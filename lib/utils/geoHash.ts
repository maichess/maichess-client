import type { Player, MatchSummary } from '@/lib/models/match'
import { isUserPlayer, isBotPlayer, playerDisplayName } from '@/lib/models/match'

export interface GlobeArc {
  matchId: string
  startLat: number
  startLng: number
  endLat: number
  endLng: number
  label: string
}

export interface GlobePoint {
  matchId: string
  lat: number
  lng: number
  label: string
  isBot: boolean
}

const BOT_LOCATIONS: Record<string, { lat: number; lng: number }> = {
  stockfish: { lat: 57.15, lng: -2.11 },
  'maia-1100': { lat: 48.86, lng: 2.35 },
  'maia-1500': { lat: 51.51, lng: -0.13 },
  'maia-1900': { lat: 52.37, lng: 4.9 },
  lc0: { lat: 37.77, lng: -122.42 },
  leela: { lat: 37.77, lng: -122.42 },
}

function djb2(s: string): number {
  let hash = 5381
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) + hash + s.charCodeAt(i)) >>> 0
  }
  return hash
}

function hashToLatLng(key: string): { lat: number; lng: number } {
  const h = djb2(key)
  const lat = ((h >>> 16) / 65535) * 150 - 75
  const lng = ((h & 0xffff) / 65535) * 360 - 180
  return { lat, lng }
}

export function playerLatLng(p: Player): { lat: number; lng: number } {
  if (isUserPlayer(p)) {
    return hashToLatLng(p.user_id)
  }
  if (isBotPlayer(p)) {
    const key = p.name.toLowerCase()
    for (const [prefix, loc] of Object.entries(BOT_LOCATIONS)) {
      if (key.startsWith(prefix)) return loc
    }
    return hashToLatLng(p.bot_id)
  }
  return hashToLatLng(p.external_name)
}

export function matchArcs(matches: MatchSummary[]): GlobeArc[] {
  return matches.map((m) => {
    const w = playerLatLng(m.white)
    const b = playerLatLng(m.black)
    return {
      matchId: m.id,
      startLat: w.lat,
      startLng: w.lng,
      endLat: b.lat,
      endLng: b.lng,
      label: `${playerDisplayName(m.white)} vs ${playerDisplayName(m.black)}`,
    }
  })
}

export function matchPoints(matches: MatchSummary[]): GlobePoint[] {
  const points: GlobePoint[] = []
  for (const m of matches) {
    const wPos = playerLatLng(m.white)
    const bPos = playerLatLng(m.black)
    points.push({ matchId: m.id, ...wPos, label: playerDisplayName(m.white), isBot: !isUserPlayer(m.white) })
    points.push({ matchId: m.id, ...bPos, label: playerDisplayName(m.black), isBot: !isUserPlayer(m.black) })
  }
  return points
}
