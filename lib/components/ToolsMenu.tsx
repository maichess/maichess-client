'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Swords, ListVideo, Search } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import type { ReactNode } from 'react'

const ITEMS: { href: string; label: string; icon: ReactNode }[] = [
  { href: ROUTES.arenaList, label: 'Bot Arena', icon: <Swords size={14} /> },
  { href: ROUTES.gamesDev, label: 'All games history', icon: <ListVideo size={14} /> },
  { href: ROUTES.searchDev, label: 'Search', icon: <Search size={14} /> },
]

// The Tools nav entry: a button that opens a dropdown of the tools sections. Closes on
// outside click, Escape, or navigation. Mirrors the ThemeSelector dropdown pattern.
export function ToolsMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  const active = pathname.startsWith(ROUTES.tools)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={[
          'flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition-colors cursor-pointer',
          active || open
            ? 'bg-bg-elevated text-text-primary'
            : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary',
        ].join(' ')}
      >
        Tools
        <span className="text-text-muted text-[10px]">▾</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full mt-1 z-50 min-w-[12rem] rounded-lg border border-border bg-bg-elevated shadow-lg py-1"
        >
          {ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={[
                  'flex w-full items-center gap-2 px-3 py-1.5 text-sm transition-colors',
                  isActive
                    ? 'text-accent bg-accent/10'
                    : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary',
                ].join(' ')}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
