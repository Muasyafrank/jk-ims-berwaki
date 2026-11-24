import { useCallback } from 'react'
import { useApp } from '../../context/AppContext.js'
import { useRecordEditor } from '../../hooks/useRecordEditor.js'
import { todayISO } from '../../lib/dates.js'
import { buildRecord } from './buildRecord.js'
import { printDocument } from '../documents/print/printDocument.js'
import RecordList from './RecordList.jsx'
import RecordModal from './RecordModal.jsx'

const LEDGER_NOTE = 'Its ledger entry is not reversed automatically — adjust the ledger if needed.'

/**
 * A complete register screen (list + create/edit dialog + print) generated from a definition.
 * See features/documents/definitions for the shape of a definition.
 */
export default function RecordPage({ definition }) {
  const { data, settings, previewRef, consumeRef, upsertRecord, removeRecord } = useApp()
  const editor = useRecordEditor()
  const { form, isNew, openNew, openEdit, close } = editor
  const { blank, collection, journal, refType, template } = definition

  const openRecord = useCallback((record) => {
    if (record) {
      openEdit(record)
      return
    }

    openNew(blank({
      ref: refType ? previewRef(refType) : '',
      today: todayISO(),
    }))
  }, [blank, openEdit, openNew, previewRef, refType])

  const save = useCallback(() => {
    const record = buildRecord(definition, form)
    if (isNew && refType) consumeRef(refType)
    upsertRecord(collection, record, {
      isNew,
      journal: isNew ? journal?.(record) : null,
    })
    close()
  }, [close, collection, consumeRef, definition, form, isNew, journal, refType, upsertRecord])

  const addRecord = useCallback(() => openRecord(), [openRecord])

  const deleteRecord = useCallback((id) => {
    removeRecord(collection, id)
  }, [collection, removeRecord])

  const printRecord = useCallback((record) => {
    if (!template) return
    try {
      void printDocument(template(record, settings)).catch((error) => {
        console.error('Could not open the print dialog:', error)
      })
    } catch (error) {
      console.error('Could not prepare the print document:', error)
    }
  }, [settings, template])

  const getDeleteNote = useCallback((record) => {
    const posts = definition.postsToLedger
      ? definition.postsToLedger(record)
      : Boolean(definition.journal)
    return posts ? LEDGER_NOTE : undefined
  }, [definition])

  return (
    <>
      <RecordList
        title={definition.title}
        icon={definition.icon}
        singular={definition.singular}
        items={data[definition.collection] ?? []}
        columns={definition.columns}
        searchKeys={definition.searchKeys}
        addLabel={definition.addLabel}
        onAdd={addRecord}
        onEdit={openRecord}
        onDelete={deleteRecord}
        onPrint={definition.template ? printRecord : undefined}
        deleteNote={definition.journal ? getDeleteNote : undefined}
      />
      {editor.isOpen && <RecordModal definition={definition} editor={editor} onSave={save} />}
    </>
  )
}
