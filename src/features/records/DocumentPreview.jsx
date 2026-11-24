import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { useApp } from '../../context/AppContext.js'
import { buildRecord } from './buildRecord.js'

const PAPER_WIDTH = 794 // A4 at 96dpi

/** Scale factor that fits the fixed-width paper into its container. */
function useFitScale(paperRef) {
  const ref = useRef(null)
  const [fit, setFit] = useState({ scale: 1, height: 0 })
  useEffect(() => {
    const frame = ref.current?.firstChild // the padding-free sizer, so scale matches the real available width
    const paper = paperRef.current
    if (!frame || !paper) return undefined

    const update = () => {
      const availableWidth = frame.clientWidth || PAPER_WIDTH
      const scale = Math.min(1, availableWidth / PAPER_WIDTH)
      setFit({ scale, height: paper.offsetHeight * scale })
    }
    update()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update)
      return () => window.removeEventListener('resize', update)
    }

    const observer = new ResizeObserver(update)
    observer.observe(frame)
    observer.observe(paper)
    return () => observer.disconnect()
  }, [paperRef])
  return [ref, fit]
}

/**
 * The document exactly as it will print, re-rendered as the form changes.
 * Markup comes from the escaped `html` templates, so user input cannot inject HTML.
 */
export default function DocumentPreview({ definition, form }) {
  const { settings } = useApp()
  const paperRef = useRef(null)
  const [frameRef, { scale, height }] = useFitScale(paperRef)
  const deferredForm = useDeferredValue(form) // keep typing responsive on big documents

  const markup = useMemo(() => {
    try {
      return String(definition.template(buildRecord(definition, deferredForm), settings))
    } catch {
      return '<p class="doc-preview__error">Preview unavailable for the current values.</p>'
    }
  }, [definition, deferredForm, settings])

  return (
    <div className="doc-preview" ref={frameRef} aria-label="Document preview">
      <div className="doc-preview__sizer" style={{ height: height || undefined }}>
        <div
          ref={paperRef}
          className="doc-preview__paper"
          style={{ transform: `scale(${scale})`, width: PAPER_WIDTH }}
          dangerouslySetInnerHTML={{ __html: markup }}
        />
      </div>
    </div>
  )
}
