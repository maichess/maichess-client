'use client'

import { useTheme } from '@/lib/hooks/useTheme'
import type { Theme } from '@/lib/constants/themes'

const themeLabels: Record<Theme, string> = {
  light: '☀ Light',
  dark: '◗ Dark',
  forest: '❧ Forest',
  ocean: '⌁ Ocean',
  midnight: '✦ Midnight',
}

export function ThemeSelector() {
  const { theme, setTheme, themes } = useTheme()

  return (
    <div className="relative">
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value as Theme)}
        className={[
          'h-8 cursor-pointer rounded-lg border border-border bg-bg-elevated px-2 pr-6 text-xs',
          'text-text-secondary appearance-none focus:outline-none focus:ring-1 focus:ring-accent',
          'transition-colors duration-150 hover:border-accent',
        ].join(' ')}
        aria-label="Select theme"
      >
        {themes.map((t) => (
          <option key={t} value={t}>
            {themeLabels[t]}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-text-muted text-[10px]">
        ▾
      </span>
    </div>
  )
}
