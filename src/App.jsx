import AppShell from './components/layout/AppShell.jsx'
import AppProvider from './context/AppProvider.jsx'
import { useApp } from './context/AppContext.js'
import { useAuth } from './hooks/useAuth.js'
import Login from './features/auth/Login.jsx'
import SetupWizard from './features/setup/SetupWizard.jsx'

/** First-run gate: show the setup wizard until the business has been configured. */
function Workspace({ onSignOut }) {
  const { settings, completeSetup } = useApp()
  if (!settings?.setupDone) return <SetupWizard onDone={completeSetup} />
  return <AppShell onSignOut={onSignOut} />
}

export default function App() {
  const { isSignedIn, signIn, signOut } = useAuth()
  if (!isSignedIn) return <Login onSignIn={signIn} />
  return (
    <AppProvider>
      <Workspace onSignOut={signOut} />
    </AppProvider>
  )
}
