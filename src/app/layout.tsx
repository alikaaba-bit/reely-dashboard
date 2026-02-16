import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Reely Dashboard - Mission Command Center',
  description: 'Live financial dashboard for Reely Studio',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#020617] min-h-screen">
        {children}
      </body>
    </html>
  )
}
