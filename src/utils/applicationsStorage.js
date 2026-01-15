const STORAGE_KEY = "applications:lastState";

export const saveApplicationsState = (state) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error("Failed to save applications state", e);
    }
};

export const loadApplicationsState = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        console.error("Failed to load applications state", e);
        return null;
    }
};
