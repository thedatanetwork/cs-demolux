/**
 * Client-side Contentstack SDK initialization for Live Preview & Visual Builder.
 *
 * CRITICAL: This module initializes synchronously at import time (module-level),
 * NOT inside a React component or useEffect. The Visual Builder sends an init
 * postMessage within 1000ms of loading the iframe — the SDK's message listener
 * must be active before that deadline. Module-level init ensures this.
 *
 * This mirrors the pattern used in working reference projects (SewnThrone, Panda Financial).
 */
import Contentstack from 'contentstack';
import ContentstackLivePreview from '@contentstack/live-preview-utils';

// Region-based preview host mapping
const REGION_PREVIEW_HOST: Record<string, string> = {
  US: 'rest-preview.contentstack.com',
  EU: 'eu-rest-preview.contentstack.com',
  AZURE_NA: 'azure-na-rest-preview.contentstack.com',
  AZURE_EU: 'azure-eu-rest-preview.contentstack.com',
  GCP_NA: 'gcp-na-rest-preview.contentstack.com',
};

const region = process.env.NEXT_PUBLIC_CONTENTSTACK_REGION || 'US';
const apiKey = process.env.NEXT_PUBLIC_CONTENTSTACK_API_KEY || '';
const deliveryToken = process.env.NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN || '';
const environment = process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT || 'dev';
const previewToken = process.env.NEXT_PUBLIC_CONTENTSTACK_PREVIEW_TOKEN || '';
const appHost = process.env.NEXT_PUBLIC_CONTENTSTACK_APP_HOST || 'app.contentstack.com';
const previewHost = process.env.NEXT_PUBLIC_CONTENTSTACK_PREVIEW_HOST || REGION_PREVIEW_HOST[region] || REGION_PREVIEW_HOST.US;
export const isLivePreviewEnabled = process.env.NEXT_PUBLIC_CONTENTSTACK_LIVE_PREVIEW === 'true';

// Build Stack config
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stackConfig: any = {
  api_key: apiKey,
  delivery_token: deliveryToken,
  environment,
  branch: 'main',
  live_preview: isLivePreviewEnabled
    ? {
        preview_token: previewToken,
        enable: true,
        host: previewHost,
      }
    : { enable: false },
};

// Set region
if (region === 'EU') {
  stackConfig.region = Contentstack.Region.EU;
} else if (region === 'AZURE_NA') {
  stackConfig.region = (Contentstack.Region as any).AZURE_NA;
} else if (region === 'AZURE_EU') {
  stackConfig.region = (Contentstack.Region as any).AZURE_EU;
}

// Create Stack synchronously at module load time
export const stack = Contentstack.Stack(stackConfig);

// Initialize Live Preview + Visual Builder synchronously at module load time
// Match SewnThrone pattern: only check window + isLivePreviewEnabled (no extra guards)
if (typeof window !== 'undefined' && isLivePreviewEnabled) {
  console.log('[CS-SDK] Initializing Live Preview...', {
    hasApiKey: !!apiKey,
    hasPreviewToken: !!previewToken,
    hasDeliveryToken: !!deliveryToken,
    environment,
    region,
    appHost,
    previewHost,
  });

  ContentstackLivePreview.init({
    ssr: false,
    enable: true,
    mode: 'builder',
    stackSdk: stack,
    clientUrlParams: {
      host: appHost,
    },
    stackDetails: {
      apiKey,
      environment,
    },
    editButton: {
      enable: true,
      exclude: ['outsideLivePreviewPortal'],
    },
  });

  console.log('[CS-SDK] Live Preview initialized (Visual Builder mode)');
}

// onEntryChange returns a callback UID string for unsubscription
export function onEntryChange(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const callbackUid = ContentstackLivePreview.onEntryChange(callback);
  return () => {
    ContentstackLivePreview.unsubscribeOnEntryChange(callbackUid);
  };
}

/**
 * Helper function to add data-cslp attributes for Visual Builder
 */
export function getEditableProps(
  contentTypeUid: string,
  entryUid: string,
  fieldPath: string,
  locale: string = 'en-us'
) {
  if (!isLivePreviewEnabled) {
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
