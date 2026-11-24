/* eslint-disable react-refresh/only-export-components -- compatibility barrel intentionally exports definitions. */
/** Backwards-compatible barrel for register definitions. */
export { customers, suppliers } from './definitions/parties.jsx'
export {
  creditNotes,
  deliveries,
  enquiries,
  invoices,
  orders,
  quotations,
  receipts,
  statements,
} from './definitions/sales.jsx'
export { purchaseOrders } from './definitions/procurement.jsx'
export { accountDefinition as accounts } from '../accounting/accountDefinition.jsx'
export { REGISTERS } from './definitions/index.js'
