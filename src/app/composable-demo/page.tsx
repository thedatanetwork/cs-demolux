import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SectionRenderer } from '@/components/blocks';
import { dataService } from '@/lib/data-service';
import { getVariantAliasesFromCookies } from '@/lib/personalize-server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Composable Page Demo | Demolux',
  description: 'Demonstrates dynamic product feed blocks composed alongside traditional CMS blocks on a single modular page.',
};

export default async function ComposableDemoPage() {
  const variantAliases = await getVariantAliasesFromCookies();

  const [page, navigation, siteSettings] = await Promise.all([
    dataService.getComposablePage(variantAliases),
    dataService.getNavigationMenus(),
    dataService.getSiteSettings(),
  ]);

  const fallbackSiteSettings = siteSettings || {
    uid: 'fallback',
    site_name: 'Demolux',
    tagline: 'Premium Wearable Tech & Technofurniture',
    logo: undefined,
    contact_info: undefined,
    social_links: undefined,
    seo: undefined,
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        navigation={navigation}
        siteName={fallbackSiteSettings.site_name}
        logoUrl={fallbackSiteSettings.logo?.url}
      />

      <main>
        {page?.page_sections && page.page_sections.length > 0 ? (
          <SectionRenderer
            sections={page.page_sections}
            entry={page}
            fieldPath="page_sections"
          />
        ) : (
          <section className="section-spacing bg-white">
            <div className="container-padding text-center">
              <div className="max-w-2xl mx-auto py-24">
                <h1 className="font-heading text-4xl font-bold text-gray-900 mb-6">
                  Composable Page Demo
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  This page is not yet configured in Contentstack. Run the setup script to create it:
                </p>
                <pre className="bg-gray-100 rounded-lg p-4 text-sm text-left">
                  cd scripts && npm run create-composable-demo-page
                </pre>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer navigation={navigation} siteSettings={fallbackSiteSettings} />
    </div>
  );
}
