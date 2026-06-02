'use client'

import { useRef, useState, useEffect } from 'react'
import { Sun, Moon, Leaf, Waves, Sparkles } from 'lucide-react'
import { useTheme } from '@/lib/hooks/useTheme'
import type { Theme } from '@/lib/constants/themes'
import type { ReactNode } from 'react'

const themeConfig: Record<Theme, { label: string; icon: ReactNode }> = {
  light: { label: 'Light', icon: <Sun size={13} /> },
  dark: { label: 'Dark', icon: <Moon size={13} /> },
  forest: { label: 'Forest', icon: <Leaf size={13} /> },
  ocean: { label: 'Ocean', icon: <Waves size={13} /> },
  midnight: { label: 'Midnight', icon: <Sparkles size={13} /> },
}

export function ThemeSelector() {
  const { theme, setTheme, themes } = useTheme()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const current = themeConfig[theme]

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={[
          'flex h-8 items-center gap-1.5 cursor-pointer rounded-lg border border-border bg-bg-elevated px-2 text-xs',
          'text-text-secondary focus:outline-none focus:ring-1 focus:ring-accent',
          'transition-colors duration-150 hover:border-accent',
        ].join(' ')}
        aria-label="Select theme"
        aria-expanded={open}
      >
        {current.icon}
        <span>{current.label}</span>
        <span className="text-text-muted text-[10px]">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[8rem] rounded-lg border border-border bg-bg-elevated shadow-lg py-1">
          {themes.map((t) => {
            const { label, icon } = themeConfig[t]
            return (
              <button
                key={t}
                type="button"
                onClick={() => { setTheme(t); setOpen(false) }}
                className={[
                  'flex w-full items-center gap-2 px-3 py-1.5 text-xs cursor-pointer transition-colors',
                  t === theme
                    ? 'text-accent bg-accent/10'
                    : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary',
                ].join(' ')}
              >
                {icon}
                {label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
