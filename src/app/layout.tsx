import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'
import { CartProvider } from '@/contexts/CartContext'
import { PersonalizeProvider } from '@/contexts/PersonalizeContext'
import { ContentstackLivePreviewProvider } from '@/components/ContentstackLivePreviewProvider'
import LyticsTracker from '@/components/LyticsTracker'
import PathforaStyleFix from '@/components/PathforaStyleFix'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ 
  subsets: ['latin'], 
  variable: '--font-playfair' 
})

export const metadata: Metadata = {
  title: 'Demolux - Premium Wearable Tech & Technofurniture',
  description: 'Discover the future of luxury with Demolux premium wearable technology and innovative technofurniture. Where cutting-edge design meets exceptional craftsmanship.',
  keywords: ['wearable tech', 'technofurniture', 'luxury accessories', 'premium technology'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-white">
        <CartProvider>
          <PersonalizeProvider>
            <ContentstackLivePreviewProvider>
              {/* LyticsTracker handles SPA route changes for Lytics (via Launch) or GTM */}
              <Suspense fallback={null}>
                <LyticsTracker />
              </Suspense>
              {/* Strip Pathfora inline styles so our CSS can take effect */}
              <PathforaStyleFix />
              {children}
            </ContentstackLivePreviewProvider>
          </PersonalizeProvider>
        </CartProvider>
      </body>
    </html>
  )
}
