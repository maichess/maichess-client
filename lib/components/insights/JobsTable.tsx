import { JobStatusBadge } from '@/lib/components/insights/JobStatusBadge'
import { Spinner } from '@/lib/components/ui/Spinner'
import { Button } from '@/lib/components/ui/Button'
import { filterLabel, sourceLabel, type InsightsJob } from '@/lib/models/insights'
import { formatMonth } from '@/lib/utils/insightsFormat'

// Shows the most recent ingestion / analysis jobs and their live status. The parent hook
// polls while anything is pending/running, so rows advance to succeeded/failed in place.
export function JobsTable({
  jobs,
  loading,
  error,
  onRefresh,
}: {
  jobs: InsightsJob[]
  loading: boolean
  error: string | null
  onRefresh: () => void
}) {
  return (
    <div className="rounded-2xl border border-border bg-bg-secondary p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Jobs</h2>
        <Button variant="secondary" size="sm" onClick={onRefresh}>
          Refresh
        </Button>
      </div>

      {error && <p className="mb-3 text-sm text-danger">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner size="md" />
        </div>
      ) : jobs.length === 0 ? (
        <p className="py-6 text-center text-sm text-text-muted">
          No jobs yet — launch an ingestion above.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-text-muted">
                <Th>Type</Th>
                <Th>Corpus</Th>
                <Th>Source</Th>
                <Th>Status</Th>
                <Th>Created</Th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-t border-border align-top">
                  <Td className="capitalize text-text-secondary">
                    {job.type}
                    {job.type === 'analysis' && job.analysis_kinds.length > 0 && (
                      <span className="block text-[11px] text-text-muted">
                        {job.analysis_kinds.join(', ')}
                      </span>
                    )}
                  </Td>
                  <Td className="font-mono text-xs text-text-primary">{job.corpus_id || '—'}</Td>
                  <Td className="text-text-secondary">
                    {sourceLabel(job.source)}
                    {filterLabel(job.filter) && (
                      <span className="block text-[11px] text-text-muted">
                        {filterLabel(job.filter)}
                      </span>
                    )}
                  </Td>
                  <Td>
                    <JobStatusBadge status={job.status} />
                    {job.status === 'failed' && job.error && (
                      <span className="mt-1 block max-w-[16rem] truncate text-[11px] text-danger" title={job.error}>
                        {job.error}
                      </span>
                    )}
                  </Td>
                  <Td className="whitespace-nowrap text-text-muted">{formatMonth(job.created_at_ms)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 font-medium">{children}</th>
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2.5 ${className}`}>{children}</td>
}
