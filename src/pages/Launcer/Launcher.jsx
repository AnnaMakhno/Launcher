import AppSection from "../../components/AppSection/AppSection";
import { loadAutorun, saveAutorun } from "../../utils/launcherStorage";
import { loadApplicationsState } from "../../utils/applicationsStorage";
import { useEffect, useState } from "react";
import { openFile } from "./model/openFile";

import "./Launcher.css";

export function Launcher({
    url,
    loaded,
    clearUrl,
    selectedExecutable,
    selectedSettings,
}) {
    const [autorun, setAutorun] = useState(loadAutorun());

    const runApplication = (pathExecutable, env, urlExecutable) => {
        if (!pathExecutable || !env || !urlExecutable) return;

        const { ipcRenderer } = window.require("electron");

        ipcRenderer.send("run-app", {
            executablePath: pathExecutable,
            env: env,
            url: urlExecutable,
        });
    };

    useEffect(() => {
        saveAutorun(autorun);
    }, [autorun]);
    // AUTORUN
    useEffect(() => {
        const settingState = openFile();
        const applicationState = loadApplicationsState();
        const autorunState = loadAutorun();
        if (!autorunState || !settingState || !applicationState || !url) return;

        settingState.then((res) => {
            runApplication(applicationState.selectedExecutablePath, res, url);
        });
    }, [url]);

    if (!loaded) return <div>Loading...</div>;

    return (
        <AppSection title="Current link">
            <input
                className="linkInput"
                value={url || ""}
                readOnly
            />

            <div className="launcherActions">
                <button
                    disabled={!url}
                    onClick={clearUrl}
                >
                    Reset
                </button>

                <button
                    disabled={!selectedExecutable || !selectedSettings || !url}
                    onClick={() =>
                        runApplication(
                            selectedExecutable.fullPath,
                            selectedSettings,
                            url
                        )
                    }
                >
                    Run
                </button>

                <input
                    id="autorunCheckbox"
                    type="checkbox"
                    checked={autorun}
                    onChange={(e) => setAutorun(e.target.checked)}
                />

                <label
                    htmlFor="autorunCheckbox"
                    className="autorun"
                >
                    Autorun
                </label>
            </div>
        </AppSection>
    );
}
