import { useMemo } from 'react'
import Badge from '../../components/ui/Badge.jsx'
import Card from '../../components/ui/Card.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import StatCard from '../../components/ui/StatCard.jsx'
import { useApp } from '../../context/AppContext.js'
import { sumBy } from '../../lib/calc.js'
import { todayISO } from '../../lib/dates.js'
import { formatDate, formatKES } from '../../lib/format.js'
import { AGING_BUCKETS, agingDays, bucketFor, outstandingInvoices } from '../../lib/receivables.js'

export default function DebtorAging() {
  const { data } = useApp()
  const today = todayISO()

  const rows = useMemo(() => outstandingInvoices(data.invoices)
    .map((invoice) => ({ ...invoice, days: agingDays(invoice, today) }))
    .sort((a, b) => b.days - a.days), [data.invoices, today])

  const columns = [
    { key: 'ref', header: 'Invoice', mono: true, small: true, tone: 'navy' },
    { key: 'customerName', header: 'Customer' },
    { key: 'date', header: 'Invoice Date', small: true, render: (r) => formatDate(r.date) },
    { key: 'dueDate', header: 'Due Date', small: true, render: (r) => formatDate(r.dueDate) },
    { key: 'total', header: 'Amount', align: 'right', strong: true, render: (r) => formatKES(r.total) },
    { key: 'days', header: 'Days Overdue', strong: true,
      render: (r) => <span className={`tone-text tone-${bucketFor(r.days)?.tone}`}>{r.days <= 0 ? 'Current' : `${r.days} days`}</span> },
    { key: 'status', header: 'Status', render: (r) => <Badge status={r.status} /> },
  ]

  return (
    <div className="page">
      <PageHeader title="Debtor Aging" icon="clock-hour-3" />

      <div className="grid grid--stats-sm">
        {AGING_BUCKETS.map((bucket) => (
          <StatCard key={bucket.label} label={bucket.label} tone={bucket.tone}
            value={formatKES(sumBy(rows.filter((r) => bucket.test(r.days)), (r) => r.total))} />
        ))}
      </div>

      <Card>
        <h2 className="card__title">Outstanding Invoice Detail</h2>
        <DataTable columns={columns} rows={rows} caption="Outstanding invoice aging" empty="No outstanding invoices." />
      </Card>
    </div>
  )
}
