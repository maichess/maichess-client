import { requireDevUser } from '@/lib/utils/serverUser'
import { ArenaCollectionDetail } from '@/lib/components/dev/ArenaCollectionDetail'

export default async function ArenaCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireDevUser()
  const { id } = await params

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <ArenaCollectionDetail id={id} />
    </div>
  )
}
