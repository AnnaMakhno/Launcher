import useDeepLink from "./model/useDeepLink";
import AppSection from "../../components/AppSection/AppSection";
import { loadAutorun, saveAutorun } from "../../utils/launcherStorage";
import { useEffect, useState } from "react";

import "./Launcher.css";

export function Launcher({
    url,
    loaded,
    clearUrl,
    selectedExecutable,
    selectedSettings,
}) {
    const [autorun, setAutorun] = useState(loadAutorun());
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        setIsReady(Boolean(selectedExecutable && selectedSettings));
    }, [selectedExecutable, selectedSettings]);

    useEffect(() => {
        saveAutorun(autorun);
    }, [autorun]);

    const runApplication = (executable, settings, url) => {
        if (!executable || !settings) return;

        const { ipcRenderer } = window.require("electron");

        console.log("RUN NOW:", {
            exe: executable.fullPath,
            settings,
            url,
        });

        ipcRenderer.send("run-app", {
            executablePath: executable.fullPath,
            env: settings,
            url,
        });
    };

    // AUTORUN
    useEffect(() => {
        if (!autorun) return;
        if (!url) return;
        if (!selectedExecutable || !selectedSettings) return;

        runApplication(selectedExecutable, selectedSettings, url);
    }, [url, autorun, selectedExecutable, selectedSettings]);

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
                    disabled={!selectedExecutable || !selectedSettings}
                    onClick={() =>
                        runApplication(
                            selectedExecutable,
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
