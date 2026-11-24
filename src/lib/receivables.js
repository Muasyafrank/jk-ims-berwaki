import {
  OUTSTANDING_INVOICE_STATUSES,
  OWED_PURCHASE_ORDER_STATUSES,
} from '../config/constants.js'
import { daysBetween } from './dates.js'

const OUTSTANDING_STATUSES = new Set(OUTSTANDING_INVOICE_STATUSES)
const OWED_PURCHASE_ORDER_STATUSES_SET = new Set(OWED_PURCHASE_ORDER_STATUSES)

export const outstandingInvoices = (invoices = []) =>
  (Array.isArray(invoices) ? invoices : []).filter((invoice) => OUTSTANDING_STATUSES.has(invoice?.status))

/** Days past due as of `today` (<= 0 means not yet due). Falls back to the invoice date. */
export const agingDays = (invoice, today) => {
  const source = invoice ?? {}
  const days = daysBetween(source.dueDate || source.date, today)
  return Number.isFinite(days) ? days : 0
}

export const AGING_BUCKETS = [
  { label: 'Current (not due)', tone: 'success', test: (d) => d <= 0 },
  { label: '1–30 days', tone: 'info', test: (d) => d > 0 && d <= 30 },
  { label: '31–60 days', tone: 'warning', test: (d) => d > 30 && d <= 60 },
  { label: '61–90 days', tone: 'gold', test: (d) => d > 60 && d <= 90 },
  { label: 'Over 90 days', tone: 'danger', test: (d) => d > 90 },
]

export const bucketFor = (days) => AGING_BUCKETS.find((bucket) => bucket.test(days))

/**
 * Customers who owe money: outstanding invoice total less receipts received from that customer.
 * (Matches the original behaviour: every receipt from the customer is netted off, not only
 * those linked to the outstanding invoices.)
 */
export function customerBalances(customers, invoices, receipts) {
  const invoicedByCustomer = new Map()
  const paidByCustomer = new Map()

  for (const invoice of outstandingInvoices(invoices)) {
    invoicedByCustomer.set(
      invoice.customerName,
      (invoicedByCustomer.get(invoice.customerName) ?? 0) + (Number(invoice.total) || 0),
    )
  }

  for (const receipt of (Array.isArray(receipts) ? receipts : [])) {
    if (!receipt) continue
    paidByCustomer.set(
      receipt.customerName,
      (paidByCustomer.get(receipt.customerName) ?? 0) + (Number(receipt.amount) || 0),
    )
  }

  return (Array.isArray(customers) ? customers : [])
    .map((customer) => {
      if (!customer) return null
      const invoiced = invoicedByCustomer.get(customer.name) ?? 0
      const paid = paidByCustomer.get(customer.name) ?? 0
      return { ...customer, invoiced, paid, balance: invoiced - paid }
    })
    .filter((customer) => customer?.invoiced > 0)
}

/** Suppliers we owe money to, from open/received purchase orders. */
export function supplierBalances(suppliers, purchaseOrders) {
  const owedBySupplier = new Map()

  for (const purchaseOrder of (Array.isArray(purchaseOrders) ? purchaseOrders : [])) {
    if (!purchaseOrder || !OWED_PURCHASE_ORDER_STATUSES_SET.has(purchaseOrder.status)) continue
    owedBySupplier.set(
      purchaseOrder.supplierName,
      (owedBySupplier.get(purchaseOrder.supplierName) ?? 0) + (Number(purchaseOrder.total) || 0),
    )
  }

  return (Array.isArray(suppliers) ? suppliers : [])
    .map((supplier) => (supplier ? {
      ...supplier,
      owed: owedBySupplier.get(supplier.name) ?? 0,
    } : null))
    .filter((supplier) => supplier?.owed > 0)
}
