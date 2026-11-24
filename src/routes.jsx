import { lazy } from 'react'
import { NAVIGATION } from './config/navigation.js'

/** Load a named export lazily so each area of the app becomes its own chunk. */
const named = (loader, name) => lazy(() => loader().then((module) => ({ default: module[name] })))
const registers = () => import('./features/documents/pages.jsx')
const dashboard = lazy(() => import('./features/dashboard/Dashboard.jsx'))

// Lower-case names: these are lazy *references* in a registry, not exported components.
const reports = lazy(() => import('./features/reports/Reports.jsx'))
const debtors = lazy(() => import('./features/reports/Debtors.jsx'))
const settings = lazy(() => import('./features/settings/Settings.jsx'))
const accounting = (name) => lazy(() => import(`./features/accounting/${name}.jsx`))

const PAGES = {
  dashboard,
  enquiries: named(registers, 'EnquiriesPage'),
  quotations: named(registers, 'QuotationsPage'),
  orders: named(registers, 'OrdersPage'),
  deliveries: named(registers, 'DeliveriesPage'),
  invoices: named(registers, 'InvoicesPage'),
  receipts: named(registers, 'ReceiptsPage'),
  creditnotes: named(registers, 'CreditNotesPage'),
  statements: named(registers, 'StatementsPage'),
  purchaseorders: named(registers, 'PurchaseOrdersPage'),
  suppliers: named(registers, 'SuppliersPage'),
  customers: named(registers, 'CustomersPage'),
  debtors,
  accounts: accounting('ChartOfAccounts'),
  journal: accounting('GeneralLedger'),
  trialbalance: accounting('TrialBalance'),
  pandl: accounting('ProfitLoss'),
  balancesheet: accounting('BalanceSheet'),
  vatreturn: accounting('VatReturn'),
  cashflow: accounting('CashFlow'),
  debtoraging: accounting('DebtorAging'),
  reports,
  settings,
}

/** Navigation sections with their page component attached. */
export const NAV_SECTIONS = NAVIGATION.map((section) => ({
  ...section,
  routes: section.routes.map((route) => ({ ...route, component: PAGES[route.id] })),
}))

export const ROUTES = NAV_SECTIONS.flatMap((section) => section.routes)
