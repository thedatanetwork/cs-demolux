'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getPageContext } from '@/lib/tracking-utils';

// Check if GTM mode is enabled (env var is inlined at build time)
const isGTMEnabled = !!process.env.NEXT_PUBLIC_GTM_CONTAINER_ID;

// Store Pathfora experiences globally so they survive SPA navigation
let storedExperiences: any[] | null = null;

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

    // On first render, capture and store the Pathfora experiences
    // They get cleared after SPA navigation, so we need to preserve them
    if (isFirstRender.current) {
      isFirstRender.current = false;

      console.log('[LyticsTracker] First render - will capture experiences after delay');

      // Try capturing at multiple intervals since Lytics load time varies
      const captureExperiences = () => {
        const config = (window as any).jstag?.config;
        const experiences = config?.pathfora?.publish?.candidates?.experiences;

        console.log('[LyticsTracker] Checking for experiences...', {
          hasJstag: !!(window as any).jstag,
          hasConfig: !!config,
          hasPathfora: !!config?.pathfora,
          experiencesLength: experiences?.length || 0,
        });

        if (experiences && experiences.length > 0 && !storedExperiences) {
          storedExperiences = JSON.parse(JSON.stringify(experiences)); // Deep copy
          console.log('[LyticsTracker] Captured', storedExperiences?.length, 'Pathfora experiences for SPA navigation');
        }
      };

      // Try at 1s, 2s, 3s, and 5s
      [1000, 2000, 3000, 5000].forEach(delay => {
        setTimeout(captureExperiences, delay);
      });

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
          storedExperiences: storedExperiences?.length || 0,
        });

        if (window.jstag) {
          // Clear Pathfora impression tracking from localStorage BEFORE any Lytics calls
          // This allows experiences to re-evaluate fresh on SPA navigation
          // Note: We keep PathforaClosed_ so dismissed modals stay dismissed
          console.log('[LyticsTracker] Checking localStorage for Pathfora keys...', {
            totalKeys: localStorage.length,
            allKeys: Object.keys(localStorage),
          });
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('PathforaImpressions_') || key === 'PathforaPageView')) {
              keysToRemove.push(key);
            }
          }
          console.log('[LyticsTracker] Found keys to remove:', keysToRemove);
          keysToRemove.forEach(key => {
            console.log('[LyticsTracker] Clearing localStorage:', key);
            localStorage.removeItem(key);
          });

          // Track the page view
          console.log('[LyticsTracker] Calling jstag.pageView()');
          window.jstag.pageView();

          // Re-fetch the visitor profile
          console.log('[LyticsTracker] Calling jstag.loadEntity()');
          window.jstag.loadEntity((profile: any) => {
            console.log('[LyticsTracker] loadEntity callback fired', {
              pathname,
              hasProfile: !!profile,
            });

            // After loadEntity, check what experiences Lytics returned for this page
            const freshExperiences = (window as any).jstag?.config?.pathfora?.publish?.candidates?.experiences;
            console.log('[LyticsTracker] Fresh experiences from loadEntity:', {
              count: freshExperiences?.length || 0,
              storedCount: storedExperiences?.length || 0,
            });

            // Update stored experiences if we got fresh ones
            if (freshExperiences && freshExperiences.length > 0) {
              storedExperiences = JSON.parse(JSON.stringify(freshExperiences));
              console.log('[LyticsTracker] Updated stored experiences from fresh API response');
            }

            // Use whatever experiences we have (fresh from API preferred, stored as fallback)
            const experiencesToUse = freshExperiences && freshExperiences.length > 0
              ? freshExperiences
              : storedExperiences;

            const pf = window.pathfora as any;
            if (pf && experiencesToUse && experiencesToUse.length > 0) {
              console.log('[LyticsTracker] Using', experiencesToUse.length, 'experiences for initialization');

              // Log the full experience structure
              console.log('[LyticsTracker] Experience details (full):', JSON.stringify(experiencesToUse, null, 2));

              // Restore experiences to the config before reinitializing
              const config = (window as any).jstag?.config?.pathfora?.publish?.candidates;
              if (config) {
                config.experiences = JSON.parse(JSON.stringify(experiencesToUse));
                console.log('[LyticsTracker] Restored experiences to jstag config');
              }

              // Clear any existing widgets from DOM
              if (typeof pf.clearAll === 'function') {
                console.log('[LyticsTracker] Clearing existing widgets from DOM');
                pf.clearAll();
              }

              // Try initializeTargetedWidgets - this should re-evaluate targeting
              if (typeof pf.initializeTargetedWidgets === 'function') {
                console.log('[LyticsTracker] Trying pathfora.initializeTargetedWidgets()');
                try {
                  pf.initializeTargetedWidgets(experiencesToUse);
                  console.log('[LyticsTracker] initializeTargetedWidgets completed');
                } catch (e) {
                  console.log('[LyticsTracker] initializeTargetedWidgets error:', e);

                  // Fall back to regular initializeWidgets
                  console.log('[LyticsTracker] Falling back to initializeWidgets');
                  try {
                    pf.initializeWidgets(experiencesToUse);
                    console.log('[LyticsTracker] initializeWidgets completed');
                  } catch (e2) {
                    console.log('[LyticsTracker] initializeWidgets error:', e2);
                  }
                }
              } else {
                // Use initializeWidgets if initializeTargetedWidgets doesn't exist
                console.log('[LyticsTracker] Calling pathfora.initializeWidgets');
                try {
                  pf.initializeWidgets(experiencesToUse);
                  console.log('[LyticsTracker] initializeWidgets completed successfully');
                } catch (e) {
                  console.log('[LyticsTracker] initializeWidgets error:', e);
                }
              }
            } else {
              console.log('[LyticsTracker] No experiences available to initialize');
            }
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
      reinitialize: () => void;
      reloadWidgets: () => void;
    };
    dataLayer?: Record<string, any>[];
  }
}
