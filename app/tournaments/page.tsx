import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { TournamentList } from '@/lib/components/TournamentList'

export default async function TournamentsPage() {
  const cookieStore = await cookies()
  if (!cookieStore.has('access_token')) redirect(ROUTES.login)

  return (
    <div className="mx-auto max-w-4xl w-full px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-text-primary">Tournaments</h1>
      <TournamentList />
    </div>
  )
}
