import { requireDevUser } from '@/lib/utils/serverUser'
import { AnticheatPanel } from '@/lib/components/dev/AnticheatPanel'

export default async function AnticheatPage() {
  await requireDevUser()

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-text-primary">Anti-cheat</h1>
      <p className="text-sm text-text-muted mb-8">
        Flagged players and their evidence (engine correlation + pre-move-aware timing), backed by
        maichess-anticheat-service. Removing a flag is audited and lets the player be matched again.
      </p>
      <AnticheatPanel />
    </div>
  )
}
