import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SectionRenderer } from '@/components/blocks';
import { ProductCard } from '@/components/product/ProductCard';
import { dataService } from '@/lib/data-service';
import { getVariantAliasesFromCookies } from '@/lib/personalize-server';
import Image from 'next/image';

// Force dynamic rendering - Contentstack credentials not available at build time
export const dynamic = 'force-dynamic';

interface LookbookPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata(props: LookbookPageProps) {
  const { slug } = await props.params;
  const variantAliases = await getVariantAliasesFromCookies();
  const lookbook = await dataService.getLookbookBySlug(slug, variantAliases);

  if (!lookbook) {
    return {
      title: 'Lookbook Not Found | Demolux',
    };
  }

  return {
    title: `${lookbook.meta_title || lookbook.title} | Demolux`,
    description: lookbook.meta_description || lookbook.description,
  };
}

export default async function LookbookPage(props: LookbookPageProps) {
  const { slug } = await props.params;
  const variantAliases = await getVariantAliasesFromCookies();

  // Fetch lookbook and site data
  const [lookbook, navigation, siteSettings] = await Promise.all([
    dataService.getLookbookBySlug(slug, variantAliases),
    dataService.getNavigationMenus(),
    dataService.getSiteSettings(),
  ]);

  if (!lookbook) {
    notFound();
  }

  // Fallback to default settings
  const fallbackSiteSettings = siteSettings || {
    uid: 'fallback',
    site_name: 'Demolux',
    tagline: 'Premium Wearable Tech & Technofurniture',
    logo: undefined,
    contact_info: undefined,
    social_links: undefined,
    seo: undefined,
  };

  const featuredImage = Array.isArray(lookbook.featured_image)
    ? lookbook.featured_image[0]
    : lookbook.featured_image;

  return (
    <div className="min-h-screen bg-white">
      <Header
        navigation={navigation}
        siteName={fallbackSiteSettings.site_name}
        logoUrl={fallbackSiteSettings.logo?.url}
      />

      <main>
        {/* Hero Section */}
        <section className="relative bg-black text-white overflow-hidden min-h-screen flex items-center">
          {/* Background Image */}
          {featuredImage?.url && (
            <>
              <div className="absolute inset-0">
                <Image
                  src={featuredImage.url}
                  alt={featuredImage.title || lookbook.title}
                  fill
                  className="object-cover opacity-40"
                  priority
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80"></div>
            </>
          )}

          <div className="relative container-padding w-full">
            <div className="max-w-5xl mx-auto text-center">
              {/* Season Badge */}
              {lookbook.season && (
                <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
                  <div className="w-2 h-2 bg-gold-400 rounded-full"></div>
                  <span className="text-sm font-medium text-white uppercase tracking-wider">
                    {lookbook.season}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className="font-heading text-6xl md:text-8xl font-bold mb-8 text-white">
                {lookbook.title}
              </h1>

              {/* Description */}
              <p className="text-2xl md:text-3xl text-white/90 leading-relaxed max-w-3xl mx-auto font-light">
                {lookbook.description}
              </p>

              {/* Decorative Line */}
              <div className="mt-12 flex justify-center">
                <div className="w-32 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent"></div>
              </div>

              {/* Scroll Indicator */}
              <div className="mt-16 animate-bounce">
                <svg
                  className="h-8 w-8 mx-auto text-white/60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Modular Sections */}
        {lookbook.page_sections && lookbook.page_sections.length > 0 && (
          <SectionRenderer sections={lookbook.page_sections} />
        )}

        {/* Featured Products Section */}
        {lookbook.products && lookbook.products.length > 0 && (
          <section className="section-spacing bg-gray-50">
            <div className="container-padding">
              {/* Section Header */}
              <div className="text-center mb-16">
                <div className="inline-flex items-center space-x-2 bg-white backdrop-blur-sm rounded-full px-6 py-3 mb-8 shadow-lg">
                  <div className="w-2 h-2 bg-gold-400 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">Featured Products</span>
                </div>

                <h2 className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Shop the{' '}
                  <span className="text-gradient bg-gradient-to-r from-gold-600 to-gold-400 bg-clip-text text-transparent">
                    Look
                  </span>
                </h2>

                <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Discover the products featured in this lookbook
                </p>

                {/* Decorative Line */}
                <div className="mt-8 flex justify-center">
                  <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent"></div>
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {lookbook.products.map((product) => (
                  <ProductCard key={product.uid} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer navigation={navigation} siteSettings={fallbackSiteSettings} />
    </div>
  );
}
