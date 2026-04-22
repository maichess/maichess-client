export const THEMES = ['light', 'dark', 'forest', 'ocean', 'midnight'] as const
export type Theme = (typeof THEMES)[number]
export const DEFAULT_THEME: Theme = 'dark'
