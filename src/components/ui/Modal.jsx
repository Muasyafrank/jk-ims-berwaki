import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'
import Icon from './Icon.jsx'
import { cx } from '../../lib/classNames.js'

/**
 * Accessible dialog: Esc closes, focus moves in and is trapped, focus returns to the trigger,
 * and the page behind does not scroll. It deliberately does NOT close on backdrop click, so a
 * stray click never discards a half-filled invoice.
 */
export default function Modal({ title, description, onClose, size = 'md', footer, children }) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const descriptionId = useId()

  useFocusTrap({
    containerRef: dialogRef,
    initialFocus: '.modal__body input, .modal__body select, .modal__body textarea',
    onEscape: onClose,
  })

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  return createPortal(
    <div className="modal-backdrop">
      <div
        ref={dialogRef}
        className={cx('modal', size === 'wide' && 'modal--wide', size === 'split' && 'modal--split', size === 'sm' && 'modal--sm')}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
      >
        <div className="modal__header">
          <h2 className="modal__title" id={titleId}>{title}</h2>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Close dialog">
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="modal__body">
          {description && <p className="modal__description" id={descriptionId}>{description}</p>}
          {children}
        </div>
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
