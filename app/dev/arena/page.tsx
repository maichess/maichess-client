import { requireDevUser } from '@/lib/utils/serverUser'
import { ArenaCollectionList } from '@/lib/components/dev/ArenaCollectionList'

export default async function ArenaListPage() {
  await requireDevUser()

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-text-primary">Arena collections</h1>
      <p className="text-sm text-text-muted mb-8">
        Browse running and finished bot arena setups.
      </p>
      <ArenaCollectionList />
    </div>
  )
}
