'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Lytics tracking component for Single Page App (SPA) route changes
 * Tracks page views and reloads visitor profile on each route change
 */
export default function LyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Ensure jstag is available
    if (typeof window !== 'undefined' && window.jstag) {
      // Track the page view for the new route
      window.jstag.pageView();
      
      // Re-fetch the visitor profile and trigger configured campaigns
      window.jstag.loadEntity((profile: any) => {
        // Optional: Log profile data for debugging
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
  }
}

