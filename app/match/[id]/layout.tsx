import { Nav } from '@/lib/components/Nav'

export default function MatchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  )
}
