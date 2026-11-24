import { useMemo } from 'react'
import Card from '../../components/ui/Card.jsx'
import DateRangeFilter from '../../components/ui/DateRangeFilter.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import { RECEIVED_PURCHASE_ORDER_STATUSES } from '../../config/constants.js'
import { useApp } from '../../context/AppContext.js'
import { useDateRange } from '../../hooks/useDateRange.js'
import { sumBy } from '../../lib/calc.js'
import { formatDate, formatKES } from '../../lib/format.js'

function VatBox({ title, tone, rows }) {
  return (
    <Card accent tone={tone}>
      <h2 className="statement__title statement__title--caps">{title}</h2>
      {rows.map(([label, value, strong]) => (
        <div key={label} className={`statement__row ${strong ? 'statement__row--strong' : ''}`}>
          <span>{label}</span>
          <span className={strong ? 'tone-text' : undefined}>{value}</span>
        </div>
      ))}
    </Card>
  )
}

export default function VatReturn() {
  const { data } = useApp()
  const range = useDateRange()
  const { inRange } = range

  const { invoices, purchases, invoiceVat, creditVat, outputVat, inputVat, net } = useMemo(() => {
    const invoiceRows = inRange(data.invoices)
    const creditRows = inRange(data.creditNotes)
      .filter((creditNote) => creditNote.type === 'Credit Note')
    const purchaseRows = inRange(data.purchaseOrders)
      .filter((purchaseOrder) => RECEIVED_PURCHASE_ORDER_STATUSES.includes(purchaseOrder.status))
    const invoicesVat = sumBy(invoiceRows, (invoice) => invoice.vatAmt)
    const creditsVat = sumBy(creditRows, (creditNote) => creditNote.vatAmt)
    const output = invoicesVat - creditsVat
    const input = sumBy(purchaseRows, (purchaseOrder) => purchaseOrder.vatAmt)

    return {
      invoices: invoiceRows,
      purchases: purchaseRows,
      invoiceVat: invoicesVat,
      creditVat: creditsVat,
      outputVat: output,
      inputVat: input,
      net: output - input,
    }
  }, [data.creditNotes, data.invoices, data.purchaseOrders, inRange])

  return (
    <div className="page">
      <PageHeader title="VAT Return Summary" icon="receipt-tax" subtitle={`${formatDate(range.from)} — ${formatDate(range.to)} · Rate: 16% · KRA VAT-3`}>
        <DateRangeFilter from={range.from} to={range.to} onFromChange={range.setFrom} onToChange={range.setTo} />
      </PageHeader>

      <div className="grid grid--2">
        <VatBox title="OUTPUT VAT (Collected on Sales)" tone="danger" rows={[
          ['Taxable Sales (excl.VAT)', formatKES(sumBy(invoices, (i) => i.sub))],
          ['VAT on Invoices', formatKES(invoiceVat)],
          ['Less: VAT on Credit Notes', `(${formatKES(creditVat)})`],
          ['Net Output VAT', formatKES(outputVat), true],
        ]} />
        <VatBox title="INPUT VAT (Paid on Purchases)" tone="success" rows={[
          ['Taxable Purchases (excl.VAT)', formatKES(sumBy(purchases, (p) => p.sub))],
          ['VAT on Purchase Orders', formatKES(inputVat)],
          ['Net Input VAT', formatKES(inputVat), true],
        ]} />
      </div>

      <Card accent tone="neutral" className="stat">
        <div className="card__note card__note--eyebrow">
          {net >= 0 ? 'VAT PAYABLE TO KRA' : 'VAT RECLAIMABLE FROM KRA'}
        </div>
        <div className={`stat-lg tone-${net >= 0 ? 'danger' : 'success'}`}>{formatKES(Math.abs(net))}</div>
        <div className="stat__label">Output VAT {formatKES(outputVat)} − Input VAT {formatKES(inputVat)}</div>
      </Card>
    </div>
  )
}
