'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Contentstack from 'contentstack';
import ContentstackLivePreview from '@contentstack/live-preview-utils';

interface ContentstackLivePreviewProviderProps {
  children: React.ReactNode;
}

// Region-based preview host mapping (must be explicit for Visual Builder validation)
const REGION_PREVIEW_HOST: Record<string, string> = {
  US: 'rest-preview.contentstack.com',
  EU: 'eu-rest-preview.contentstack.com',
  AZURE_NA: 'azure-na-rest-preview.contentstack.com',
  AZURE_EU: 'azure-eu-rest-preview.contentstack.com',
  GCP_NA: 'gcp-na-rest-preview.contentstack.com',
};

// Client-side config (only public values)
const region = process.env.NEXT_PUBLIC_CONTENTSTACK_REGION || 'US';
const livePreviewConfig = {
  api_key: process.env.NEXT_PUBLIC_CONTENTSTACK_API_KEY || '',
  delivery_token: process.env.NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN || '',
  environment: process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT || 'dev',
  preview_token: process.env.NEXT_PUBLIC_CONTENTSTACK_PREVIEW_TOKEN || '',
  app_host: process.env.NEXT_PUBLIC_CONTENTSTACK_APP_HOST || 'app.contentstack.com',
  preview_host: process.env.NEXT_PUBLIC_CONTENTSTACK_PREVIEW_HOST || REGION_PREVIEW_HOST[region] || REGION_PREVIEW_HOST.US,
  region,
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

  // Validate preview token is actually present
  if (!livePreviewConfig.preview_token) {
    console.error(
      'Contentstack Live Preview: NEXT_PUBLIC_CONTENTSTACK_PREVIEW_TOKEN is not set!',
      'Live Preview requires a valid preview token. Generate one in Contentstack:',
      'Settings → Tokens → Delivery Tokens → [your token] → Create Preview Token'
    );
    return;
  }

  try {
    // Build live_preview config with explicit host (required for Visual Builder token validation)
    const livePreviewSdkConfig: Record<string, any> = {
      enable: true,
      preview_token: livePreviewConfig.preview_token,
      host: livePreviewConfig.preview_host,
    };

    // Create client-side Stack with live_preview config
    // NOTE: The `host` top-level property is NOT processed by the SDK's object constructor -
    // the CDN host is determined automatically by `region`. Don't pass it to avoid confusion.
    clientStack = Contentstack.Stack({
      api_key: livePreviewConfig.api_key,
      delivery_token: livePreviewConfig.delivery_token,
      environment: livePreviewConfig.environment,
      region: (Contentstack.Region as any)[livePreviewConfig.region] || Contentstack.Region.US,
      branch: 'main',
      live_preview: livePreviewSdkConfig,
    } as any);

    // Log the resolved live_preview config for debugging
    const resolvedConfig = (clientStack as any)?.live_preview;
    console.log('Contentstack Live Preview config:', {
      api_key: livePreviewConfig.api_key ? `${livePreviewConfig.api_key.substring(0, 8)}...` : 'MISSING',
      delivery_token: livePreviewConfig.delivery_token ? `${livePreviewConfig.delivery_token.substring(0, 8)}...` : 'MISSING',
      preview_token: livePreviewConfig.preview_token ? `${livePreviewConfig.preview_token.substring(0, 8)}...` : 'MISSING',
      environment: livePreviewConfig.environment,
      region: livePreviewConfig.region,
      resolved_preview_host: resolvedConfig?.host || 'not set',
      preview_host_override: livePreviewConfig.preview_host || 'none (using SDK auto-detect)',
    });

    // Initialize Live Preview SDK
    ContentstackLivePreview.init({
      ssr: false,
      enable: true,
      mode: 'builder',
      stackSdk: clientStack as any,
      clientUrlParams: {
        host: livePreviewConfig.app_host,
      },
      stackDetails: {
        apiKey: livePreviewConfig.api_key,
        environment: livePreviewConfig.environment,
        branch: 'main',
      },
      editButton: {
        enable: true,
        exclude: ['outsideLivePreviewPortal'],
      },
    });

    sdkInitialized = true;
    console.log('Contentstack Live Preview initialized (Visual Builder mode)');
  } catch (error) {
    console.error('Failed to initialize Contentstack Live Preview:', error);
  }
}

// Try to initialize immediately when module loads (client-side only)
if (typeof window !== 'undefined') {
  // Debug: log all postMessage events to diagnose VB communication
  window.addEventListener('message', (event) => {
    const d = event.data;
    if (d && d.eventManager === 'contentstack-adv-post-message') {
      console.log('[CS-DEBUG] postMessage:', d.metadata?.nature, d.type, JSON.stringify(d).substring(0, 300));
    }
  });
  // Debug: catch unhandled rejections to see the actual error
  window.addEventListener('unhandledrejection', (event) => {
    console.log('[CS-DEBUG] Unhandled rejection:', event.reason);
  });

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
