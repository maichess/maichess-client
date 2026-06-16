import Link from 'next/link'
import { Swords, ListVideo, Search, Globe, BarChart3 } from 'lucide-react'
import { requireUser } from '@/lib/utils/serverUser'
import { ROUTES } from '@/lib/constants/routes'

const TOOLS = [
  {
    href: ROUTES.arenaList,
    title: 'Bot Arena',
    icon: Swords,
    description:
      'Pit bots against each other to see how they stack up — run tournaments, head-to-head matrices, or single match-ups, then compare results and ratings.',
  },
  {
    href: ROUTES.gamesDev,
    title: 'All games history',
    icon: ListVideo,
    description:
      'A global, chronological feed of every game played on the platform, filterable by player and by who started it.',
  },
  {
    href: ROUTES.searchDev,
    title: 'Search',
    icon: Search,
    description:
      'Find your games and matches by player, bot, or opening (partial matches work), or look up every game that reached a given FEN position.',
  },
  {
    href: ROUTES.insights,
    title: 'Insights',
    icon: BarChart3,
    description:
      'Analyze massive historical corpora (Lichess monthly dumps or your own PGN uploads) with Spark, then explore top openings, common endgames and positions, and the tricky spots where players blunder under pressure.',
  },
  {
    href: ROUTES.lichessPlay,
    title: 'Play on Lichess',
    icon: Globe,
    description:
      'Send a maichess bot to play a Lichess game (the AI, another user/bot, or an existing game) — the engine drives our moves and the game is mirrored here as an external match.',
  },
]

export default async function ToolsPage() {
  await requireUser()

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-text-primary">Tools</h1>
      <p className="text-sm text-text-muted mb-8">
        Power tools for exploring play on maichess: benchmark bots against each other in the
        Bot Arena, browse the global game history, and search games, matches, and positions.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {TOOLS.map(({ href, title, icon: Icon, description }) => (
          <Link
            key={href}
            href={href}
            className="rounded-2xl border border-border bg-bg-secondary p-6 hover:border-accent/50 hover:bg-bg-elevated transition-all group"
          >
            <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary group-hover:text-accent transition-colors">
              <Icon size={18} />
              {title}
            </h2>
            <p className="mt-1 text-sm text-text-muted">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
