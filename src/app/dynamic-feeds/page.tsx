import { dataService } from '@/lib/data-service';
import { getVariantAliasesFromCookies } from '@/lib/personalize-server';
import { configurePreview } from '@/lib/preview-context';
import { convertCMSFeedEntry } from '@/lib/rule-engine';
import type { DynamicProductFeedConfig } from '@/lib/rule-engine';
import { DynamicFeedsClient } from './DynamicFeedsClient';

export const dynamic = 'force-dynamic';

export default async function DynamicFeedsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  // Configure live preview stack when Visual Builder reloads the iframe
  configurePreview(await searchParams);

  const variantAliases = await getVariantAliasesFromCookies();

  let feedConfigs: DynamicProductFeedConfig[] = [];
  let fetchError: string | null = null;
  let pageHeading = 'Merchandising Rule Engine';
  let pageSubheading: string | undefined;

  try {
    // Fetch the dynamic_feeds_page entry — includes component_list references
    const page = await dataService.getDynamicFeedsPage(variantAliases);

    if (page) {
      pageHeading = page.heading || pageHeading;
      pageSubheading = page.subheading;

      // component_list contains resolved dynamic_product_feed entries
      // Render in the same order as the CMS editor UI (top-to-bottom)
      const cmsEntries = page.component_list || [];
      feedConfigs = cmsEntries.map(convertCMSFeedEntry);
    } else {
      // Fallback: query dynamic_product_feed entries directly
      const cmsEntries = await dataService.getDynamicProductFeeds(variantAliases);
      feedConfigs = cmsEntries.map(convertCMSFeedEntry);
    }
  } catch (error: any) {
    fetchError = error.message || 'Failed to fetch dynamic feeds from Contentstack';
    console.error('Dynamic feeds fetch error:', error);
  }

  return (
    <DynamicFeedsClient
      feedConfigs={feedConfigs}
      fetchError={fetchError}
      pageHeading={pageHeading}
      pageSubheading={pageSubheading}
    />
  );
}
