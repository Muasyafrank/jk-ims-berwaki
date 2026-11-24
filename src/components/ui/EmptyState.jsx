import { cx } from '../../lib/classNames.js'

export default function EmptyState({ small, children }) {
  return <div className={cx('empty', small && 'empty--sm')}>{children}</div>
}
