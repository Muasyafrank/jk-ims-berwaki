import { Suspense, useEffect, useRef, useState } from 'react'
import { useApp } from '../../context/AppContext.js'
import { useHashRoute } from '../../hooks/useHashRoute.js'
import { useFocusTrap } from '../../hooks/useFocusTrap.js'
import { DEFAULT_ROUTE, ROUTE_IDS } from '../../config/navigation.js'
import { ROUTES } from '../../routes.jsx'
import { cx } from '../../lib/classNames.js'
import ErrorBoundary from '../ErrorBoundary.jsx'
import Icon from '../ui/Icon.jsx'
import Sidebar from './Sidebar.jsx'

function PageSkeleton() {
  return (
    <div className="page" aria-busy="true" aria-label="Loading page">
      <div className="skeleton skeleton--title" />
      <div className="card"><div className="skeleton" /><div className="skeleton" /><div className="skeleton skeleton--short" /></div>
    </div>
  )
}

export default function AppShell({ onSignOut }) {
  const { settings } = useApp()
  const [routeId, navigate] = useHashRoute(ROUTE_IDS, DEFAULT_ROUTE)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef(null)
  const sidebarRef = useRef(null)

  const route = ROUTES.find((item) => item.id === routeId)
  const Page = route.component

  const closeMenu = ({ restoreFocus = false } = {}) => {
    setMenuOpen(false)
    if (restoreFocus) menuButtonRef.current?.focus()
  }

  useEffect(() => {
    document.title = `${route.label} · JK IMS`
    document.getElementById('main-content')?.scrollTo(0, 0)
  }, [route])

  // Mobile drawer: keep focus inside it while open and close on Escape.
  useFocusTrap({
    active: menuOpen,
    containerRef: sidebarRef,
    initialFocus: '.sidebar__link',
    onEscape: () => closeMenu({ restoreFocus: true }),
    restoreFocus: false,
  })

  const go = (id) => {
    navigate(id)
    closeMenu({ restoreFocus: true })
  }

  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault()
          document.getElementById('main-content')?.focus()
        }}
      >
        Skip to main content
      </a>

      <Sidebar
        sidebarRef={sidebarRef}
        activeId={routeId}
        onNavigate={go}
        onClose={() => closeMenu({ restoreFocus: true })}
        bizName={settings.bizName}
        onSignOut={onSignOut}
        open={menuOpen}
      />
      <div className={cx('sidebar-backdrop', menuOpen && 'is-open')} onClick={() => closeMenu({ restoreFocus: true })} aria-hidden="true" />

      <div className="app-shell__body" inert={menuOpen || undefined}>
        <div className="topbar">
          <button
            ref={menuButtonRef}
            type="button"
            className="topbar__menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="app-sidebar"
            onClick={() => (menuOpen ? closeMenu({ restoreFocus: true }) : setMenuOpen(true))}
          >
            <Icon name={menuOpen ? 'x' : 'menu-2'} size={20} />
          </button>
          <span className="topbar__title">{route.label}</span>
        </div>
        <main id="main-content" className="app-shell__main" tabIndex={-1}>
          <ErrorBoundary key={routeId}>
            <Suspense fallback={<PageSkeleton />}>
              <Page />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
