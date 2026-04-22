import { cookies } from 'next/headers'

/**
 * Reads the HttpOnly access_token cookie server-side and returns it
 * formatted as a Bearer token string. Returns null if not present.
 * Used by route handlers that proxy to match-maker and match-manager,
 * which require Authorization: Bearer <token> instead of cookies.
 */
export async function getBearerToken(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  return token ? `Bearer ${token}` : null
}
