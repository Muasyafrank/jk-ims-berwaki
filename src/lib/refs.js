/**
 * Auto-numbered document references, e.g. INV-0007.
 * settings.refMap[type] = { prefix, start, pad }
 * settings.usedRefs[type] = number[] of numbers already issued
 */
const FALLBACK = (type) => ({ prefix: String(type ?? 'REF').slice(0, 2).toUpperCase(), start: 1, pad: 4 })

export const formatRef = (cfg, n) => {
  const config = cfg ?? { prefix: 'REF', pad: 4 }
  const requestedPad = Number(config.pad)
  const pad = Number.isInteger(requestedPad) && requestedPad >= 1 && requestedPad <= 8 ? requestedPad : 4
  const prefix = String(config.prefix ?? 'REF').trim() || 'REF'
  const number = Number.isFinite(Number(n)) ? Number(n) : 0
  return `${prefix}-${String(number).padStart(pad, '0')}`
}

export function nextRefNumber(cfg, used = []) {
  const config = cfg ?? { prefix: 'REF', start: 1, pad: 4 }
  const requestedStart = Number(config.start)
  const taken = new Set(
    (Array.isArray(used) ? used : [])
      .map(Number)
      .filter((number) => Number.isInteger(number)),
  )
  let n = Number.isInteger(requestedStart) && requestedStart >= 1 ? requestedStart : 1
  while (taken.has(n)) n++
  return n
}

export function nextRef(settings, type, cfgOverride) {
  const source = settings ?? {}
  const cfg = cfgOverride ?? source.refMap?.[type] ?? FALLBACK(type)
  const prefix = String(cfg?.prefix ?? type).trim() || type
  return formatRef({ ...cfg, prefix }, nextRefNumber(cfg, source.usedRefs?.[type]))
}

/** Returns new settings with the next number for `type` marked as used. */
export function consumeRef(settings, type) {
  const source = settings ?? {}
  const cfg = source.refMap?.[type] ?? FALLBACK(type)
  const used = Array.isArray(source.usedRefs?.[type]) ? source.usedRefs[type] : []
  const n = nextRefNumber(cfg, used)
  return { ...source, usedRefs: { ...source.usedRefs, [type]: [...used, n] } }
}
