'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants/routes'
import { useTournaments } from '@/lib/hooks/useTournaments'
import { useTournamentConfig } from '@/lib/hooks/useTournamentConfig'
import { Spinner } from '@/lib/components/ui/Spinner'
import { Button } from '@/lib/components/ui/Button'
import { TournamentCreateForm } from './TournamentCreateForm'
import type { TournamentInfo } from '@/lib/models/tournament'

function formatClock(clock: { limit: number; increment: number }): string {
  const mins = Math.floor(clock.limit / 60)
  return clock.increment > 0 ? `${mins}+${clock.increment}` : `${mins} min`
}

function TournamentCard({ tournament }: { tournament: TournamentInfo }) {
  return (
    <Link
      href={ROUTES.tournament(tournament.id)}
      className="flex items-center justify-between rounded-xl border border-border bg-bg-secondary px-4 py-3 transition-all hover:border-accent/50"
    >
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-text-primary">
          {tournament.fullName}
        </div>
        <div className="mt-0.5 text-xs text-text-muted">
          {formatClock(tournament.clock)} · {tournament.format} · {tournament.nbRounds} rounds · {tournament.nbPlayers} player{tournament.nbPlayers === 1 ? '' : 's'}
        </div>
      </div>
      <span className="ml-3 text-xs text-accent shrink-0">View →</span>
    </Link>
  )
}

function TournamentSection({ title, tournaments, badge }: { title: string; tournaments: TournamentInfo[]; badge?: string }) {
  if (tournaments.length === 0) return null
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider">{title}</h2>
        {badge && (
          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
            {badge}
          </span>
        )}
      </div>
      <ul className="space-y-2">
        {tournaments.map((t) => (
          <li key={t.id}><TournamentCard tournament={t} /></li>
        ))}
      </ul>
    </div>
  )
}

const inputClass =
  'w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none'

function ServerConfig({ onServerChange }: { onServerChange: () => void }) {
  const { config, loading: configLoading, updateConfig } = useTournamentConfig()
  const [showConfig, setShowConfig] = useState(false)
  const [serverInput, setServerInput] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  if (configLoading || !config) return null

  const currentValue = serverInput ?? config.default_server_url
  const isDirty = serverInput !== null && serverInput !== config.default_server_url

  return (
    <div className="space-y-2">
      <button
        onClick={() => {
          setShowConfig(!showConfig)
          setServerInput(null)
          setSaved(false)
        }}
        className="text-xs text-text-muted hover:text-accent transition-colors"
      >
        Server: {config.default_server_url} {showConfig ? '▴' : '▾'}
      </button>

      {showConfig && (
        <div className="rounded-xl border border-border bg-bg-secondary p-3 space-y-2">
          <label className="block text-xs text-text-muted">Tournament Server URL</label>
          <div className="flex gap-2">
            <input
              className={inputClass}
              value={currentValue}
              onChange={(e) => {
                setServerInput(e.target.value)
                setSaved(false)
              }}
              placeholder="https://tournament.example.com"
            />
            <Button
              size="sm"
              variant={saved ? 'secondary' : 'primary'}
              loading={saving}
              disabled={!isDirty}
              onClick={async () => {
                if (!isDirty) return
                setSaving(true)
                try {
                  await updateConfig({ default_server_url: serverInput! })
                  setServerInput(null)
                  setSaved(true)
                  onServerChange()
                } catch {
                  // error handled by hook
                } finally {
                  setSaving(false)
                }
              }}
            >
              {saved ? 'Saved' : 'Save'}
            </Button>
          </div>
          <p className="text-[10px] text-text-muted">
            The URL the bridge uses to reach the tournament server. Change this to connect to a different server.
          </p>
        </div>
      )}
    </div>
  )
}

export function TournamentList() {
  const { data, loading, error, refresh } = useTournaments()
  const [showCreate, setShowCreate] = useState(false)

  const totalCount = data.created.length + data.started.length + data.finished.length

  // ServerConfig stays mounted at all times so the tournament server URL can be
  // edited even while a list fetch against an unreachable URL is still hanging.
  // Only the list area below it reflects the loading/error state.
  return (
    <div className="space-y-6">
      <ServerConfig onServerChange={refresh} />

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">
              {totalCount} tournament{totalCount === 1 ? '' : 's'}
            </span>
            <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
              {showCreate ? 'Cancel' : 'Create Tournament'}
            </Button>
          </div>

          {showCreate && (
            <TournamentCreateForm
              onCreated={() => {
                setShowCreate(false)
                refresh()
              }}
            />
          )}

          <TournamentSection title="In Progress" tournaments={data.started} badge={data.started.length > 0 ? 'LIVE' : undefined} />
          <TournamentSection title="Waiting to Start" tournaments={data.created} />
          <TournamentSection title="Finished" tournaments={data.finished} />

          {totalCount === 0 && (
            <p className="rounded-xl border border-border bg-bg-secondary p-6 text-center text-text-muted">
              No tournaments yet. Create one to get started.
            </p>
          )}
        </>
      )}
    </div>
  )
}
