import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { GameLibrary } from '@/lib/components/analysis/GameLibrary'
import type { AnalysisGame } from '@/lib/models/analysis'

const PAGE_SIZE = 20

interface GamesResponse {
  games: AnalysisGame[]
  total: number
  page: number
  page_size: number
}

async function getGames(token: string): Promise<GamesResponse | null> {
  try {
    const res = await fetch(
      `${process.env.ANALYSIS_SERVICE_URL}/games?page=1&page_size=${PAGE_SIZE}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }
    )
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function AnalysisPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  if (!token) redirect(ROUTES.login)

  const result = await getGames(token)

  return (
    <GameLibrary
      initialGames={result?.games ?? []}
      initialTotal={result?.total ?? 0}
      pageSize={PAGE_SIZE}
    />
  )
}
