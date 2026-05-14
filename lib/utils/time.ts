import type { TimeFormat } from '@/lib/models/match'

/**
 * Converts milliseconds to a clock string: "5:32" or "0:04"
 */
export function msToClockString(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Returns true if the time is critically low (under 10 seconds)
 */
export function isCriticalTime(ms: number): boolean {
  return ms < 10_000
}

/**
 * Renders the chess-standard `base+increment` label, e.g. "5+0", "3+2".
 * Falls back to the format id when increment data is missing.
 */
export function formatTimeFormatLabel(tf: TimeFormat): string {
  if (tf.id && tf.id.includes('+')) return tf.id
  const baseMin = Math.floor(tf.base_ms / 60_000)
  const incSec = Math.floor(tf.increment_ms / 1_000)
  return `${baseMin}+${incSec}`
}

/**
 * Renders the duration in human-readable form: "5 min + 0s" or "1 min + 1s".
 */
export function formatTimeFormatDuration(tf: TimeFormat): string {
  const baseMin = Math.round(tf.base_ms / 60_000)
  const incSec = Math.round(tf.increment_ms / 1_000)
  const baseLabel = baseMin === 1 ? '1 min' : `${baseMin} min`
  return `${baseLabel} + ${incSec}s`
}
