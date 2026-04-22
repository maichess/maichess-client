import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { cookies } from 'next/headers'
import type { Theme } from '@/lib/constants/themes'
import { DEFAULT_THEME, THEMES } from '@/lib/constants/themes'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'maichess',
  description: 'Play chess online',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const rawTheme = cookieStore.get('theme')?.value
  const theme: Theme =
    rawTheme && (THEMES as readonly string[]).includes(rawTheme)
      ? (rawTheme as Theme)
      : DEFAULT_THEME

  return (
    <html
      lang="en"
      data-theme={theme}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
