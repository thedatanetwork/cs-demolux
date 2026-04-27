import { dataService } from '@/lib/data-service';
import { getVariantAliasesFromCookies } from '@/lib/personalize-server';
import { configurePreview } from '@/lib/preview-context';
import { HeroSevenBlock } from '@/components/blocks/HeroSevenBlock';

export const dynamic = 'force-dynamic';

export default async function HeroSevenPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  configurePreview(await searchParams);

  const variantAliases = await getVariantAliasesFromCookies();

  let pageHeading = 'Hero 7 Layout';
  let pageSubheading: string | undefined;
  let banners: any[] = [];
  let fetchError: string | null = null;

  try {
    const page = await dataService.getHeroSevenPage(variantAliases);
    if (page) {
      pageHeading = page.heading || pageHeading;
      pageSubheading = page.subheading;
      banners = page.hero_banners || [];
    }
  } catch (error: any) {
    fetchError = error.message || 'Failed to fetch hero_seven_page';
    console.error('Hero 7 fetch error:', error);
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-900 text-white">
        <div className="container-padding py-12 md:py-16">
          <div className="max-w-4xl">
            <div className="inline-flex items-center space-x-2 bg-gold-400/20 rounded-full px-4 py-1.5 mb-4">
              <div className="w-1.5 h-1.5 bg-gold-400 rounded-full"></div>
              <span className="text-xs font-semibold text-gold-400 uppercase tracking-wider">
                Hero 7 Demo
              </span>
            </div>
            <h1 className="font-heading text-3xl md:text-5xl font-bold mb-4">{pageHeading}</h1>
            {pageSubheading && <p className="text-base md:text-lg text-gray-300">{pageSubheading}</p>}
            {fetchError && (
              <div className="mt-4 bg-red-500/20 border border-red-500/40 rounded-lg p-3">
                <p className="text-red-300 text-sm">{fetchError}</p>
                <p className="text-red-400 text-xs mt-1">
                  Run <code className="bg-white/10 px-1 rounded">cd scripts && npm run setup-hero-seven</code>
                </p>
              </div>
            )}
            {!fetchError && banners.length === 0 && (
              <div className="mt-4 bg-white/5 border border-white/10 rounded-lg p-3">
                <p className="text-sm">No banner configured. Run <code className="bg-white/10 px-1 rounded">npm run setup-hero-seven</code></p>
              </div>
            )}
          </div>
        </div>
      </div>

      {banners.map((banner, i) => (
        <HeroSevenBlock key={banner.uid || i} block={banner} />
      ))}
    </div>
  );
}
