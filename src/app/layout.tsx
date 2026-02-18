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
        {/*
          VB Early Interceptor: Responds to Contentstack Visual Builder init messages
          BEFORE the full SDK loads. The VB sends init within ~100ms of creating the
          iframe, but React/SDK bundles take 500-1000ms to load. Without this, the
          VB's 1000ms ACK timeout fires before the SDK can respond.

          This script:
          1. Listens for init REQUEST messages from the VB parent
          2. Immediately sends ACK (prevents timeout)
          3. Sends RESPONSE with SDK config (completes the handshake)
          4. Stops intercepting once the real SDK takes over
        */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var handled = {};
            window.addEventListener('message', function(e) {
              if (!e.data || e.data.eventManager !== 'contentstack-adv-post-message') return;
              var meta = e.data.metadata;
              if (!meta || meta.nature !== 'REQUEST' || e.data.type !== 'init') return;
              var hash = meta.hash;
              var channel = e.data.channel;
              if (handled[hash]) return;
              handled[hash] = true;
              var src = e.source;
              if (!src) return;
              console.log('[VB-Interceptor] Caught init REQUEST on ' + channel + ', sending ACK+RESPONSE');
              src.postMessage({
                eventManager: 'contentstack-adv-post-message',
                metadata: { hash: hash, nature: 'ACK' },
                channel: channel,
                type: 'init'
              }, '*');
              var payload = { config: { shouldReload: false, href: window.location.href, sdkVersion: '4.2.1', mode: 'builder' } };
              src.postMessage({
                eventManager: 'contentstack-adv-post-message',
                metadata: { hash: hash, nature: 'RESPONSE' },
                channel: channel,
                type: 'init',
                payload: payload
              }, '*');
            });
          })();
        `}} />
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
