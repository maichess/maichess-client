import { requireUser } from '@/lib/utils/serverUser'
import { CorpusExplorer } from '@/lib/components/insights/CorpusExplorer'

export default async function CorpusInsightsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser()
  const { id } = await params

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <CorpusExplorer corpusId={decodeURIComponent(id)} />
    </div>
  )
}
