import { COLLECTIONS, createInitialData } from '../config/initialData.js'

const APP_ID = 'jk-ims'
const FORMAT_VERSION = 1
const LIST_KEYS = [...COLLECTIONS, 'accounts']
const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

/** Everything needed to rebuild the workspace on another browser or machine. */
export function createBackup(data, settings, now = new Date()) {
  return { app: APP_ID, version: FORMAT_VERSION, exportedAt: now.toISOString(), settings, data }
}

export const backupFileName = (now = new Date()) =>
  `jk-ims-backup-${now.toISOString().slice(0, 10)}.json`

/**
 * Validate backup text and return { data, settings, recordCount }.
 * Throws an Error with a user-readable message if the file is not a usable backup.
 */
export function parseBackup(text) {
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('This file is not valid JSON.')
  }
  if (!isPlainObject(parsed) || parsed.app !== APP_ID || !isPlainObject(parsed.data)) {
    throw new Error('This is not a JK IMS backup file.')
  }
  if (!Number.isInteger(parsed.version) || parsed.version < 1) {
    throw new Error('This backup has an unreadable format version.')
  }
  if (parsed.version > FORMAT_VERSION) {
    throw new Error('This backup was made by a newer version of JK IMS.')
  }
  for (const key of LIST_KEYS) {
    if (key in parsed.data && !Array.isArray(parsed.data[key])) {
      throw new Error(`Backup is damaged: "${key}" should be a list.`)
    }
  }
  if (parsed.settings != null && !isPlainObject(parsed.settings)) {
    throw new Error('Backup is damaged: settings are unreadable.')
  }

  const data = { ...createInitialData(), ...parsed.data }
  const recordCount = COLLECTIONS.reduce((sum, key) => sum + data[key].length, 0)
  return { data, settings: parsed.settings ?? null, recordCount }
}
