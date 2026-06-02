import type { SVGProps } from 'react'

export function PawnIcon({ size = 24, className, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="7" r="3" />
      <path d="M9.5 10.5c-.83 1.08-1.5 2.3-1.5 4 0 .55.45 1 1 1h6c.55 0 1-.45 1-1 0-1.7-.67-2.92-1.5-4H9.5z" />
      <rect x="8" y="16" width="8" height="1.5" rx="0.75" />
      <rect x="6.5" y="18" width="11" height="1.5" rx="0.75" />
    </svg>
  )
}
