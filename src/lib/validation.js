import { DEFAULT_REF_CONFIG, REFERENCE_DOC_TYPES } from '../config/constants.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeReferenceMap(refMap = {}) {
  return Object.fromEntries(REFERENCE_DOC_TYPES.map(({ type }) => {
    const config = refMap[type] ?? DEFAULT_REF_CONFIG(type)
    return [type, {
      ...config,
      prefix: String(config.prefix ?? type).trim(),
      start: Number(config.start),
      pad: Number(config.pad),
    }]
  }))
}

export function validateBusinessProfile(profile = {}) {
  const errors = {}
  const businessName = String(profile.bizName ?? '').trim()
  const email = String(profile.email ?? '').trim()

  if (!businessName) errors.bizName = 'Company name is required.'
  if (email && !EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address.'

  return errors
}

export function validateReferenceConfig(refMap = {}) {
  const errors = {}

  for (const { type, label } of REFERENCE_DOC_TYPES) {
    const config = refMap[type] ?? DEFAULT_REF_CONFIG(type)
    const prefix = String(config.prefix ?? '').trim()
    const start = Number(config.start)
    const pad = Number(config.pad)

    if (!prefix) errors[type] = `${label} needs a reference prefix.`
    else if (!Number.isInteger(start) || start < 1) errors[type] = `${label} must start at 1 or later.`
    else if (!Number.isInteger(pad) || pad < 1 || pad > 8) errors[type] = `${label} padding must be between 1 and 8.`
  }

  return errors
}
