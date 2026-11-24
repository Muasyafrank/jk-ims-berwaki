import Badge from '../../components/ui/Badge.jsx'
import { formatDate, formatKES } from '../../lib/format.js'

/** Column presets shared by the document registers. */
export const refColumn = (header = 'Ref', key = 'ref') => ({ key, header, strong: true, tone: 'navy', mono: true })
export const monoColumn = (key, header) => ({ key, header, mono: true, small: true })
export const dateColumn = (key, header) => ({ key, header, render: (row) => formatDate(row[key]) })
export const moneyColumn = (key, header) => ({ key, header, align: 'right', render: (row) => formatKES(row[key]) })
export const statusColumn = { key: 'status', header: 'Status', render: (row) => <Badge status={row.status} /> }
