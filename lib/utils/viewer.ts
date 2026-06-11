// Extracts the viewing user's id from a JWT access token without verifying it
// (verification happens server-side at the services). Returns null for a malformed
// token. Used to decide board orientation and whether the viewer may resume a game.
export function getViewerUserId(token: string | undefined): string | null {
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.sub ?? payload.user_id ?? null
  } catch {
    return null
  }
}
