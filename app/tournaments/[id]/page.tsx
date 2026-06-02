import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants/routes'
import { TournamentDetail } from '@/lib/components/TournamentDetail'

type Props = {
  params: Promise<{ id: string }>
}

export default async function TournamentPage({ params }: Props) {
  const cookieStore = await cookies()
  if (!cookieStore.has('access_token')) redirect(ROUTES.login)

  const { id } = await params

  return (
    <div className="mx-auto max-w-4xl w-full px-4 py-10">
      <Link href={ROUTES.tournaments} className="mb-4 inline-block text-sm text-text-muted hover:text-accent">
        ← Back to Tournaments
      </Link>
      <TournamentDetail id={id} />
    </div>
  )
}
