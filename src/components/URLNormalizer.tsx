'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Client-side component that normalizes URLs with double slashes.
 * This catches cases where malformed URLs bypass server-side middleware
 * or are generated client-side.
 */
export function URLNormalizer() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check the actual window location for double slashes
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;

      // If the path contains double slashes, normalize and redirect
      if (currentPath.includes('//')) {
        const normalizedPath = currentPath.replace(/\/+/g, '/');
        // Use window.location.replace to avoid adding to history
        window.location.replace(normalizedPath + window.location.search + window.location.hash);
      }
    }
  }, [pathname]);

  return null;
}
