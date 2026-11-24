import { usePersistentState } from './usePersistentState.js'
import { STORAGE_KEYS } from '../config/constants.js'

/** Persisted signed-in flag. See config/auth.js for the (client-side only) credential check. */
export function useAuth() {
  const [isSignedIn, setSignedIn] = usePersistentState(STORAGE_KEYS.auth, (saved) => saved === true, { delay: 0 })
  return { isSignedIn, signIn: () => setSignedIn(true), signOut: () => setSignedIn(false) }
}
