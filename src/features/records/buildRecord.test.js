import test from 'node:test'
import assert from 'node:assert/strict'
import { buildRecord } from './buildRecord.js'

const fields = [{ name: 'amount', type: 'number' }, { name: 'note' }]

test('coerces numeric fields and stamps the document type', () => {
  const out = buildRecord({ fields, docType: 'Receipt' }, { amount: '1500', note: 'x' })
  assert.deepEqual(out, { amount: 1500, note: 'x', _type: 'Receipt' })
})

test('blank numeric input becomes 0', () => {
  assert.equal(buildRecord({ fields }, { amount: '' }).amount, 0)
})

test('documents with line items get normalised items and totals', () => {
  const form = { items: [{ id: 'a', qty: '2', unitPrice: '100', vat: '16' }] }
  const out = buildRecord({ fields: [], hasItems: true, docType: 'Invoice' }, form)
  assert.deepEqual([out.sub, out.vatAmt, out.total], [200, 32, 232])
  assert.equal(out.items[0].qty, 2)
})

test('prepare runs after coercion and docType may depend on the record', () => {
  const def = {
    fields,
    prepare: (r) => ({ ...r, doubled: r.amount * 2 }),
    docType: (r) => (r.amount > 10 ? 'Big' : 'Small'),
  }
  const out = buildRecord(def, { amount: '20' })
  assert.deepEqual([out.doubled, out._type], [40, 'Big'])
})

test('does not mutate the form it was given', () => {
  const form = { amount: '5' }
  buildRecord({ fields, docType: 'X' }, form)
  assert.deepEqual(form, { amount: '5' })
})
