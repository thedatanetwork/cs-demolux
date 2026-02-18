import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Suspense } from 'react'
import Script from 'next/script'
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
        {/*
          Early Visual Builder ACK interceptor — runs before any JS bundle loads.
          VB sends an init REQUEST on the "visual-builder" channel via postMessage.
          If no ACK arrives within ~1000ms, VB gives up and never retries.
          This script ACKs that specific init message and buffers it so the SDK
          can replay it after loading and send the proper RESPONSE.
        */}
        <Script id="cs-vb-early-ack" strategy="beforeInteractive">
          {`(function(){if(typeof window==='undefined')return;var CH='contentstack-adv-post-message';var buf=[];window.__csVBBuffer=buf;window.__csVBSdkReady=false;window.addEventListener('message',function handler(e){if(window.__csVBSdkReady)return;var d=e.data;if(!d||d.eventManager!==CH)return;if(!d.metadata||d.metadata.nature!=='REQUEST')return;buf.push({data:d,source:e.source,origin:e.origin});if(e.source&&typeof e.source.postMessage==='function'){e.source.postMessage({eventManager:CH,metadata:{hash:d.metadata.hash,nature:'ACK'},channel:d.channel,type:d.type},e.origin);}});})();`}
        </Script>
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
