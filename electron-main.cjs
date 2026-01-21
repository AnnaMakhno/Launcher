const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const express = require("express");

const { spawn } = require("child_process");

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
    if (mainWindow) {
        if (pendingLink) {
            mainWindow.webContents.send("deep-link", pendingLink);
        }
        mainWindow.focus();
        return;
    }

    mainWindow = new BrowserWindow({
        width: "100%",
        height: "100%",
        webPreferences: { nodeIntegration: true, contextIsolation: false },
    });

    const url = app.isPackaged ? await startServer() : "http://localhost:5173";
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
if (!gotLock) app.quit();
else {
    app.on("second-instance", (event, argv) => {
        const link = getDeepLink(argv);
        if (link) pendingLink = link;
        createWindow();
    });
}

app.whenReady().then(() => {
    const link = getDeepLink(process.argv);
    if (link) pendingLink = link;

    if (process.defaultApp) {
        app.setAsDefaultProtocolClient("visionaws", process.execPath, [
            path.resolve(process.argv[1]),
        ]);
    } else {
        app.setAsDefaultProtocolClient("visionaws");
    }

    createWindow();
});

ipcMain.on("request-link", (event) => {
    event.sender.send("deep-link", pendingLink);
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
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
