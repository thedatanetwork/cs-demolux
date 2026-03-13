import { dataService } from '@/lib/data-service';
import { getVariantAliasesFromCookies } from '@/lib/personalize-server';
import { convertDropdownFeedEntry } from '@/lib/rule-engine';
import type { DynamicProductFeedConfig } from '@/lib/rule-engine';
import { DynamicFeedsClient } from '../dynamic-feeds/DynamicFeedsClient';

export const dynamic = 'force-dynamic';

export default async function DynamicFeedsDropdownPage() {
  const variantAliases = await getVariantAliasesFromCookies();

  let feedConfigs: DynamicProductFeedConfig[] = [];
  let fetchError: string | null = null;
  let pageHeading = 'Merchandising Rule Engine';
  let pageSubheading: string | undefined;

  try {
    const page = await dataService.getDynamicFeedsDropdownPage(variantAliases);

    if (page) {
      pageHeading = page.heading || pageHeading;
      pageSubheading = page.subheading;

      // Render in the same order as the CMS editor UI (top-to-bottom)
      const cmsEntries = page.component_list || [];
      feedConfigs = cmsEntries.map(convertDropdownFeedEntry);
    }
  } catch (error: any) {
    fetchError = error.message || 'Failed to fetch dropdown feeds from Contentstack';
    console.error('Dropdown feeds fetch error:', error);
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
