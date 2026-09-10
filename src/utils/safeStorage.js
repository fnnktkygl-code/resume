/**
 * Safe localStorage wrapper
 * Prevents uncaught QuotaExceededError and private-mode storage exceptions.
 */

export function safeStorageGet(key, fallback = null) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return fallback;
    const item = window.localStorage.getItem(key);
    return item !== null ? item : fallback;
  } catch (err) {
    console.warn(`[safeStorage] Failed to get key "${key}":`, err);
    return fallback;
  }
}

export function safeStorageGetJSON(key, fallback = null) {
  try {
    const raw = safeStorageGet(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[safeStorage] Failed to parse JSON for key "${key}":`, err);
    return fallback;
  }
}

export function safeStorageSet(key, value) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    return true;
  } catch (err) {
    console.error(`[safeStorage] Storage quota exceeded or blocked for key "${key}":`, err);
    return false;
  }
}

export function safeStorageRemove(key) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    window.localStorage.removeItem(key);
    return true;
  } catch (err) {
    console.warn(`[safeStorage] Failed to remove key "${key}":`, err);
    return false;
  }
}
