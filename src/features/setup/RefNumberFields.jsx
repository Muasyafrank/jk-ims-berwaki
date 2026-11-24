import { Field, Input, NumberInput } from '../../components/ui/Field.jsx'
import { DEFAULT_REF_CONFIG, REFERENCE_DOC_TYPES } from '../../config/constants.js'
import { cx } from '../../lib/classNames.js'
import { formatRef, nextRefNumber } from '../../lib/refs.js'

/**
 * Prefix / start number / padding editor for each auto-numbered document type.
 * `usedRefs` (optional) lets the preview show the number that will really be issued next.
 */
export default function RefNumberFields({
  refMap = {},
  onChange,
  usedRefs = {},
  errors = {},
  previewLabel = 'Next',
  single,
}) {
  return (
    <div className={cx('ref-grid', single && 'ref-grid--single')}>
      {REFERENCE_DOC_TYPES.map(({ type, label }) => {
        const config = refMap[type] ?? DEFAULT_REF_CONFIG(type)
        const error = errors[type]
        const set = (key, value) => onChange(type, { ...config, [key]: value })
        const next = formatRef(config, nextRefNumber(config, usedRefs[type]))

        return (
          <div key={type} className={cx('ref-card', error && 'ref-card--error')}>
            <div className="ref-card__top">
              <div>
                <div className="ref-card__title">{label}</div>
                <span className="ref-card__type">{type}</span>
              </div>
            </div>
            <div className="ref-card__inputs">
              <Field label="Prefix" error={error}>
                <Input small value={config.prefix ?? ''} onChange={(event) => set('prefix', event.target.value)} />
              </Field>
              <Field label="Start #">
                <NumberInput small min={1} value={config.start ?? 1} onChange={(event) => set('start', Number(event.target.value) || 0)} />
              </Field>
              <Field label="Pad">
                <NumberInput small min={1} max={8} value={config.pad ?? 4} onChange={(event) => set('pad', Number(event.target.value) || 1)} />
              </Field>
            </div>
            <div className="ref-card__preview">
              <span>{previewLabel}</span>
              <code>{next}</code>
            </div>
          </div>
        )
      })}
    </div>
  )
}
