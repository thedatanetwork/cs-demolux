import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import Script from 'next/script'
import { Suspense } from 'react'
import './globals.css'
import { CartProvider } from '@/contexts/CartContext'
import { PersonalizeProvider } from '@/contexts/PersonalizeContext'
import { ContentstackLivePreviewProvider } from '@/components/ContentstackLivePreviewProvider'
import LyticsTracker from '@/components/LyticsTracker'
import PathforaStyleFix from '@/components/PathforaStyleFix'

// Force dynamic rendering for all pages - Contentstack credentials not available at build time
export const dynamic = 'force-dynamic';

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

// GTM Container ID from environment variable
const gtmContainerId = process.env.NEXT_PUBLIC_GTM_CONTAINER_ID;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/* 
          Early ACK responder for Contentstack Visual Builder.
          The Visual Builder sends a postMessage handshake to the iframe and expects
          an ACK within 1 second (hardcoded in @contentstack/advanced-post-message).
          In Next.js App Router, React hydration + SDK init often takes longer than 1s,
          so this inline script catches early messages, sends ACKs immediately, and
          parks the messages for replay once the SDK is ready.
        */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var CHANNEL_NAME = 'contentstack-adv-post-message';
            var stored = [];
            var sdkReady = false;
            window.__csEarlyMessages = stored;
            window.__csMarkSdkReady = function() { sdkReady = true; };
            window.addEventListener('message', function(event) {
              if (sdkReady) return;
              var data = event.data;
              if (!data || data.eventManager !== CHANNEL_NAME) return;
              if (!data.metadata || data.metadata.nature !== 'REQUEST') return;
              stored.push({ data: data, origin: event.origin });
              var ack = {
                eventManager: CHANNEL_NAME,
                metadata: { hash: data.metadata.hash, nature: 'ACK' },
                channel: data.channel,
                error: undefined,
                payload: undefined,
                type: data.type
              };
              if (event.source && typeof event.source.postMessage === 'function') {
                event.source.postMessage(ack, event.origin);
              }
            });
          })();
        `}} />
        {/* Google Tag Manager - only loads if GTM_CONTAINER_ID is set */}
        {gtmContainerId && (
          <Script id="gtm-script" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmContainerId}');
            `}
          </Script>
        )}
      </head>
      <body className="min-h-screen bg-white">
        {/* Google Tag Manager (noscript) - only loads if GTM_CONTAINER_ID is set */}
        {gtmContainerId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmContainerId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}

        {/* Lytics Tracking Tag is now injected by Contentstack Launch via Event Tracking setting */}
        {/* The LyticsTracker component below handles SPA route changes */}
        
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
