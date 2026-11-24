import { useState } from 'react'
import Button from '../../components/ui/Button.jsx'
import { Field, Input, NumberInput, Select, Textarea } from '../../components/ui/Field.jsx'
import Modal from '../../components/ui/Modal.jsx'
import DocumentPreview from './DocumentPreview.jsx'
import LineItemsEditor from './LineItemsEditor.jsx'

function FieldControl({ field, value, onChange, ...controlProps }) {
  const common = {
    ...controlProps,
    value: value ?? '',
    placeholder: field.placeholder,
    onChange: (event) => onChange(field.name, event.target.value),
  }

  switch (field.type) {
    case 'select': return <Select options={field.options} value={common.value} onChange={common.onChange} />
    case 'textarea': return <Textarea rows={field.rows} {...common} />
    case 'number': return <NumberInput {...common} />
    case 'date': return <Input type="date" {...common} />
    default: return <Input mono={field.mono} {...common} />
  }
}

/** Create/edit dialog generated from a record definition's `fields` (and optional line items). */
export default function RecordModal({ definition, editor, onSave }) {
  const { form, setField, updateField } = editor
  const [showPreview, setShowPreview] = useState(false)
  const canPreview = Boolean(definition.template)
  const title = editor.isNew ? definition.modalTitle.new : definition.modalTitle.edit
  const postsToLedger = definition.postsToLedger
    ? definition.postsToLedger(editor.form)
    : Boolean(definition.journal)
  const ledgerHint = postsToLedger
    ? editor.isNew
      ? 'Saving this document will also post a balanced entry to the general ledger.'
      : 'This document already has a ledger entry. Editing it does not update that entry; adjust the ledger separately.'
    : null

  return (
    <Modal
      title={title}
      size={showPreview ? 'split' : definition.wide ? 'wide' : 'md'}
      onClose={editor.close}
      footer={
        <>
          {canPreview && (
            <Button
              variant="ghost"
              className="modal__preview-toggle"
              aria-pressed={showPreview}
              onClick={() => setShowPreview((visible) => !visible)}
            >
              {showPreview ? 'Hide preview' : 'Live preview'}
            </Button>
          )}
          <Button variant="secondary" onClick={editor.close}>Cancel</Button>
          <Button onClick={onSave}>{definition.saveLabel}</Button>
        </>
      }
    >
      <div className={showPreview ? 'record-split' : undefined}>
        <div className="record-split__form">
          {ledgerHint && <p className="form-note">{ledgerHint}</p>}
          <div className="form-grid">
            {definition.fields.map((field) => (
              <Field
                key={field.name}
                label={field.label}
                half={field.half}
                hint={field.hint}
                required={field.required}
              >
                <FieldControl field={field} value={form[field.name]} onChange={setField} />
              </Field>
            ))}
          </div>

          {definition.hasItems && (
            <section className="form-section">
              <h3 className="form-section__title">Line Items</h3>
              <LineItemsEditor
                items={form.items}
                setItems={(updater) => updateField('items', updater)}
              />
            </section>
          )}
        </div>
        {showPreview && <DocumentPreview definition={definition} form={form} />}
      </div>
    </Modal>
  )
}
