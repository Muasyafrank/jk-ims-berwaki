import { useEffect, useState } from 'react'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import { Field, Input, Textarea } from '../../components/ui/Field.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import { useApp } from '../../context/AppContext.js'
import { normalizeReferenceMap, validateBusinessProfile, validateReferenceConfig } from '../../lib/validation.js'
import { hydrateSettings } from '../../lib/workspace.js'
import RefNumberFields from '../setup/RefNumberFields.jsx'
import BackupRestore from './BackupRestore.jsx'

const formFromSettings = (settings) => {
  const source = settings ?? {}
  return {
    bizName: source.bizName ?? '',
    pin: source.pin ?? '',
    phone: source.phone ?? '',
    email: source.email ?? '',
    address: source.address ?? '',
    refMap: source.refMap ?? {},
  }
}

export default function Settings() {
  const { settings, updateSettings } = useApp()
  const [form, setForm] = useState(() => formFromSettings(settings))
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!saved) return undefined
    const timer = setTimeout(() => setSaved(false), 2500)
    return () => clearTimeout(timer)
  }, [saved])

  const set = (key) => (event) => {
    const { value } = event.target
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
    setSaved(false)
  }

  const updateReference = (type, config) => {
    setForm((current) => ({ ...current, refMap: { ...current.refMap, [type]: config } }))
    setErrors((current) => ({ ...current, [type]: undefined }))
    setSaved(false)
  }

  const save = () => {
    const nextErrors = {
      ...validateBusinessProfile(form),
      ...validateReferenceConfig(form.refMap),
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setSaved(false)
      return
    }

    updateSettings({
      ...form,
      bizName: form.bizName.trim(),
      email: form.email.trim(),
      refMap: normalizeReferenceMap(form.refMap),
    })
    setSaved(true)
  }

  const handleRestored = (restoredSettings) => {
    const normalized = hydrateSettings(restoredSettings)
    if (normalized) setForm(formFromSettings(normalized))
    setErrors({})
    setSaved(false)
  }

  return (
    <div className="page">
      <PageHeader title="System Settings" icon="settings" />
      <div className="grid grid--2">
        <Card>
          <h2 className="card__title">Business Profile</h2>
          <div className="form-grid">
            <Field label="Company Name" required error={errors.bizName}>
              <Input value={form.bizName} onChange={set('bizName')} />
            </Field>
            <Field label="KRA PIN">
              <Input value={form.pin} onChange={set('pin')} />
            </Field>
            <Field label="Phone" half>
              <Input value={form.phone} onChange={set('phone')} />
            </Field>
            <Field label="Email" half error={errors.email}>
              <Input type="email" value={form.email} onChange={set('email')} />
            </Field>
            <Field label="Address">
              <Textarea rows={3} value={form.address} onChange={set('address')} />
            </Field>
          </div>
        </Card>
        <Card>
          <h2 className="card__title">Reference Number Settings</h2>
          <RefNumberFields
            single
            refMap={form.refMap}
            usedRefs={settings?.usedRefs ?? {}}
            errors={errors}
            onChange={updateReference}
          />
        </Card>
      </div>
      <div className="toolbar">
        <Button onClick={save}>Save Settings</Button>
        {saved && <span role="status" className="saved-note">✓ Settings saved</span>}
      </div>
      <BackupRestore onRestored={handleRestored} />
    </div>
  )
}
