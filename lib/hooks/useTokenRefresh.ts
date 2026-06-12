'use client'

import { useCallback, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

// The access token is a 15-min JWT. Refresh at its half-life so a single missed
// attempt (a network blip, or a timer throttled while the tab is backgrounded) still
// leaves a full window to recover before the user is bounced.
const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000
const REFRESH_AFTER_MS = ACCESS_TOKEN_TTL_MS / 2 // 7.5 min — two attempts per access window

// How often we re-check whether a refresh is due while the tab is open.
const HEARTBEAT_MS = 60 * 1000

// A session counts as "active" only if the user interacted within this window. Past it
// we stop proactively refreshing and let the access token lapse; the long-lived refresh
// token (30 days) silently re-establishes the session on the next interaction. This is
// what couples session lifetime to real activity instead of a blind keep-alive timer.
const ACTIVITY_WINDOW_MS = ACCESS_TOKEN_TTL_MS

/**
 * Keeps the HttpOnly access_token cookie fresh for an *actively used* session and lets
 * an idle one lapse gracefully.
 *
 * A refresh fires only when the token is past its half-life AND the session is active:
 * the tab is visible and the user interacted (pointer/key/scroll, route change, or just
 * returned to the tab) within {@link ACTIVITY_WINDOW_MS}. A backgrounded or untouched tab
 * stops refreshing rather than being kept alive — or bounced — by the clock. Returning to
 * a throttled tab refreshes on sight, which is the main guard against background-tab logout.
 *
 * Mount once in an authenticated layout. Safe to mount multiple times.
 */
export function useTokenRefresh() {
  const pathname = usePathname()
  // Refs so the long-lived effect always reads current values without re-subscribing.
  // Seeded in the mount effect below (Date.now() is impure, so not in render).
  const lastRefresh = useRef(0)
  const lastActivity = useRef(0)

  const refresh = useCallback(() => {
    lastRefresh.current = Date.now()
    fetch('/api/auth/refresh', { method: 'POST' }).catch(() => {
      // Network errors are non-fatal: a later heartbeat or interaction retries, and a
      // genuinely stale token still falls back to the server-side dashboard logout flow.
    })
  }, [])

  const maybeRefresh = useCallback(() => {
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
    const now = Date.now()
    const due = now - lastRefresh.current >= REFRESH_AFTER_MS
    const active = now - lastActivity.current < ACTIVITY_WINDOW_MS
    if (due && active) refresh()
  }, [refresh])

  const markActivity = useCallback(() => {
    lastActivity.current = Date.now()
  }, [])

  useEffect(() => {
    // Seed the clocks: login/navigation implies a freshly validated access token, so
    // treat mount as both the last refresh and the last activity.
    const now = Date.now()
    lastRefresh.current = now
    lastActivity.current = now

    const heartbeat = window.setInterval(maybeRefresh, HEARTBEAT_MS)

    // Real user interaction keeps the session active. Passive listeners so we never block input.
    const activityEvents = ['pointerdown', 'pointermove', 'keydown', 'scroll'] as const
    activityEvents.forEach((e) => document.addEventListener(e, markActivity, { passive: true }))

    // Returning to a backgrounded tab: timers were throttled, so mark activity and refresh
    // on sight if the token is due.
    function onVisibility() {
      if (document.visibilityState !== 'visible') return
      markActivity()
      maybeRefresh()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.clearInterval(heartbeat)
      activityEvents.forEach((e) => document.removeEventListener(e, markActivity))
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [maybeRefresh, markActivity])

  // A route change is genuine user activity; treat each navigation as an interaction.
  useEffect(() => {
    markActivity()
    maybeRefresh()
  }, [pathname, markActivity, maybeRefresh])
}
