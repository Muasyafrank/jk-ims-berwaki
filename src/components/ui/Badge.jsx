import { toneForStatus } from '../../config/status.js'
import { cx } from '../../lib/classNames.js'

/** Coloured pill. Pass `status` to derive the tone from the document status, or `tone` directly. */
export default function Badge({ status, tone, children }) {
  return <span className={cx('badge', `tone-${tone ?? toneForStatus(status)}`)}>{children ?? status}</span>
}
