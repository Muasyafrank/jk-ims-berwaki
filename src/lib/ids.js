/** Collision-resistant id for client-side records, with a non-crypto fallback. */
export const genId = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()

  const random = Math.random().toString(36).slice(2, 12)
  return `${Date.now().toString(36)}-${random}`.toUpperCase()
}
