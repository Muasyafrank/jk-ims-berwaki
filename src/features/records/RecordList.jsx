import { useDeferredValue, useMemo, useState } from 'react'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import { Input } from '../../components/ui/Field.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'

const DEFAULT_SEARCH_KEYS = ['ref', 'customerName', 'customer', 'supplierName', 'name']

const labelFor = (item, singular) => item.ref || item.name || `this ${singular.toLowerCase()}`

/** A searchable register with row actions (Print / Edit / Delete) and a delete confirmation. */
export default function RecordList({
  title, icon, singular = 'record', items = [], columns = [], searchKeys = DEFAULT_SEARCH_KEYS,
  addLabel = 'New', onAdd, onEdit, onDelete, onPrint, deleteNote,
}) {
  const [query, setQuery] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)
  const deferredQuery = useDeferredValue(query)

  const needle = deferredQuery.trim().toLowerCase()
  const records = useMemo(
    () => (Array.isArray(items) ? items.filter((item) => item && typeof item === 'object') : []),
    [items],
  )
  const filtered = useMemo(
    () => needle
      ? records.filter((item) => searchKeys.some((key) => String(item[key] ?? '').toLowerCase().includes(needle)))
      : records,
    [needle, records, searchKeys],
  )

  const actionsColumn = useMemo(() => ({
    key: '__actions',
    header: <span className="sr-only">Actions</span>,
    render: (item) => (
      <div className="table__actions">
        {onPrint && <Button variant="secondary" size="sm" icon="printer" aria-label={`Print ${labelFor(item, singular)}`} onClick={() => onPrint(item)}>Print</Button>}
        {onEdit && <Button variant="secondary" size="sm" icon="pencil" aria-label={`Edit ${labelFor(item, singular)}`} onClick={() => onEdit(item)}>Edit</Button>}
        {onDelete && <Button variant="danger" size="sm" icon="trash" aria-label={`Delete ${labelFor(item, singular)}`} onClick={() => setPendingDelete(item)}>Delete</Button>}
      </div>
    ),
  }), [singular, onPrint, onEdit, onDelete])

  return (
    <div className="page">
      <PageHeader
        title={title}
        icon={icon}
        subtitle={filtered.length === records.length
          ? `${records.length} record${records.length === 1 ? '' : 's'}`
          : `${filtered.length} of ${records.length} records shown`}
      >
        <Input
          type="search"
          className="input--search"
          placeholder="Search…"
          aria-label={`Search ${title}`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && <Button variant="ghost" size="sm" icon="x" aria-label="Clear search" onClick={() => setQuery('')}>Clear</Button>}
        {onAdd && <Button icon="plus" onClick={onAdd}>{addLabel}</Button>}
      </PageHeader>

      <span className="sr-only" role="status" aria-live="polite">
        {filtered.length} {title.toLowerCase()} records shown
      </span>

      <Card flush>
        {filtered.length === 0 ? (
          <EmptyState>
            {needle
              ? <>No results for “{deferredQuery}”</>
              : <>No {title.toLowerCase()} yet — click <strong>{addLabel}</strong> to start.</>}
          </EmptyState>
        ) : (
          <DataTable columns={[...columns, actionsColumn]} rows={filtered} caption={`${title} list`} />
        )}
      </Card>

      {pendingDelete && (
        <ConfirmDialog
          title={`Delete ${singular.toLowerCase()}?`}
          message={<>Delete <strong>{labelFor(pendingDelete, singular)}</strong>? This can’t be undone.{deleteNote && <> {typeof deleteNote === 'function' ? deleteNote(pendingDelete) : deleteNote}</>}</>}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => { onDelete(pendingDelete.id); setPendingDelete(null) }}
        />
      )}
    </div>
  )
}
