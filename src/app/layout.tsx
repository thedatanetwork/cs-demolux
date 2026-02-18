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
      <head>
        {/*
          Early Visual Builder init interceptor — must be a raw <script> (not next/script)
          so it executes synchronously during HTML parsing, BEFORE any JS bundles load.
          The VB sends an init REQUEST on the "visual-builder" postMessage channel
          immediately when the iframe loads. The SDK's 1000ms ACK timeout is too tight
          to survive React hydration. This script ACKs that init instantly and buffers
          the message for the SDK to send a proper RESPONSE after it loads.
        */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){
var CH='contentstack-adv-post-message';
var buf=[];
window.__csVBBuffer=buf;
window.__csVBSdkReady=false;
console.log('[VB-Interceptor] Early ACK interceptor installed');
window.addEventListener('message',function(e){
  if(window.__csVBSdkReady)return;
  var d=e.data;
  if(!d||d.eventManager!==CH)return;
  if(!d.metadata||d.metadata.nature!=='REQUEST')return;
  if(d.channel!=='visual-builder'||d.type!=='init')return;
  console.log('[VB-Interceptor] Caught VB init, sending early ACK for hash:',d.metadata.hash);
  buf.push({data:d,source:e.source,origin:e.origin});
  if(e.source&&typeof e.source.postMessage==='function'){
    e.source.postMessage({eventManager:CH,metadata:{hash:d.metadata.hash,nature:'ACK'},channel:d.channel,type:d.type},e.origin);
  }
});
})();` }} />
      </head>
      <body className="min-h-screen bg-white">
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
