

export function setSessionItem(name, value) {
    sessionStorage.setItem(name, value)
}

export function getSessionItem(key) {
    const item = sessionStorage.getItem(key);
    if (item === null) {
        return null; 
    }
    try {
        return JSON.parse(item);
    } catch (e) {
        return item;
    }
}

export function clearSession() {
    sessionStorage.clear()
}

export function removeSessionItem(key) {
    sessionStorage.removeItem(key)
}