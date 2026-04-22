import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-text-secondary"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={[
          'h-10 w-full rounded-lg border px-3 text-sm',
          'bg-bg-elevated text-text-primary placeholder:text-text-muted',
          'border-border focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent',
          'transition-colors duration-150',
          error ? 'border-danger focus:border-danger focus:ring-danger' : '',
          className,
        ].join(' ')}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
