'use client'

import { useTokenRefresh } from '@/lib/hooks/useTokenRefresh'

/**
 * Render-nothing client component that keeps the access_token cookie warm.
 * Mount inside an authenticated layout. See `useTokenRefresh` for cadence.
 */
export function TokenRefresher() {
  useTokenRefresh()
  return null
}
