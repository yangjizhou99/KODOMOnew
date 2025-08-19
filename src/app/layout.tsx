import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Kodomo 2.0',
  description: 'Menu & QR Ordering & Membership',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>
        <Suspense fallback={<div className="h-14 border-b"></div>}>
          <Navbar />
        </Suspense>
        <main className="container py-8">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
