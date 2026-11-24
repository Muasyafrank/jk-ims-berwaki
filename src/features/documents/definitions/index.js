import { creditNotes, enquiries, invoices, orders, quotations, receipts, statements, deliveries } from './sales.jsx'
import { customers, suppliers } from './parties.jsx'
import { purchaseOrders } from './procurement.jsx'

/** Registers shown through <RecordPage/>, keyed by route id. */
export const REGISTERS = {
  customers,
  suppliers,
  enquiries,
  quotations,
  orders,
  deliveries,
  invoices,
  receipts,
  creditnotes: creditNotes,
  statements,
  purchaseorders: purchaseOrders,
}
