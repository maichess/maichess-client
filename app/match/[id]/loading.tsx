export default function MatchLoading() {
  return (
    <div className="flex flex-col min-h-screen animate-pulse">
      <div className="h-14 border-b border-border bg-bg-secondary" />
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col gap-3 w-full max-w-xl px-4">
          <div className="h-16 rounded-xl bg-bg-secondary border border-border" />
          <div className="aspect-square w-full max-w-[min(100%,_560px)] mx-auto rounded-lg bg-bg-secondary" />
          <div className="h-16 rounded-xl bg-bg-secondary border border-border" />
        </div>
      </div>
    </div>
  )
}
