import { useEffect, useRef, useState } from 'react'
import { loadJSON, saveJSON } from '../lib/storage.js'

/**
 * useState that mirrors its value to localStorage.
 *
 * - `hydrate(saved)` builds the initial value from whatever was stored (or null on first run).
 * - Writes are debounced so rapid edits (typing, bulk updates) don't serialise the whole
 *   dataset on every keystroke.
 * - Pending writes are flushed when the tab is hidden, the page closes, or the provider
 *   unmounts (for example, immediately after signing out).
 * - `skipSave(value)` can veto a write (e.g. don't persist a half-finished setup).
 */
export function usePersistentState(key, hydrate, { delay = 250, skipSave } = {}) {
  const [value, setValue] = useState(() => hydrate(loadJSON(key, null)))
  const valueRef = useRef(value)
  const skipSaveRef = useRef(skipSave)

  useEffect(() => {
    valueRef.current = value
  }, [value])

  useEffect(() => {
    skipSaveRef.current = skipSave
  }, [skipSave])

  useEffect(() => {
    if (skipSaveRef.current?.(value)) return undefined

    const timer = setTimeout(() => saveJSON(key, value), delay)
    return () => clearTimeout(timer)
  }, [delay, key, value])

  useEffect(() => {
    const flush = () => {
      const current = valueRef.current
      if (!skipSaveRef.current?.(current)) saveJSON(key, current)
    }
    const onVisibility = () => document.visibilityState === 'hidden' && flush()

    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.removeEventListener('pagehide', flush)
      document.removeEventListener('visibilitychange', onVisibility)
      flush()
    }
  }, [key])

  return [value, setValue]
}
