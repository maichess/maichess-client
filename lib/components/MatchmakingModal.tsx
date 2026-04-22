'use client'

import { Spinner } from './ui/Spinner'
import { Button } from './ui/Button'

interface MatchmakingModalProps {
  isOpen: boolean
  onCancel: () => void
}

export function MatchmakingModal({ isOpen, onCancel }: MatchmakingModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-bg-secondary p-8 shadow-2xl w-80">
        <Spinner size="lg" />
        <div className="text-center">
          <p className="text-lg font-semibold text-text-primary">Finding opponent…</p>
          <p className="mt-1 text-sm text-text-muted">This may take a moment</p>
        </div>
        <Button variant="secondary" onClick={onCancel} className="w-full">
          Cancel
        </Button>
      </div>
    </div>
  )
}
