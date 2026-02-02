const isElectron =
    typeof window !== "undefined" && typeof window.require === "function";

const fs = isElectron ? window.require("fs") : null;
const path = isElectron ? window.require("path") : null;

export const selectDirectory = async () => {
    return new Promise((resolve) => {
        const input = document.createElement("input");
        input.type = "file";
        input.webkitdirectory = true;
        input.onchange = () => {
            resolve(Array.from(input.files));
        };
        input.click();
    });
};

export const readDirectoryByPath = async (dirPath) => {
    const walk = (currentPath) => {
        const items = [];
        fs.readdirSync(currentPath).forEach((name) => {
            const fullPath = path.join(currentPath, name);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                items.push({ name, path: fullPath, isDirectory: true });
                items.push(...walk(fullPath)); // рекурсивно
            } else {
                items.push({ name, path: fullPath, isDirectory: false });
            }
        });
        return items;
    };

    return walk(dirPath);
};

export const readFile = (file) => {
    return new Promise((resolve, reject) => {
        fs.readFile(file.path, "utf-8", (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
};

const scanVisionExecutables = (dirPath, rootPath) => {
    let items = [];
    if (!fs.existsSync(dirPath)) return items;

    fs.readdirSync(dirPath).forEach((name) => {
        const fullPath = path.join(dirPath, name);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            items.push(...scanVisionExecutables(fullPath, rootPath));
        } else if (
            name.toLowerCase() === "vision.exe" ||
            name.toLowerCase() === "visiondfa.exe"
        ) {
            items.push({
                name,
                fullPath,
                relativePath: rootPath
                    ? path.relative(rootPath, fullPath)
                    : fullPath,
            });
        }
    });

    return items;
};

export const findVisionExecutables = async (dirPath) => {
    return await window
        .require("electron")
        .ipcRenderer.invoke("find-vision-executables", dirPath);
};
