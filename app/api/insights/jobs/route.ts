import { insightsGet } from '@/lib/utils/insightsProxy'

export async function GET(req: Request) {
  return insightsGet(req, '/insights/jobs')
}
