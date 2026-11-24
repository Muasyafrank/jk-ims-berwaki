import { useMemo } from 'react'
import Badge from '../../components/ui/Badge.jsx'
import Card from '../../components/ui/Card.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import StatCard from '../../components/ui/StatCard.jsx'
import { SIGNED_IN_USER } from '../../config/auth.js'
import {
  OPEN_PURCHASE_ORDER_STATUSES, OPEN_QUOTATION_STATUSES, WORKFLOW_PHASES,
} from '../../config/constants.js'
import { useApp } from '../../context/AppContext.js'
import { sumBy } from '../../lib/calc.js'
import { currentMonthPrefix, todayISO } from '../../lib/dates.js'
import { formatDate, formatKES } from '../../lib/format.js'
import { outstandingInvoices } from '../../lib/receivables.js'
import { cx } from '../../lib/classNames.js'

const RECENT_COLUMNS = [
  { key: 'ref', header: 'Ref', mono: true, strong: true, tone: 'navy', small: true, render: (r) => r.ref || r.id },
  { key: '_type', header: 'Type', small: true, render: (r) => r._type || 'Doc' },
  { key: 'party', header: 'Party', render: (r) => r.customerName || r.customer || r.supplierName || '-' },
  { key: 'date', header: 'Date', small: true, render: (r) => formatDate(r.date) },
  { key: 'status', header: 'Status', render: (r) => <Badge status={r.status} /> },
]

export default function Dashboard() {
  const { data, settings } = useApp()

  const monthPrefix = currentMonthPrefix()
  const stats = useMemo(() => [
    { label: 'Open Quotations', icon: 'file-description', tone: 'info',
      value: data.quotations.filter((q) => OPEN_QUOTATION_STATUSES.includes(q.status)).length },
    { label: 'LPOs Awaiting PO', icon: 'clipboard-list', tone: 'warning',
      value: data.orders.filter((o) => o.status === 'Open').length },
    { label: 'Outstanding (KES)', icon: 'file-invoice', tone: 'danger', compact: true,
      value: formatKES(sumBy(outstandingInvoices(data.invoices), (i) => i.total)) },
    { label: 'Month Sales (KES)', icon: 'trending-up', tone: 'success', compact: true,
      value: formatKES(sumBy(data.invoices.filter((i) => i.date?.startsWith(monthPrefix)), (i) => i.total)) },
    { label: 'Open Purchase Orders', icon: 'shopping-cart', tone: 'neutral',
      value: data.purchaseOrders.filter((p) => OPEN_PURCHASE_ORDER_STATUSES.includes(p.status)).length },
    { label: 'Customers', icon: 'users', tone: 'gold', value: data.customers.length },
  ], [data.customers.length, data.invoices, data.orders, data.purchaseOrders, data.quotations, monthPrefix])

  const recent = useMemo(() => [...data.invoices, ...data.quotations, ...data.orders]
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
    .slice(0, 8), [data.invoices, data.orders, data.quotations])

  return (
    <div className="page">
      <PageHeader
        eyebrow={`Welcome, ${SIGNED_IN_USER}`}
        title="Operations Dashboard"
        subtitle={`${settings.bizName} · ${formatDate(todayISO())}`}
      />

      <div className="grid grid--stats">
        {stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
      </div>

      <div className="grid grid--2-1">
        <Card flush>
          <h2 className="card__title card__title--inset">Recent Activity</h2>
          {recent.length === 0
            ? <EmptyState>No transactions yet.<br />Start by adding a customer, then create an enquiry.</EmptyState>
            : <DataTable columns={RECENT_COLUMNS} rows={recent} rowKey={(r) => `${r._type}-${r.id}`} caption="Recent activity" />}
        </Card>

        <Card>
          <h2 className="card__title">Workflow Pipeline</h2>
          <ul className="pipeline">
            {WORKFLOW_PHASES.map(({ label, collection }) => {
              const count = data[collection].length
              return (
                <li key={label} className={cx(count > 0 && 'has-items')}>
                  <span className="pipeline__dot" />
                  <span className="pipeline__label">{label}</span>
                  <span className="pipeline__count">{count}</span>
                </li>
              )
            })}
          </ul>
        </Card>
      </div>
    </div>
  )
}
