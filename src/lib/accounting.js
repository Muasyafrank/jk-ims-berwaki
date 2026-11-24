import { DEBIT_NORMAL_TYPES } from '../config/constants.js'
import { todayISO } from './dates.js'
import { genId } from './ids.js'
import { sumBy } from './calc.js'

const DEBIT_NORMAL = new Set(DEBIT_NORMAL_TYPES)

export const isDebitNormal = (type) => DEBIT_NORMAL.has(type)

/** Non-mutating sort by account code. */
export const sortByCode = (accounts = []) => [...(Array.isArray(accounts) ? accounts : [])]
  .sort((a, b) => String(a?.code ?? '').localeCompare(String(b?.code ?? '')))

/**
 * Balance per account code in its *natural* sign:
 * assets/expenses are positive when debit-heavy, liabilities/equity/income when credit-heavy.
 */
export function computeBalances(accounts, journals) {
  const typeByCode = new Map()
  const balances = {}
  for (const account of Array.isArray(accounts) ? accounts : []) {
    if (!account || !account.code) continue
    if (!typeByCode.has(account.code)) typeByCode.set(account.code, account.type)
    balances[account.code] = 0
  }
  for (const journal of Array.isArray(journals) ? journals : []) {
    for (const line of Array.isArray(journal?.lines) ? journal.lines : []) {
      if (!line) continue
      const type = typeByCode.get(line.account)
      if (!type) continue
      const debit = Number(line.debit) || 0
      const credit = Number(line.credit) || 0
      balances[line.account] += isDebitNormal(type) ? debit - credit : credit - debit
    }
  }
  return balances
}

/** Which trial-balance column a natural-sign balance belongs in. */
export function toTrialBalanceColumns(type, balance) {
  const debitSide = isDebitNormal(type) ? balance : -balance
  return debitSide >= 0 ? { debit: debitSide, credit: 0 } : { debit: 0, credit: -debitSide }
}

export function buildTrialBalance(accounts, balances) {
  const rows = sortByCode(accounts)
    .map((account) => ({ ...account, balance: balances[account.code] || 0 }))
    .filter((account) => account.balance !== 0)
    .map((account) => ({ ...account, ...toTrialBalanceColumns(account.type, account.balance) }))
  const totalDebit = sumBy(rows, (r) => r.debit)
  const totalCredit = sumBy(rows, (r) => r.credit)
  return { rows, totalDebit, totalCredit, balanced: Math.abs(totalDebit - totalCredit) < 0.01 }
}

/** Accounts of one type with their natural-sign balance attached. */
export const accountsOfType = (accounts, balances, type) =>
  accounts.filter((a) => a.type === type).map((a) => ({ ...a, balance: balances[a.code] || 0 }))

export function netProfit(accounts, balances) {
  const income = sumBy(accountsOfType(accounts, balances, 'Income'), (a) => a.balance)
  const expense = sumBy(accountsOfType(accounts, balances, 'Expense'), (a) => a.balance)
  return income - expense
}

export const journalTotals = (lines = []) => {
  const rows = Array.isArray(lines) ? lines : []
  const debit = sumBy(rows, (line) => line.debit)
  const credit = sumBy(rows, (line) => line.credit)
  return { debit, credit, balanced: Math.abs(debit - credit) < 0.01 }
}

/** Journals created by hand (as opposed to auto-posted from a document) can be edited/deleted. */
export const isManualJournal = (journal) => !journal.docType || journal.docType === 'manual'

const line = (account, description, debit, credit) => ({ id: genId(), account, description, debit, credit })

/**
 * Build the journal entry that a document posts to the ledger when it is first saved.
 * Returns null for document kinds that do not post.
 */
export function autoJournal(kind, doc) {
  const date = doc.date || todayISO()
  const ref = doc.ref || doc.id
  const header = (memo) => ({
    id: genId(), date, ref: `JNL-${ref}`, memo, docRef: ref, docType: kind, status: 'Posted',
  })

  switch (kind) {
    case 'invoice':
      return {
        ...header(`Tax Invoice ${ref} — ${doc.customerName || ''}`),
        lines: [
          line('1100', 'Accounts Receivable', Number(doc.total) || 0, 0),
          line('4000', 'Sales Revenue', 0, Number(doc.sub) || 0),
          line('2100', 'VAT Output (16%)', 0, Number(doc.vatAmt) || 0),
        ],
      }
    case 'receipt':
      return {
        ...header(`Receipt ${ref} — ${doc.customerName || ''}`),
        lines: [
          line('1000', 'Cash & Bank', Number(doc.amount) || 0, 0),
          line('1100', 'Accounts Receivable (cleared)', 0, Number(doc.amount) || 0),
        ],
      }
    case 'purchaseorder':
      return {
        ...header(`Purchase Order ${ref} — ${doc.supplierName || ''}`),
        lines: [
          line('5000', 'Cost of Goods Sold', Number(doc.sub) || 0, 0),
          line('1200', 'VAT Input (16%)', Number(doc.vatAmt) || 0, 0),
          line('2000', 'Accounts Payable', 0, Number(doc.total) || 0),
        ],
      }
    case 'creditnote':
      return {
        ...header(`Credit Note ${ref} — ${doc.customerName || ''}`),
        lines: [
          line('4000', 'Sales Revenue (reversed)', Number(doc.amount) || 0, 0),
          line('2100', 'VAT Output (reversed)', Number(doc.vatAmt) || 0, 0),
          line('1100', 'Accounts Receivable (reduced)', 0, Number(doc.total) || 0),
        ],
      }
    default:
      return null
  }
}
