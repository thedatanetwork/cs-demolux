'use client';

import { useEffect } from 'react';
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

// Initialize SDK at module load time (not in useEffect) for faster response to Visual Builder
let sdkInitialized = false;
let clientStack: ReturnType<typeof Contentstack.Stack> | null = null;

function initializeLivePreviewSDK() {
  if (sdkInitialized || typeof window === 'undefined') {
    return;
  }

  if (!livePreviewConfig.live_preview || !livePreviewConfig.api_key) {
    return;
  }

  try {
    // Create client-side Stack for Live Preview SDK
    clientStack = Contentstack.Stack({
      api_key: livePreviewConfig.api_key,
      delivery_token: livePreviewConfig.delivery_token,
      environment: livePreviewConfig.environment,
      live_preview: {
        enable: true,
        preview_token: livePreviewConfig.preview_token,
        host: livePreviewConfig.preview_host,
      },
    });

    // Initialize Live Preview SDK
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
      ssr: true,
      mode: 'builder',
      editButton: {
        enable: true,
      },
    });

    sdkInitialized = true;
    console.log('Contentstack Live Preview initialized with Visual Builder mode');
    console.log(`  Preview host: ${livePreviewConfig.preview_host}`);
    console.log(`  App host: ${livePreviewConfig.app_host}`);
  } catch (error) {
    console.error('Failed to initialize Contentstack Live Preview:', error);
  }
}

// Try to initialize immediately when module loads (client-side only)
if (typeof window !== 'undefined') {
  initializeLivePreviewSDK();
}

export function ContentstackLivePreviewProvider({ children }: ContentstackLivePreviewProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Ensure SDK is initialized (in case module-level init didn't run yet)
  useEffect(() => {
    initializeLivePreviewSDK();
  }, []);

  // Set up content change handler
  useEffect(() => {
    if (sdkInitialized && livePreviewConfig.live_preview) {
      ContentstackLivePreview.onEntryChange(() => {
        router.refresh();
      });
    }
  }, [router, pathname]);

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
