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

export const findVisionExecutables = async (dirPath) => {
    const walk = (currentPath, rootPath) => {
        let items = [];
        fs.readdirSync(currentPath).forEach((name) => {
            const fullPath = path.join(currentPath, name);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                items.push(...walk(fullPath, rootPath));
            } else if (
                name.toLowerCase() === "vision.exe" ||
                name.toLowerCase() === "visiondfa.exe"
            ) {
                items.push({
                    name,
                    fullPath, // полный путь для Electron
                    relativePath: path.relative(rootPath, fullPath), // путь относительно выбранной папки
                });
            }
        });
        return items;
    };

    return walk(dirPath, dirPath);
};
