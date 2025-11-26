import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SectionRenderer } from '@/components/blocks';
import { dataService } from '@/lib/data-service';
import { getVariantAliasesFromCookies } from '@/lib/personalize-server';

export const metadata = {
  title: 'Home | Demolux',
  description: 'Experience the future of luxury technology with Demolux premium wearable tech and technofurniture.',
};

export default async function HomePage() {
  // Get variant aliases from cookies (for personalization without flicker)
  const variantAliases = await getVariantAliasesFromCookies();

  // Fetch modular home page and site settings
  const [modularHomePage, navigation, siteSettings] = await Promise.all([
    dataService.getModularHomePage(variantAliases),
    dataService.getNavigationMenus(),
    dataService.getSiteSettings(),
  ]);

  // Fallback to default settings if Contentstack is not available
  const fallbackSiteSettings = siteSettings || {
    uid: 'fallback',
    site_name: 'Demolux',
    tagline: 'Premium Wearable Tech & Technofurniture',
    logo: undefined,
    contact_info: undefined,
    social_links: undefined,
    seo: undefined,
  };

  console.log('HomePage render:', {
    hasModularHomePage: !!modularHomePage,
    sectionsCount: modularHomePage?.page_sections?.length || 0,
    sections: modularHomePage?.page_sections?.map(s => s.block_type) || []
  });

  return (
    <div className="min-h-screen bg-white">
      <Header
        navigation={navigation}
        siteName={fallbackSiteSettings.site_name}
        logoUrl={fallbackSiteSettings.logo?.url}
      />

      <main>
        {/* Render all modular sections dynamically */}
        {modularHomePage?.page_sections && modularHomePage.page_sections.length > 0 ? (
          <SectionRenderer sections={modularHomePage.page_sections} />
        ) : (
          /* Fallback message if no sections are configured */
          <section className="section-spacing bg-white">
            <div className="container-padding text-center">
              <div className="max-w-2xl mx-auto">
                <h1 className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Welcome to Demolux
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  The modular home page is not yet configured in Contentstack. Please create a
                  <code className="mx-1 px-2 py-1 bg-gray-100 rounded text-sm">modular_home_page</code>
                  content entry with page sections to get started.
                </p>
                <div className="bg-gray-50 rounded-lg p-6 text-left">
                  <h3 className="font-semibold text-gray-900 mb-2">Next Steps:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Create content types in Contentstack using the provided schemas</li>
                    <li>Create a <code className="px-2 py-1 bg-gray-100 rounded text-sm">modular_home_page</code> entry</li>
                    <li>Add page sections (hero, featured content, values, etc.)</li>
                    <li>Publish your changes</li>
                  </ol>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer navigation={navigation} siteSettings={fallbackSiteSettings} />
    </div>
  );
}
