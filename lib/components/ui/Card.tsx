import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean
}

export function Card({ elevated = false, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={[
        'rounded-2xl border border-border',
        elevated ? 'bg-bg-elevated' : 'bg-bg-secondary',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}
