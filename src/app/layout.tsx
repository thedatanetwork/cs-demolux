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
      <head>
        {/* PostMessage diagnostic: runs BEFORE any React/SDK code */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var t0 = Date.now();
            console.log('[VB-Diag] PostMessage monitor active at', t0);
            window.addEventListener('message', function(e) {
              var elapsed = Date.now() - t0;
              if (e.data && typeof e.data === 'object') {
                var type = e.data.type || e.data.eventName || 'unknown';
                console.log('[VB-Diag] Message at +' + elapsed + 'ms:', type, JSON.stringify(e.data).substring(0, 200));
              }
            });
          })();
        `}} />
      </head>
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
