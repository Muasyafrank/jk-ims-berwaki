import test from 'node:test'
import assert from 'node:assert/strict'
import { backupFileName, createBackup, parseBackup } from './backup.js'
import { createInitialData } from '../config/initialData.js'

const sample = () => {
  const data = createInitialData()
  data.customers.push({ id: 'C1', name: 'Acme' })
  data.invoices.push({ id: 'I1' }, { id: 'I2' })
  return createBackup(data, { bizName: 'X', setupDone: true }, new Date('2026-11-14T10:00:00Z'))
}

test('a backup round-trips through JSON unchanged', () => {
  const backup = sample()
  const out = parseBackup(JSON.stringify(backup))
  assert.deepEqual(out.data, backup.data)
  assert.deepEqual(out.settings, backup.settings)
  assert.equal(out.recordCount, 3)
})

test('file name carries the date', () => {
  assert.equal(backupFileName(new Date('2026-11-14T10:00:00Z')), 'jk-ims-backup-2026-11-14.json')
})

test('rejects non-JSON, foreign JSON and newer formats with clear messages', () => {
  assert.throws(() => parseBackup('nope'), /not valid JSON/)
  assert.throws(() => parseBackup('{"hello":1}'), /not a JK IMS backup/)
  assert.throws(() => parseBackup('[]'), /not a JK IMS backup/)
  assert.throws(() => parseBackup(JSON.stringify({ ...sample(), version: 0 })), /unreadable format version/)
  assert.throws(() => parseBackup(JSON.stringify({ ...sample(), version: 99 })), /newer version/)
})

test('rejects damaged collections instead of crashing later', () => {
  const bad = sample(); bad.data.invoices = 'oops'
  assert.throws(() => parseBackup(JSON.stringify(bad)), /"invoices" should be a list/)
})

test('missing collections are filled with defaults; missing settings stay null', () => {
  const out = parseBackup(JSON.stringify({ app: 'jk-ims', version: 1, data: { customers: [] } }))
  assert.ok(Array.isArray(out.data.invoices) && out.data.accounts.length > 0)
  assert.equal(out.settings, null)
})
