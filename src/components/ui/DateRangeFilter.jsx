import { Input } from './Field.jsx'

/** From → To date pickers. Pair with the useDateRange() hook. */
export default function DateRangeFilter({ from, to, onFromChange, onToChange }) {
  const invalidRange = Boolean(from && to && from > to)

  return (
    <div className="date-range" role="group" aria-label="Date range">
      <Input
        type="date"
        className="input--date"
        aria-label="From date"
        aria-invalid={invalidRange || undefined}
        max={to || undefined}
        value={from}
        onChange={(event) => onFromChange(event.target.value)}
      />
      <span aria-hidden="true">→</span>
      <Input
        type="date"
        className="input--date"
        aria-label="To date"
        aria-invalid={invalidRange || undefined}
        min={from || undefined}
        value={to}
        onChange={(event) => onToChange(event.target.value)}
      />
      {invalidRange && <span className="date-range__error" role="alert">Start date cannot be after the end date.</span>}
    </div>
  )
}
