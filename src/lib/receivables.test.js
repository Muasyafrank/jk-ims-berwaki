import test from 'node:test'
import assert from 'node:assert/strict'
import { AGING_BUCKETS, agingDays, bucketFor, customerBalances, supplierBalances } from './receivables.js'

test('aging buckets partition every number of days', () => {
  for (const d of [-30, 0, 1, 30, 31, 60, 61, 90, 91, 400]) {
    assert.equal(AGING_BUCKETS.filter((b) => b.test(d)).length, 1, `day ${d}`)
  }
  assert.equal(bucketFor(45).label, '31–60 days')
})

test('aging uses the due date, falling back to the invoice date', () => {
  assert.equal(agingDays({ dueDate: '2026-11-01', date: '2026-10-01' }, '2026-11-13'), 12)
  assert.equal(agingDays({ date: '2026-11-01' }, '2026-11-13'), 12)
  assert.equal(agingDays({}, '2026-11-13'), 0)
})

test('customer balances only list customers with outstanding invoices', () => {
  const customers = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }]
  const invoices = [
    { customerName: 'A', status: 'Pending', total: 100 },
    { customerName: 'A', status: 'Paid', total: 999 },
    { customerName: 'B', status: 'Paid', total: 50 },
  ]
  const receipts = [{ customerName: 'A', amount: 30 }]
  const rows = customerBalances(customers, invoices, receipts)
  assert.equal(rows.length, 1)
  assert.deepEqual([rows[0].invoiced, rows[0].paid, rows[0].balance], [100, 30, 70])
})

test('supplier balances sum open and received purchase orders', () => {
  const rows = supplierBalances(
    [{ name: 'Z' }, { name: 'Y' }],
    [{ supplierName: 'Z', status: 'Open', total: 10 }, { supplierName: 'Z', status: 'Received', total: 5 },
     { supplierName: 'Z', status: 'Closed', total: 100 }, { supplierName: 'Y', status: 'Draft', total: 7 }],
  )
  assert.deepEqual(rows.map((r) => [r.name, r.owed]), [['Z', 15]])
})
