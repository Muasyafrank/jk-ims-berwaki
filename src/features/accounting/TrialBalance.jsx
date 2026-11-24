import { useMemo, useState } from 'react'
import Card from '../../components/ui/Card.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import { Input } from '../../components/ui/Field.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import { useApp } from '../../context/AppContext.js'
import { buildTrialBalance, computeBalances } from '../../lib/accounting.js'
import { todayISO } from '../../lib/dates.js'
import { formatDate, formatKES } from '../../lib/format.js'
import { TYPE_TONE } from './tones.js'

const COLUMNS = [
  { key: 'code', header: 'Code', mono: true, strong: true, tone: 'navy' },
  { key: 'name', header: 'Account Name' },
  { key: 'type', header: 'Type', render: (r) => <span className={`type-chip tone-${TYPE_TONE[r.type]}`}>{r.type}</span> },
  { key: 'debit', header: 'Debit (KES)', align: 'right', tone: 'success', render: (r) => (r.debit ? formatKES(r.debit) : '') },
  { key: 'credit', header: 'Credit (KES)', align: 'right', tone: 'info', render: (r) => (r.credit ? formatKES(r.credit) : '') },
]

export default function TrialBalance() {
  const { data } = useApp()
  const [asOf, setAsOf] = useState(() => todayISO())

  const { rows, totalDebit, totalCredit, balanced } = useMemo(() => {
    const balances = computeBalances(
      data.accounts,
      data.journals.filter((journal) => journal.date <= asOf),
    )
    return buildTrialBalance(data.accounts, balances)
  }, [asOf, data.accounts, data.journals])

  return (
    <div className="page">
      <PageHeader title="Trial Balance" icon="scale" subtitle={`As at: ${formatDate(asOf)}`}>
        <Input type="date" className="input--date" aria-label="As at date" value={asOf} onChange={(e) => setAsOf(e.target.value)} />
      </PageHeader>

      <Card flush>
        <DataTable
          columns={COLUMNS}
          rows={rows}
          rowKey="code"
          empty="No account movements yet."
          footer={
            <tr>
              <td colSpan={3}>TOTALS</td>
              <td className="cell--right cell--success">{formatKES(totalDebit)}</td>
              <td className="cell--right cell--info">{formatKES(totalCredit)}</td>
            </tr>
          }
        />
      </Card>

      <div className={`banner tone-${balanced ? 'success' : 'danger'}`} role="status">
        <span className="banner__status">
          {balanced
            ? '✔ Trial Balance is balanced — debits equal credits'
            : `✘ Out of balance by ${formatKES(Math.abs(totalDebit - totalCredit))}`}
        </span>
      </div>
    </div>
  )
}
