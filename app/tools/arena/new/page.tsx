import { requireUser } from '@/lib/utils/serverUser'
import { SpawnSetupForm } from '@/lib/components/dev/SpawnSetupForm'

export default async function ArenaNewPage() {
  await requireUser()

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-text-primary">Spawn setup</h1>
      <p className="text-sm text-text-muted mb-8">
        Create a new bot arena collection.
      </p>
      <SpawnSetupForm />
    </div>
  )
}
