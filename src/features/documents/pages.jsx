import RecordPage from '../records/RecordPage.jsx'
import { REGISTERS } from './definitions.jsx'

/** One page component per register route. Kept in one module so they share a single lazy chunk. */
const page = (id) => function RegisterPage() { return <RecordPage definition={REGISTERS[id]} /> }

export const CustomersPage = page('customers')
export const SuppliersPage = page('suppliers')
export const EnquiriesPage = page('enquiries')
export const QuotationsPage = page('quotations')
export const OrdersPage = page('orders')
export const DeliveriesPage = page('deliveries')
export const InvoicesPage = page('invoices')
export const ReceiptsPage = page('receipts')
export const CreditNotesPage = page('creditnotes')
export const StatementsPage = page('statements')
export const PurchaseOrdersPage = page('purchaseorders')
