import { useEffect, useState } from 'react'

const read = (validIds, fallback) => {
  const id = window.location.hash.replace(/^#\/?/, '')
  return validIds.includes(id) ? id : fallback
}

/** Minimal hash router: #/quotations. Gives deep links, refresh-safe pages and a working Back button. */
export function useHashRoute(validIds, fallback) {
  const [route, setRoute] = useState(() => read(validIds, fallback))

  useEffect(() => {
    const onChange = () => setRoute(read(validIds, fallback))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [validIds, fallback])

  const navigate = (id) => { window.location.hash = `/${id}` }
  return [route, navigate]
}
