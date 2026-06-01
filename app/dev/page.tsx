import { requireDevUser } from '@/lib/utils/serverUser'

export default async function DevPage() {
  await requireDevUser()

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-text-primary">Dev tools</h1>
      <p className="text-sm text-text-muted">
        Developer tooling will appear here.
      </p>
    </div>
  )
}
