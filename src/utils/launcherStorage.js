const STORAGE_KEY = "launcher:autorun";

export const loadAutorun = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? false;
    } catch {
        return false;
    }
};

export const saveAutorun = (value) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
};
