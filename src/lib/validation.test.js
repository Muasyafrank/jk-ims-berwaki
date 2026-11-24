import test from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_REF_CONFIG, REFERENCE_DOC_TYPES } from '../config/constants.js'
import { normalizeReferenceMap, validateBusinessProfile, validateReferenceConfig } from './validation.js'

test('business profile requires a name and validates an optional email', () => {
  assert.ok(validateBusinessProfile({}).bizName)
  assert.ok(validateBusinessProfile({ bizName: 'Acme', email: 'bad' }).email)
  assert.deepEqual(validateBusinessProfile({ bizName: 'Acme', email: 'finance@example.com' }), {})
})

test('reference configuration validates prefixes, start values and padding', () => {
  const valid = Object.fromEntries(
    REFERENCE_DOC_TYPES.map(({ type }) => [type, DEFAULT_REF_CONFIG(type)]),
  )
  assert.deepEqual(validateReferenceConfig(valid), {})

  const invalid = {
    ...valid,
    INV: { prefix: '', start: 0, pad: 12 },
  }
  assert.ok(validateReferenceConfig(invalid).INV)
})

test('reference configuration is normalized before it is stored', () => {
  const normalized = normalizeReferenceMap({ INV: { prefix: '  SALE  ', start: '10', pad: '4' } })
  assert.deepEqual(normalized.INV, { prefix: 'SALE', start: 10, pad: 4 })
  assert.ok(normalized.INV)
})
