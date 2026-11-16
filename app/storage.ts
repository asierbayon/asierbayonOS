// Storage can be blocked (SecurityError on access) or full (QuotaExceededError).
// Values that could not be persisted are kept in memory for the session.
const unpersistedValues = new Map<string, string>();

export const readStoredValue = (key: string): string | null => {
  const unpersisted = unpersistedValues.get(key);
  if (unpersisted !== undefined) return unpersisted;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const writeStoredValue = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    unpersistedValues.delete(key);
    return true;
  } catch {
    unpersistedValues.set(key, value);
    return false;
  }
};
