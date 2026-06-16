import { requireUser } from '@/lib/utils/serverUser'
import { InsightsLanding } from '@/lib/components/insights/InsightsLanding'

export default async function InsightsPage() {
  await requireUser()

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-text-primary">Insights</h1>
      <p className="mb-8 text-sm text-text-muted">
        Analyze massive historical chess corpora — Lichess monthly dumps or your own PGN uploads —
        with Apache Spark, then explore the most successful openings, common endgames and positions,
        and the &ldquo;tricky&rdquo; positions where players blunder under time pressure.
      </p>
      <InsightsLanding />
    </div>
  )
}
