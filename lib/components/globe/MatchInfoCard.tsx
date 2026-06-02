import Link from 'next/link'
import { ROUTES } from '@/lib/constants/routes'
import { isUserPlayer, playerDisplayName } from '@/lib/models/match'
import { formatTimeFormatLabel } from '@/lib/utils/time'
import type { MatchSummary } from '@/lib/models/match'

interface Props {
  match: MatchSummary
  onClose: () => void
}

export function MatchInfoCard({ match, onClose }: Props) {
  return (
    <div
      className="absolute bottom-4 right-4 w-72 rounded-xl border p-4 shadow-2xl"
      style={{
        background: 'rgba(22,21,18,0.92)',
        borderColor: 'rgba(91,141,217,0.4)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <button
        onClick={onClose}
        className="absolute right-3 top-3 text-sm leading-none"
        style={{ color: 'rgba(255,255,255,0.4)' }}
        aria-label="Close"
      >
        ×
      </button>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium" style={{ color: '#f0ece4' }}>
          <span className="inline-block size-2 rounded-full" style={{ background: '#f0ece4', flexShrink: 0 }} />
          {playerDisplayName(match.white)}
          {!isUserPlayer(match.white) && (
            <span className="rounded px-1 text-xs" style={{ background: 'rgba(91,141,217,0.2)', color: '#5b8dd9' }}>
              BOT
            </span>
          )}
        </div>

        <div className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
          vs
        </div>

        <div className="flex items-center gap-2 text-sm font-medium" style={{ color: '#1a1714', background: '#f0ece4', padding: '2px 6px', borderRadius: '4px', display: 'inline-flex' }}>
          <span className="inline-block size-2 rounded-full" style={{ background: '#1a1714', flexShrink: 0 }} />
          {playerDisplayName(match.black)}
          {!isUserPlayer(match.black) && (
            <span className="rounded px-1 text-xs" style={{ background: 'rgba(0,0,0,0.15)', color: '#444' }}>
              BOT
            </span>
          )}
        </div>

        <div className="mt-3 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {formatTimeFormatLabel(match.time_format)} · {match.move_count} move{match.move_count === 1 ? '' : 's'}
        </div>

        <Link
          href={ROUTES.watchMatch(match.id)}
          className="mt-2 flex w-full items-center justify-center rounded-lg py-2 text-sm font-medium transition-opacity hover:opacity-80"
          style={{ background: '#2563eb', color: '#fff' }}
        >
          Watch live →
        </Link>
      </div>
    </div>
  )
}
