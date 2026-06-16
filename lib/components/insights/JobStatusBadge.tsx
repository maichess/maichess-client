import type { JobStatus } from '@/lib/models/insights'

const STYLES: Record<JobStatus, string> = {
  pending: 'border-border text-text-muted',
  running: 'border-accent/50 text-accent',
  succeeded: 'border-emerald-400/50 text-emerald-400',
  failed: 'border-danger/50 text-danger',
}

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
        STYLES[status] ?? STYLES.pending
      }`}
    >
      {status}
    </span>
  )
}
