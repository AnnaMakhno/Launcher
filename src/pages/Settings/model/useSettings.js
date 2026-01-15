import { useState, useEffect, useCallback } from "react";
import fsService from "../../../servises/fileSystem";
import {
    saveSettingsState,
    loadSettingsState,
} from "../../../utils/settingsStorage";

export default function useSettings() {
    const [folderPath, setFolderPath] = useState("");
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [content, setContent] = useState(null);

    // -------- ВОССТАНОВЛЕНИЕ --------
    useEffect(() => {
        const restore = async () => {
            const saved = loadSettingsState();
            if (!saved) return;

            if (saved.folderPath) {
                setFolderPath(saved.folderPath);

                // читаем файлы
                const filesFromFs = await fsService.readDirectoryByPath(
                    saved.folderPath
                );

                const jsonFiles = filesFromFs.filter((f) =>
                    f.name.toLowerCase().endsWith(".json")
                );

                setFiles(jsonFiles);

                // если был выбран файл
                if (saved.selectedFileName) {
                    const file = jsonFiles.find(
                        (f) => f.name === saved.selectedFileName
                    );

                    if (file) {
                        await openFile(file);
                    }
                }
            }
        };

        restore();
    }, []);

    // -------- СОХРАНЕНИЕ --------
    const persist = useCallback((nextFolder, nextFile) => {
        saveSettingsState({
            folderPath: nextFolder,
            selectedFileName: nextFile ? nextFile.name : null,
        });
    }, []);

    // -------- ОТКРЫТЬ ФАЙЛ --------
    const openFile = useCallback(
        async (file) => {
            const text = await fsService.readFile(file);

            let parsed;
            try {
                parsed = JSON.parse(text);
            } catch {
                parsed = "Invalid JSON file";
            }

            setSelectedFile(file);
            setContent(parsed);

            const newFolder = file.path
                ? window.require("path").dirname(file.path)
                : folderPath;

            setFolderPath(newFolder);
            persist(newFolder, file);
        },
        [folderPath, persist]
    );

    // -------- ВЫБРАТЬ ПАПКУ --------
    const loadDirectory = useCallback(async () => {
        const filesFromDialog = await fsService.selectDirectory();
        if (!filesFromDialog.length) return;

        let newFolder = "";
        if (filesFromDialog[0].path) {
            const path = window.require("path");
            newFolder = path.dirname(filesFromDialog[0].path);
        } else {
            newFolder = filesFromDialog[0].webkitRelativePath.split("/")[0];
        }

        setFolderPath(newFolder);

        const jsonFiles = filesFromDialog.filter((f) =>
            f.name.toLowerCase().endsWith(".json")
        );

        setFiles(jsonFiles);
        setSelectedFile(null);
        setContent(null);

        persist(newFolder, null);
    }, [persist]);

    // -------- ОБНОВИТЬ СОСТОЯНИЕ ПАПКИ --------
    const updateFolderPath = useCallback(async () => {
        if (!folderPath) return;

        const filesFromFs = await fsService.readDirectoryByPath(folderPath);

        const jsonFiles = filesFromFs.filter((f) =>
            f.name.toLowerCase().endsWith(".json")
        );

        setFiles(jsonFiles);

        if (selectedFile) {
            const stillExists = jsonFiles.find(
                (f) => f.name === selectedFile.name
            );
            if (!stillExists) {
                setSelectedFile(null);
                setContent(null);
                persist(folderPath, null);
            }
        }
    }, [folderPath, selectedFile, persist]);

    return {
        folderPath,
        files,
        selectedFile,
        content,
        openFile,
        loadDirectory,
        updateFolderPath,
    };
}
