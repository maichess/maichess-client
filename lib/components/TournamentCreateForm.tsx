'use client'

import { useState } from 'react'
import { useTournamentBots } from '@/lib/hooks/useTournamentBots'
import { useTournamentOpenings } from '@/lib/hooks/useTournamentOpenings'
import { Button } from '@/lib/components/ui/Button'

interface Props {
  onCreated: () => void
}

const FORMATS = [
  { value: 'swiss', label: 'Swiss' },
  { value: 'singleElimination', label: 'Single Elimination' },
  { value: 'doubleElimination', label: 'Double Elimination' },
  { value: 'groupStage', label: 'Group Stage' },
  { value: 'league', label: 'League' },
  { value: 'randomKnockout', label: 'Random Knockout' },
]

// Sentinel values for the start-position selector that aren't opening keys.
const START_STANDARD = 'standard'
const START_CUSTOM = '__custom__'

const inputClass =
  'w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none'

export function TournamentCreateForm({ onCreated }: Props) {
  const { bots, loading: botsLoading } = useTournamentBots()
  const { openings, register: registerOpening } = useTournamentOpenings()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [showAddOpening, setShowAddOpening] = useState(false)
  const [newOpeningName, setNewOpeningName] = useState('')
  const [newOpeningFen, setNewOpeningFen] = useState('')
  const [openingBusy, setOpeningBusy] = useState(false)
  const [openingError, setOpeningError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [nbRounds, setNbRounds] = useState(5)
  const [clockLimit, setClockLimit] = useState(300)
  const [clockIncrement, setClockIncrement] = useState(3)
  const [format, setFormat] = useState('swiss')
  const [rated, setRated] = useState(true)
  const [matchesPerPairing, setMatchesPerPairing] = useState(1)
  const [groupSize, setGroupSize] = useState(4)
  const [maxConcurrentGames, setMaxConcurrentGames] = useState('')
  const [startChoice, setStartChoice] = useState(START_STANDARD)
  const [customFen, setCustomFen] = useState('')
  const [thematic, setThematic] = useState(false)
  const [selectedOpenings, setSelectedOpenings] = useState<string[]>([])
  const [botId, setBotId] = useState('')

  const isGroupStage = format === 'groupStage'
  const isCustomStart = startChoice === START_CUSTOM

  function toggleOpening(key: string, checked: boolean) {
    setSelectedOpenings((prev) =>
      checked ? [...prev, key] : prev.filter((k) => k !== key))
  }

  async function handleRegisterOpening() {
    setOpeningBusy(true)
    setOpeningError(null)
    try {
      const opening = await registerOpening(newOpeningName.trim(), newOpeningFen.trim())
      // Preselect the freshly registered opening for convenience.
      if (thematic) {
        setSelectedOpenings((prev) => [...prev, opening.key])
      } else {
        setStartChoice(opening.key)
      }
      setNewOpeningName('')
      setNewOpeningFen('')
      setShowAddOpening(false)
    } catch (err) {
      setOpeningError(err instanceof Error ? err.message : 'Failed to register opening')
    } finally {
      setOpeningBusy(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const body: Record<string, string | number | boolean> = {
        name,
        nbRounds,
        clockLimit,
        clockIncrement,
        format,
        rated,
        matchesPerPairing,
      }

      if (isGroupStage) body.groupSize = groupSize

      if (thematic && selectedOpenings.length > 0) {
        // Thematic book: each pairing plays every selected opening with both
        // colours. The server derives matchesPerPairing (2 * openings).
        body.openings = selectedOpenings.join(',')
      } else if (startChoice === START_CUSTOM) {
        if (customFen.trim()) body.startPosition = customFen.trim()
      } else if (startChoice !== START_STANDARD) {
        body.opening = startChoice
      }

      const maxConcurrent = Number(maxConcurrentGames)
      if (maxConcurrentGames.trim() && maxConcurrent >= 1) {
        body.maxConcurrentGames = maxConcurrent
      }

      const createRes = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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

        <div>
          <label className="mb-1 block text-xs text-text-muted">Games per pairing</label>
          <input
            type="number"
            className={inputClass}
            value={matchesPerPairing}
            onChange={(e) => setMatchesPerPairing(Number(e.target.value))}
            min={1}
            placeholder="1"
          />
        </div>

        {isGroupStage && (
          <div>
            <label className="mb-1 block text-xs text-text-muted">Group size</label>
            <input
              type="number"
              className={inputClass}
              value={groupSize}
              onChange={(e) => setGroupSize(Number(e.target.value))}
              min={2}
              placeholder="4"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs text-text-muted">Max concurrent games (optional)</label>
          <input
            type="number"
            className={inputClass}
            value={maxConcurrentGames}
            onChange={(e) => setMaxConcurrentGames(e.target.value)}
            min={1}
            placeholder="Unlimited"
          />
        </div>

        <div className="sm:col-span-2 space-y-2">
          <div className="flex items-center gap-2">
            <input
              id="thematic"
              type="checkbox"
              checked={thematic}
              onChange={(e) => setThematic(e.target.checked)}
              className="h-4 w-4 rounded border-border bg-bg-elevated accent-accent"
            />
            <label htmlFor="thematic" className="text-xs text-text-muted">
              Thematic opening book — each pairing plays every selected opening with both colours
            </label>
          </div>

          {thematic ? (
            <div className="rounded-lg border border-border bg-bg-elevated p-3">
              {openings.length === 0 ? (
                <p className="text-xs text-text-muted">No openings available.</p>
              ) : (
                <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                  {openings.map((o) => (
                    <label key={o.key} className="flex items-center gap-2 text-sm text-text-primary">
                      <input
                        type="checkbox"
                        checked={selectedOpenings.includes(o.key)}
                        onChange={(e) => toggleOpening(o.key, e.target.checked)}
                        className="h-4 w-4 rounded border-border bg-bg-elevated accent-accent"
                      />
                      {o.name}
                    </label>
                  ))}
                </div>
              )}
              <p className="mt-2 text-[10px] text-text-muted">
                {selectedOpenings.length > 0
                  ? `${selectedOpenings.length} opening${selectedOpenings.length === 1 ? '' : 's'} → ${selectedOpenings.length * 2} games per pairing`
                  : 'Select at least one opening.'}
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="mb-1 block text-xs text-text-muted">Start position</label>
                <select className={inputClass} value={startChoice} onChange={(e) => setStartChoice(e.target.value)}>
                  <option value={START_STANDARD}>Standard</option>
                  {openings.map((o) => (
                    <option key={o.key} value={o.key}>{o.name}</option>
                  ))}
                  <option value={START_CUSTOM}>Custom FEN…</option>
                </select>
              </div>

              {isCustomStart && (
                <div>
                  <label className="mb-1 block text-xs text-text-muted">Custom starting FEN</label>
                  <input
                    className={inputClass}
                    value={customFen}
                    onChange={(e) => setCustomFen(e.target.value)}
                    placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                  />
                </div>
              )}
            </>
          )}

          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAddOpening((v) => !v)}
              className="text-[11px] text-text-muted hover:text-accent transition-colors"
            >
              {showAddOpening ? '− Cancel custom opening' : '+ Register a custom opening'}
            </button>

            {showAddOpening && (
              <div className="mt-2 space-y-2 rounded-lg border border-border bg-bg-elevated p-3">
                {openingError && (
                  <div className="rounded-lg border border-danger/40 bg-danger/10 px-2 py-1 text-[11px] text-danger">
                    {openingError}
                  </div>
                )}
                <input
                  className={inputClass}
                  value={newOpeningName}
                  onChange={(e) => setNewOpeningName(e.target.value)}
                  placeholder="Opening name (e.g. London System)"
                />
                <input
                  className={inputClass}
                  value={newOpeningFen}
                  onChange={(e) => setNewOpeningFen(e.target.value)}
                  placeholder="FEN — rnbqkbnr/ppp1pppp/8/3p4/3P1B2/8/PPP1PPPP/RN1QKBNR b KQkq - 2 2"
                />
                <Button
                  type="button"
                  size="sm"
                  loading={openingBusy}
                  disabled={!newOpeningName.trim() || !newOpeningFen.trim()}
                  onClick={handleRegisterOpening}
                >
                  Save opening
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:col-span-2">
          <input
            id="rated"
            type="checkbox"
            checked={rated}
            onChange={(e) => setRated(e.target.checked)}
            className="h-4 w-4 rounded border-border bg-bg-elevated accent-accent"
          />
          <label htmlFor="rated" className="text-xs text-text-muted">Rated</label>
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
