import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { User } from '@/lib/models/user'
import { ROUTES } from '@/lib/constants/routes'

/**
 * Server-side fetch of the authenticated user's profile from the user service,
 * forwarding the incoming cookies. Returns null when unauthenticated or on error.
 */
export async function getServerUser(): Promise<User | null> {
  const cookieStore = await cookies()
  try {
    const res = await fetch(`${process.env.USER_SERVICE_URL}/users/me`, {
      headers: { Cookie: cookieStore.toString() },
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

/**
 * Server-side guard for the Dev area. Redirects unauthenticated users to login
 * and authenticated non-dev users to the dashboard. Returns the user otherwise.
 */
export async function requireDevUser(): Promise<User> {
  const user = await getServerUser()
  if (!user) redirect(ROUTES.login)
  if (!user.dev_mode) redirect(ROUTES.dashboard)
  return user
}
