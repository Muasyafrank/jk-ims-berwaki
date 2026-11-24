/** Maps a document status to a colour tone (see .tone-* in tokens.css). */
const STATUS_TONES = {
  // neutral
  Draft: 'neutral', Active: 'neutral', Open: 'neutral',
  // info
  Sent: 'info', Issued: 'info', 'PO Raised': 'info',
  // success
  Accepted: 'success', Converted: 'success', Paid: 'success', Delivered: 'success',
  Closed: 'success', Received: 'success', Signed: 'success', Applied: 'success', Invoiced: 'success',
  // warning
  Pending: 'warning', Partial: 'warning', 'Follow Up': 'warning', 'On Hold': 'warning',
  // danger
  Overdue: 'danger', Cancelled: 'danger', Rejected: 'danger', Expired: 'danger',
  Lost: 'danger', Disputed: 'danger',
}

export const toneForStatus = (status) => STATUS_TONES[status] ?? 'neutral'
