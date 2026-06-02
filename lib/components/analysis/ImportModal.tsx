'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import { Button } from '@/lib/components/ui/Button'

type Tab = 'pgn' | 'fen' | 'match'

interface ImportModalProps {
  onClose: () => void
}

export function ImportModal({ onClose }: ImportModalProps) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('pgn')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleImport() {
    if (!input.trim()) return
    setLoading(true)
    setError(null)

    try {
      let res: Response
      if (tab === 'pgn') {
        res = await fetch('/api/games', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pgn: input.trim() }),
        })
      } else if (tab === 'fen') {
        res = await fetch('/api/games/from-fen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fen: input.trim() }),
        })
      } else {
        res = await fetch(`/api/games/from-match/${input.trim()}`, { method: 'POST' })
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? `Import failed (${res.status}).`)
        return
      }

      const game = await res.json()
      router.push(ROUTES.analysisGame(game.id))
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const tabs: Array<{ id: Tab; label: string; placeholder: string }> = [
    { id: 'pgn', label: 'PGN', placeholder: 'Paste PGN here…' },
    { id: 'fen', label: 'FEN', placeholder: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' },
    { id: 'match', label: 'From Match', placeholder: 'Match ID (UUID)' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-bg-secondary shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-text-primary">Import Game</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 rounded-lg bg-bg-elevated p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setInput(''); setError(null) }}
                className={[
                  'flex-1 rounded-md py-1.5 text-sm font-medium transition-colors',
                  tab === t.id
                    ? 'bg-bg-secondary text-text-primary shadow-sm'
                    : 'text-text-muted hover:text-text-primary',
                ].join(' ')}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Input */}
          {tab === 'pgn' ? (
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={tabs.find((t) => t.id === tab)!.placeholder}
              rows={8}
              className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent resize-none"
            />
          ) : (
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={tabs.find((t) => t.id === tab)!.placeholder}
              className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
            />
          )}

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button
            onClick={handleImport}
            loading={loading}
            disabled={!input.trim()}
            className="w-full"
          >
            Import & Analyse
          </Button>
        </div>
      </div>
    </div>
  )
}
