import { useCallback, useMemo } from 'react'
import { AppContext } from './AppContext.js'
import { STORAGE_KEYS } from '../config/constants.js'
import { usePersistentState } from '../hooks/usePersistentState.js'
import { consumeRef, nextRef } from '../lib/refs.js'
import { hydrateData, hydrateSettings } from '../lib/workspace.js'

const skipEmptySettings = (value) => value === null

/** Owns the app's persisted state and exposes intention-revealing actions instead of raw setters. */
export default function AppProvider({ children }) {
  const [data, setData] = usePersistentState(STORAGE_KEYS.data, hydrateData)
  const [settings, setSettings] = usePersistentState(STORAGE_KEYS.settings, hydrateSettings, {
    skipSave: skipEmptySettings,
  })

  const updateSettings = useCallback((changes) => {
    setSettings((current) => ({ ...(current ?? {}), ...changes }))
  }, [setSettings])

  const completeSetup = useCallback((initial) => {
    setSettings((current) => ({ ...(current ?? {}), ...initial, setupDone: true }))
  }, [setSettings])

  const restoreBackup = useCallback(({ data: restored, settings: restoredSettings }) => {
    setData(hydrateData(restored))
    const normalizedSettings = hydrateSettings(restoredSettings)
    if (normalizedSettings) {
      setSettings({ ...normalizedSettings, setupDone: true })
    }
  }, [setData, setSettings])

  const previewRef = useCallback(
    (type) => nextRef(settings ?? {}, type),
    [settings],
  )

  const consume = useCallback((type) => {
    setSettings((current) => consumeRef(current ?? {}, type))
  }, [setSettings])

  const upsertRecord = useCallback((collection, record, { isNew = false, journal = null } = {}) => {
    setData((current) => {
      const records = current[collection] ?? []
      const updatedRecords = isNew
        ? [...records, record]
        : records.map((item) => (item.id === record.id ? record : item))

      return {
        ...current,
        [collection]: updatedRecords,
        ...(journal ? { journals: [...(current.journals ?? []), journal] } : {}),
      }
    })
  }, [setData])

  const removeRecord = useCallback((collection, id) => {
    setData((current) => ({
      ...current,
      [collection]: (current[collection] ?? []).filter((record) => record.id !== id),
    }))
  }, [setData])

  const saveJournal = useCallback((journal) => {
    setData((current) => {
      const journals = current.journals ?? []
      const updatedJournals = journals.some((item) => item.id === journal.id)
        ? journals.map((item) => (item.id === journal.id ? journal : item))
        : [...journals, journal]
      return { ...current, journals: updatedJournals }
    })
  }, [setData])

  const value = useMemo(() => ({
    data,
    settings,
    updateSettings,
    completeSetup,
    restoreBackup,
    previewRef,
    consumeRef: consume,
    upsertRecord,
    removeRecord,
    saveJournal,
  }), [
    completeSetup,
    consume,
    data,
    previewRef,
    removeRecord,
    restoreBackup,
    saveJournal,
    settings,
    updateSettings,
    upsertRecord,
  ])

  return <AppContext value={value}>{children}</AppContext>
}
