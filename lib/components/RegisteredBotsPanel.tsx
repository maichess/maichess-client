'use client'

import { useState } from 'react'
import { useRegisteredBots } from '@/lib/hooks/useRegisteredBots'
import { useTournamentBots } from '@/lib/hooks/useTournamentBots'
import { Button } from '@/lib/components/ui/Button'

const inputClass =
  'rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none'

// Manages maichess bots permanently registered in the tournament server's bot
// registry, so they can be reused across tournaments (and added by id alone).
export function RegisteredBotsPanel() {
  const { bots: registered, loading, register, remove } = useRegisteredBots()
  const { bots: maichessBots } = useTournamentBots()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const registeredMaichessIds = new Set(
    registered.map((b) => b.maichess_bot_id).filter(Boolean),
  )
  const available = maichessBots.filter((b) => !registeredMaichessIds.has(b.id))

  async function run(action: () => Promise<void>) {
    setBusy(true)
    setError(null)
    try {
      await action()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-text-muted hover:text-accent transition-colors"
      >
        Registered bots ({registered.length}) {open ? '▴' : '▾'}
      </button>

      {open && (
        <div className="rounded-xl border border-border bg-bg-secondary p-3 space-y-3">
          <p className="text-[10px] text-text-muted">
            Bots registered here are stored permanently on the tournament server and can be
            reused across tournaments.
          </p>

          {error && (
            <div className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-xs text-text-muted">Loading…</p>
          ) : registered.length === 0 ? (
            <p className="text-xs text-text-muted">No bots registered yet.</p>
          ) : (
            <ul className="space-y-1">
              {registered.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between rounded-lg bg-bg-elevated px-3 py-2"
                >
                  <span className="text-sm text-text-primary font-medium">
                    {b.name}
                    {!b.maichess_bot_id && (
                      <span className="ml-2 text-[10px] text-text-muted">(external)</span>
                    )}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    loading={busy}
                    onClick={() => run(() => remove(b.id))}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}

          {available.length > 0 && (
            <div className="flex items-center gap-2 pt-1">
              <select
                className={inputClass}
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
              >
                <option value="">Select a bot to register…</option>
                {available.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.elo})
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                disabled={!selected}
                loading={busy}
                onClick={() =>
                  run(async () => {
                    await register(selected)
                    setSelected('')
                  })
                }
              >
                Register
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
