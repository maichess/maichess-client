import { requireUser } from '@/lib/utils/serverUser'
import { AllGamesPanel } from '@/lib/components/dev/AllGamesPanel'

export default async function AllGamesPage() {
  await requireUser()

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-text-primary">All games</h1>
      <p className="text-sm text-text-muted mb-8">
        Every game played on maichess — native human games, arena bot-vs-bot games, and mirrored
        external games — in one chronological feed. Filter by participant, initiator, status, source,
        or date; rows open the match in the viewer. Backed by match-manager&apos;s global match search.
      </p>
      <AllGamesPanel />
    </div>
  )
}
