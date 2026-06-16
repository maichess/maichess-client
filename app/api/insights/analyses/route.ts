import { insightsPostJson } from '@/lib/utils/insightsProxy'

export async function POST(req: Request) {
  return insightsPostJson(req, '/insights/analyses')
}
