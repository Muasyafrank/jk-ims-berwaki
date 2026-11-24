import { PAYMENT_METHODS, PAYMENT_TERMS } from '../../../config/constants.js'
import { autoJournal } from '../../../lib/accounting.js'
import { calcNoteTotals } from '../../../lib/calc.js'
import { formatKES, truncate } from '../../../lib/format.js'
import { genId } from '../../../lib/ids.js'
import { dateColumn, moneyColumn, monoColumn, refColumn, statusColumn } from '../../records/columns.jsx'
import {
  creditNoteTemplate, deliveryNoteTemplate, invoiceTemplate, quotationTemplate, receiptTemplate, statementTemplate,
} from '../print/templates.js'
import { area, date, half, money, reference, select, text } from './fields.js'

export const enquiries = {
  id: 'enquiries', collection: 'enquiries', title: 'Enquiries & Leads', singular: 'Enquiry', icon: 'mail-opened',
  addLabel: 'New Enquiry', saveLabel: 'Save Enquiry',
  modalTitle: { new: 'New Enquiry', edit: 'Edit Enquiry' },
  refType: 'ENQ', docType: 'Enquiry',
  searchKeys: ['ref', 'customer', 'description'],
  columns: [
    refColumn(),
    dateColumn('date', 'Date'),
    { key: 'customer', header: 'Customer/Lead' },
    { key: 'description', header: 'Requirements', render: (row) => truncate(row.description) },
    { key: 'source', header: 'Source' },
    statusColumn,
  ],
  fields: [
    reference('Reference'),
    date('date', 'Date'),
    text('customer', 'Customer / Organisation'),
    half('contactPerson', 'Contact Person'),
    half('phone', 'Phone'),
    half('email', 'Email'),
    select('source', 'Source', ['Direct', 'Phone', 'Email', 'Referral', 'Tender', 'Walk-in', 'Website']),
    select('status', 'Status', ['Active', 'Follow Up', 'Converted', 'Lost', 'On Hold']),
    area('description', 'Requirements / Description', 3),
    date('followUpDate', 'Follow-Up Date'),
    half('notes', 'Notes'),
  ],
  blank: ({ ref, today }) => ({
    id: genId(), ref, date: today, customer: '', contactPerson: '', phone: '', email: '',
    description: '', source: 'Direct', status: 'Active', followUpDate: '', notes: '',
  }),
}

export const quotations = {
  id: 'quotations', collection: 'quotations', title: 'Quotations', singular: 'Quotation', icon: 'file-description',
  addLabel: 'New Quotation', saveLabel: 'Save Quotation',
  modalTitle: { new: 'New Quotation', edit: 'Edit Quotation' },
  refType: 'QT', docType: 'Quotation', hasItems: true, wide: true,
  template: quotationTemplate,
  columns: [
    refColumn(),
    dateColumn('date', 'Date'),
    { key: 'customerName', header: 'Customer' },
    dateColumn('validUntil', 'Valid Until'),
    moneyColumn('total', 'Total (incl.VAT)'),
    statusColumn,
  ],
  fields: [
    reference('Quotation Ref'),
    date('date', 'Date'),
    date('validUntil', 'Valid Until'),
    select('status', 'Status', ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired']),
    text('customerName', 'Customer Name'),
    half('customerAddress', 'Customer Address'),
    half('customerPin', 'Customer KRA PIN'),
    select('paymentTerms', 'Payment Terms', PAYMENT_TERMS),
    half('delivery', 'Delivery Timeline'),
    half('enquiryRef', 'Enquiry Ref', { mono: true }),
    area('notes', 'Notes / Terms'),
  ],
  blank: ({ ref, today }) => ({
    id: genId(), ref, date: today, validUntil: '', customerName: '', customerAddress: '', customerPin: '',
    paymentTerms: '30 days', delivery: '7 working days', notes: '', status: 'Draft', enquiryRef: '', items: [],
  }),
}

export const orders = {
  id: 'orders', collection: 'orders', title: 'LPO Register', singular: 'LPO', icon: 'clipboard-list',
  addLabel: 'Log LPO', saveLabel: 'Save LPO Record',
  modalTitle: { new: 'Log Received LPO', edit: 'Edit LPO' },
  refType: 'LPO', docType: 'LPO Received', wide: true,
  columns: [
    refColumn('Internal Ref'),
    { key: 'customerLPONo', header: 'Customer LPO No', mono: true },
    dateColumn('date', 'Date'),
    { key: 'customerName', header: 'Customer' },
    moneyColumn('value', 'LPO Value'),
    dateColumn('deliveryDate', 'Req. Delivery'),
    statusColumn,
  ],
  fields: [
    reference('Internal Ref'),
    date('date', 'Date Received'),
    half('customerLPONo', 'Customer LPO Number', { mono: true }),
    half('quotationRef', 'Linked Quotation Ref', { mono: true }),
    text('customerName', 'Customer Name'),
    money('value', 'LPO Value (KES)'),
    date('deliveryDate', 'Required Delivery Date'),
    text('deliveryAddress', 'Delivery Address'),
    area('items', 'Items Description', 3),
    select('status', 'Status', ['Open', 'PO Raised', 'Delivered', 'Invoiced', 'Closed', 'Cancelled']),
    half('notes', 'Notes'),
  ],
  blank: ({ ref, today }) => ({
    id: genId(), ref, date: today, customerLPONo: '', customerName: '', quotationRef: '', deliveryDate: '',
    deliveryAddress: '', items: '', value: 0, status: 'Open', notes: '',
  }),
}

export const deliveries = {
  id: 'deliveries', collection: 'deliveries', title: 'Delivery Notes', singular: 'Delivery note', icon: 'truck',
  addLabel: 'New Delivery Note', saveLabel: 'Save Delivery Note',
  modalTitle: { new: 'New Delivery Note', edit: 'Edit Delivery Note' },
  refType: 'DN', docType: 'Delivery Note', wide: true,
  template: deliveryNoteTemplate,
  columns: [
    refColumn('DN Ref'),
    dateColumn('date', 'Date'),
    { key: 'customerName', header: 'Customer' },
    monoColumn('invoiceRef', 'Invoice Ref'),
    monoColumn('lpoRef', 'LPO Ref'),
    statusColumn,
  ],
  fields: [
    reference('DN Reference'),
    date('date', 'Date'),
    half('invoiceRef', 'Invoice Reference', { mono: true }),
    half('lpoRef', 'Customer LPO Reference', { mono: true }),
    text('customerName', 'Customer Name'),
    text('customerAddress', 'Delivery Address'),
    half('deliveredBy', 'Delivered By'),
    half('driverName', 'Driver Name'),
    area('items', 'Items Description', 3),
    select('status', 'Status', ['Pending', 'Delivered', 'Signed', 'Disputed']),
    half('receivedBy', 'Received By'),
    date('receivedDate', 'Date Received'),
  ],
  blank: ({ ref, today }) => ({
    id: genId(), ref, date: today, customerName: '', customerAddress: '', invoiceRef: '', lpoRef: '',
    driverName: '', deliveredBy: '', items: '', status: 'Pending', receivedBy: '', receivedDate: '', notes: '',
  }),
}

export const invoices = {
  id: 'invoices', collection: 'invoices', title: 'Tax Invoices', singular: 'Invoice', icon: 'file-invoice',
  addLabel: 'New Invoice', saveLabel: 'Save Invoice',
  modalTitle: { new: 'New Tax Invoice', edit: 'Edit Tax Invoice' },
  refType: 'INV', docType: 'Invoice', hasItems: true, wide: true,
  journal: (record) => autoJournal('invoice', record),
  template: invoiceTemplate,
  columns: [
    refColumn('Invoice Ref'),
    dateColumn('date', 'Date'),
    { key: 'customerName', header: 'Customer' },
    dateColumn('dueDate', 'Due Date'),
    { key: 'sub', header: 'Excl.VAT', align: 'right', render: (row) => formatKES(row.sub || 0) },
    moneyColumn('total', 'Total incl.VAT'),
    statusColumn,
  ],
  fields: [
    reference('Invoice Ref'),
    date('date', 'Date'),
    date('dueDate', 'Payment Due Date'),
    select('status', 'Status', ['Pending', 'Partial', 'Paid', 'Overdue', 'Cancelled']),
    text('customerName', 'Customer Name'),
    half('customerAddress', 'Customer Address'),
    half('customerPin', 'Customer KRA PIN'),
    half('lpoRef', 'LPO Reference', { mono: true }),
    half('dnRef', 'Delivery Note Reference', { mono: true }),
    half('bankName', 'Bank Name'),
    half('bankAccount', 'Account Number'),
    half('bankBranch', 'Bank Branch'),
  ],
  blank: ({ ref, today }) => ({
    id: genId(), ref, date: today, dueDate: '', customerName: '', customerAddress: '', customerPin: '',
    lpoRef: '', dnRef: '', bankName: '', bankAccount: '', bankBranch: '', status: 'Pending', notes: '', items: [],
  }),
}

export const receipts = {
  id: 'receipts', collection: 'receipts', title: 'Official Receipts', singular: 'Receipt', icon: 'receipt',
  addLabel: 'New Receipt', saveLabel: 'Save Receipt',
  modalTitle: { new: 'New Receipt', edit: 'Edit Receipt' },
  refType: 'RCT', docType: 'Receipt',
  journal: (record) => autoJournal('receipt', record),
  template: receiptTemplate,
  columns: [
    refColumn('Receipt Ref'),
    dateColumn('date', 'Date'),
    { key: 'customerName', header: 'Received From' },
    monoColumn('invoiceRef', 'Invoice Ref'),
    { key: 'paymentMethod', header: 'Method' },
    moneyColumn('amount', 'Amount'),
    statusColumn,
  ],
  fields: [
    reference('Receipt Reference'),
    date('date', 'Date'),
    text('customerName', 'Received From (Customer)'),
    half('invoiceRef', 'Invoice Reference', { mono: true }),
    money('amount', 'Amount (KES)'),
    text('amountWords', 'Amount in Words', { placeholder: 'Kenya Shillings …' }),
    select('paymentMethod', 'Payment Method', PAYMENT_METHODS),
    half('chequeRef', 'Transaction / Cheque / M-Pesa Ref'),
    half('cashier', 'Received By'),
    half('notes', 'Notes'),
  ],
  blank: ({ ref, today }) => ({
    id: genId(), ref, date: today, customerName: '', invoiceRef: '', amount: 0, amountWords: '',
    paymentMethod: 'EFT', chequeRef: '', cashier: 'ADMIN', status: 'Paid', notes: '',
  }),
}

export const creditNotes = {
  id: 'creditnotes', collection: 'creditNotes', title: 'Credit / Debit Notes', singular: 'Note', icon: 'file-minus',
  addLabel: 'New Note', saveLabel: 'Save Note',
  modalTitle: { new: 'New Credit/Debit Note', edit: 'Edit Note' },
  refType: 'CN', docType: (record) => record.type,
  // Only credit notes post to the ledger; debit notes are records only.
  journal: (record) => (record.type === 'Credit Note' ? autoJournal('creditnote', record) : null),
  postsToLedger: (record) => record.type === 'Credit Note',
  prepare: (record) => ({ ...record, ...calcNoteTotals(record.amount, record.vat) }),
  template: creditNoteTemplate,
  columns: [
    refColumn(),
    { key: 'type', header: 'Type' },
    dateColumn('date', 'Date'),
    { key: 'customerName', header: 'Customer' },
    monoColumn('originalInvoice', 'Orig. Invoice'),
    { key: 'total', header: 'Amount', align: 'right', render: (row) => formatKES(row.total || 0) },
    statusColumn,
  ],
  fields: [
    reference('Reference'),
    select('type', 'Type', ['Credit Note', 'Debit Note']),
    date('date', 'Date'),
    select('status', 'Status', ['Draft', 'Issued', 'Applied', 'Cancelled']),
    text('customerName', 'Customer Name'),
    half('originalInvoice', 'Original Invoice Reference', { mono: true }),
    money('amount', 'Amount Excl. VAT (KES)'),
    money('vat', 'VAT %'),
    area('reason', 'Reason / Description', 3),
  ],
  blank: ({ ref, today }) => ({
    id: genId(), ref, type: 'Credit Note', date: today, customerName: '', originalInvoice: '',
    amount: 0, vat: 16, reason: '', status: 'Draft',
  }),
}

export const statements = {
  id: 'statements', collection: 'statements', title: 'Statements of Account', singular: 'Statement', icon: 'report-money',
  addLabel: 'New Statement', saveLabel: 'Save Statement',
  modalTitle: { new: 'New Statement', edit: 'Edit Statement' },
  refType: 'STA', docType: 'Statement',
  template: statementTemplate,
  columns: [
    refColumn(),
    dateColumn('date', 'Date'),
    { key: 'period', header: 'Period' },
    { key: 'customerName', header: 'Customer' },
    moneyColumn('closingBalance', 'Balance Due'),
  ],
  fields: [
    reference('Statement Ref'),
    date('date', 'Date'),
    half('period', 'Statement Period', { placeholder: 'e.g. May 2026' }),
    date('dueDate', 'Payment Due Date'),
    text('customerName', 'Customer Name'),
    money('openingBalance', 'Opening Balance (KES)'),
    money('closingBalance', 'Closing Balance / Amount Due (KES)'),
    area('invoices', 'Invoices Summary', 2, { placeholder: 'e.g. INV-1078 dated 01 May — KES 50,000' }),
    area('payments', 'Payments Received', 2, { placeholder: 'e.g. RCT-0001 dated 15 May — KES 30,000' }),
    text('credits', 'Credits Applied'),
    text('notes', 'Notes'),
  ],
  blank: ({ ref, today }) => ({
    id: genId(), ref, date: today, period: '', customerName: '', openingBalance: 0, invoices: '',
    payments: '', credits: '', closingBalance: 0, dueDate: '', notes: '',
  }),
}
