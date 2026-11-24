import Icon from '../ui/Icon.jsx'
import { PRODUCT } from '../../config/company.js'
import { NAV_SECTIONS } from '../../routes.jsx'
import { cx } from '../../lib/classNames.js'

export default function Sidebar({ sidebarRef, activeId, onNavigate, onClose, bizName, onSignOut, open }) {
  return (
    <aside ref={sidebarRef} className={cx('sidebar', open && 'is-open')} id="app-sidebar">
      <div className="sidebar__brand">
        <div>
          <div className="sidebar__brand-name">{PRODUCT.name}</div>
          <div className="sidebar__brand-sub">{bizName}</div>
        </div>
        <button type="button" className="sidebar__close" aria-label="Close menu" onClick={onClose}>
          <Icon name="x" size={18} />
        </button>
      </div>

      <nav className="sidebar__nav" aria-label="Main">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <h2 className="sidebar__section-title">{section.title}</h2>
            <ul>
              {section.routes.map((route) => (
                <li key={route.id}>
                  <a
                    href={`#/${route.id}`}
                    className={cx('sidebar__link', activeId === route.id && 'is-active')}
                    aria-current={activeId === route.id ? 'page' : undefined}
                    onClick={() => onNavigate(route.id)}
                  >
                    <Icon name={route.icon} size={16} />
                    {route.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="sidebar__footer">
        <button type="button" className="sidebar__signout" onClick={onSignOut}>
          <Icon name="logout" size={16} /> Sign Out
        </button>
      </div>
    </aside>
  )
}
