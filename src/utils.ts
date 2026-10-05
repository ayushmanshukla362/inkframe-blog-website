export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${value}T12:00:00`))
}

export function formatCount(value: number) {
  return new Intl.NumberFormat('en-US', { notation: value > 999 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(value)
}

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeStorage<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage can be unavailable in privacy-restricted contexts; the in-memory state still works.
  }
}
