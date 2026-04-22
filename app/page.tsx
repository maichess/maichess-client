import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'

// proxy.ts handles unauthenticated redirect to /login.
// Authenticated users landing at / go to dashboard.
export default function Home() {
  redirect(ROUTES.dashboard)
}
