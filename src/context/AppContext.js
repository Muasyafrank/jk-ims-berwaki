import { createContext, useContext } from 'react'

export const AppContext = createContext(null)

/** Access business data, settings and the actions that change them. */
export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used inside <AppProvider>')
  return context
}
