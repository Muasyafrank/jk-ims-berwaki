import test from 'node:test'
import assert from 'node:assert/strict'
import { consumeRef, formatRef, nextRef } from './refs.js'

const settings = { refMap: { INV: { prefix: 'INV', start: 1000, pad: 4 } }, usedRefs: {} }

test('formats with prefix and zero padding', () => {
  assert.equal(formatRef({ prefix: 'QT', pad: 4 }, 7), 'QT-0007')
  assert.equal(nextRef(settings, 'INV'), 'INV-1000')
})

test('consuming a ref advances to the next free number', () => {
  const after = consumeRef(consumeRef(settings, 'INV'), 'INV')
  assert.deepEqual(after.usedRefs.INV, [1000, 1001])
  assert.equal(nextRef(after, 'INV'), 'INV-1002')
})

test('skips numbers already used, even after the start is changed', () => {
  const s = { refMap: { INV: { prefix: 'INV', start: 1, pad: 4 } }, usedRefs: { INV: [1, 2, 3] } }
  assert.equal(nextRef(s, 'INV'), 'INV-0004')
})

test('falls back to a sensible config for an unconfigured type', () => {
  assert.equal(nextRef({}, 'XYZ'), 'XY-0001')
})

test('consumeRef does not mutate the previous settings', () => {
  consumeRef(settings, 'INV')
  assert.deepEqual(settings.usedRefs, {})
})

test('repairs malformed reference configuration without throwing', () => {
  assert.equal(nextRef({ refMap: { INV: { prefix: '', start: -4, pad: -2 } } }, 'INV'), 'INV-0001')
  assert.equal(nextRef({ refMap: { INV: { start: 1 } }, usedRefs: { INV: ['1'] } }, 'INV'), 'INV-0002')
  assert.equal(consumeRef(null, 'INV').usedRefs.INV.length, 1)
})
