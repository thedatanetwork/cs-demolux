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
      <body className="min-h-screen bg-white">
        {/*
          Early Visual Builder init interceptor: The VB sends an init REQUEST on the
          "visual-builder" channel via postMessage BEFORE React hydrates and the SDK loads.
          The 1000ms ACK timeout expires, VB gives up, and never retries.
          This script runs before any client JS, ACKs that specific init immediately,
          and buffers it so the SDK can send a proper RESPONSE after it loads.
        */}
        <Script id="cs-vb-early-ack" strategy="beforeInteractive">
          {`(function(){if(typeof window==='undefined')return;var CH='contentstack-adv-post-message';var buf=[];window.__csVBBuffer=buf;window.__csVBSdkReady=false;window.addEventListener('message',function(e){if(window.__csVBSdkReady)return;var d=e.data;if(!d||d.eventManager!==CH)return;if(!d.metadata||d.metadata.nature!=='REQUEST')return;if(d.channel!=='visual-builder'||d.type!=='init')return;buf.push({data:d,source:e.source,origin:e.origin});if(e.source&&typeof e.source.postMessage==='function'){e.source.postMessage({eventManager:CH,metadata:{hash:d.metadata.hash,nature:'ACK'},channel:d.channel,type:d.type},e.origin);}});})();`}
        </Script>

        {/* Google Tag Manager - only loads if GTM_CONTAINER_ID is set */}
        {gtmContainerId && (
          <>
            <Script id="gtm-script" strategy="afterInteractive">
              {`
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${gtmContainerId}');
              `}
            </Script>
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${gtmContainerId}`}
                height="0"
                width="0"
                style={{ display: 'none', visibility: 'hidden' }}
              />
            </noscript>
          </>
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
