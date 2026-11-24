import { DEFAULT_REF_CONFIG, REFERENCE_DOC_TYPES } from '../config/constants.js'
import { DEFAULT_COMPANY } from '../config/company.js'
import { COLLECTIONS, createInitialData } from '../config/initialData.js'

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const isFiniteNumber = (value) => value !== null && value !== '' && Number.isInteger(Number(value))

/** Remove malformed list members and repair nested collections used by the UI. */
function sanitizeRecords(records) {
  return records.filter(isPlainObject).map((record) => {
    let sanitized = record

    if ('lines' in record) {
      sanitized = {
        ...sanitized,
        lines: Array.isArray(record.lines) ? record.lines.filter(isPlainObject) : [],
      }
    }

    if (Array.isArray(record.items)) {
      sanitized = {
        ...sanitized,
        items: record.items.filter(isPlainObject),
      }
    }

    return sanitized
  })
}

/**
 * Build a safe workspace from persisted data.
 *
 * Older backups and hand-edited localStorage may contain missing collections or
 * values with the wrong shape. Invalid collections fall back to an empty list,
 * while valid records are preserved exactly as they were saved.
 */
export function hydrateData(saved) {
  const data = createInitialData()
  if (!isPlainObject(saved)) return data

  for (const collection of COLLECTIONS) {
    if (Array.isArray(saved[collection])) data[collection] = sanitizeRecords(saved[collection])
  }
  if (Array.isArray(saved.accounts)) data.accounts = sanitizeRecords(saved.accounts)

  return data
}

/**
 * Normalize persisted settings without discarding extension fields.
 * Reference configuration and issued-number history are the two structures the
 * application relies on, so malformed values are repaired at the boundary.
 */
export function hydrateSettings(saved) {
  if (!isPlainObject(saved)) return null

  const refMap = {}
  if (isPlainObject(saved.refMap)) {
    for (const [type, config] of Object.entries(saved.refMap)) {
      if (!isPlainObject(config)) continue
      const start = Number(config.start)
      const pad = Number(config.pad)
      refMap[type] = {
        ...config,
        prefix: String(config.prefix ?? type).trim() || type,
        start: Number.isInteger(start) && start >= 1 ? start : 1,
        pad: Number.isInteger(pad) && pad >= 1 && pad <= 8 ? pad : 4,
      }
    }
  }

  for (const { type } of REFERENCE_DOC_TYPES) {
    if (!refMap[type]) refMap[type] = DEFAULT_REF_CONFIG(type)
  }

  const usedRefs = {}
  if (isPlainObject(saved.usedRefs)) {
    for (const [type, numbers] of Object.entries(saved.usedRefs)) {
      if (!Array.isArray(numbers)) continue
      usedRefs[type] = numbers.filter(isFiniteNumber).map(Number)
    }
  }

  return {
    ...saved,
    bizName: saved.bizName || DEFAULT_COMPANY.bizName,
    pin: saved.pin ?? DEFAULT_COMPANY.pin,
    phone: saved.phone ?? DEFAULT_COMPANY.phone,
    email: saved.email ?? DEFAULT_COMPANY.email,
    address: saved.address ?? DEFAULT_COMPANY.address,
    setupDone: Boolean(saved.setupDone),
    refMap,
    usedRefs,
  }
}
