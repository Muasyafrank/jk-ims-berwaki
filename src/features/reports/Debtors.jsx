import { useMemo } from 'react'
import Card from '../../components/ui/Card.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import { useApp } from '../../context/AppContext.js'
import { sumBy } from '../../lib/calc.js'
import { formatKES } from '../../lib/format.js'
import { customerBalances, supplierBalances } from '../../lib/receivables.js'

const DEBTOR_COLUMNS = [
  { key: 'name', header: 'Customer' },
  { key: 'invoiced', header: 'Invoiced', align: 'right', small: true, render: (r) => formatKES(r.invoiced) },
  { key: 'paid', header: 'Paid', align: 'right', small: true, tone: 'success', render: (r) => formatKES(r.paid) },
  { key: 'balance', header: 'Balance', align: 'right', strong: true,
    render: (r) => <span className={r.balance > 0 ? 'cell--danger' : 'cell--success'}>{formatKES(r.balance)}</span> },
]

const CREDITOR_COLUMNS = [
  { key: 'name', header: 'Supplier' },
  { key: 'owed', header: 'PO Value Owed', align: 'right', strong: true, tone: 'warning', render: (r) => formatKES(r.owed) },
]

export default function Debtors() {
  const { data } = useApp()
  const { debtors, creditors } = useMemo(() => ({
    debtors: customerBalances(data.customers, data.invoices, data.receipts),
    creditors: supplierBalances(data.suppliers, data.purchaseOrders),
  }), [data.customers, data.invoices, data.purchaseOrders, data.receipts, data.suppliers])

  return (
    <div className="page">
      <PageHeader title="Debtors & Creditors" icon="coin" />

      <div className="grid grid--2">
        <Card tinted tone="danger">
          <div className="card__note card__note--eyebrow">Total Owed to Berwaki</div>
          <div className="stat-lg">{formatKES(sumBy(debtors, (d) => d.balance))}</div>
        </Card>
        <Card tinted tone="warning">
          <div className="card__note card__note--eyebrow">Total Owed to Suppliers</div>
          <div className="stat-lg">{formatKES(sumBy(creditors, (c) => c.owed))}</div>
        </Card>
      </div>

      <div className="grid grid--2">
        <Card>
          <h2 className="card__title">Debtors — Customers Owing</h2>
          <DataTable columns={DEBTOR_COLUMNS} rows={debtors} compact caption="Debtors" empty="No outstanding customer balances." />
        </Card>
        <Card>
          <h2 className="card__title">Creditors — Owed to Suppliers</h2>
          <DataTable columns={CREDITOR_COLUMNS} rows={creditors} compact caption="Creditors" empty="No outstanding supplier balances." />
        </Card>
      </div>
    </div>
  )
}
