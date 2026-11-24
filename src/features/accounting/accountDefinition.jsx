import { ACCOUNT_TYPES } from '../../config/constants.js'
import { genId } from '../../lib/ids.js'

/** The chart-of-accounts editor uses the same record-dialog contract as registers. */
export const accountDefinition = {
  id: 'accounts',
  collection: 'accounts',
  title: 'Chart of Accounts',
  singular: 'Account',
  icon: 'book',
  saveLabel: 'Save Account',
  modalTitle: { new: 'New Account', edit: 'Edit Account' },
  fields: [
    { name: 'code', label: 'Account Code', half: true, mono: true, placeholder: 'e.g. 1100' },
    { name: 'type', label: 'Type', half: true, type: 'select', options: ACCOUNT_TYPES },
    { name: 'name', label: 'Account Name' },
    { name: 'description', label: 'Description' },
  ],
  blank: () => ({ id: genId(), code: '', name: '', type: 'Asset', description: '' }),
}
