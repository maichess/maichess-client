'use client'

import { useState } from 'react'
import { DEFAULT_THEME, THEMES, type Theme } from '@/lib/constants/themes'

function getInitialTheme(): Theme {
  if (typeof document === 'undefined') return DEFAULT_THEME
  const attr = document.documentElement.getAttribute('data-theme')
  return attr && (THEMES as readonly string[]).includes(attr)
    ? (attr as Theme)
    : DEFAULT_THEME
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  function setTheme(name: Theme) {
    document.documentElement.setAttribute('data-theme', name)
    document.cookie = `theme=${name}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
    setThemeState(name)
  }

  return { theme, setTheme, themes: THEMES }
}
