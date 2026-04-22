export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 animate-pulse">
      <div className="h-9 w-32 rounded-lg bg-bg-elevated mb-8" />
      <div className="rounded-2xl border border-border bg-bg-secondary p-6 mb-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className="h-9 w-16 rounded bg-bg-elevated" />
              <div className="mt-1 h-3 w-10 rounded bg-bg-elevated" />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-bg-secondary p-6">
        <div className="h-10 w-full rounded-lg bg-bg-elevated" />
      </div>
    </div>
  )
}
