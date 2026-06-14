import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { AnalysisClient } from '@/lib/components/AnalysisClient'
import type { AnalysisConfig, AnalysisGameDetail } from '@/lib/models/analysis'

async function getGame(id: string, token: string): Promise<AnalysisGameDetail | null> {
  try {
    const res = await fetch(`${process.env.ANALYSIS_SERVICE_URL}/games/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

async function getConfig(token: string): Promise<AnalysisConfig | null> {
  try {
    const res = await fetch(`${process.env.ANALYSIS_SERVICE_URL}/analysis/config`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function AnalysisGamePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ analysis?: string }>
}) {
  const { id } = await params
  const { analysis } = await searchParams
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  if (!token) redirect(ROUTES.login)

  const [game, config] = await Promise.all([getGame(id, token), getConfig(token)])

  if (!game || !config) redirect(ROUTES.analysis)

  // Result lists deep-link with `?analysis=off` to open the read-only viewer.
  return <AnalysisClient game={game} config={config} analysisEnabled={analysis !== 'off'} />
}
