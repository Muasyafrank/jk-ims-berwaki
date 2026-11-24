import { useCallback, useMemo, useState } from 'react'

/** State for a create/edit dialog: which mode it is in and the working copy of the record. */
export function useRecordEditor() {
  const [mode, setMode] = useState(null) // null | 'new' | 'edit'
  const [form, setForm] = useState({})

  const openNew = useCallback((blank) => {
    setForm(blank)
    setMode('new')
  }, [])

  const openEdit = useCallback((record) => {
    setForm(record)
    setMode('edit')
  }, [])

  const close = useCallback(() => setMode(null), [])

  const setField = useCallback((name, value) => {
    setForm((current) => ({ ...current, [name]: value }))
  }, [])

  /** Update one field from its previous value (safe for rapid edits to nested lists). */
  const updateField = useCallback((name, updater) => {
    setForm((current) => ({ ...current, [name]: updater(current[name]) }))
  }, [])

  return useMemo(() => ({
    mode,
    form,
    isOpen: mode !== null,
    isNew: mode === 'new',
    openNew,
    openEdit,
    close,
    setField,
    updateField,
    setForm,
  }), [close, form, mode, openEdit, openNew, setField, updateField])
}
