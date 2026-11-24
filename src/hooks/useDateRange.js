import { useCallback, useMemo, useState } from 'react'
import { monthStartISO, todayISO } from '../lib/dates.js'

/** From/to date state (defaults to month-to-date) plus a helper to filter rows by it. */
export function useDateRange() {
  const [from, setFrom] = useState(() => monthStartISO())
  const [to, setTo] = useState(() => todayISO())

  const inRange = useCallback(
    (rows = [], key = 'date') => (Array.isArray(rows) ? rows : [])
      .filter((row) => row && row[key] >= from && row[key] <= to),
    [from, to],
  )

  return useMemo(() => ({ from, to, setFrom, setTo, inRange }), [from, inRange, to])
}
