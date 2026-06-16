import { insightsPostForm } from '@/lib/utils/insightsProxy'

export async function POST(req: Request) {
  return insightsPostForm(req, '/insights/uploads')
}
