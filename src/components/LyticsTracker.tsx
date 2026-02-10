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
 * Capture Pathfora experiences from jstag config (non-destructive read).
 * Returns true if experiences were captured.
 */
function captureExperiences(): boolean {
  ensureLyticsOptIn();

  const config = (window as any).jstag?.config;
  const experiences = config?.pathfora?.publish?.candidates?.experiences;

  if (experiences && experiences.length > 0) {
    storedExperiences = JSON.parse(JSON.stringify(experiences));
    console.log('[LyticsTracker] Captured', storedExperiences?.length, 'Pathfora experiences');
    return true;
  }
  return false;
}

/**
 * Filter stored experiences to the best match for the current URL.
 * Returns a single-element array with the most specific match, or empty array.
 */
function getMatchingExperiences(experiences: any[]): any[] {
  const currentUrl = window.location.href;

  const matching = experiences.filter((exp: any) => {
    const urlRules = exp.displayConditions?.urlContains || [];
    const hasIncludeMatch = urlRules.some((rule: any) => {
      if (rule.exclude) return false;
      return currentUrl.toLowerCase().includes(rule.value.toLowerCase());
    });
    const isExcluded = urlRules.some((rule: any) => {
      if (!rule.exclude) return false;
      return currentUrl.toLowerCase().includes(rule.value.toLowerCase());
    });
    return hasIncludeMatch && !isExcluded;
  });

  // Sort by specificity: experiences with non-"/" include rules come first
  matching.sort((a: any, b: any) => {
    const aRules = a.displayConditions?.urlContains || [];
    const bRules = b.displayConditions?.urlContains || [];
    const aHasSpecificRule = aRules.some((r: any) => !r.exclude && r.value !== '/');
    const bHasSpecificRule = bRules.some((r: any) => !r.exclude && r.value !== '/');
    if (aHasSpecificRule && !bHasSpecificRule) return -1;
    if (bHasSpecificRule && !aHasSpecificRule) return 1;
    return 0;
  });

  return matching.length > 0 ? [matching[0]] : [];
}

/**
 * Re-initialize Pathfora widgets using stored experiences for the current URL.
 * Does NOT call loadEntity — uses cached data only, so no flicker.
 */
function reinitWidgetsForCurrentUrl() {
  const pf = window.pathfora as any;
  if (!pf || !storedExperiences || storedExperiences.length === 0) {
    console.log('[LyticsTracker] No experiences or pathfora available to reinit');
    return;
  }

  // Clear Pathfora impression tracking so experiences can re-show on new pages
  // Keep PathforaClosed_ so dismissed modals stay dismissed
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('PathforaImpressions_') || key === 'PathforaPageView')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));

  // Deep copy and reset valid flags
  const freshCopy = JSON.parse(JSON.stringify(storedExperiences));
  freshCopy.forEach((exp: any) => {
    exp.valid = true;
    if (exp.config) {
      exp.config.valid = true;
    }
  });

  const experienceToShow = getMatchingExperiences(freshCopy);

  if (experienceToShow.length === 0) {
    // No matching experience for this URL — just clear existing widgets
    if (typeof pf.clearAll === 'function') {
      pf.clearAll();
    }
    console.log('[LyticsTracker] No matching experiences for current URL');
    return;
  }

  console.log('[LyticsTracker] Reinitializing widget for experience:', experienceToShow[0]?.id);

  // Restore experiences to jstag config
  const config = (window as any).jstag?.config?.pathfora?.publish?.candidates;
  if (config) {
    config.experiences = JSON.parse(JSON.stringify(experienceToShow));
  }

  // Clear then re-init
  if (typeof pf.clearAll === 'function') {
    pf.clearAll();
  }

  try {
    pf.initializeWidgets(experienceToShow);
    console.log('[LyticsTracker] initializeWidgets completed');
  } catch (e) {
    console.log('[LyticsTracker] initializeWidgets error:', e);
  }
}

/**
 * Lytics tracking component for Single Page App (SPA) route changes
 *
 * Supports two modes:
 * - Direct Lytics: Calls jstag.pageView() for tracking, uses cached
 *   experiences to reinit Pathfora widgets (avoids loadEntity to prevent flicker)
 * - GTM Mode: Pushes 'pageView' event to dataLayer for GTM to handle
 *
 * loadEntity is intentionally NOT called on navigation — it triggers a profile
 * re-fetch which re-evaluates experiences and causes visible widget flicker.
 * The cached profile/experiences are sufficient for SPA page transitions.
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

    // First render: just capture experiences from Lytics initial load.
    // Pathfora already initializes its own widgets on first load — we only
    // need to grab a copy so we can re-init them on SPA navigation later.
    // No loadEntity call needed here.
    if (isFirstRender.current) {
      isFirstRender.current = false;

      console.log('[LyticsTracker] First render - capturing experiences passively');

      // Poll until experiences are available (Lytics load time varies)
      const captureIntervals = [1000, 2000, 3000, 5000];
      const timers = captureIntervals.map(delay =>
        setTimeout(() => {
          if (!storedExperiences) {
            captureExperiences();
          }
        }, delay)
      );

      return () => timers.forEach(clearTimeout);
    }

    // SPA navigation
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
      // Direct Lytics mode
      const triggerLyticsSPA = () => {
        if (!window.jstag) return false;

        // Track the page view (send-only, does not refresh experiences)
        console.log('[LyticsTracker] Calling jstag.pageView()');
        window.jstag.pageView();

        // Re-capture experiences in case they weren't captured on first render
        if (!storedExperiences) {
          captureExperiences();
        }

        // Re-init widgets from cached experiences — no loadEntity needed
        reinitWidgetsForCurrentUrl();
        return true;
      };

      if (!triggerLyticsSPA()) {
        console.log('[LyticsTracker] jstag not ready, starting retry...');
        let attempts = 0;
        const maxAttempts = 10;
        const retryInterval = setInterval(() => {
          attempts++;
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
      config?: any;
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
