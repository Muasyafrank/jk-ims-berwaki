import Icon from './Icon.jsx'
import { cx } from '../../lib/classNames.js'

/**
 * variant: primary | gold | secondary | danger | danger-solid | ghost
 * size:    md | sm
 */
export default function Button({
  variant = 'primary', size = 'md', icon, block, className, type = 'button', children, ...props
}) {
  return (
    <button
      type={type}
      className={cx('btn', variant !== 'primary' && `btn--${variant}`, size === 'sm' && 'btn--sm', block && 'btn--block', className)}
      {...props}
    >
      {icon && <Icon name={icon} size={size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  )
}
