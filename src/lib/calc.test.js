import test from 'node:test'
import assert from 'node:assert/strict'
import { calcNoteTotals, calcTotals, normalizeItems, sumBy } from './calc.js'

test('calcTotals handles mixed VAT rates', () => {
  const items = [
    { qty: 2, unitPrice: 12500, vat: 16 },
    { qty: 3, unitPrice: 4200, vat: 0 },
  ]
  assert.deepEqual(calcTotals(items), { sub: 37600, vatAmt: 4000, total: 41600 })
})

test('calcTotals tolerates empty rows and string input from form fields', () => {
  assert.deepEqual(calcTotals([]), { sub: 0, vatAmt: 0, total: 0 })
  assert.deepEqual(calcTotals([{ qty: '', unitPrice: '5', vat: '16' }]), { sub: 0, vatAmt: 0, total: 0 })
  assert.deepEqual(calcTotals([{ qty: '2', unitPrice: '50', vat: '10' }]), { sub: 100, vatAmt: 10, total: 110 })
})

test('normalizeItems coerces numeric fields and keeps the rest', () => {
  assert.deepEqual(normalizeItems([{ id: 'a', desc: 'x', qty: '3', unitPrice: '', vat: '16' }]),
    [{ id: 'a', desc: 'x', qty: 3, unitPrice: 0, vat: 16 }])
})

test('credit-note totals respect a 0% VAT rate', () => {
  assert.deepEqual(calcNoteTotals(1000, 16), { vatAmt: 160, total: 1160 })
  assert.deepEqual(calcNoteTotals(1000, 0), { vatAmt: 0, total: 1000 })
})

test('sumBy treats missing values as zero', () => {
  assert.equal(sumBy([{ a: 1 }, {}, { a: '2' }], (r) => r.a), 3)
})
