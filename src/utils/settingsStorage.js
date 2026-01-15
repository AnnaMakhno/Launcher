const STORAGE_KEY = "settings:lastState";

export const saveSettingsState = (state) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error("Failed to save settings state", e);
    }
};

export const loadSettingsState = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        console.error("Failed to load settings state", e);
        return null;
    }
};

export const clearSettingsState = () => {
    localStorage.removeItem(STORAGE_KEY);
};
