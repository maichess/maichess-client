export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  play: '/play',
  match: (id: string) => `/match/${id}`,
  profile: '/profile',
} as const
