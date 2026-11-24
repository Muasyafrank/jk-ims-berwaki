import { cx } from '../../lib/classNames.js'

/** Surface container. `tone` adds a coloured top border (accent) or tinted background (tinted). */
export default function Card({ tone, accent, tinted, flush, className, children, ...props }) {
  return (
    <div
      className={cx('card', flush && 'card--flush', accent && 'card--accent', tinted && 'card--tinted', tone && `tone-${tone}`, className)}
      {...props}
    >
      {children}
    </div>
  )
}
