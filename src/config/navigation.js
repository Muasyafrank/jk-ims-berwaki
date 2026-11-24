/**
 * Navigation model: labels, icons and route ids only — no React.
 * The page components are attached in routes.jsx, keeping this module safe to
 * import from anywhere (including tests and non-React code).
 */
export const NAVIGATION = [
  { title: 'Overview', routes: [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  ] },
  { title: 'Customer Workflow', routes: [
    { id: 'enquiries', label: 'Enquiries', icon: 'mail-opened' },
    { id: 'quotations', label: 'Quotations', icon: 'file-description' },
    { id: 'orders', label: 'LPO Register', icon: 'clipboard-list' },
    { id: 'deliveries', label: 'Delivery Notes', icon: 'truck' },
    { id: 'invoices', label: 'Tax Invoices', icon: 'file-invoice' },
    { id: 'receipts', label: 'Receipts', icon: 'receipt' },
    { id: 'creditnotes', label: 'Credit / Debit Notes', icon: 'file-minus' },
    { id: 'statements', label: 'Statements', icon: 'report-money' },
  ] },
  { title: 'Procurement', routes: [
    { id: 'purchaseorders', label: 'Purchase Orders', icon: 'shopping-cart' },
    { id: 'suppliers', label: 'Suppliers', icon: 'building-store' },
  ] },
  { title: 'Relations', routes: [
    { id: 'customers', label: 'Customers', icon: 'users' },
    { id: 'debtors', label: 'Debtors / Creditors', icon: 'coin' },
  ] },
  { title: 'Accounting', routes: [
    { id: 'accounts', label: 'Chart of Accounts', icon: 'book' },
    { id: 'journal', label: 'General Ledger', icon: 'list-details' },
    { id: 'trialbalance', label: 'Trial Balance', icon: 'scale' },
    { id: 'pandl', label: 'Profit & Loss', icon: 'trending-up' },
    { id: 'balancesheet', label: 'Balance Sheet', icon: 'building-bank' },
    { id: 'vatreturn', label: 'VAT Return', icon: 'receipt-tax' },
    { id: 'cashflow', label: 'Cash Flow', icon: 'arrows-exchange' },
    { id: 'debtoraging', label: 'Debtor Aging', icon: 'clock-hour-3' },
  ] },
  { title: 'System', routes: [
    { id: 'reports', label: 'Reports', icon: 'chart-bar' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ] },
]

export const ROUTE_IDS = NAVIGATION.flatMap((section) => section.routes.map((route) => route.id))
export const DEFAULT_ROUTE = 'dashboard'
