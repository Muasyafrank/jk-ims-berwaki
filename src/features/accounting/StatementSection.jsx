import { formatKES } from '../../lib/format.js'

/** A titled list of account lines with a total — shared by Profit & Loss and the Balance Sheet. */
export default function StatementSection({ title, rows, total, tone, caps }) {
  return (
    <section className={`statement tone-${tone}`}>
      <h3 className={caps ? 'statement__title statement__title--caps' : 'statement__title'}>{title}</h3>
      {rows.map((row) => (
        <div key={row.code} className="statement__row">
          <span>{caps ? row.name : `${row.code} ${row.name}`}</span>
          <strong>{formatKES(row.balance)}</strong>
        </div>
      ))}
      <div className="statement__total"><span>Total {title}</span><span>{formatKES(total)}</span></div>
    </section>
  )
}
