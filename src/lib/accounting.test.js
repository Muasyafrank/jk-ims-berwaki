import test from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_ACCOUNTS } from '../config/initialData.js'
import {
  autoJournal, buildTrialBalance, computeBalances, isManualJournal, journalTotals, netProfit, sortByCode,
} from './accounting.js'

const invoice = { ref: 'INV-0001', date: '2026-11-01', customerName: 'Acme', sub: 100, vatAmt: 16, total: 116 }

test('every auto-posted journal balances', () => {
  const docs = {
    invoice,
    receipt: { ref: 'R1', date: '2026-11-02', amount: 116 },
    purchaseorder: { ref: 'PO1', date: '2026-11-02', sub: 50, vatAmt: 8, total: 58 },
    creditnote: { ref: 'CN1', date: '2026-11-03', amount: 10, vatAmt: 1.6, total: 11.6 },
  }
  for (const [kind, doc] of Object.entries(docs)) {
    const journal = autoJournal(kind, doc)
    assert.ok(journalTotals(journal.lines).balanced, `${kind} journal is balanced`)
    assert.ok(journal.lines.every((l) => l.id), `${kind} lines have ids (stable React keys)`)
  }
  assert.equal(autoJournal('unknown', {}), null)
})

test('balances use natural signs per account type', () => {
  const bal = computeBalances(DEFAULT_ACCOUNTS, [autoJournal('invoice', invoice)])
  assert.equal(bal['1100'], 116) // receivable (asset, debit)
  assert.equal(bal['4000'], 100) // revenue (income, credit)
  assert.equal(bal['2100'], 16) // VAT output (liability, credit)
})

test('trial balance puts credit-normal accounts in the credit column and balances', () => {
  const bal = computeBalances(DEFAULT_ACCOUNTS, [autoJournal('invoice', invoice)])
  const tb = buildTrialBalance(DEFAULT_ACCOUNTS, bal)
  assert.equal(tb.totalDebit, 116)
  assert.equal(tb.totalCredit, 116)
  assert.ok(tb.balanced)
  const revenue = tb.rows.find((r) => r.code === '4000')
  assert.deepEqual([revenue.debit, revenue.credit], [0, 100])
})

test('a contra balance flips to the opposite column', () => {
  const journal = { lines: [{ account: '1000', debit: 0, credit: 50 }, { account: '3000', debit: 50, credit: 0 }] }
  const tb = buildTrialBalance(DEFAULT_ACCOUNTS, computeBalances(DEFAULT_ACCOUNTS, [journal]))
  assert.deepEqual(tb.rows.map((r) => [r.code, r.debit, r.credit]), [['1000', 0, 50], ['3000', 50, 0]])
  assert.ok(tb.balanced)
})

test('net profit = income − expenses; lines for unknown accounts are ignored', () => {
  const journals = [
    autoJournal('invoice', invoice),
    autoJournal('purchaseorder', { ref: 'P', sub: 40, vatAmt: 6.4, total: 46.4 }),
    { lines: [{ account: '9999', debit: 1, credit: 0 }] },
  ]
  const bal = computeBalances(DEFAULT_ACCOUNTS, journals)
  assert.equal(netProfit(DEFAULT_ACCOUNTS, bal), 60)
})

test('manual journals are those without an auto-post docType', () => {
  assert.ok(isManualJournal({ id: '1' }))
  assert.ok(isManualJournal({ docType: 'manual' }))
  assert.ok(!isManualJournal({ docType: 'invoice' }))
})

test('sortByCode does not mutate its input', () => {
  const input = [{ code: '2' }, { code: '1' }]
  assert.deepEqual(sortByCode(input).map((a) => a.code), ['1', '2'])
  assert.deepEqual(input.map((a) => a.code), ['2', '1'])
})
