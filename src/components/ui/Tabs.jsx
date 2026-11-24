import { cx } from '../../lib/classNames.js'

const tabId = (prefix, id) => `${prefix}-tab-${id}`
const panelId = (prefix, id) => `${prefix}-panel-${id}`

/**
 * Segmented control following the WAI-ARIA tabs pattern.
 * `tabs` = [{ id, label }]; pair with a panel that uses `idPrefix`:
 *   id={`${idPrefix}-panel-${activeId}`} aria-labelledby={`${idPrefix}-tab-${activeId}`}
 */
export default function Tabs({ tabs, value, onChange, label, idPrefix = 'tabs' }) {
  const onKeyDown = (event) => {
    const current = tabs.findIndex((tab) => tab.id === value)
    if (current < 0) return

    let next
    if (event.key === 'ArrowRight') next = (current + 1) % tabs.length
    else if (event.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = tabs.length - 1
    else return

    event.preventDefault()
    const nextTab = tabs[next]
    onChange(nextTab.id)
    document.getElementById(tabId(idPrefix, nextTab.id))?.focus()
  }

  return (
    <div className="tabs" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
      {tabs.map((tab) => {
        const selected = value === tab.id
        return (
          <button
            key={tab.id}
            id={tabId(idPrefix, tab.id)}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={panelId(idPrefix, tab.id)}
            tabIndex={selected ? 0 : -1}
            className={cx('tab', selected && 'is-active')}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
