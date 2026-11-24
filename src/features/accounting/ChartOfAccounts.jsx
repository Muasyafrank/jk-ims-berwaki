import { useMemo, useState } from 'react'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import { ACCOUNT_TYPES } from '../../config/constants.js'
import { useApp } from '../../context/AppContext.js'
import { useRecordEditor } from '../../hooks/useRecordEditor.js'
import { computeBalances, sortByCode } from '../../lib/accounting.js'
import { formatKES } from '../../lib/format.js'
import RecordModal from '../records/RecordModal.jsx'
import { accountDefinition } from './accountDefinition.jsx'
import { TYPE_TONE } from './tones.js'

export default function ChartOfAccounts() {
  const { data, upsertRecord, removeRecord } = useApp()
  const editor = useRecordEditor()
  const [pendingDelete, setPendingDelete] = useState(null)

  const balances = useMemo(
    () => computeBalances(data.accounts, data.journals),
    [data.accounts, data.journals],
  )
  const sorted = useMemo(() => sortByCode(data.accounts), [data.accounts])

  const save = () => {
    upsertRecord('accounts', editor.form, { isNew: editor.isNew })
    editor.close()
  }

  return (
    <div className="page">
      <PageHeader title="Chart of Accounts" icon="book" subtitle={`${data.accounts.length} accounts · Double-entry system`}>
        <Button icon="plus" onClick={() => editor.openNew(accountDefinition.blank())}>Add Account</Button>
      </PageHeader>

      {ACCOUNT_TYPES.map((type) => {
        const rows = sorted.filter((a) => a.type === type)
        if (rows.length === 0) return null
        return (
          <Card flush key={type} className={`tone-${TYPE_TONE[type]}`}>
            <div className="account-type-header"><strong>{type}</strong><span>({rows.length})</span></div>
            <div className="table-wrap">
              <table className="table table--hover">
                <caption className="sr-only">{type} accounts</caption>
                <thead>
                  <tr>
                    <th scope="col">Code</th><th scope="col">Account Name</th><th scope="col">Description</th>
                    <th scope="col" className="cell--right">Balance (KES)</th><th scope="col"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((account) => {
                    const balance = balances[account.code] || 0
                    return (
                      <tr key={account.id}>
                        <td className="cell--mono cell--strong cell--navy">{account.code}</td>
                        <td className="cell--strong">{account.name}</td>
                        <td className="cell--small cell--muted">{account.description}</td>
                        <td className={`cell--right cell--strong ${balance < 0 ? 'cell--danger' : ''}`}>
                          {formatKES(Math.abs(balance))}{balance < 0 ? ' (Cr)' : ''}
                        </td>
                        <td>
                          <div className="table__actions">
                            <Button variant="secondary" size="sm" icon="pencil" aria-label={`Edit ${account.name}`} onClick={() => editor.openEdit(account)}>Edit</Button>
                            <Button variant="danger" size="sm" icon="trash" aria-label={`Delete ${account.name}`} onClick={() => setPendingDelete(account)}>Delete</Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )
      })}

      {editor.isOpen && <RecordModal definition={accountDefinition} editor={editor} onSave={save} />}
      {pendingDelete && (
        <ConfirmDialog
          title="Delete account?"
          message={<>Delete <strong>{pendingDelete.code} {pendingDelete.name}</strong>? Journal lines that use this code will no longer appear in reports.</>}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => { removeRecord('accounts', pendingDelete.id); setPendingDelete(null) }}
        />
      )}
    </div>
  )
}
