'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from './ui/Button'

interface ExportGamePanelProps {
  pgn: string
  fen: string
}

type Modal = { title: string; value: string } | null

export function ExportGamePanel({ pgn, fen }: ExportGamePanelProps) {
  const [modal, setModal] = useState<Modal>(null)
  const [copied, setCopied] = useState(false)

  function copy() {
    if (!modal) return
    navigator.clipboard
      .writeText(modal.value)
      .then(() => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1500)
      })
      .catch(() => {})
  }

  function close() {
    setModal(null)
    setCopied(false)
  }

  return (
    <>
      <div className="flex gap-2 rounded-xl border border-border bg-bg-secondary p-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => setModal({ title: 'PGN', value: pgn })}
        >
          Export PGN
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => setModal({ title: 'FEN', value: fen })}
        >
          Export FEN
        </Button>
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={close}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-border bg-bg-secondary shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold text-text-primary">{modal.title}</h2>
              <button
                onClick={close}
                className="text-text-muted hover:text-text-primary transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <textarea
                readOnly
                value={modal.value}
                rows={modal.title === 'FEN' ? 3 : 10}
                className="w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm font-mono text-text-primary resize-none focus:outline-none"
              />
              <Button variant="secondary" className="w-full" onClick={copy}>
                {copied ? 'Copied!' : 'Copy to clipboard'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
