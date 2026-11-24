import { PAYMENT_TERMS } from '../../../config/constants.js'
import { genId } from '../../../lib/ids.js'
import { moneyColumn } from '../../records/columns.jsx'
import { half, money, select, text, area } from './fields.js'

export const customers = {
  id: 'customers', collection: 'customers', title: 'Customers', singular: 'Customer', icon: 'users',
  addLabel: 'Add Customer', saveLabel: 'Save Customer',
  modalTitle: { new: 'New Customer', edit: 'Edit Customer' },
  searchKeys: ['name'],
  columns: [
    { key: 'name', header: 'Name', strong: true },
    { key: 'contactPerson', header: 'Contact' },
    { key: 'phone', header: 'Phone' },
    { key: 'email', header: 'Email' },
    { key: 'pin', header: 'KRA PIN', mono: true, small: true },
    { key: 'type', header: 'Type' },
    moneyColumn('creditLimit', 'Credit Limit'),
  ],
  fields: [
    text('name', 'Company / Customer Name'),
    half('contactPerson', 'Contact Person'),
    select('type', 'Type', ['Company', 'Government', 'NGO', 'Individual']),
    half('phone', 'Phone'),
    half('email', 'Email'),
    half('pin', 'KRA PIN'),
    money('creditLimit', 'Credit Limit (KES)'),
    area('address', 'Address'),
    text('notes', 'Notes'),
  ],
  blank: () => ({
    id: genId(), name: '', phone: '', email: '', pin: '', address: '', contactPerson: '',
    type: 'Company', creditLimit: 0, notes: '',
  }),
}

export const suppliers = {
  id: 'suppliers', collection: 'suppliers', title: 'Suppliers', singular: 'Supplier', icon: 'building-store',
  addLabel: 'Add Supplier', saveLabel: 'Save Supplier',
  modalTitle: { new: 'New Supplier', edit: 'Edit Supplier' },
  searchKeys: ['name'],
  columns: [
    { key: 'name', header: 'Name', strong: true },
    { key: 'contactPerson', header: 'Contact' },
    { key: 'phone', header: 'Phone' },
    { key: 'email', header: 'Email' },
    { key: 'products', header: 'Products/Services' },
    { key: 'paymentTerms', header: 'Terms' },
  ],
  fields: [
    text('name', 'Supplier Name'),
    half('contactPerson', 'Contact Person'),
    half('phone', 'Phone'),
    half('email', 'Email'),
    half('pin', 'KRA PIN'),
    select('paymentTerms', 'Payment Terms', PAYMENT_TERMS),
    text('products', 'Products / Services'),
    area('address', 'Address'),
  ],
  blank: () => ({
    id: genId(), name: '', phone: '', email: '', pin: '', address: '', contactPerson: '',
    products: '', paymentTerms: '30 days',
  }),
}
