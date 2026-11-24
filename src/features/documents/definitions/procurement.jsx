import { PAYMENT_TERMS } from '../../../config/constants.js'
import { autoJournal } from '../../../lib/accounting.js'
import { genId } from '../../../lib/ids.js'
import { dateColumn, moneyColumn, monoColumn, refColumn, statusColumn } from '../../records/columns.jsx'
import { purchaseOrderTemplate } from '../print/templates.js'
import { area, date, half, reference, select, text } from './fields.js'

export const purchaseOrders = {
  id: 'purchaseorders', collection: 'purchaseOrders', title: 'Purchase Orders', singular: 'Purchase order', icon: 'shopping-cart',
  addLabel: 'New PO', saveLabel: 'Save Purchase Order',
  modalTitle: { new: 'New Purchase Order', edit: 'Edit Purchase Order' },
  refType: 'PO', docType: 'Purchase Order', hasItems: true, wide: true,
  searchKeys: ['ref', 'supplierName', 'lpoRef'],
  journal: (record) => autoJournal('purchaseorder', record),
  template: purchaseOrderTemplate,
  columns: [
    refColumn('PO Ref'),
    dateColumn('date', 'Date'),
    { key: 'supplierName', header: 'Supplier' },
    monoColumn('lpoRef', 'LPO Ref'),
    moneyColumn('total', 'Total'),
    statusColumn,
  ],
  fields: [
    reference('PO Reference'),
    date('date', 'Date'),
    half('lpoRef', 'Customer LPO Reference', { mono: true }),
    select('status', 'Status', ['Draft', 'Sent', 'Open', 'Received', 'Closed', 'Cancelled']),
    text('supplierName', 'Supplier Name'),
    half('supplierAddress', 'Supplier Address'),
    half('deliveryTo', 'Deliver To'),
    date('deliveryDate', 'Required Delivery Date'),
    select('paymentTerms', 'Payment Terms', PAYMENT_TERMS),
    area('notes', 'Notes'),
  ],
  blank: ({ ref, today }) => ({
    id: genId(), ref, date: today, supplierName: '', supplierAddress: '', lpoRef: '', deliveryDate: '',
    deliveryTo: '', paymentTerms: '30 days', notes: '', status: 'Draft', items: [],
  }),
}
