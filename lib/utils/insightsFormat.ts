// Display helpers for the Insights views. Rates arrive as fractions in [0,1]; counts can
// reach the tens of millions on a full Lichess month, so they are abbreviated.

export function pct(fraction: number): string {
  return `${Math.round((fraction ?? 0) * 100)}%`
}

export function pct1(fraction: number): string {
  return `${((fraction ?? 0) * 100).toFixed(1)}%`
}

export function formatCount(n: number): string {
  if (n == null) return '0'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`
  return n.toLocaleString()
}

export function formatSeconds(ms: number): string {
  return `${((ms ?? 0) / 1000).toFixed(1)}s`
}

export function formatMonth(ms: number): string {
  if (!ms) return '—'
  return new Date(ms).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
