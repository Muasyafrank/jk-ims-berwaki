/**
 * Tiny safe-HTML templating for printable documents.
 *
 *   html`<td>${customer.name}</td>`     // interpolated values are HTML-escaped
 *   html`<td>${raw('<b>ok</b>')}</td>`  // opt out for trusted markup
 *   html`<ul>${items.map(i => html`<li>${i}</li>`)}</ul>`   // arrays & nested html compose
 *
 * User-entered text (customer names, notes, descriptions) must never reach innerHTML unescaped.
 */
const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

export const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ENTITIES[c])

class SafeHtml {
  constructor(value) { this.value = value }
  toString() { return this.value }
}

export const raw = (value) => new SafeHtml(String(value))

function render(value) {
  if (value instanceof SafeHtml) return value.value
  if (Array.isArray(value)) return value.map(render).join('')
  if (value === null || value === undefined || value === false) return ''
  return escapeHtml(value)
}

export function html(strings, ...values) {
  let out = strings[0]
  values.forEach((value, i) => { out += render(value) + strings[i + 1] })
  return new SafeHtml(out)
}
