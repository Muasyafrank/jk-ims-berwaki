import Modal from './Modal.jsx'
import Button from './Button.jsx'

export default function ConfirmDialog({ title = 'Are you sure?', message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  return (
    <Modal
      title={title}
      description={message}
      size="sm"
      onClose={onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button variant="danger-solid" onClick={onConfirm}>{confirmLabel}</Button>
        </>
      }
    />
  )
}
