import { pct } from '@/lib/utils/insightsFormat'

// A single stacked bar showing the White-win / draw / Black-win split for an opening or
// position. Segments are proportional to their fractions; the title gives exact values.
export function WinDrawLossBar({
  white,
  draw,
  black,
}: {
  white: number
  draw: number
  black: number
}) {
  const title = `White ${pct(white)} · Draw ${pct(draw)} · Black ${pct(black)}`
  return (
    <div
      className="flex h-3 w-full overflow-hidden rounded-full bg-bg-elevated"
      title={title}
      aria-label={title}
    >
      <span style={{ width: `${white * 100}%` }} className="bg-emerald-400/80" />
      <span style={{ width: `${draw * 100}%` }} className="bg-text-muted/40" />
      <span style={{ width: `${black * 100}%` }} className="bg-sky-500/80" />
    </div>
  )
}
