import { requireDevUser } from '@/lib/utils/serverUser'
import { SearchPanel } from '@/lib/components/dev/SearchPanel'

export default async function SearchPage() {
  await requireDevUser()

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-text-primary">Search</h1>
      <p className="text-sm text-text-muted mb-8">
        Faceted search over your games and matches, plus FEN position lookup. Backed by the
        Elasticsearch read model (maichess-search-service); results link back to the owning service.
      </p>
      <SearchPanel />
    </div>
  )
}
