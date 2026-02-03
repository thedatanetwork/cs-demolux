'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Contentstack from 'contentstack';
import ContentstackLivePreview from '@contentstack/live-preview-utils';

interface ContentstackLivePreviewProviderProps {
  children: React.ReactNode;
}

// Client-side config (only public values)
const livePreviewConfig = {
  api_key: process.env.NEXT_PUBLIC_CONTENTSTACK_API_KEY || '',
  delivery_token: process.env.NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN || '',
  environment: process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT || 'dev',
  preview_token: process.env.NEXT_PUBLIC_CONTENTSTACK_PREVIEW_TOKEN || '',
  app_host: process.env.NEXT_PUBLIC_CONTENTSTACK_APP_HOST || 'app.contentstack.com',
  preview_host: process.env.NEXT_PUBLIC_CONTENTSTACK_PREVIEW_HOST || 'rest-preview.contentstack.com',
  live_preview: process.env.NEXT_PUBLIC_CONTENTSTACK_LIVE_PREVIEW === 'true',
};

export function ContentstackLivePreviewProvider({ children }: ContentstackLivePreviewProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isInitialized, setIsInitialized] = useState(false);
  const stackRef = useRef<ReturnType<typeof Contentstack.Stack> | null>(null);

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

    if (isInitialized) {
      return;
    }

    try {
      // Create client-side Stack for Live Preview SDK
      // This is separate from the server-side Stack used for data fetching
      const clientStack = Contentstack.Stack({
        api_key: livePreviewConfig.api_key,
        delivery_token: livePreviewConfig.delivery_token,
        environment: livePreviewConfig.environment,
        live_preview: {
          enable: true,
          preview_token: livePreviewConfig.preview_token,
          host: livePreviewConfig.preview_host,
        },
      });

      stackRef.current = clientStack;

      // Initialize Live Preview SDK with stackSdk (key difference from before)
      ContentstackLivePreview.init({
        stackSdk: clientStack,
        stackDetails: {
          apiKey: livePreviewConfig.api_key,
          environment: livePreviewConfig.environment,
        },
        clientUrlParams: {
          protocol: 'https',
          host: livePreviewConfig.app_host,
          port: 443,
        },
        ssr: true, // Using Next.js SSR
        mode: 'builder', // Enable Visual Builder mode
        editButton: {
          enable: true,
        },
      });

      // Set up callback for content changes
      ContentstackLivePreview.onEntryChange(() => {
        router.refresh();
      });

      setIsInitialized(true);
      console.log('Contentstack Live Preview initialized with Visual Builder mode');
      console.log(`  Preview host: ${livePreviewConfig.preview_host}`);
      console.log(`  App host: ${livePreviewConfig.app_host}`);
    } catch (error) {
      console.error('Failed to initialize Contentstack Live Preview:', error);
    }
  }, [router, isInitialized]);

  // Re-initialize on route changes if in preview mode
  useEffect(() => {
    if (isInitialized && livePreviewConfig.live_preview) {
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
