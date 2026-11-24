import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]:not([tabindex="-1"])',
  'button:not([disabled]):not([tabindex="-1"])',
  'input:not([disabled]):not([tabindex="-1"])',
  'select:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function getFocusableElements(container) {
  return [...container.querySelectorAll(FOCUSABLE_SELECTOR)].filter((element) =>
    !element.hidden && element.getAttribute('aria-hidden') !== 'true' && element.getClientRects().length > 0)
}

/**
 * Keep keyboard focus inside a container while it is active.
 *
 * The hook handles Tab/Shift+Tab wrapping, Escape, focus recovery and returning
 * focus to the element that opened the container. `initialFocus` may be a CSS
 * selector or a React ref.
 */
export function useFocusTrap({
  active = true,
  containerRef,
  initialFocus,
  onEscape,
  restoreFocus = true,
}) {
  const onEscapeRef = useRef(onEscape)

  useEffect(() => {
    onEscapeRef.current = onEscape
  }, [onEscape])

  useEffect(() => {
    if (!active) return undefined

    const container = containerRef.current
    if (!container) return undefined

    const previouslyFocused = document.activeElement

    const focusInitialElement = () => {
      const candidates = getFocusableElements(container)
      const requested = typeof initialFocus === 'string'
        ? container.querySelector(initialFocus)
        : initialFocus?.current
      const target = requested && requested.getClientRects().length > 0
        ? requested
        : candidates[0] ?? container
      target.focus?.()
    }

    focusInitialElement()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onEscapeRef.current?.()
        return
      }
      if (event.key !== 'Tab') return

      const items = getFocusableElements(container)
      if (items.length === 0) {
        event.preventDefault()
        container.focus?.()
        return
      }

      const first = items[0]
      const last = items[items.length - 1]
      const current = document.activeElement

      if (event.shiftKey && (current === first || !container.contains(current))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && current === last) {
        event.preventDefault()
        first.focus()
      }
    }

    const onFocusIn = (event) => {
      if (!container.contains(event.target)) focusInitialElement()
    }

    document.addEventListener('keydown', onKeyDown, true)
    document.addEventListener('focusin', onFocusIn)

    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.removeEventListener('focusin', onFocusIn)
      if (restoreFocus && previouslyFocused?.isConnected) previouslyFocused.focus?.()
    }
  }, [active, containerRef, initialFocus, restoreFocus])
}
