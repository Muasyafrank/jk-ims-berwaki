import ICON_PATHS from './iconPaths.js'
import { cx } from '../../lib/classNames.js'

/** Inline SVG icon (Tabler set). Decorative by default; pass `label` to expose it to screen readers. */
export default function Icon({ name, size = 18, className, label }) {
  const paths = ICON_PATHS[name]
  if (!paths) return null
  return (
    <svg
      className={cx('icon', className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : 'true'}
      focusable="false"
    >
      {paths.map((d) => <path key={d} d={d} />)}
    </svg>
  )
}
