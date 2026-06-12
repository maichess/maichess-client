import { requireUser } from '@/lib/utils/serverUser'
import { LichessPlayForm } from '@/lib/components/dev/LichessPlayForm'

export default async function LichessPlayPage() {
  await requireUser()

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-text-primary">Play on Lichess</h1>
      <p className="text-sm text-text-muted mb-8">
        Point a maichess bot at a Lichess game. Challenge the Lichess AI or another user/bot, or
        attach to an existing game id — the engine drives our moves and the game is mirrored into
        Watch and Past Matches as a read-only, unrated external match.
      </p>
      <LichessPlayForm />
    </div>
  )
}
