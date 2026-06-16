import { pct } from '@/lib/utils/insightsFormat'
import type { OpeningTrendPoint } from '@/lib/models/insights'

// A compact month-over-month sparkline: one bar per month, height proportional to that
// month's game count, with the win/draw/loss split in the tooltip.
export function MiniTrend({ trend }: { trend: OpeningTrendPoint[] }) {
  if (!trend || trend.length === 0) return <span className="text-text-muted">—</span>
  const max = Math.max(...trend.map((p) => p.game_count), 1)

  return (
    <div className="flex h-8 items-end gap-0.5">
      {trend.map((p) => (
        <span
          key={p.year_month}
          style={{ height: `${Math.max(8, (p.game_count / max) * 100)}%` }}
          title={`${p.year_month}: White ${pct(p.white_win_rate)} · Draw ${pct(p.draw_rate)} · Black ${pct(p.black_win_rate)}`}
          className="w-1.5 rounded-sm bg-accent/60"
        />
      ))}
    </div>
  )
}
