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

export const readFile = (file) => {
    if (!(file instanceof Blob)) {
        throw new Error("The provided argument is not a File or Blob object.");
    }
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerroe = reject;
        reader.readAsText(file);
    });
};

export const findVisionExecutables = async (files) => {
    return files
        .filter(
            (f) =>
                f.name.toLowerCase() === "vision.exe" ||
                f.name.toLowerCase() === "visiondfa.exe"
        )
        .map((f) => ({
            name: f.name,
            relativePath: f.webkitRelativePath,
        }));
};
