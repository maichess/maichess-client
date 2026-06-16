import { Button } from '@/lib/components/ui/Button'

// Offset/limit pager for the explorer tables. The query API returns a page array with no
// total, so "Next" is enabled while the page came back full (atEnd === false).
export function Pagination({
  offset,
  pageSize,
  atEnd,
  onChange,
}: {
  offset: number
  pageSize: number
  atEnd: boolean
  onChange: (offset: number) => void
}) {
  if (offset === 0 && atEnd) return null
  const page = Math.floor(offset / pageSize) + 1

  return (
    <div className="flex items-center justify-center gap-3 pt-3">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onChange(Math.max(0, offset - pageSize))}
        disabled={offset === 0}
      >
        ← Prev
      </Button>
      <span className="text-sm text-text-muted">Page {page}</span>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onChange(offset + pageSize)}
        disabled={atEnd}
      >
        Next →
      </Button>
    </div>
  )
}
