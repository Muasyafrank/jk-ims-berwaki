import { useMemo } from 'react'
import Card from '../../components/ui/Card.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import DateRangeFilter from '../../components/ui/DateRangeFilter.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import StatCard from '../../components/ui/StatCard.jsx'
import { RECEIVED_PURCHASE_ORDER_STATUSES } from '../../config/constants.js'
import { useApp } from '../../context/AppContext.js'
import { useDateRange } from '../../hooks/useDateRange.js'
import { sumBy } from '../../lib/calc.js'
import { formatDate, formatKES } from '../../lib/format.js'
import { outstandingInvoices } from '../../lib/receivables.js'

const COLUMNS = [
  { key: 'date', header: 'Date', small: true, render: (r) => formatDate(r.date) },
  { key: 'ref', header: 'Ref', mono: true, small: true, tone: 'navy' },
  { key: 'customerName', header: 'From' },
  { key: 'paymentMethod', header: 'Method' },
  { key: 'amount', header: 'Amount', align: 'right', strong: true, tone: 'success', render: (r) => formatKES(r.amount) },
]

export default function CashFlow() {
  const { data } = useApp()
  const range = useDateRange()
  const { inRange } = range

  const { receipts, received, outstanding, purchases, net } = useMemo(() => {
    const receiptRows = inRange(data.receipts)
    const receivedTotal = sumBy(receiptRows, (receipt) => receipt.amount)
    const outstandingTotal = sumBy(outstandingInvoices(inRange(data.invoices)), (invoice) => invoice.total)
    const purchaseTotal = sumBy(
      inRange(data.purchaseOrders)
        .filter((purchaseOrder) => RECEIVED_PURCHASE_ORDER_STATUSES.includes(purchaseOrder.status)),
      (purchaseOrder) => purchaseOrder.total,
    )
    return {
      receipts: receiptRows,
      received: receivedTotal,
      outstanding: outstandingTotal,
      purchases: purchaseTotal,
      net: receivedTotal - purchaseTotal,
    }
  }, [data.invoices, data.purchaseOrders, data.receipts, inRange])

  return (
    <div className="page">
      <PageHeader title="Cash Flow" icon="arrows-exchange" subtitle={`${formatDate(range.from)} — ${formatDate(range.to)}`}>
        <DateRangeFilter from={range.from} to={range.to} onFromChange={range.setFrom} onToChange={range.setTo} />
      </PageHeader>

      <div className="grid grid--stats-sm">
        <StatCard label="Cash Received" value={formatKES(received)} tone="success" />
        <StatCard label="Cash Out (Purchases)" value={formatKES(purchases)} tone="danger" />
        <StatCard label="Net Cash Flow" value={formatKES(net)} tone={net >= 0 ? 'success' : 'danger'} />
        <StatCard label="Outstanding Invoices" value={formatKES(outstanding)} tone="warning" />
      </div>

      <Card>
        <h2 className="card__title">Cash Receipts — {formatDate(range.from)} to {formatDate(range.to)}</h2>
        <DataTable columns={COLUMNS} rows={receipts} empty="No receipts in this period."
          footer={<tr><td colSpan={4}>TOTAL RECEIVED</td><td className="cell--right cell--success">{formatKES(received)}</td></tr>} />
      </Card>
    </div>
  )
}
