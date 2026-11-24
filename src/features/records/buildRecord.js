import { calcTotals, normalizeItems } from '../../lib/calc.js'

/**
 * Turn the dialog's working copy into the record that gets saved:
 * numeric inputs are coerced, line-item totals computed, then the definition's own
 * `prepare` hook runs and the document type (`_type`) is stamped.
 */
export function buildRecord(definition, form) {
  let record = { ...form }

  for (const field of definition.fields ?? []) {
    if (field.type === 'number') record[field.name] = Number(record[field.name]) || 0
  }

  if (definition.hasItems) {
    record.items = normalizeItems(form.items)
    record = { ...record, ...calcTotals(record.items) }
  }

  if (definition.prepare) record = definition.prepare(record)

  if (definition.docType) {
    record._type = typeof definition.docType === 'function' ? definition.docType(record) : definition.docType
  }
  return record
}
