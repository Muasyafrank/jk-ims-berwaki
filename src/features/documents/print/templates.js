import { formatDateLong, formatKES } from '../../../lib/format.js'
import { calcNoteTotals } from '../../../lib/calc.js'
import { html } from '../../../lib/html.js'
import {
  companyDetails, detailsBlock, docFooter, docHeader, lineItemsTable, note, optionalRow, party, row, section,
  signatures, twoColumns,
} from './layout.js'

/** Each template turns one saved document + the company settings into printable HTML. */
const page = (...parts) => html`<div>${parts}</div>`
const billTo = (doc, title = 'Bill To') =>
  party(title, doc.customerName, doc.customerAddress, doc.customerPin && `KRA PIN: ${doc.customerPin}`)
const header = (settings, title, doc, subline = formatDateLong(doc.date)) =>
  docHeader(settings, { title, ref: doc.ref, subline })

export const quotationTemplate = (doc, settings) => page(
  header(settings, 'QUOTATION', doc),
  twoColumns(
    billTo(doc),
    detailsBlock('Quotation Details',
      row('Quotation Ref', doc.ref),
      row('Date', formatDateLong(doc.date)),
      row('Valid Until', formatDateLong(doc.validUntil)),
      row('Payment Terms', doc.paymentTerms || '30 days'),
      row('Delivery', doc.delivery),
      optionalRow('Enquiry Ref', doc.enquiryRef)),
  ),
  section('Items', lineItemsTable(doc.items)),
  note(doc.notes && html`<strong>Notes/Terms:</strong> ${doc.notes}`),
  signatures('Authorised Signature & Date', 'Company Seal', 'Client Acceptance & Date'),
  docFooter(settings),
)

export const invoiceTemplate = (doc, settings) => {
  const hasBank = doc.bankName || doc.bankAccount
  const company = companyDetails(settings)
  return page(
    header(settings, 'TAX INVOICE', doc),
    twoColumns(
      billTo(doc),
      detailsBlock('Invoice Details',
        row('Invoice Ref', doc.ref),
        row('Date', formatDateLong(doc.date)),
        row('Payment Due', formatDateLong(doc.dueDate)),
        optionalRow('LPO Reference', doc.lpoRef),
        optionalRow('Delivery Note', doc.dnRef)),
    ),
    section('Items', lineItemsTable(doc.items)),
    hasBank && section('Payment Details',
      row('Bank', doc.bankName),
      row('Account Number', doc.bankAccount),
      row('Branch', doc.bankBranch),
      row('Account Name', company.bizName)),
    note('E.&O.E. — This is a Tax Invoice. Accounts are due on demand.'),
    signatures('Authorised Signature & Date', `For: ${company.bizName}`),
    docFooter(settings),
  )
}

export const receiptTemplate = (doc, settings) => page(
  header(settings, 'OFFICIAL RECEIPT', doc),
  section('Payment Received',
    row('Received From', html`<strong>${doc.customerName}</strong>`),
    row('Amount (Figures)', html`<strong>${formatKES(doc.amount)}</strong>`),
    row('Amount (Words)', doc.amountWords),
    row('Payment Method', doc.paymentMethod),
    row('Transaction Ref', doc.chequeRef),
    row('Invoice Reference', doc.invoiceRef),
    row('Received By', doc.cashier || 'ADMIN'),
    optionalRow('Notes', doc.notes)),
  signatures('Cashier / Received By', 'Customer Signature'),
  docFooter(settings),
)

export const deliveryNoteTemplate = (doc, settings) => {
  const lines = Array.isArray(doc.items)
    ? doc.items.map((item) => (typeof item === 'string' ? item : item?.desc ?? '')).filter(Boolean)
    : String(doc.items || '').split('\n').filter(Boolean)
  return page(
    header(settings, 'DELIVERY NOTE', doc),
    twoColumns(
      party('Deliver To', doc.customerName, doc.customerAddress),
      detailsBlock('References',
        row('Delivery Note', doc.ref),
        row('Invoice Ref', doc.invoiceRef),
        row('LPO Ref', doc.lpoRef),
        row('Date', formatDateLong(doc.date))),
    ),
    section('Goods Delivered', html`
      <table class="ph-table">
        <thead><tr><th>#</th><th>Description of Goods</th><th>Condition</th></tr></thead>
        <tbody>
          ${(lines.length ? lines : [Array.isArray(doc.items) ? '' : doc.items || '']).map((line, i) => html`<tr><td>${i + 1}</td><td>${line}</td><td>Good</td></tr>`)}
        </tbody>
      </table>`),
    note('Please receive the above goods in good order and condition.'),
    signatures('Delivered By / Driver Name', 'Received By (Name & Signature)', 'Date Received'),
    docFooter(settings, 'E.&O.E.'),
  )
}

export const purchaseOrderTemplate = (doc, settings) => {
  const company = companyDetails(settings)
  return page(
    header(settings, 'PURCHASE ORDER', doc),
    twoColumns(
      party('Supplier', doc.supplierName, doc.supplierAddress),
      detailsBlock('Order Details',
        row('PO Reference', doc.ref),
        row('Date', formatDateLong(doc.date)),
        optionalRow('Customer LPO Ref', doc.lpoRef),
        row('Required Delivery', formatDateLong(doc.deliveryDate)),
        row('Deliver To', doc.deliveryTo),
        row('Payment Terms', doc.paymentTerms || '30 days')),
    ),
    section('Items Ordered', lineItemsTable(doc.items)),
    note(doc.notes && html`<strong>Notes:</strong> ${doc.notes}`),
    signatures(`Authorised By (${company.bizName})`, 'Supplier Acknowledgement'),
    docFooter(settings),
  )
}

export const statementTemplate = (doc, settings) => page(
  header(settings, 'STATEMENT', doc, doc.period),
  twoColumns(
    party('Statement For', doc.customerName),
    detailsBlock('Details',
      row('Statement Ref', doc.ref),
      row('Period', doc.period),
      row('Statement Date', formatDateLong(doc.date)),
      row('Payment Due', formatDateLong(doc.dueDate))),
  ),
  section('Account Summary', html`
    <table class="ph-table">
      <thead><tr><th>Description</th><th class="r">Amount</th></tr></thead>
      <tbody>
        <tr><td>Opening Balance</td><td class="r">${formatKES(doc.openingBalance)}</td></tr>
        ${doc.invoices && html`<tr><td>Invoices: ${doc.invoices}</td><td class="r"></td></tr>`}
        ${doc.payments && html`<tr><td>Payments Received: ${doc.payments}</td><td class="r"></td></tr>`}
        ${doc.credits && html`<tr><td>Credits: ${doc.credits}</td><td class="r"></td></tr>`}
        <tr class="total-row"><td><strong>Closing Balance / Amount Due</strong></td><td class="r"><strong>${formatKES(doc.closingBalance)}</strong></td></tr>
      </tbody>
    </table>`),
  note(doc.notes),
  signatures('Authorised By', 'Date'),
  docFooter(settings),
)

export const creditNoteTemplate = (doc, settings) => {
  const rate = doc.vat ?? 16
  const { vatAmt, total } = calcNoteTotals(doc.amount, rate)
  return page(
    header(settings, (doc.type || 'Credit Note').toUpperCase(), doc),
    section('Details',
      row('Issued To', html`<strong>${doc.customerName}</strong>`),
      row('Original Invoice', doc.originalInvoice),
      row('Amount (excl.VAT)', formatKES(doc.amount)),
      row(`VAT (${rate}%)`, formatKES(doc.vatAmt ?? vatAmt)),
      row('Total Credit', html`<strong>${formatKES(doc.total ?? total)}</strong>`),
      row('Reason', doc.reason)),
    signatures('Authorised Signature', 'Date'),
    docFooter(settings),
  )
}
