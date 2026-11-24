import Icon from './Icon.jsx'

/** Page title with optional icon, subtitle and a slot for actions (filters, buttons). */
export default function PageHeader({ title, icon, eyebrow, subtitle, children }) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && <div className="page-header__eyebrow">{eyebrow}</div>}
        <h1 className="page-header__title">
          {icon && <Icon name={icon} size={22} />}
          {title}
        </h1>
        {subtitle && <div className="page-header__subtitle">{subtitle}</div>}
      </div>
      {children && <div className="page-header__actions">{children}</div>}
    </header>
  )
}
