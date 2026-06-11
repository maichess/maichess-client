'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants/routes'
import { isUserPlayer, playerDisplayName } from '@/lib/models/match'
import { formatTimeFormatLabel } from '@/lib/utils/time'
import { GlobeView } from '@/lib/components/globe/GlobeView'
import type { MatchSummary, TimeFormatCategory } from '@/lib/models/match'

interface Props {
  matches: MatchSummary[]
  total: number
  page: number
  hasMore: boolean
  validCategory: TimeFormatCategory | undefined
  viewerUserId: string | null
}

type View = 'list' | 'globe'

function isViewerParticipant(m: MatchSummary, viewerUserId: string | null): boolean {
  if (!viewerUserId) return false
  return (
    (isUserPlayer(m.white) && m.white.user_id === viewerUserId) ||
    (isUserPlayer(m.black) && m.black.user_id === viewerUserId)
  )
}

function pageQuery(page: number, category: TimeFormatCategory | undefined): string {
  const params = new URLSearchParams({ page: String(page) })
  if (category) params.set('category', category)
  return params.toString()
}

function CategoryFilter({ active, href, label }: { active: boolean; href: string; label: string }) {
  return (
    <Link
      href={href}
      className={[
        'rounded-full border px-3 py-1 text-xs font-medium transition-all',
        active
          ? 'border-accent bg-accent/10 text-accent'
          : 'border-border bg-bg-secondary text-text-muted hover:border-accent/40',
      ].join(' ')}
    >
      {label}
    </Link>
  )
}

export function WatchPageShell({ matches, total, page, hasMore, validCategory, viewerUserId }: Props) {
  const [view, setView] = useState<View>('list')

  return (
    <div className={view === 'globe' ? 'flex-1 flex flex-col w-full' : 'mx-auto max-w-4xl px-4 py-10 w-full'}>
      <div
        className={[
          'flex items-center justify-between',
          view === 'globe' ? 'px-4 pt-6 pb-4' : 'mb-6',
        ].join(' ')}
      >
        <h1 className="text-2xl font-bold text-text-primary">Watch</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-muted">
            {total} ongoing game{total === 1 ? '' : 's'}
          </span>
          <div className="flex items-center gap-0.5 rounded-full border border-border bg-bg-secondary p-0.5">
            <button
              onClick={() => setView('list')}
              className={[
                'rounded-full px-3 py-1 text-xs font-medium transition-all',
                view === 'list' ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary',
              ].join(' ')}
              aria-label="List view"
            >
              ≡ List
            </button>
            <button
              onClick={() => setView('globe')}
              className={[
                'rounded-full px-3 py-1 text-xs font-medium transition-all',
                view === 'globe' ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary',
              ].join(' ')}
              aria-label="Globe view"
            >
              ◎ Globe
            </button>
          </div>
        </div>
      </div>

      {view === 'globe' ? (
        <GlobeView initialMatches={matches} />
      ) : (
        <>
          <div className="mb-4 flex gap-2 overflow-x-auto">
            <CategoryFilter active={validCategory === undefined} href={ROUTES.watch} label="All" />
            {(['bullet', 'blitz', 'rapid', 'classical'] as TimeFormatCategory[]).map((c) => (
              <CategoryFilter
                key={c}
                active={validCategory === c}
                href={`${ROUTES.watch}?category=${c}`}
                label={c[0].toUpperCase() + c.slice(1)}
              />
            ))}
          </div>

          {matches.length === 0 ? (
            <p className="rounded-xl border border-border bg-bg-secondary p-6 text-center text-text-muted">
              No ongoing games right now. Check back in a moment.
            </p>
          ) : (
            <ul className="space-y-2">
              {matches.map((m) => {
                const canResume = isViewerParticipant(m, viewerUserId)
                return (
                <li key={m.id}>
                  <Link
                    href={canResume ? ROUTES.match(m.id) : ROUTES.watchMatch(m.id)}
                    className="flex items-center justify-between rounded-xl border border-border bg-bg-secondary px-4 py-3 transition-all hover:border-accent/50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-text-primary">
                        {playerDisplayName(m.white)}
                        {!isUserPlayer(m.white) && (
                          <span className="ml-1 text-xs text-text-muted">(BOT)</span>
                        )}
                        <span className="mx-2 text-text-muted">vs</span>
                        {playerDisplayName(m.black)}
                        {!isUserPlayer(m.black) && (
                          <span className="ml-1 text-xs text-text-muted">(BOT)</span>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-text-muted">
                        <span>{formatTimeFormatLabel(m.time_format)} · {m.move_count} move{m.move_count === 1 ? '' : 's'}</span>
                        {m.source === 'external' && (
                          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                            {m.external_provider || 'external'}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="ml-3 text-xs font-medium text-accent">
                      {canResume ? 'Resume →' : 'Watch →'}
                    </span>
                  </Link>
                </li>
                )
              })}
            </ul>
          )}

          <div className="mt-6 flex justify-between">
            {page > 1 ? (
              <Link
                href={`${ROUTES.watch}?${pageQuery(page - 1, validCategory)}`}
                className="text-sm text-accent hover:underline"
              >
                ← Previous
              </Link>
            ) : (
              <span />
            )}
            {hasMore && (
              <Link
                href={`${ROUTES.watch}?${pageQuery(page + 1, validCategory)}`}
                className="text-sm text-accent hover:underline"
              >
                Next →
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  )
}
