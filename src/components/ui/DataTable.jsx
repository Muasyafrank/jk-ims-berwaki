import { useState } from 'react'
import EmptyState from './EmptyState.jsx'
import { cx } from '../../lib/classNames.js'
import { displayCell } from '../../lib/format.js'

const DEFAULT_PAGE_SIZE = 150

const alignClass = (column) => cx(
  column.align === 'right' && 'cell--right',
  column.align === 'center' && 'cell--center',
)

function cellClass(column) {
  return cx(
    alignClass(column),
    column.mono && 'cell--mono',
    column.strong && 'cell--strong',
    column.small && 'cell--small',
    column.nowrap && 'cell--nowrap',
    column.tone && `cell--${column.tone}`,
  )
}

/**
 * Presentational table driven by a column spec:
 *   { key, header, render?(row), align?, mono?, strong?, small?, tone?, nowrap? }
 * Long lists render in pages ("Show more") so very large registers stay fast.
 * `footer` is an optional <tr> (e.g. a totals row) placed in <tfoot>; `caption` labels the table
 * for screen readers.
 */
export default function DataTable({
  columns = [], rows = [], rowKey = 'id', footer, empty, pageSize = DEFAULT_PAGE_SIZE, compact, className, caption,
}) {
  // Keep the expanded page count, but start from the first page again when the result
  // set or page size changes (derived state instead of an effect).
  const [pagination, setPagination] = useState({ length: rows.length, pageSize, limit: pageSize })
  const isCurrent = pagination.length === rows.length && pagination.pageSize === pageSize
  const limit = isCurrent ? pagination.limit : pageSize

  if (rows.length === 0 && empty) return <EmptyState small>{empty}</EmptyState>

  const visible = rows.slice(0, limit)
  const remaining = rows.length - visible.length
  const showMore = () => setPagination({ length: rows.length, pageSize, limit: limit + pageSize })

  return (
    <>
      <div className="table-wrap">
        <table className={cx('table table--hover', compact && 'table--compact', className)}>
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col" className={alignClass(column)}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row, index) => (
              <tr key={typeof rowKey === 'function' ? rowKey(row) : (row[rowKey] ?? index)}>
                {columns.map((column) => (
                  <td key={column.key} className={cellClass(column)}>
                    {column.render ? column.render(row) : displayCell(row[column.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {footer && <tfoot>{footer}</tfoot>}
        </table>
      </div>
      {remaining > 0 && (
        <button type="button" className="table__more" onClick={showMore}>
          Show {Math.min(remaining, pageSize)} more ({remaining} remaining)
        </button>
      )}
    </>
  )
}
