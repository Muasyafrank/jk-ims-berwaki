/** localStorage keys. Do not rename — existing users' saved data is stored under these. */
export const STORAGE_KEYS = {
  data: 'jkims_data_v1',
  settings: 'jkims_settings_v1',
  auth: 'jkims_auth_v1',
}

export const DEFAULT_VAT_RATE = 16

export const PAYMENT_TERMS = ['Immediate', '7 days', '14 days', '30 days', '45 days', '60 days']
export const PAYMENT_METHODS = ['Cash', 'Cheque', 'EFT', 'M-Pesa', 'Bank Transfer']

/** Status groups that several screens agree on. */
export const OUTSTANDING_INVOICE_STATUSES = ['Pending', 'Overdue', 'Partial']
export const OPEN_QUOTATION_STATUSES = ['Draft', 'Sent']
export const OPEN_PURCHASE_ORDER_STATUSES = ['Draft', 'Sent', 'Open']
export const OWED_PURCHASE_ORDER_STATUSES = ['Open', 'Received']
export const RECEIVED_PURCHASE_ORDER_STATUSES = ['Received', 'Closed']

export const ACCOUNT_TYPES = ['Asset', 'Liability', 'Equity', 'Income', 'Expense']

/** Account types whose natural balance is a debit. */
export const DEBIT_NORMAL_TYPES = ['Asset', 'Expense']

/** Dashboard pipeline, in workflow order. */
export const WORKFLOW_PHASES = [
  { label: 'Enquiry', collection: 'enquiries' },
  { label: 'Quotation', collection: 'quotations' },
  { label: 'LPO Received', collection: 'orders' },
  { label: 'Purchase Order', collection: 'purchaseOrders' },
  { label: 'Delivery', collection: 'deliveries' },
  { label: 'Invoice', collection: 'invoices' },
  { label: 'Receipt', collection: 'receipts' },
]

/** Document types that get auto-numbered references (configured in setup + settings). */
export const REFERENCE_DOC_TYPES = [
  { type: 'ENQ', label: 'Enquiry' },
  { type: 'QT', label: 'Quotation' },
  { type: 'PI', label: 'Proforma Invoice' },
  { type: 'LPO', label: 'LPO Received' },
  { type: 'PO', label: 'Purchase Order' },
  { type: 'DN', label: 'Delivery Note' },
  { type: 'INV', label: 'Tax Invoice' },
  { type: 'RCT', label: 'Receipt' },
  { type: 'CN', label: 'Credit Note' },
  { type: 'STA', label: 'Statement' },
]

export const DEFAULT_REF_CONFIG = (type) => ({ prefix: type, start: 1, pad: 4 })
