export function GlobeSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: '#0a0a16' }}>
      <div
        className="size-16 rounded-full border-2 animate-spin"
        style={{ borderColor: 'rgba(91,141,217,0.3)', borderTopColor: '#5b8dd9' }}
      />
    </div>
  )
}
