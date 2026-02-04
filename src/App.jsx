import "./App.css";

import { Launcher } from "./pages/Launcer/Launcher";
import { Settings } from "./pages/Settings/Settings";
import { Applications } from "./pages/Applications/Applications";

import useApplications from "./pages/Applications/model/useApplications";
import useSettings from "./pages/Settings/model/useSettings";
import useDeepLink from "./pages/Launcer/model/useDeepLink";

export default function App() {
    // Хуки, которые управляют логикой
    const apps = useApplications();
    const settings = useSettings();
    const deepLink = useDeepLink();
    console.log("123");

    // Передаём внутрь Launcher всё, что ему нужно
    return (
        <div className="appLayout">
            <div className="leftColumn">
                <Launcher
                    url={deepLink.url}
                    loaded={deepLink.loaded}
                    clearUrl={deepLink.clearUrl}
                    selectedExecutable={apps.selectedExecutable}
                    selectedSettings={
                        settings.selectedFile ? settings.content : null
                    }
                    // runApplication={runApplication}
                />

                <Settings {...settings} />
            </div>

            <div className="rightColumn">
                <Applications {...apps} />
            </div>
        </div>
    );
}
