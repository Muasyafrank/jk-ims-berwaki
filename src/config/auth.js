/**
 * Sign-in gate.
 *
 * ⚠ This is a client-side convenience lock, NOT real security: the credentials ship in the
 * JavaScript bundle and the "logged in" flag lives in localStorage. Anyone with access to the
 * browser can bypass it. Move authentication to a server before holding sensitive data online.
 */
const CREDENTIALS = { username: 'ADMIN', password: 'admin123' }

export function checkCredentials(username, password) {
  return username.trim().toUpperCase() === CREDENTIALS.username && password === CREDENTIALS.password
}

export const SIGNED_IN_USER = CREDENTIALS.username
