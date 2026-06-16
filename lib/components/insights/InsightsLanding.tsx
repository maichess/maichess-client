'use client'

import { useInsightsJobs } from '@/lib/hooks/useInsightsJobs'
import { useCorpora } from '@/lib/hooks/useCorpora'
import { IngestionForm } from '@/lib/components/insights/IngestionForm'
import { JobsTable } from '@/lib/components/insights/JobsTable'
import { CorporaList } from '@/lib/components/insights/CorporaList'
import type { CorpusFilter } from '@/lib/models/insights'

// The Insights landing: launch ingestions (Lichess month / PGN upload), watch job status,
// and pick a corpus to explore. A single jobs hook owns submission + polling so a launched
// job and a finished corpus both appear without a manual refresh.
export function InsightsLanding() {
  const {
    jobs,
    loading: jobsLoading,
    error: jobsError,
    submitting,
    submitError,
    refresh: refreshJobs,
    submitIngestion,
    submitAnalysis,
    uploadAndIngest,
  } = useInsightsJobs()
  const { corpora, loading: corporaLoading, error: corporaError, refresh: refreshCorpora } = useCorpora()

  const ingestMonth = (yearMonth: string, filter: CorpusFilter) =>
    submitIngestion({ lichess_month: { year_month: yearMonth }, filter })

  const upload = (file: File, label: string, filter: CorpusFilter) =>
    uploadAndIngest(file, label, filter)

  // Run all metric kinds, then refresh the corpus catalog once the analysis lands.
  const analyze = async (corpusId: string) => {
    await submitAnalysis({ corpus_id: corpusId })
    await refreshCorpora()
  }

  return (
    <div className="space-y-6">
      <IngestionForm
        onSubmitMonth={ingestMonth}
        onUpload={upload}
        submitting={submitting}
        error={submitError}
      />
      <JobsTable jobs={jobs} loading={jobsLoading} error={jobsError} onRefresh={refreshJobs} />
      <CorporaList
        corpora={corpora}
        loading={corporaLoading}
        error={corporaError}
        onAnalyze={analyze}
        analyzing={submitting}
      />
    </div>
  )
}
