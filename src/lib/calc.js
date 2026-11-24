const num = (value) => Number(value) || 0
const listOf = (items) => (Array.isArray(items) ? items : [])

export const lineSubtotal = (item) => num(item?.qty) * num(item?.unitPrice)
export const lineVat = (item) => lineSubtotal(item) * (num(item?.vat) / 100)
export const lineTotal = (item) => lineSubtotal(item) + lineVat(item)

/** Subtotal (excl. VAT), VAT amount and grand total for a list of line items. */
export function calcTotals(items = []) {
  const rows = listOf(items)
  const sub = rows.reduce((sum, item) => sum + lineSubtotal(item), 0)
  const vatAmt = rows.reduce((sum, item) => sum + lineVat(item), 0)
  return { sub, vatAmt, total: sub + vatAmt }
}

/** Coerce the numeric fields of line items (inputs hold strings while typing). */
export const normalizeItems = (items = []) =>
  listOf(items).filter((item) => item && typeof item === 'object').map((item) => ({
    ...item,
    qty: num(item.qty),
    unitPrice: num(item.unitPrice),
    vat: num(item.vat),
  }))

/** Credit/debit-note amounts: VAT and gross total from a net amount and rate. */
export function calcNoteTotals(amount, vatRate) {
  const net = num(amount)
  const vatAmt = net * (num(vatRate) / 100)
  return { vatAmt, total: net + vatAmt }
}

/** Sum a numeric property (or derived value) over rows, treating missing values as 0. */
export const sumBy = (rows, pick) => (Array.isArray(rows) ? rows : [])
  .reduce((total, row) => total + (Number(pick(row)) || 0), 0)
