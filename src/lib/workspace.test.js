import test from 'node:test'
import assert from 'node:assert/strict'
import { hydrateData, hydrateSettings } from './workspace.js'

test('hydrateData preserves valid records and replaces damaged collections', () => {
  const saved = {
    customers: [{ id: 'C1', name: 'Acme' }, null],
    invoices: 'not-a-list',
    customField: 'kept separately',
  }

  const data = hydrateData(saved)
  assert.deepEqual(data.customers, [{ id: 'C1', name: 'Acme' }])
  assert.deepEqual(data.invoices, [])
  assert.ok(Array.isArray(data.journals))
  assert.ok(data.accounts.length > 0)
})

test('hydrateData rejects values that are not workspace objects', () => {
  assert.deepEqual(hydrateData(null).customers, [])
  assert.deepEqual(hydrateData([]).customers, [])
})

test('hydrateSettings repairs reference structures and preserves extension fields', () => {
  const settings = hydrateSettings({
    bizName: 'Acme',
    setupDone: true,
    custom: 'preserved',
    refMap: {
      INV: { prefix: 'INV', start: '100', pad: '4' },
      broken: 'not-an-object',
    },
    usedRefs: {
      INV: [1, '2', 'bad'],
      broken: 'not-a-list',
    },
  })

  assert.equal(settings.bizName, 'Acme')
  assert.equal(settings.custom, 'preserved')
  assert.deepEqual(settings.refMap.INV, { prefix: 'INV', start: 100, pad: 4 })
  assert.equal(settings.refMap.broken, undefined)
  assert.deepEqual(settings.usedRefs.INV, [1, 2])
  assert.equal(settings.usedRefs.broken, undefined)
})

test('hydrateSettings returns null for missing or malformed settings', () => {
  assert.equal(hydrateSettings(null), null)
  assert.equal(hydrateSettings([]), null)
})
