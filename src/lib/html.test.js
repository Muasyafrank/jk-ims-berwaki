import test from 'node:test'
import assert from 'node:assert/strict'
import { escapeHtml, html, raw } from './html.js'

test('interpolated values are escaped', () => {
  const evil = '<img src=x onerror="alert(1)">'
  assert.equal(String(html`<td>${evil}</td>`), '<td>&lt;img src=x onerror=&quot;alert(1)&quot;&gt;</td>')
})

test('raw() and nested html`` are not double-escaped', () => {
  assert.equal(String(html`<p>${raw('<b>x</b>')}</p>`), '<p><b>x</b></p>')
  const rows = ['a & b', 'c'].map((t) => html`<li>${t}</li>`)
  assert.equal(String(html`<ul>${rows}</ul>`), '<ul><li>a &amp; b</li><li>c</li></ul>')
})

test('null, undefined and false render as nothing; 0 renders', () => {
  assert.equal(String(html`[${null}${undefined}${false}${0}]`), '[0]')
})

test('escapeHtml covers quotes and ampersands', () => {
  assert.equal(escapeHtml(`Tom & "Jerry's"`), 'Tom &amp; &quot;Jerry&#39;s&quot;')
})
