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
