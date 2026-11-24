# JK IMS — Berwaki Africa Limited

Quotations → LPOs → purchase orders → delivery → tax invoices → receipts, with a double-entry
ledger and the usual reports (trial balance, P&L, balance sheet, VAT return, cash flow, debtor aging).
A React 19 + Vite single-page app; all data is stored in the browser's `localStorage`.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm test           # unit tests for the business logic (Node's built-in runner, no extra deps)
npm run lint
npm run check      # lint + unit tests + production build
```

Default sign-in: **ADMIN / admin123** (pull the lamp cord first). See *Security* below.

## Project layout

```
src/
  main.jsx · App.jsx · routes.jsx      entry, auth/setup gate, navigation + page registry
  config/                              constants, company defaults, status→colour map, seed data
  lib/                                 pure, tested logic — no React (money, dates, totals,
                                       refs, accounting, receivables, validation, safe storage hydration)
  hooks/                               usePersistentState, useDateRange, useRecordEditor, useFocusTrap, …
  context/                             AppProvider + useApp(): data, settings and actions
  components/
    ui/                                Button, Field, Modal, DataTable, Badge, Tabs, StatCard, Icon …
    layout/                            AppShell, Sidebar
  features/
    records/                           generic register: list + dialog + line items, from a definition
    documents/                         register definitions (split by domain) + printable-document templates
    accounting/                        ledger, chart of accounts, trial balance, P&L, balance sheet, VAT …
    reports/ · dashboard/ · settings/ · setup/ · auth/
  styles/                              tokens.css (design tokens) → base → layout → components → pages → print
```

### Adding a register (e.g. "Quotes from suppliers")

1. Add a definition in the matching file under `features/documents/definitions/` (the legacy
   `features/documents/definitions.jsx` path remains a barrel) — `collection`, `fields`, `columns`,
   `blank()`, and optionally `refType`, `hasItems`, `journal`, `template`.
2. Export a page in `features/documents/pages.jsx` and add one line to `routes.jsx`.
   The sidebar, list, search, create/edit dialog, delete confirmation and printing come for free.
3. Add the new collection name to `config/initialData.js`.

### Conventions

- **Styling**: CSS classes + design tokens (`styles/tokens.css`); no inline style objects for layout.
- **Money/dates**: always `formatKES`, `formatDate` from `lib/format.js`. Dates are `YYYY-MM-DD`
  strings and use the user's local calendar day.
- **Printing**: build documents with the `html` tagged template (`lib/html.js`) — interpolated values
  are escaped automatically. Never concatenate user text into HTML.
- **State**: change data through `useApp()` actions (`upsertRecord`, `removeRecord`, `saveJournal`…).
  The provider keeps action identities stable; report and dashboard views memoize derived calculations.
- **Storage keys** (`jkims_*_v1`) and record shapes are unchanged, so existing saved data still loads.
  Persisted data is normalized at the boundary, and pending writes are flushed before sign-out/unmount.

## Security notes

Sign-in is a **client-side lock only**: credentials ship in the JS bundle and the signed-in flag lives in
`localStorage`. It keeps casual users out; it is not security. Add server-side authentication before
exposing this online or holding sensitive data. Likewise, `localStorage` is per-browser and has no
backup — export/back up important data regularly.

## Live preview & backup

- **Live preview** – every printable register (quotations, invoices, receipts, delivery notes, credit notes, statements, purchase orders) has a *Live preview* button in its create/edit dialog. It renders the same `template` used for printing (`definition.template`), so what you see is what prints. Output is escaped by the `html` tag, so typed text can never inject markup.
- **Backup & restore** – *Settings → Backup & Restore* downloads all data and settings as `jk-ims-backup-YYYY-MM-DD.json` and restores from one (after a confirmation, since it replaces everything). Files are validated by `src/lib/backup.js` before anything is touched. Data otherwise lives only in the browser's localStorage, so back up regularly.
