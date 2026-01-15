import { useEffect, useState } from "react";
import fsService from "../../../servises/fileSystem";
import {
    saveApplicationsState,
    loadApplicationsState,
} from "../../../utils/applicationsStorage";

const useApplications = () => {
    const [folderPath, setFolderPath] = useState("");
    const [executables, setExecutables] = useState([]);
    const [filter, setFilter] = useState("");
    const [selectedExecutable, setSelectedExecutable] = useState(null);

    const persistState = (folder, selected) => {
        saveApplicationsState({
            folderPath: folder,
            selectedExecutablePath: selected?.fullPath ?? null,
        });
    };

    const selectExecutable = (exe) => {
        const next = exe === selectedExecutable ? null : exe;

        setSelectedExecutable(next);
        persistState(folderPath, next);
    };

    const loadDirectory = async () => {
        const files = await fsService.selectDirectory();
        if (!files.length) return;

        let folder = "";
        if (files[0].path) {
            const path = window.require("path");
            folder = path.dirname(files[0].path);
        } else {
            folder = files[0].webkitRelativePath.split("/")[0];
        }

        setFolderPath(folder);

        const exeFiles = await fsService.findVisionExecutables(folder);
        setExecutables(exeFiles);
        setSelectedExecutable(null);

        persistState(folder, null);
    };

    const updateFolderPath = async () => {
        if (!folderPath) return;

        const exeFiles = await fsService.findVisionExecutables(folderPath);
        setExecutables(exeFiles);

        if (selectedExecutable) {
            const stillExists = exeFiles.find(
                (e) => e.fullPath === selectedExecutable.fullPath
            );
            if (!stillExists) {
                setSelectedExecutable(null);
                persistState(folderPath, null);
            }
        }
    };

    useEffect(() => {
        const restore = async () => {
            const saved = loadApplicationsState();
            if (!saved?.folderPath) return;

            setFolderPath(saved.folderPath);

            const exeFiles = await fsService.findVisionExecutables(
                saved.folderPath
            );
            setExecutables(exeFiles);

            if (saved.selectedExecutablePath) {
                const selected = exeFiles.find(
                    (e) => e.fullPath === saved.selectedExecutablePath
                );
                if (selected) {
                    setSelectedExecutable(selected);
                }
            }
        };

        restore();
    }, []);

    return {
        folderPath,
        executables,
        filter,
        setFilter,
        loadDirectory,
        updateFolderPath,
        selectExecutable,
        selectedExecutable,
    };
};

export default useApplications;
