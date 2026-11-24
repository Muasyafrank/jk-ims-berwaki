import { Fragment, useMemo, useState } from 'react'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import DateRangeFilter from '../../components/ui/DateRangeFilter.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import { Field, Input, NumberInput, Select } from '../../components/ui/Field.jsx'
import Modal from '../../components/ui/Modal.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import { useApp } from '../../context/AppContext.js'
import { useDateRange } from '../../hooks/useDateRange.js'
import { useRecordEditor } from '../../hooks/useRecordEditor.js'
import { isManualJournal, journalTotals, sortByCode } from '../../lib/accounting.js'
import { todayISO } from '../../lib/dates.js'
import { formatDate, formatKES } from '../../lib/format.js'
import { genId } from '../../lib/ids.js'
import { TYPE_TONE } from './tones.js'

const blankLine = () => ({ id: genId(), account: '', description: '', debit: 0, credit: 0 })
const journalLines = (journal) => (Array.isArray(journal?.lines) ? journal.lines : [])

export default function GeneralLedger() {
  const { data, saveJournal, removeRecord } = useApp()
  const editor = useRecordEditor()
  const range = useDateRange()
  const { inRange } = range
  const [accountFilter, setAccountFilter] = useState('ALL')
  const [pendingDelete, setPendingDelete] = useState(null)

  const accounts = useMemo(() => sortByCode(data.accounts), [data.accounts])
  const accountByCode = useMemo(
    () => new Map(data.accounts.map((account) => [account.code, account])),
    [data.accounts],
  )
  const { form } = editor
  const formLines = Array.isArray(form.lines) ? form.lines : []
  const totals = journalTotals(formLines)
  // Must carry value, balance, and every line with an amount needs an account (otherwise reports ignore it).
  const missingAccount = formLines.some((line) => (line.debit || line.credit) && !line.account)
  const canPost = totals.balanced && totals.debit > 0 && !missingAccount

  const entries = useMemo(() => inRange(data.journals)
    .filter((journal) => accountFilter === 'ALL' || journalLines(journal).some((line) => line?.account === accountFilter))
    .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? '')), [accountFilter, data.journals, inRange])

  const nextJournalRef = useMemo(() => {
    const highest = data.journals.reduce((maximum, journal) => {
      const match = /^JNL-(\d+)$/.exec(journal.ref ?? '')
      return Math.max(maximum, match ? Number(match[1]) : 0)
    }, 0)
    return `JNL-${String(highest + 1).padStart(4, '0')}`
  }, [data.journals])

  const openNew = () => editor.openNew({
    id: '', date: todayISO(), memo: '', lines: [blankLine(), blankLine()], ref: nextJournalRef,
  })

  const post = () => {
    if (!canPost) return
    const lines = (Array.isArray(form.lines) ? form.lines : []).map((line) => ({
      ...line,
      debit: Number(line.debit) || 0,
      credit: Number(line.credit) || 0,
    }))
    saveJournal({
      ...form,
      lines,
      id: form.id || genId(),
      status: 'Posted',
      docType: 'manual',
      _type: 'Journal',
    })
    editor.close()
  }

  const updateLine = (id, key, value) =>
    editor.updateField('lines', (lines = []) => (Array.isArray(lines) ? lines : [])
      .map((line) => (line.id === id ? { ...line, [key]: value } : line)))

  return (
    <div className="page">
      <PageHeader title="General Ledger" icon="list-details" subtitle={`${data.journals.length} journal entries`}>
        <Select small className="input--account" aria-label="Filter by account" value={accountFilter} onChange={(e) => setAccountFilter(e.target.value)}
          options={[{ value: 'ALL', label: 'All Accounts' }, ...accounts.map((a) => ({ value: a.code, label: `${a.code} ${a.name}` }))]} />
        <DateRangeFilter from={range.from} to={range.to} onFromChange={range.setFrom} onToChange={range.setTo} />
        <Button icon="plus" onClick={openNew}>Manual Journal</Button>
      </PageHeader>

      <Card flush>
        {entries.length === 0 ? (
          <EmptyState>No journal entries in this period. Journals are created automatically when you post invoices, receipts, and POs. You can also add manual journals here.</EmptyState>
        ) : (
          <div className="table-wrap">
            <table className="table ledger">
              <caption className="sr-only">General ledger entries</caption>
              <thead>
                <tr>
                  <th scope="col">Date</th><th scope="col">Ref</th><th scope="col">Memo</th><th scope="col">Account</th>
                  <th scope="col" className="cell--right">Debit</th><th scope="col" className="cell--right">Credit</th>
                  <th scope="col"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((journal) => {
                  const lines = journalLines(journal)
                  return (
                    <Fragment key={journal.id}>
                      {lines.map((line, index) => {
                        const account = accountByCode.get(line.account)
                        const span = lines.length
                        return (
                          <tr key={line.id ?? index} className={index === 0 ? 'ledger__first' : undefined}>
                            {index === 0 && (
                              <>
                                <td rowSpan={span} className="cell--small">{formatDate(journal.date)}</td>
                                <td rowSpan={span} className="cell--mono cell--small cell--strong cell--navy">{journal.ref}</td>
                                <td rowSpan={span} className="cell--small cell--muted">{journal.memo}</td>
                              </>
                            )}
                            <td className={account ? `tone-${TYPE_TONE[account.type]}` : undefined}>
                              <span className="acc-code">{line.account}</span> {account?.name}
                            </td>
                            <td className="cell--right cell--success">{line.debit > 0 ? formatKES(line.debit) : ''}</td>
                            <td className="cell--right cell--info">{line.credit > 0 ? formatKES(line.credit) : ''}</td>
                            {index === 0 && (
                              <td rowSpan={span}>
                                {isManualJournal(journal) && (
                                  <div className="table__actions">
                                    <Button variant="secondary" size="sm" icon="pencil" aria-label={`Edit ${journal.ref}`} onClick={() => editor.openEdit(journal)}>Edit</Button>
                                    <Button variant="danger" size="sm" icon="trash" aria-label={`Delete ${journal.ref}`} onClick={() => setPendingDelete(journal)}>Delete</Button>
                                  </div>
                                )}
                              </td>
                            )}
                          </tr>
                        )
                      })}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {editor.isOpen && (
        <Modal
          title={editor.isNew ? 'New Manual Journal' : 'Edit Journal'}
          size="wide"
          onClose={editor.close}
          footer={
            <>
              <Button variant="secondary" onClick={editor.close}>Cancel</Button>
              <Button disabled={!canPost} onClick={post}>Post Journal</Button>
            </>
          }
        >
          <div className="form-grid">
            <Field label="Date" half><Input type="date" value={form.date || todayISO()} onChange={(e) => editor.setField('date', e.target.value)} /></Field>
            <Field label="Reference" half><Input mono value={form.ref || ''} onChange={(e) => editor.setField('ref', e.target.value)} /></Field>
            <Field label="Memo / Description"><Input value={form.memo || ''} onChange={(e) => editor.setField('memo', e.target.value)} /></Field>
          </div>

          <div className="table-wrap form-section">
            <table className="table table--compact">
              <caption className="sr-only">Journal lines</caption>
              <thead>
                <tr>
                  <th scope="col">Account</th><th scope="col">Description</th>
                  <th scope="col" className="cell--right">Debit (KES)</th><th scope="col" className="cell--right">Credit (KES)</th>
                  <th scope="col"><span className="sr-only">Remove</span></th>
                </tr>
              </thead>
              <tbody>
                {formLines.map((line, i) => (
                  <tr key={line.id ?? i}>
                    <td>
                      <Select small aria-label={`Line ${i + 1} account`} value={line.account ?? ''} onChange={(event) => updateLine(line.id, 'account', event.target.value)}
                        options={[{ value: '', label: 'Select…' }, ...accounts.map((a) => ({ value: a.code, label: `${a.code} — ${a.name}` }))]} />
                    </td>
                    <td><Input aria-label={`Line ${i + 1} description`} value={line.description || ''} onChange={(e) => updateLine(line.id, 'description', e.target.value)} /></td>
                    <td><NumberInput right aria-label={`Line ${i + 1} debit`} value={line.debit ?? 0} onChange={(e) => updateLine(line.id, 'debit', Number(e.target.value) || 0)} /></td>
                    <td><NumberInput right aria-label={`Line ${i + 1} credit`} value={line.credit ?? 0} onChange={(e) => updateLine(line.id, 'credit', Number(e.target.value) || 0)} /></td>
                    <td><Button variant="danger" size="sm" icon="x" aria-label={`Remove line ${i + 1}`} onClick={() => editor.updateField('lines', (lines = []) => (Array.isArray(lines) ? lines : []).filter((entry) => entry.id !== line.id))} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button variant="secondary" size="sm" icon="plus" className="mt-line" onClick={() => editor.updateField('lines', (lines = []) => [...(Array.isArray(lines) ? lines : []), blankLine()])}>Add Line</Button>

          <div className={`banner mt-banner tone-${totals.balanced ? 'success' : 'danger'}`} role="status">
            <span>Total Debits: <strong>{formatKES(totals.debit)}</strong></span>
            <span>Total Credits: <strong>{formatKES(totals.credit)}</strong></span>
            <span className="banner__status">
              {!totals.balanced && `✘ Out of balance by ${formatKES(Math.abs(totals.debit - totals.credit))}`}
              {totals.balanced && missingAccount && '✘ Choose an account for every line with an amount'}
              {totals.balanced && !missingAccount && (totals.debit > 0 ? '✔ Balanced' : 'Enter debit and credit amounts')}
            </span>
          </div>
        </Modal>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete journal?"
          message={<>Delete manual journal <strong>{pendingDelete.ref}</strong>? Account balances will change.</>}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => { removeRecord('journals', pendingDelete.id); setPendingDelete(null) }}
        />
      )}
    </div>
  )
}
