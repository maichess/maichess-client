'use client'

import { useState } from 'react'
import { useTournamentBots } from '@/lib/hooks/useTournamentBots'
import { Button } from '@/lib/components/ui/Button'

interface Props {
  onCreated: () => void
}

const FORMATS = [
  { value: 'swiss', label: 'Swiss' },
  { value: 'singleElimination', label: 'Single Elimination' },
  { value: 'doubleElimination', label: 'Double Elimination' },
  { value: 'league', label: 'League' },
]

const inputClass =
  'w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none'

export function TournamentCreateForm({ onCreated }: Props) {
  const { bots, loading: botsLoading } = useTournamentBots()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [nbRounds, setNbRounds] = useState(5)
  const [clockLimit, setClockLimit] = useState(300)
  const [clockIncrement, setClockIncrement] = useState(3)
  const [format, setFormat] = useState('swiss')
  const [botId, setBotId] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const createRes = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, nbRounds, clockLimit, clockIncrement, format }),
      })

      if (!createRes.ok) {
        throw new Error(`Failed to create tournament (${createRes.status})`)
      }

      const created = await createRes.json() as { registration_id: string; tournament: { id: string } }

      if (botId) {
        const regRes = await fetch(`/api/tournaments/${created.tournament.id}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bot_id: botId }),
        })
        if (!regRes.ok) {
          throw new Error(`Tournament created but bot registration failed (${regRes.status})`)
        }
      }

      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-bg-secondary p-4 space-y-4">
      <h3 className="text-sm font-semibold text-text-primary">New Tournament</h3>

      {error && (
        <div className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-text-muted">Name</label>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Friday Night Bots"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-text-muted">Format</label>
          <select className={inputClass} value={format} onChange={(e) => setFormat(e.target.value)}>
            {FORMATS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-text-muted">Rounds</label>
          <input
            type="number"
            className={inputClass}
            value={nbRounds}
            onChange={(e) => setNbRounds(Number(e.target.value))}
            min={1}
            max={20}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-text-muted">Clock (seconds + increment)</label>
          <div className="flex gap-2">
            <input
              type="number"
              className={inputClass}
              value={clockLimit}
              onChange={(e) => setClockLimit(Number(e.target.value))}
              min={30}
              placeholder="300"
              required
            />
            <input
              type="number"
              className={inputClass}
              value={clockIncrement}
              onChange={(e) => setClockIncrement(Number(e.target.value))}
              min={0}
              placeholder="3"
              required
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-text-muted">Register Bot (optional)</label>
          <select
            className={inputClass}
            value={botId}
            onChange={(e) => setBotId(e.target.value)}
            disabled={botsLoading}
          >
            <option value="">None — register later</option>
            {bots.map((b) => (
              <option key={b.id} value={b.id}>{b.name} ({b.elo})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={submitting} disabled={!name}>
          Create
        </Button>
      </div>
    </form>
  )
}
