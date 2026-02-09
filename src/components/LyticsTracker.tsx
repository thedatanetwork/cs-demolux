'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getPageContext } from '@/lib/tracking-utils';

// Check if GTM mode is enabled (env var is inlined at build time)
const isGTMEnabled = !!process.env.NEXT_PUBLIC_GTM_CONTAINER_ID;

// Store Pathfora experiences globally so they survive SPA navigation
let storedExperiences: any[] | null = null;

// Session storage key for opt-in state
const LYTICS_OPTIN_KEY = 'lytics_opted_in';

/**
 * Check if we've already opted in this session
 */
function hasOptedInThisSession(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(LYTICS_OPTIN_KEY) === 'true';
}

/**
 * Ensure user is opted in to Lytics tracking (once per session)
 * Returns true if already opted in or successfully opted in now
 */
function ensureLyticsOptIn(): boolean {
  if (typeof window === 'undefined') return false;

  // Skip if already opted in this session
  if (hasOptedInThisSession()) {
    return true;
  }

  const jstag = (window as any).jstag;
  if (jstag?.optIn) {
    jstag.optIn();
    sessionStorage.setItem(LYTICS_OPTIN_KEY, 'true');
    console.log('[LyticsTracker] Called jstag.optIn() - user is now opted in for this session');
    return true;
  }
  return false;
}

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

  // Opt-in once per session when component mounts
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // If already opted in this session, skip
    if (hasOptedInThisSession()) {
      console.log('[LyticsTracker] Already opted in this session');
      return;
    }

    // Try to opt-in immediately, then retry until successful
    if (!ensureLyticsOptIn()) {
      // Lytics not loaded yet, retry at intervals
      const optInIntervals = [100, 250, 500, 1000, 2000, 3000];
      const timers: ReturnType<typeof setTimeout>[] = [];

      optInIntervals.forEach(delay => {
        timers.push(setTimeout(() => {
          if (!hasOptedInThisSession()) {
            ensureLyticsOptIn();
          }
        }, delay));
      });

      return () => timers.forEach(clearTimeout);
    }
  }, []); // Run once on mount

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // On first render, capture and store the Pathfora experiences
    // They get cleared after SPA navigation, so we need to preserve them
    if (isFirstRender.current) {
      isFirstRender.current = false;

      console.log('[LyticsTracker] First render - will capture experiences after delay');

      // Try capturing at multiple intervals since Lytics load time varies
      const captureExperiences = () => {
        // Ensure opt-in before checking experiences
        ensureLyticsOptIn();

        const config = (window as any).jstag?.config;
        const experiences = config?.pathfora?.publish?.candidates?.experiences;

        console.log('[LyticsTracker] Checking for experiences...', {
          hasJstag: !!(window as any).jstag,
          hasConfig: !!config,
          hasPathfora: !!config?.pathfora,
          experiencesLength: experiences?.length || 0,
          isOptedIn: hasOptedInThisSession(),
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

      // IMPORTANT: After initial page load, Lytics may have updated the user's profile
      // with new audience membership. We need to re-fetch the profile and re-evaluate
      // experiences to show the correct content for newly added audiences.
      let hasReEvaluated = false;
      const reEvaluateAfterProfileUpdate = () => {
        if (hasReEvaluated) return; // Only re-evaluate once

        const jstag = (window as any).jstag;
        const pf = (window as any).pathfora;

        if (!jstag || !pf) {
          console.log('[LyticsTracker] First render re-evaluation: jstag or pathfora not ready');
          return;
        }

        console.log('[LyticsTracker] First render: Re-fetching profile after initial page view processing');

        // Call loadEntity to get the updated profile (with new audience memberships)
        jstag.loadEntity((profile: any) => {
          console.log('[LyticsTracker] First render: Profile re-fetched', {
            hasProfile: !!profile,
            segments: profile?.segments || [],
          });

          // Get fresh experiences from the updated config
          const freshExperiences = jstag?.config?.pathfora?.publish?.candidates?.experiences;

          if (freshExperiences && freshExperiences.length > 0) {
            // Update stored experiences
            storedExperiences = JSON.parse(JSON.stringify(freshExperiences));

            // Clear existing widgets
            if (typeof pf.clearAll === 'function') {
              pf.clearAll();
            }

            // Re-initialize with fresh experiences
            console.log('[LyticsTracker] First render: Re-initializing', freshExperiences.length, 'experiences');
            try {
              pf.initializeWidgets(freshExperiences);
              hasReEvaluated = true; // Mark as done so we don't repeat
              console.log('[LyticsTracker] First render: Experiences re-initialized');
            } catch (e) {
              console.log('[LyticsTracker] First render: initializeWidgets error:', e);
            }
          }
        });
      };

      // Poll at 1s, 2s, and 3s to catch profile update as soon as it's ready
      [1000, 2000, 3000].forEach(delay => {
        setTimeout(reEvaluateAfterProfileUpdate, delay);
      });

      console.log('[LyticsTracker] First render - will re-evaluate experiences at 1s, 2s, 3s');
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

              // Create a completely fresh deep copy to avoid any mutated state
              const freshExperiences = JSON.parse(JSON.stringify(experiencesToUse));

              // Reset the 'valid' flag so Pathfora re-evaluates targeting for current URL
              freshExperiences.forEach((exp: any) => {
                exp.valid = true;
                if (exp.config) {
                  exp.config.valid = true;
                }
              });

              // Filter to only show one experience - pick the most specific URL match
              // More specific = has include rules that match current URL (not just "/" catch-all)
              const currentUrl = window.location.href;
              const matchingExperiences = freshExperiences.filter((exp: any) => {
                const urlRules = exp.displayConditions?.urlContains || [];
                // Check if any include rule matches
                const hasIncludeMatch = urlRules.some((rule: any) => {
                  if (rule.exclude) return false;
                  return currentUrl.toLowerCase().includes(rule.value.toLowerCase());
                });
                // Check if any exclude rule blocks
                const isExcluded = urlRules.some((rule: any) => {
                  if (!rule.exclude) return false;
                  return currentUrl.toLowerCase().includes(rule.value.toLowerCase());
                });
                return hasIncludeMatch && !isExcluded;
              });

              // Sort by specificity: experiences with non-"/" include rules come first
              matchingExperiences.sort((a: any, b: any) => {
                const aRules = a.displayConditions?.urlContains || [];
                const bRules = b.displayConditions?.urlContains || [];
                const aHasSpecificRule = aRules.some((r: any) => !r.exclude && r.value !== '/');
                const bHasSpecificRule = bRules.some((r: any) => !r.exclude && r.value !== '/');
                if (aHasSpecificRule && !bHasSpecificRule) return -1;
                if (bHasSpecificRule && !aHasSpecificRule) return 1;
                return 0;
              });

              // Only use the first (most specific) matching experience
              const experienceToShow = matchingExperiences.length > 0 ? [matchingExperiences[0]] : [];
              console.log('[LyticsTracker] Filtered experiences:', {
                total: freshExperiences.length,
                matching: matchingExperiences.length,
                showing: experienceToShow.length,
                selectedId: experienceToShow[0]?.id,
              });
              console.log('[LyticsTracker] Current URL for targeting:', window.location.href);

              // Use initializeWidgets with the filtered experience (only one)
              if (experienceToShow.length === 0) {
                console.log('[LyticsTracker] No matching experiences for current URL');
                return;
              }

              console.log('[LyticsTracker] Calling pathfora.initializeWidgets with single experience');
              try {
                pf.initializeWidgets(experienceToShow);
                console.log('[LyticsTracker] initializeWidgets completed');

                // Check if any widgets were added to DOM
                setTimeout(() => {
                  const widgets = document.querySelectorAll('.pf-widget');
                  console.log('[LyticsTracker] Widgets in DOM after init:', widgets.length);
                  if (widgets.length > 0) {
                    widgets.forEach((w, i) => {
                      console.log(`[LyticsTracker] Widget ${i}:`, w.className, (w as HTMLElement).style.display);
                    });
                  }
                }, 500);
              } catch (e) {
                console.log('[LyticsTracker] initializeWidgets error:', e);
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
