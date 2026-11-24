import { useMemo, useState } from 'react'
import Card from '../../components/ui/Card.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import DateRangeFilter from '../../components/ui/DateRangeFilter.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import StatCard from '../../components/ui/StatCard.jsx'
import Tabs from '../../components/ui/Tabs.jsx'
import {
  OPEN_PURCHASE_ORDER_STATUSES, OPEN_QUOTATION_STATUSES,
} from '../../config/constants.js'
import { useApp } from '../../context/AppContext.js'
import { useDateRange } from '../../hooks/useDateRange.js'
import { sumBy } from '../../lib/calc.js'
import { formatDate, formatKES } from '../../lib/format.js'
import { outstandingInvoices } from '../../lib/receivables.js'
import { dateColumn, moneyColumn, refColumn, statusColumn } from '../records/columns.jsx'

const TABS = [
  { id: 'sales', label: 'Sales' },
  { id: 'outstanding', label: 'Outstanding' },
  { id: 'procurement', label: 'Procurement' },
  { id: 'pipeline', label: 'Pipeline' },
]

const SALES_COLUMNS = [
  refColumn('Ref'), dateColumn('date', 'Date'), { key: 'customerName', header: 'Customer' },
  moneyColumn('sub', 'Excl.VAT'), moneyColumn('vatAmt', 'VAT'), { ...moneyColumn('total', 'Total'), strong: true },
  statusColumn,
]
const OUTSTANDING_COLUMNS = [
  refColumn('Invoice Ref'), { key: 'customerName', header: 'Customer' }, dateColumn('date', 'Date'),
  dateColumn('dueDate', 'Due Date'), { ...moneyColumn('total', 'Amount'), strong: true, tone: 'danger' },
  statusColumn,
]
const PROCUREMENT_COLUMNS = [
  refColumn('PO Ref'), { key: 'supplierName', header: 'Supplier' }, dateColumn('date', 'Date'),
  { key: 'lpoRef', header: 'LPO Ref', mono: true, small: true, render: (row) => row.lpoRef || '-' },
  { ...moneyColumn('total', 'Total'), strong: true }, statusColumn,
]
const pipelineColumns = (party) => [
  refColumn('Ref'),
  { key: party, header: 'Party', small: true, render: (row) => row[party] || '-' },
  dateColumn('date', 'Date'),
  statusColumn,
]

export default function Reports() {
  const { data } = useApp()
  const [tab, setTab] = useState('sales')
  const range = useDateRange()
  const { inRange } = range

  const { invoices, purchaseOrders, receipts, salesTotal, vatTotal, outstanding, pipeline } = useMemo(() => {
    const invoiceRows = inRange(data.invoices)
    const purchaseOrderRows = inRange(data.purchaseOrders)
    const receiptRows = inRange(data.receipts)
    const outstandingRows = outstandingInvoices(data.invoices)

    return {
      invoices: invoiceRows,
      purchaseOrders: purchaseOrderRows,
      receipts: receiptRows,
      salesTotal: sumBy(invoiceRows, (invoice) => invoice.total),
      vatTotal: sumBy(invoiceRows, (invoice) => invoice.vatAmt),
      outstanding: outstandingRows,
      pipeline: [
        { title: 'Open Enquiries', party: 'customer', items: data.enquiries.filter((enquiry) => enquiry.status === 'Active') },
        { title: 'Open Quotations', party: 'customerName', items: data.quotations.filter((quotation) => OPEN_QUOTATION_STATUSES.includes(quotation.status)) },
        { title: 'LPOs Awaiting Action', party: 'customerName', items: data.orders.filter((order) => order.status === 'Open') },
        { title: 'Open Purchase Orders', party: 'supplierName', items: data.purchaseOrders.filter((purchaseOrder) => OPEN_PURCHASE_ORDER_STATUSES.includes(purchaseOrder.status)) },
      ],
    }
  }, [data.enquiries, data.invoices, data.orders, data.purchaseOrders, data.quotations, data.receipts, inRange])

  return (
    <div className="page">
      <PageHeader title="Reports" icon="chart-bar">
        <Tabs label="Report type" idPrefix="reports" tabs={TABS} value={tab} onChange={setTab} />
        <DateRangeFilter from={range.from} to={range.to} onFromChange={range.setFrom} onToChange={range.setTo} />
      </PageHeader>

      <div
        role="tabpanel"
        id={`reports-panel-${tab}`}
        aria-labelledby={`reports-tab-${tab}`}
        tabIndex={0}
        className="tab-panel"
      >
        {tab === 'sales' && (
          <>
            <div className="grid grid--stats-sm">
              <StatCard large label="Invoices Issued" value={invoices.length} />
              <StatCard label="Sales incl.VAT" value={formatKES(salesTotal)} />
              <StatCard label="VAT Collected" value={formatKES(vatTotal)} />
              <StatCard label="Payments Received" value={formatKES(sumBy(receipts, (receipt) => receipt.amount))} />
            </div>
            <Card>
              <h2 className="card__title">Invoice Detail — {formatDate(range.from)} to {formatDate(range.to)}</h2>
              <DataTable
                columns={SALES_COLUMNS}
                rows={invoices}
                caption="Invoice detail"
                empty="No invoices in this period."
                footer={
                  <tr>
                    <td colSpan={3}>TOTAL</td>
                    <td className="cell--right">{formatKES(salesTotal - vatTotal)}</td>
                    <td className="cell--right">{formatKES(vatTotal)}</td>
                    <td className="cell--right cell--navy">{formatKES(salesTotal)}</td>
                    <td />
                  </tr>
                }
              />
            </Card>
          </>
        )}

        {tab === 'outstanding' && (
          <Card>
            <h2 className="card__title card__title--row">
              <span>Outstanding Invoices (All Time)</span>
              <strong className="tone-text tone-danger">{formatKES(sumBy(outstanding, (i) => i.total))}</strong>
            </h2>
            <DataTable columns={OUTSTANDING_COLUMNS} rows={outstanding} caption="Outstanding invoices" empty="No outstanding invoices." />
          </Card>
        )}

        {tab === 'procurement' && (
          <Card>
            <h2 className="card__title card__title--row">
              <span>Purchase Orders — {formatDate(range.from)} to {formatDate(range.to)}</span>
              <strong className="tone-text tone-neutral">{formatKES(sumBy(purchaseOrders, (p) => p.total))}</strong>
            </h2>
            <DataTable columns={PROCUREMENT_COLUMNS} rows={purchaseOrders} caption="Purchase orders" empty="No purchase orders in this period." />
          </Card>
        )}

        {tab === 'pipeline' && (
          <div className="grid grid--2">
            {pipeline.map(({ title, party, items }) => (
              <Card key={title}>
                <h2 className="card__title">{title} ({items.length})</h2>
                <DataTable
                  columns={pipelineColumns(party)}
                  rows={items.slice(0, 8)}
                  compact
                  caption={title}
                  empty="None open."
                />
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
