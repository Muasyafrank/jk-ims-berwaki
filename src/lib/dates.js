const pad = (n) => String(n).padStart(2, '0')

/** Today's date as YYYY-MM-DD in the user's *local* timezone (not UTC). */
export function todayISO(now = new Date()) {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/** First day of the current month as YYYY-MM-DD. */
export const monthStartISO = (now = new Date()) => `${todayISO(now).slice(0, 7)}-01`

/** YYYY-MM prefix for the current month. */
export const currentMonthPrefix = (now = new Date()) => todayISO(now).slice(0, 7)

const MS_PER_DAY = 86_400_000

/** Whole days from `fromISO` to `toISO` (positive when `toISO` is later). */
export function daysBetween(fromISO, toISO) {
  return Math.floor((new Date(toISO) - new Date(fromISO)) / MS_PER_DAY)
}
