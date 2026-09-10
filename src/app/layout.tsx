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
import { JsonLd } from '@/components/seo/JsonLd'
import { organizationSchema, webSiteSchema } from '@/lib/structured-data'
import { dataService } from '@/lib/data-service'
import { SITE_URL, SITE_NAME } from '@/lib/seo'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair'
})

const GTM_CONTAINER_ID = process.env.NEXT_PUBLIC_GTM_CONTAINER_ID
const LYTICS_TAG_SRC =
  process.env.NEXT_PUBLIC_LYTICS_TAG_SRC ||
  'https://c.lytics.io/api/tag/1de4557be14a84af4b7b999c8703fb83/latest.min.js'

const DEFAULT_TITLE = 'Demolux - Premium Wearable Tech & Technofurniture'
const DEFAULT_DESCRIPTION =
  'Discover the future of luxury with Demolux premium wearable technology and innovative technofurniture. Where cutting-edge design meets exceptional craftsmanship.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: '%s | Demolux',
  },
  description: DEFAULT_DESCRIPTION,
  keywords: ['wearable tech', 'technofurniture', 'luxury accessories', 'premium technology'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_US',
    url: SITE_URL,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Site-wide structured data (Organization + WebSite/SearchAction) for SEO + AEO.
  let siteSettings = null
  try {
    siteSettings = await dataService.getSiteSettings()
  } catch {
    // Non-fatal: fall back to defaults inside the schema builder.
  }

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-white">
        <JsonLd data={[organizationSchema(siteSettings), webSiteSchema()]} />

        {/*
          Lytics jstag.

          Contentstack Launch can also inject this at the edge (the "Event Tracking"
          setting), so the snippet is guarded on `window.jstag` being absent and is a
          no-op whenever Launch is doing the job. It is here because that toggle is a
          console-side setting: turning it off silently drops the tag on an already
          deployed build, and the recommendation rails go blank with it since they
          depend on `jstag.recommend`. Owning the tag in app code makes the rails
          survive a Launch settings change. GTM mode loads Lytics itself, so skip it.
        */}
        {!GTM_CONTAINER_ID && (
          <Script id="lytics-tracking" strategy="afterInteractive">
            {`
              if (!window.jstag) {
                !function(){"use strict";var o=window.jstag||(window.jstag={}),r=[];function n(e){o[e]=function(){for(var n=arguments.length,t=new Array(n),i=0;i<n;i++)t[i]=arguments[i];r.push([e,t])}}n("send"),n("mock"),n("identify"),n("pageView"),n("unblock"),n("getid"),n("setid"),n("loadEntity"),n("getEntity"),n("on"),n("once"),n("call"),o.loadScript=function(n,t,i){var e=document.createElement("script");e.async=!0,e.src=n,e.onload=t,e.onerror=i;var o=document.getElementsByTagName("script")[0],r=o&&o.parentNode||document.head||document.body,c=o||r.lastChild;return null!=c?r.insertBefore(e,c):r.appendChild(e),this},o.init=function n(t){return this.config=t,this.loadScript(t.src,function(){if(o.init===n)throw new Error("Load error!");o.init(o.config),function(){for(var n=0;n<r.length;n++){var t=r[n][0],i=r[n][1];o[t].apply(o,i)}r=void 0}()}),this}}();

                jstag.init({ src: '${LYTICS_TAG_SRC}' });
                jstag.pageView();
                jstag.loadEntity();
              }
            `}
          </Script>
        )}

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
