/** localStorage helpers that never throw (private mode, quota, corrupt JSON). */
export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function saveJSON(key, value) {
  try {
    const serialized = JSON.stringify(value)
    if (serialized === undefined) return false
    localStorage.setItem(key, serialized)
    return true
  } catch {
    /* storage full or unavailable — keep running in memory */
    return false
  }
}
