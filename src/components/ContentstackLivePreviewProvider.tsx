'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import ContentstackLivePreview from '@contentstack/live-preview-utils';

interface ContentstackLivePreviewProviderProps {
  children: React.ReactNode;
}

// Client-side config (only public values)
const livePreviewConfig = {
  api_key: process.env.NEXT_PUBLIC_CONTENTSTACK_API_KEY || '',
  environment: process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT || 'dev',
  preview_token: process.env.NEXT_PUBLIC_CONTENTSTACK_PREVIEW_TOKEN || '',
  app_host: process.env.NEXT_PUBLIC_CONTENTSTACK_APP_HOST || 'app.contentstack.com',
  live_preview: process.env.NEXT_PUBLIC_CONTENTSTACK_LIVE_PREVIEW === 'true',
};

export function ContentstackLivePreviewProvider({ children }: ContentstackLivePreviewProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only initialize if live preview is enabled and we have the required config
    if (!livePreviewConfig.live_preview || !livePreviewConfig.api_key) {
      return;
    }

    // Check if we're in the Contentstack preview context (iframe)
    const isInPreviewMode = typeof window !== 'undefined' &&
      (window.location.search.includes('live_preview') ||
       window.parent !== window);

    if (!isInPreviewMode && !isInitialized) {
      return;
    }

    try {
      // Initialize Live Preview SDK
      ContentstackLivePreview.init({
        ssr: true, // Using Next.js SSR
        enable: true,
        stackDetails: {
          apiKey: livePreviewConfig.api_key,
          environment: livePreviewConfig.environment,
        },
        clientUrlParams: {
          host: livePreviewConfig.app_host,
        },
        editButton: {
          enable: true, // Enable edit button in Visual Builder
        },
      });

      // Set up callback for content changes
      ContentstackLivePreview.onEntryChange(() => {
        // Refresh the page to get new content
        router.refresh();
      });

      setIsInitialized(true);
      console.log('Contentstack Live Preview initialized');
    } catch (error) {
      console.error('Failed to initialize Contentstack Live Preview:', error);
    }
  }, [router, isInitialized]);

  // Re-initialize on route changes if in preview mode
  useEffect(() => {
    if (isInitialized && livePreviewConfig.live_preview) {
      // Notify Live Preview of route change
      ContentstackLivePreview.onEntryChange(() => {
        router.refresh();
      });
    }
  }, [pathname, isInitialized, router]);

  return <>{children}</>;
}

/**
 * Helper function to add data-cslp attributes for Visual Builder
 * Use this on elements you want to be editable in Visual Builder
 *
 * @param contentTypeUid - The content type UID
 * @param entryUid - The entry UID
 * @param fieldPath - The field path (e.g., 'title', 'description', 'hero.title')
 * @param locale - Optional locale (defaults to 'en-us')
 * @returns Object with data-cslp attribute for spreading onto elements
 *
 * @example
 * <h1 {...getEditableProps('product', product.uid, 'title')}>
 *   {product.title}
 * </h1>
 */
export function getEditableProps(
  contentTypeUid: string,
  entryUid: string,
  fieldPath: string,
  locale: string = 'en-us'
) {
  if (!livePreviewConfig.live_preview) {
    return {};
  }

  return {
    'data-cslp': `${contentTypeUid}.${entryUid}.${locale}.${fieldPath}`,
  };
}

/**
 * Helper to generate the data-cslp string directly
 */
export function getEditableAttribute(
  contentTypeUid: string,
  entryUid: string,
  fieldPath: string,
  locale: string = 'en-us'
): string {
  return `${contentTypeUid}.${entryUid}.${locale}.${fieldPath}`;
}

/**
 * Check if live preview mode is enabled
 */
export function isLivePreviewEnabled(): boolean {
  return livePreviewConfig.live_preview && !!livePreviewConfig.api_key;
}
