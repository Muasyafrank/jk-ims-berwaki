import logoUrl from '../../../assets/logo.png'
import { COMPANY_DEALS_IN, COMPANY_TAGLINE, DEFAULT_COMPANY } from '../../../config/company.js'
import { calcTotals, lineTotal } from '../../../lib/calc.js'
import { formatKES } from '../../../lib/format.js'
import { html } from '../../../lib/html.js'

/** Company details with blanks filled from the defaults. */
export const companyDetails = (settings) =>
  Object.fromEntries(Object.entries(DEFAULT_COMPANY).map(([key, fallback]) => [key, settings?.[key] ?? fallback]))

/** Letterhead: logo, company details and the document title/reference block. */
export function docHeader(settings, { title, ref, subline }) {
  const company = companyDetails(settings)
  return html`
    <div class="ph-header">
      <img class="ph-logo" src="${logoUrl}" alt="${company.bizName} logo"/>
      <div class="ph-co">
        <div class="ph-co-name">${company.bizName}</div>
        <div class="ph-co-sub">${COMPANY_DEALS_IN}</div>
        <div class="ph-co-contact">
          ${company.address}<br/>
          Tel: ${company.phone} &nbsp;|&nbsp; Email: ${company.email}<br/>
          KRA PIN: ${company.pin}
        </div>
      </div>
      <div class="ph-doc-label">
        <div class="ph-doc-type">${title}</div>
        <div class="ph-doc-ref">${ref}</div>
        <div class="ph-doc-date">${subline}</div>
      </div>
    </div>`
}

export function docFooter(settings, suffix) {
  const company = companyDetails(settings)
  return html`
    <div class="ph-footer">
      <strong>${company.bizName}</strong> &nbsp;|&nbsp; ${COMPANY_TAGLINE} &nbsp;|&nbsp;
      PIN: ${company.pin}${suffix ? html` &nbsp;|&nbsp; ${suffix}` : ''}
    </div>`
}

export const row = (label, value) =>
  html`<div class="ph-row"><span class="ph-lbl">${label}:</span><span class="ph-val">${value}</span></div>`

/** A row that is omitted entirely when it has no value. */
export const optionalRow = (label, value) => (value ? row(label, value) : '')

export const section = (title, ...body) =>
  html`<div class="ph-section"><div class="ph-section-title">${title}</div>${body}</div>`

export const twoColumns = (left, right) => html`<div class="ph-two-col">${left}${right}</div>`

/** Name + address lines under a heading (Bill To, Deliver To, Supplier …). */
export const party = (title, name, ...lines) => html`
  <div>
    <div class="ph-section-title">${title}</div>
    <strong>${name}</strong><br/>
    ${lines.filter(Boolean).map((line) => html`${line}<br/>`)}
  </div>`

export const detailsBlock = (title, ...rows) => html`<div><div class="ph-section-title">${title}</div>${rows}</div>`

export const note = (content) => (content ? html`<div class="ph-note">${content}</div>` : '')

export const signatures = (...labels) => html`
  <div class="ph-sig">${labels.map((label) => html`<div class="ph-sig-block"><div class="ph-sig-line">${label}</div></div>`)}</div>`

/** Priced line items with subtotal / VAT / grand total. */
export function lineItemsTable(items = []) {
  const rows = (Array.isArray(items) ? items : []).filter(Boolean)
  const { sub, vatAmt, total } = calcTotals(rows)
  return html`
    <table class="ph-table">
      <thead><tr>
        <th style="width:30px">#</th><th>Description</th><th class="r">Qty</th><th>Unit</th>
        <th class="r">Unit Price</th><th class="r">VAT</th><th class="r">Total</th>
      </tr></thead>
      <tbody>
        ${rows.map((item, i) => html`
          <tr>
            <td>${i + 1}</td><td>${item.desc}</td><td class="r">${item.qty}</td><td>${item.unit || 'Pcs'}</td>
            <td class="r">${formatKES(item.unitPrice)}</td><td class="r">${item.vat}%</td>
            <td class="r">${formatKES(lineTotal(item))}</td>
          </tr>`)}
      </tbody>
    </table>
    <div class="ph-totals">
      <div class="ph-totals-row"><span>Subtotal (excl. VAT)</span><span>${formatKES(sub)}</span></div>
      <div class="ph-totals-row"><span>VAT</span><span>${formatKES(vatAmt)}</span></div>
      <div class="ph-totals-row grand"><span>GRAND TOTAL</span><span>${formatKES(total)}</span></div>
    </div>`
}
