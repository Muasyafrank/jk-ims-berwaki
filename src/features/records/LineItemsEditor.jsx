import Button from '../../components/ui/Button.jsx'
import { Input, NumberInput } from '../../components/ui/Field.jsx'
import { DEFAULT_VAT_RATE } from '../../config/constants.js'
import { calcTotals, lineTotal } from '../../lib/calc.js'
import { formatKES } from '../../lib/format.js'
import { genId } from '../../lib/ids.js'

/** Editable priced line items with live subtotal / VAT / total. `setItems` takes an updater fn. */
export default function LineItemsEditor({ items = [], setItems }) {
  const rows = (Array.isArray(items) ? items : []).filter((item) => item && typeof item === 'object')
  const { sub, vatAmt, total } = calcTotals(rows)

  const add = () =>
    setItems((list = []) => [
      ...(Array.isArray(list) ? list : []),
      { id: genId(), desc: '', qty: 1, unit: 'Pcs', unitPrice: 0, vat: DEFAULT_VAT_RATE },
    ])
  const update = (id, key, value) =>
    setItems((list = []) => (Array.isArray(list) ? list : []).map((item) => (item.id === id ? { ...item, [key]: value } : item)))
  const remove = (id) => setItems((list = []) => (Array.isArray(list) ? list : []).filter((item) => item.id !== id))

  const numberProps = (item, key) => ({
    right: true, value: item[key] ?? 0,
    onChange: (event) => update(item.id, key, event.target.value),
  })

  return (
    <div className="line-items">
      <div className="table-wrap">
        <table className="table table--compact">
          <caption className="sr-only">Line items</caption>
          <thead>
            <tr>
              <th scope="col">Description</th>
              <th scope="col" className="cell--right">Qty</th>
              <th scope="col">Unit</th>
              <th scope="col" className="cell--right">Unit Price</th>
              <th scope="col" className="cell--right">VAT %</th>
              <th scope="col" className="cell--right">Total</th>
              <th scope="col"><span className="sr-only">Remove</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={7} className="cell--muted">No line items yet — add the first one below.</td></tr>
            )}
            {rows.map((item, index) => (
              <tr key={item.id}>
                <td><Input className="col-desc" aria-label={`Line ${index + 1} description`} placeholder="Description" value={item.desc ?? ''} onChange={(event) => update(item.id, 'desc', event.target.value)} /></td>
                <td><NumberInput className="col-qty" aria-label={`Line ${index + 1} quantity`} {...numberProps(item, 'qty')} /></td>
                <td><Input className="col-unit" aria-label={`Line ${index + 1} unit`} value={item.unit ?? ''} onChange={(event) => update(item.id, 'unit', event.target.value)} /></td>
                <td><NumberInput className="col-price" aria-label={`Line ${index + 1} unit price`} {...numberProps(item, 'unitPrice')} /></td>
                <td><NumberInput className="col-vat" aria-label={`Line ${index + 1} VAT percent`} {...numberProps(item, 'vat')} /></td>
                <td className="cell--right cell--strong cell--nowrap">{formatKES(lineTotal(item))}</td>
                <td><Button variant="danger" size="sm" icon="x" aria-label={`Remove line ${index + 1}`} onClick={() => remove(item.id)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button variant="secondary" size="sm" icon="plus" onClick={add} className="mt-line">Add Line</Button>

      <div className="totals">
        <span>Subtotal (excl. VAT): <strong>{formatKES(sub)}</strong></span>
        <span>VAT: <strong>{formatKES(vatAmt)}</strong></span>
        <span className="totals__grand">Grand Total: {formatKES(total)}</span>
      </div>
    </div>
  )
}
