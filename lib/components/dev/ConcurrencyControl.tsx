'use client'

import { useState } from 'react'
import { useArenaConfig } from '@/lib/hooks/useArenaConfig'
import { Button } from '@/lib/components/ui/Button'
import { Spinner } from '@/lib/components/ui/Spinner'

export function ConcurrencyControl() {
  const { limit, loading, saving, error, updateLimit } = useArenaConfig()
  const [draft, setDraft] = useState<number | null>(null)

  const displayValue = draft ?? limit

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseInt(e.target.value, 10)
    if (!isNaN(v) && v >= 1) setDraft(v)
  }

  async function handleSave() {
    if (draft !== null && draft !== limit) {
      await updateLimit(draft)
      setDraft(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2">
        <Spinner size="sm" />
        <span className="text-sm text-text-muted">Loading concurrency limit…</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <label htmlFor="concurrency" className="text-sm text-text-secondary whitespace-nowrap">
          Max concurrent games
        </label>
        <input
          id="concurrency"
          type="number"
          min={1}
          value={displayValue}
          onChange={handleChange}
          className="h-8 w-20 rounded-md border border-border bg-bg-elevated px-2 text-sm text-text-primary text-center tabular-nums focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        {draft !== null && draft !== limit && (
          <Button size="sm" onClick={handleSave} loading={saving}>
            Save
          </Button>
        )}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      <p className="text-[11px] text-text-muted">
        Global limit shared by all users. The scheduler respects this cap when launching new arena games.
      </p>
    </div>
  )
}
