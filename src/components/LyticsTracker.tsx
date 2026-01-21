'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getPageContext } from '@/lib/tracking-utils';

// Check if GTM mode is enabled (env var is inlined at build time)
const isGTMEnabled = !!process.env.NEXT_PUBLIC_GTM_CONTAINER_ID;

/**
 * Lytics tracking component for Single Page App (SPA) route changes
 *
 * Supports two modes:
 * - Direct Lytics: Calls jstag.pageView() and jstag.loadEntity()
 * - GTM Mode: Pushes 'pageView' event to dataLayer for GTM to handle
 */
export default function LyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isGTMEnabled) {
      // GTM mode: push pageView event to dataLayer
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'pageView',
        ...getPageContext(),
        timestamp: new Date().toISOString(),
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('GTM: pageView event pushed to dataLayer');
      }
    } else if (window.jstag) {
      // Direct Lytics mode: track via jstag
      window.jstag.pageView();

      // Re-fetch the visitor profile and trigger configured campaigns
      window.jstag.loadEntity((profile: any) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('Lytics profile loaded:', profile?.data);
        }
      });
    }
  }, [pathname, searchParams]);

  return null;
}

// Type declaration for jstag
declare global {
  interface Window {
    jstag?: {
      pageView: () => void;
      loadEntity: (callback?: (profile: any) => void) => void;
      getEntity: (callback?: (entity: any) => void) => void;
      getSegments: () => string[];
      send: (data: any) => void;
      identify: (data: any) => void;
      init: (config: any) => void;
      getid: (callback: (id: string) => void) => void;
      isLoaded: boolean;
    };
    dataLayer?: Record<string, any>[];
  }
}
