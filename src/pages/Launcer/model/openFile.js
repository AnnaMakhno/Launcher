import fsService from "../../../servises/fileSystem";
import { loadSettingsState } from "../../../utils/settingsStorage";

const openFile = async () => {
    const settingState = loadSettingsState();
    const filesFromFs = await fsService.readDirectoryByPath(
        settingState.folderPath
    );

    const file = filesFromFs.find(
        (f) => f.name === settingState.selectedFileName
    );

    if (file) {
        const text = await fsService.readFile(file);

        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch {
            parsed = "Invalid JSON file";
        }
        return parsed;
    }
};

export { openFile };
