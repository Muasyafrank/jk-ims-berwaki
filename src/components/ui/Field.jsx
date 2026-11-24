import { cloneElement, isValidElement, useId } from 'react'
import { cx } from '../../lib/classNames.js'

/**
 * Label + control. The wrapping <label> associates the text with its input without ids.
 * Optional hint and error messages are linked to the control for screen readers.
 */
export function Field({ label, half, hint, error, required, children, className }) {
  const hintId = useId()
  const errorId = useId()
  const describedBy = [
    isValidElement(children) ? children.props['aria-describedby'] : null,
    hint ? hintId : null,
    error ? errorId : null,
  ].filter(Boolean).join(' ') || undefined

  const control = isValidElement(children)
    ? cloneElement(children, {
        ...(required ? { required: true } : {}),
        ...(error ? { 'aria-invalid': true } : {}),
        ...(describedBy ? { 'aria-describedby': describedBy } : {}),
      })
    : children

  return (
    <label className={cx('field', half && 'field--half', error && 'field--error', className)}>
      <span className="field__label">
        {label}
        {required && <span className="field__required" aria-hidden="true"> *</span>}
      </span>
      {control}
      {hint && <span className="field__hint" id={hintId}>{hint}</span>}
      {error && <span className="field__error" id={errorId} role="alert">{error}</span>}
    </label>
  )
}

export function Input({ mono, right, small, className, ...props }) {
  return <input className={cx('input', mono && 'input--mono', right && 'input--right', small && 'input--sm', className)} {...props} />
}

/** Number input with sensible defaults; callers can still override type/step/onFocus. */
export function NumberInput({ onFocus = (event) => event.target.select(), ...props }) {
  return <Input type="number" step="any" onFocus={onFocus} {...props} />
}

export function Textarea({ rows = 3, className, ...props }) {
  return <textarea className={cx('input', className)} rows={rows} {...props} />
}

/** `options` are strings, or { value, label } objects. */
export function Select({ options, className, small, ...props }) {
  return (
    <select className={cx('input', small && 'input--sm', className)} {...props}>
      {options.map((option) => {
        const { value, label } = typeof option === 'string' ? { value: option, label: option } : option
        return <option key={value} value={value}>{label}</option>
      })}
    </select>
  )
}
