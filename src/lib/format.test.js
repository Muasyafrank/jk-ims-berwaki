import test from 'node:test'
import assert from 'node:assert/strict'
import { displayCell, formatDate, formatDateLong, formatKES, truncate } from './format.js'
import { daysBetween, todayISO } from './dates.js'

test('formatKES groups thousands and always shows 2 decimals', () => {
  assert.equal(formatKES(1234.5), 'KES 1,234.50')
  assert.equal(formatKES(undefined), 'KES 0.00')
  assert.equal(formatKES('abc'), 'KES 0.00')
})

test('dates format without drifting across timezones', () => {
  assert.equal(formatDate('2026-11-13'), '13 Nov 2026')
  assert.equal(formatDateLong('2026-01-01'), '01 January 2026')
  assert.equal(formatDate(''), '-')
  assert.equal(formatDate('not-a-date'), '-')
  assert.equal(formatDateLong(undefined), '—')
})

test('todayISO uses the local calendar date', () => {
  assert.equal(todayISO(new Date(2026, 10, 3, 0, 30)), '2026-11-03') // 00:30 local stays on the 3rd
})

test('daysBetween counts whole days', () => {
  assert.equal(daysBetween('2026-11-01', '2026-11-13'), 12)
  assert.equal(daysBetween('2026-11-13', '2026-11-01'), -12)
})

test('truncate only shortens long text', () => {
  assert.equal(truncate('short', 10), 'short')
  assert.equal(truncate('abcdefghij', 4), 'abcd…')
})

test('displayCell only replaces missing values, not zero or false', () => {
  assert.equal(displayCell(0), 0)
  assert.equal(displayCell(false), false)
  assert.equal(displayCell('OK'), 'OK')
  assert.equal(displayCell(null), '-')
  assert.equal(displayCell(''), '-')
})
