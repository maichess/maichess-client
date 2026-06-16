import { insightsGet } from '@/lib/utils/insightsProxy'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return insightsGet(req, `/insights/corpora/${encodeURIComponent(id)}/openings`)
}
