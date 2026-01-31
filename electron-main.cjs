const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const express = require("express");
const net = require("net");
const fs = require("fs");
const { spawn } = require("child_process");

class CommandLineParameterActor {
    constructor() {
        this.param = "";
    }

    getParam() {
        return this.param;
    }

    setParam(value) {
        this.param = value;
    }

    resetParams() {
        this.param = "";
    }
}
class SettingsHolder {
    constructor() {
        this.currentSettingsFile = null;
    }

    update(settingsFile) {
        this.currentSettingsFile = settingsFile;
    }
}

const UNITY_EDITOR_TCP_PORT = 52234;
const HOST = "127.0.0.1";

class CredentialsServerForUnityEditorClients {
    constructor(commandLineActor, settingsHolder) {
        this.commandLineActor = commandLineActor;
        this.settingsHolder = settingsHolder;
        this.server = null;
    }

    start() {
        if (this.server) return;

        this.server = net.createServer((socket) =>
            this.handleClient(socket).catch((err) =>
                console.error("TCP client error:", err),
            ),
        );

        this.server.listen(UNITY_EDITOR_TCP_PORT, HOST, () => {
            console.log(
                `TCP server started on ${HOST}:${UNITY_EDITOR_TCP_PORT}`,
            );
        });
    }

    stop() {
        if (!this.server) return;
        this.server.close();
        this.server = null;
    }

    async handleClient(socket) {
        socket.setTimeout(5000);

        const firstByte = await this.tryReadByte(socket, 5);

        if (firstByte === -1 || firstByte === 0) {
            await this.monitorParamsAndSend(socket);
        } else if (firstByte === 1) {
            await this.sendCurrentSettings(socket);
        }

        socket.end();
    }

    tryReadByte(socket, timeoutMs) {
        return new Promise((resolve) => {
            let done = false;

            const timer = setTimeout(() => {
                if (!done) {
                    done = true;
                    resolve(-1);
                }
            }, timeoutMs);

            socket.once("data", (data) => {
                if (done) return;
                clearTimeout(timer);
                done = true;
                resolve(data[0]);
            });

            socket.once("error", () => {
                if (!done) {
                    clearTimeout(timer);
                    done = true;
                    resolve(-1);
                }
            });
        });
    }

    async monitorParamsAndSend(socket) {
        const param = await this.pullParametersWhenNotEmpty();
        socket.write(Buffer.from(param, "utf8"));
    }

    async sendCurrentSettings(socket) {
        const settings = this.settingsHolder.currentSettingsFile;
        if (!settings) return;

        const payload = Object.entries(settings.variables)
            .map(([k, v]) => `${k}=${v}`)
            .join("|");

        socket.write(Buffer.from(payload, "utf8"));
    }

    async pullParametersWhenNotEmpty() {
        while (true) {
            const p = this.commandLineActor.getParam();
            if (p) {
                this.commandLineActor.resetParams();
                return p;
            }
            await new Promise((r) => setTimeout(r, 50));
        }
    }
}

const commandLineActor = new CommandLineParameterActor();
const settingsHolder = new SettingsHolder();
const tcpServer = new CredentialsServerForUnityEditorClients(
    commandLineActor,
    settingsHolder,
);

let mainWindow = null;
let server = null;
let pendingLink = null;

function getDeepLink(argv) {
    return (
        argv.find(
            (arg) => typeof arg === "string" && arg.startsWith("visionaws://"),
        ) || null
    );
}

function startServer() {
    if (server) return Promise.resolve("http://localhost:3000");

    return new Promise((resolve) => {
        const appServer = express();
        appServer.use(express.static(path.join(__dirname, "dist")));

        server = appServer.listen(3000, () => resolve("http://localhost:3000"));
        server.on("error", (err) => {
            if (err.code === "EADDRINUSE") resolve("http://localhost:3000");
            else console.error(err);
        });
    });
}

async function createWindow() {
    if (mainWindow) return;

    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    const url = app.isPackaged ? await startServer() : "http://localhost:5173";

    // Загрузка страницы только после того, как pendingLink готов
    mainWindow.loadURL(url);

    mainWindow.webContents.once("did-finish-load", () => {
        if (pendingLink) {
            mainWindow.webContents.send("deep-link", pendingLink);
        }
    });

    mainWindow.on("closed", () => {
        mainWindow = null;
        if (server) server.close();
    });
}

const gotLock = app.requestSingleInstanceLock();

if (!gotLock) {
    app.quit();
} else {
    // Второй запуск через ссылку
    app.on("second-instance", (event, argv) => {
        const link = getDeepLink(argv.slice(1)); // slice(1) для Windows
        if (link) {
            pendingLink = link;
        } else {
            pendingLink = null; // обычный запуск из папки → очищаем
        }
        if (mainWindow) {
            mainWindow.webContents.send("deep-link", pendingLink);
            mainWindow.focus();
        } else {
            createWindow();
        }
    });

    // Первый запуск
    app.whenReady().then(async () => {
        // Windows: проверяем argv на ссылку
        if (process.platform === "win32") {
            const link = getDeepLink(process.argv.slice(1));
            if (link) {
                pendingLink = link; // deep link
            } else {
                pendingLink = null; // обычный запуск → очищаем
            }
        } else {
            // На macOS/другие платформы тоже безопасно
            pendingLink = null;
        }

        tcpServer.start();
        await createWindow();
    });
}

ipcMain.on("request-link", (event) => {
    event.sender.send("deep-link", pendingLink);
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
    tcpServer.stop();
});

// // NEW

ipcMain.handle("read-directory", async (_, folderPath) => {
    const files = fs.readdirSync(folderPath).map((name) => ({
        name,
        path: path.join(folderPath, name),
    }));

    return files;
});

ipcMain.handle("read-file", async (_, filePath) => {
    return fs.readFileSync(filePath, "utf-8");
});

////////

ipcMain.on("run-app", (event, { executablePath, env, url }) => {
    console.log("Run request:", { executablePath, env, url });

    settingsHolder.update({
        variables: env.reduce((acc, p) => {
            acc[p.Key] = p.Value;
            return acc;
        }, {}),
    });
    if (url) {
        commandLineActor.setParam(url);
    }
    // преобразуем env
    const envObj = Array.isArray(env)
        ? env.reduce((acc, pair) => {
              acc[pair.Key] = pair.Value;
              return acc;
          }, {})
        : {};

    const args = typeof url === "string" ? [url] : [];

    // запускаем приложение
    const child = spawn(executablePath, args, {
        env: {
            ...process.env,
            ...envObj,
        },
    });

    child.stdout.on("data", (data) => console.log(`APP OUT: ${data}`));
    child.stderr.on("data", (data) => console.error(`APP ERROR: ${data}`));
    child.on("close", (code) => console.log(`App exited with code ${code}`));
});
