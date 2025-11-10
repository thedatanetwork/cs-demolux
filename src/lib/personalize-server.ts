import { cookies } from 'next/headers';

/**
 * Server-side utilities for Contentstack Personalize
 * 
 * These functions allow Next.js server components to access variant aliases
 * that were determined by the client-side Personalize SDK.
 * 
 * Flow:
 * 1. Client-side: Personalize SDK initializes and stores variant aliases in a cookie
 * 2. Server-side: This utility reads the cookie during SSR/SSG
 * 3. Server-side: Contentstack queries include the variant aliases
 * 4. Result: No content flicker - personalized content is rendered from the start
 */

const VARIANT_COOKIE_NAME = 'cs_personalize_variants';

/**
 * Get variant aliases from cookies (server-side only)
 * 
 * This should be called in server components during rendering to fetch
 * the appropriate personalized content.
 * 
 * @returns Array of variant aliases, or empty array if none found
 */
export async function getVariantAliasesFromCookies(): Promise<string[]> {
  try {
    const cookieStore = await cookies();
    const variantCookie = cookieStore.get(VARIANT_COOKIE_NAME);
    
    if (!variantCookie?.value) {
      return [];
    }

    // Cookie value is a JSON-encoded array
    const variantAliases = JSON.parse(variantCookie.value);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🍪 Server: Read variant aliases from cookie:', variantAliases);
    }
    
    return Array.isArray(variantAliases) ? variantAliases : [];
  } catch (error) {
    console.error('Error reading variant aliases from cookie:', error);
    return [];
  }
}

/**
 * Check if Personalize is configured
 * 
 * @returns true if Personalize project UID is configured
 */
export function isPersonalizeConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID;
}

