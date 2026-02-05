'use client';

import { useEffect, useRef } from 'react';
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
 *
 * For SPA navigation, both pageView() and loadEntity() must be called
 * to track the page view AND re-evaluate Pathfora experiences.
 */
export default function LyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Skip the very first render - let Lytics handle the initial page load
    if (isFirstRender.current) {
      isFirstRender.current = false;
      console.log('[LyticsTracker] Skipping first render, letting Lytics handle initial load');
      return;
    }

    console.log('[LyticsTracker] SPA navigation detected:', pathname);

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
    } else {
      // Direct Lytics mode: track via jstag
      // Use a retry mechanism in case jstag isn't ready yet
      const triggerLyticsSPA = () => {
        console.log('[LyticsTracker] Attempting to trigger Lytics SPA...', {
          hasJstag: !!window.jstag,
          hasPathfora: !!window.pathfora,
        });

        if (window.jstag) {
          // Clear existing Pathfora widgets before re-evaluating
          // This is critical for SPA - without clearing, Pathfora thinks
          // experiences have already been triggered and won't show them again
          if (window.pathfora) {
            console.log('[LyticsTracker] Calling pathfora.clearAll()');
            window.pathfora.clearAll();
          }

          // Track the page view
          console.log('[LyticsTracker] Calling jstag.pageView()');
          window.jstag.pageView();

          // Re-fetch the visitor profile and trigger Pathfora experiences
          // This is critical for SPA - loadEntity re-evaluates all experiences
          console.log('[LyticsTracker] Calling jstag.loadEntity()');
          window.jstag.loadEntity((profile: any) => {
            console.log('[LyticsTracker] loadEntity callback fired', {
              pathname,
              hasProfile: !!profile,
              segments: profile?.data?.segments,
            });
          });

          return true;
        }
        return false;
      };

      // Try immediately
      if (!triggerLyticsSPA()) {
        console.log('[LyticsTracker] jstag not ready, starting retry...');
        // If jstag not ready, retry a few times
        let attempts = 0;
        const maxAttempts = 10;
        const retryInterval = setInterval(() => {
          attempts++;
          console.log(`[LyticsTracker] Retry attempt ${attempts}/${maxAttempts}`);
          if (triggerLyticsSPA() || attempts >= maxAttempts) {
            clearInterval(retryInterval);
            if (attempts >= maxAttempts) {
              console.warn('[LyticsTracker] jstag not available after retries');
            }
          }
        }, 200);

        return () => clearInterval(retryInterval);
      } else {
        console.log('[LyticsTracker] Successfully triggered on first attempt');
      }
    }
  }, [pathname, searchParams]);

  return null;
}

// Type declarations for Lytics
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
    pathfora?: {
      clearAll: () => void;
      clearById: (ids?: string[]) => void;
      triggerWidgets: (ids?: string[]) => void;
      initializeWidgets: (modules: any[], config?: any) => void;
    };
    dataLayer?: Record<string, any>[];
  }
}
