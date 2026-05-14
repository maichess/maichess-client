'use client'

import { useEffect } from 'react'

const REFRESH_INTERVAL_MS = 10 * 60 * 1000 // 10 min — comfortably inside the 15-min access-token expiry
const VISIBILITY_REFRESH_THRESHOLD_MS = REFRESH_INTERVAL_MS

/**
 * Proactively refreshes the HttpOnly access_token cookie on a fixed cadence so
 * the user is not silently logged out after 15 min of idle. Also refreshes
 * immediately when the tab regains focus after >10 min hidden, since the
 * setInterval pauses with the tab.
 *
 * Mount once in an authenticated layout. Safe to mount multiple times — each
 * interval fires independently and the auth service tolerates concurrent refreshes.
 */
export function useTokenRefresh() {
  useEffect(() => {
    let lastRefresh = Date.now()

    function refresh() {
      lastRefresh = Date.now()
      fetch('/api/auth/refresh', { method: 'POST' }).catch(() => {
        // Network errors are non-fatal: the next interval/visibility tick will retry,
        // and a stale token still falls back to the existing dashboard logout flow.
      })
    }

    const intervalId = window.setInterval(refresh, REFRESH_INTERVAL_MS)

    function onVisibility() {
      if (document.visibilityState !== 'visible') return
      if (Date.now() - lastRefresh < VISIBILITY_REFRESH_THRESHOLD_MS) return
      refresh()
    }

    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])
}
