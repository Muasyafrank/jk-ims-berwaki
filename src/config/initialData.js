import { PAYMENT_TERMS } from './constants.js'

const account = (code, name, type, description) => ({ id: code, code, name, type, description })

/** Default chart of accounts. Balances are always computed from journals, never stored. */
export const DEFAULT_ACCOUNTS = [
  account('1000', 'Cash & Bank', 'Asset', 'Cash on hand and bank accounts'),
  account('1100', 'Accounts Receivable', 'Asset', 'Customer invoices outstanding'),
  account('1200', 'VAT Input (16%)', 'Asset', 'VAT paid on purchases'),
  account('1500', 'Prepayments & Deposits', 'Asset', 'Deposits paid to suppliers'),
  account('2000', 'Accounts Payable', 'Liability', 'Supplier invoices owed'),
  account('2100', 'VAT Output (16%)', 'Liability', 'VAT collected on sales'),
  account('2200', 'Accruals', 'Liability', 'Accrued expenses'),
  account('3000', 'Share Capital', 'Equity', "Owner's investment"),
  account('3100', 'Retained Earnings', 'Equity', 'Accumulated profit'),
  account('4000', 'Sales Revenue', 'Income', 'All sales invoices'),
  account('4100', 'Other Income', 'Income', 'Miscellaneous income'),
  account('5000', 'Cost of Goods Sold', 'Expense', 'Purchase cost of goods sold'),
  account('5100', 'Operating Expenses', 'Expense', 'Salaries, rent, utilities'),
  account('5200', 'Transport & Delivery', 'Expense', 'Delivery costs'),
  account('5300', 'Bank Charges', 'Expense', 'Bank fees and charges'),
]

export const COLLECTIONS = [
  'customers', 'suppliers', 'enquiries', 'quotations', 'orders', 'purchaseOrders',
  'deliveries', 'invoices', 'receipts', 'creditNotes', 'statements', 'journals',
]

export const createInitialData = () => ({
  ...Object.fromEntries(COLLECTIONS.map((name) => [name, []])),
  accounts: DEFAULT_ACCOUNTS.map((a) => ({ ...a })),
})

export const DEFAULT_PAYMENT_TERMS = PAYMENT_TERMS[3]
