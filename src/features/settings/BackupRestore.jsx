import { useRef, useState } from 'react'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import { useApp } from '../../context/AppContext.js'
import { backupFileName, createBackup, parseBackup } from '../../lib/backup.js'

const MAX_BACKUP_BYTES = 25 * 1024 * 1024

function downloadJSON(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = Object.assign(document.createElement('a'), { href: url, download: filename })
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

/** Export all data to a JSON file, or replace everything from one. Data otherwise lives only in this browser. */
export default function BackupRestore({ onRestored }) {
  const { data, settings, restoreBackup } = useApp()
  const fileInput = useRef(null)
  const [pending, setPending] = useState(null) // parsed backup awaiting confirmation
  const [message, setMessage] = useState(null) // { tone, text }

  const exportBackup = () => {
    downloadJSON(backupFileName(), createBackup(data, settings))
    setMessage({ tone: 'success', text: 'Backup downloaded. Keep it somewhere safe.' })
  }

  const chooseFile = async (event) => {
    const file = event.target.files[0]
    event.target.value = '' // allow re-selecting the same file later
    if (!file) return
    if (file.size > MAX_BACKUP_BYTES) {
      setMessage({ tone: 'danger', text: 'That file is too large to be a valid JK IMS backup.' })
      return
    }
    try {
      setPending(parseBackup(await file.text()))
      setMessage(null)
    } catch (error) {
      setMessage({ tone: 'danger', text: error.message })
    }
  }

  const confirmRestore = () => {
    restoreBackup(pending)
    onRestored?.(pending.settings)
    setMessage({ tone: 'success', text: `Restored ${pending.recordCount} records from the backup.` })
    setPending(null)
  }

  return (
    <Card>
      <h2 className="card__title">Backup &amp; Restore</h2>
      <p className="card__note backup__intro">
        Your data is stored in this browser only. Download a backup regularly, and use it to move to another
        computer or recover after clearing browser data.
      </p>
      <div className="toolbar">
        <Button icon="arrow-right" onClick={exportBackup}>Download backup</Button>
        <Button variant="secondary" onClick={() => fileInput.current.click()}>Restore from file…</Button>
        <input ref={fileInput} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} onChange={chooseFile} aria-label="Backup file" />
      </div>
      {message && (
        <p
          role={message.tone === 'danger' ? 'alert' : 'status'}
          className={`backup__message tone-${message.tone}`}
        >
          {message.text}
        </p>
      )}

      {pending && (
        <ConfirmDialog
          title="Replace all current data?"
          confirmLabel="Replace data"
          message={<>This backup holds <strong>{pending.recordCount}</strong> records. Restoring <strong>replaces everything currently in the system</strong>. Download a backup of the current data first if you might need it.</>}
          onCancel={() => setPending(null)}
          onConfirm={confirmRestore}
        />
      )}
    </Card>
  )
}
