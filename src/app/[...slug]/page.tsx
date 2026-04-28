import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SectionRenderer } from '@/components/blocks';
import { dataService } from '@/lib/data-service';
import { getVariantAliasesFromCookies } from '@/lib/personalize-server';
import { configurePreview } from '@/lib/preview-context';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<Record<string, string>>;
}

function buildUrl(slug: string[]): string {
  return '/' + slug.map(encodeURIComponent).join('/');
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const url = buildUrl(slug);
  const page = await dataService.getComposablePageByUrl(url);
  if (!page) return {};
  return {
    title: `${page.title} | Demolux`,
  };
}

export default async function ComposableCatchAllPage({ params, searchParams }: PageProps) {
  configurePreview(await searchParams);

  const { slug } = await params;
  const url = buildUrl(slug);

  const variantAliases = await getVariantAliasesFromCookies();

  const [page, navigation, siteSettings] = await Promise.all([
    dataService.getComposablePageByUrl(url, variantAliases),
    dataService.getNavigationMenus(),
    dataService.getSiteSettings(),
  ]);

  if (!page) {
    notFound();
  }

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
        {page.page_sections && page.page_sections.length > 0 ? (
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
                  {page.title}
                </h1>
                <p className="text-lg text-gray-600">
                  This page has no sections yet. Add blocks in Contentstack.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer navigation={navigation} siteSettings={fallbackSiteSettings} />
    </div>
  );
}
