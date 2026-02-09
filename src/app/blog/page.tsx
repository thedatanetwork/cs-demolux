import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SectionRenderer } from '@/components/blocks';
import { dataService } from '@/lib/data-service';
import { getVariantAliasesFromCookies } from '@/lib/personalize-server';

// Force dynamic rendering - Contentstack credentials not available at build time
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Blog | Demolux',
  description: 'Stay informed about the latest trends, innovations, and insights in wearable technologies and technofurniture.',
};

export default async function BlogPage() {
  // Get variant aliases from cookies (for personalization without flicker)
  const variantAliases = await getVariantAliasesFromCookies();

  // Fetch modular blog page and site settings
  const [blogPage, navigation, siteSettings] = await Promise.all([
    dataService.getBlogPage(variantAliases),
    dataService.getNavigationMenus(),
    dataService.getSiteSettings()
  ]);

  // Fallback to default settings if Contentstack is not available
  const fallbackSiteSettings = siteSettings || {
    uid: 'fallback',
    site_name: 'Demolux',
    tagline: 'Premium Wearable Tech & Technofurniture',
    logo: undefined,
    contact_info: undefined,
    social_links: undefined,
    seo: undefined
  };

  console.log('Blog Page render:', {
    hasBlogPage: !!blogPage,
    sectionsCount: blogPage?.page_sections?.length || 0,
    sections: blogPage?.page_sections?.map(s => s.block_type) || []
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
        {blogPage?.page_sections && blogPage.page_sections.length > 0 ? (
          <SectionRenderer sections={blogPage.page_sections} />
        ) : (
          /* Fallback message if no sections are configured */
          <section className="section-spacing bg-white">
            <div className="container-padding text-center">
              <div className="max-w-2xl mx-auto">
                <h1 className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Blog
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  The blog page is not yet configured in Contentstack. Please create a
                  <code className="mx-1 px-2 py-1 bg-gray-100 rounded text-sm">blog_page</code>
                  content entry with page sections to get started.
                </p>
                <div className="bg-gray-50 rounded-lg p-6 text-left">
                  <h3 className="font-semibold text-gray-900 mb-2">Next Steps:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Create a <code className="px-2 py-1 bg-gray-100 rounded text-sm">blog_page</code> entry in Contentstack</li>
                    <li>Add page sections (hero, blog posts grid, newsletter CTA, etc.)</li>
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
