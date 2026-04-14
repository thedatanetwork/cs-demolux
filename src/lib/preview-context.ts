/**
 * Per-request preview stack management for Visual Builder SSR mode.
 *
 * When Visual Builder reloads the iframe with live_preview query params,
 * the server must create a fresh Contentstack stack configured with
 * livePreviewQuery() to fetch the exact draft being edited.
 *
 * Uses React cache() to scope the preview stack to the current server
 * request, avoiding cross-session data leakage between concurrent requests.
 */
import { cache } from 'react';
import Contentstack from 'contentstack';

const REGION_PREVIEW_HOST: Record<string, string> = {
  US: 'rest-preview.contentstack.com',
  EU: 'eu-rest-preview.contentstack.com',
  AZURE_NA: 'azure-na-rest-preview.contentstack.com',
  AZURE_EU: 'azure-eu-rest-preview.contentstack.com',
  GCP_NA: 'gcp-na-rest-preview.contentstack.com',
};

/**
 * Per-request storage for the preview stack.
 * React cache() ensures each server render gets its own instance.
 */
const getPreviewContext = cache(() => ({
  stack: null as ReturnType<typeof Contentstack.Stack> | null,
}));

/**
 * Configure live preview for the current server request.
 * Call this in page components BEFORE any data fetching.
 *
 * When live_preview query params are present (sent by Visual Builder),
 * creates a fresh stack and calls livePreviewQuery() so the SDK
 * fetches the exact draft version being edited.
 */
export function configurePreview(searchParams: Record<string, string>) {
  if (!searchParams?.live_preview) return;

  const region = process.env.CONTENTSTACK_REGION || 'US';
  const previewHost =
    process.env.CONTENTSTACK_PREVIEW_HOST ||
    REGION_PREVIEW_HOST[region] ||
    REGION_PREVIEW_HOST.US;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stackConfig: any = {
    api_key: process.env.CONTENTSTACK_API_KEY,
    delivery_token: process.env.CONTENTSTACK_DELIVERY_TOKEN,
    environment: process.env.CONTENTSTACK_ENVIRONMENT || 'dev',
    live_preview: {
      preview_token: process.env.CONTENTSTACK_PREVIEW_TOKEN,
      enable: true,
      host: previewHost,
    },
  };

  if (region === 'EU') {
    stackConfig.region = Contentstack.Region.EU;
  } else if (region === 'AZURE_NA') {
    stackConfig.region = (Contentstack.Region as Record<string, unknown>).AZURE_NA;
  } else if (region === 'AZURE_EU') {
    stackConfig.region = (Contentstack.Region as Record<string, unknown>).AZURE_EU;
  }

  const stack = Contentstack.Stack(stackConfig);
  // Cast searchParams — Visual Builder sends live_preview, content_type_uid, etc. as query params
  stack.livePreviewQuery(searchParams as unknown as Contentstack.LivePreviewQuery);
  getPreviewContext().stack = stack;
}

/**
 * Get the preview stack for the current request, if any.
 * Returns null when not in a live preview context.
 */
export function getPreviewStack(): ReturnType<typeof Contentstack.Stack> | null {
  try {
    return getPreviewContext().stack;
  } catch {
    // cache() throws outside React server component rendering (e.g., API routes)
    return null;
  }
}
