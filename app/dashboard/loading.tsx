export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 animate-pulse">
      <div className="mb-8">
        <div className="h-9 w-72 rounded-lg bg-bg-elevated" />
        <div className="mt-2 h-4 w-32 rounded bg-bg-elevated" />
      </div>
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-bg-secondary p-4">
            <div className="h-8 w-16 rounded bg-bg-elevated" />
            <div className="mt-2 h-3 w-12 rounded bg-bg-elevated" />
          </div>
        ))}
      </div>
    </div>
  )
}
