import { bridgeFetch } from '@/lib/utils/proxyFetch'

export async function GET() {
  return bridgeFetch('/bots')
}
