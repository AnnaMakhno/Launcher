import { useEffect, useState } from "react";

export default function useDeepLink() {
    const [url, setUrl] = useState(null); // null = ждем ответа от Electron
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (!window.require) {
            setLoaded(true);
            return;
        }
        const { ipcRenderer } = window.require("electron");
        const handler = (_, value) => {
            setUrl(value);
            setLoaded(true);
        };

        ipcRenderer.on("deep-link", handler);
        ipcRenderer.send("request-link");

        return () => {
            ipcRenderer.removeListener("deep-link", handler);
        };
    }, []);

    const clearUrl = () => {
        setUrl("");
    };

    return { url, setUrl, clearUrl, loaded };
}
