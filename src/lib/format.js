// Intl formatters are expensive to construct, so build them once.
// Dates are YYYY-MM-DD strings; format in UTC so they never shift a day with the viewer's timezone.
const shortDate = new Intl.DateTimeFormat('en-KE', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
const longDate = new Intl.DateTimeFormat('en-KE', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' })
const money = new Intl.NumberFormat('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const parse = (value) => {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

/** 13 Nov 2026 — "-" when empty/invalid. */
export const formatDate = (value) => {
  const d = parse(value)
  return d ? shortDate.format(d) : '-'
}

/** 13 November 2026 — "—" when empty/invalid. Used on printed documents. */
export const formatDateLong = (value) => {
  const d = parse(value)
  return d ? longDate.format(d) : '—'
}

/** KES 1,234.50 */
export const formatKES = (amount) => `KES ${money.format(Number(amount) || 0)}`

/** Fallback for empty table cells. Unlike `||`, this keeps legitimate 0 and false values. */
export const displayCell = (value) => (value === '' || value === null || value === undefined ? '-' : value)

/** Truncate long text for table cells. */
export const truncate = (text = '', max = 45) => {
  const value = String(text ?? '')
  return value.length > max ? `${value.slice(0, max)}…` : value
}
