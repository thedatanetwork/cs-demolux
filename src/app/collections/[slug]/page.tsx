import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { SectionRenderer } from '@/components/blocks';
import { dataService } from '@/lib/data-service';
import { getVariantAliasesFromCookies } from '@/lib/personalize-server';
import Image from 'next/image';

// Force dynamic rendering - Contentstack credentials not available at build time
export const dynamic = 'force-dynamic';

interface CollectionPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: CollectionPageProps) {
  const variantAliases = await getVariantAliasesFromCookies();
  const collection = await dataService.getCollectionBySlug(params.slug, variantAliases);

  if (!collection) {
    return {
      title: 'Collection Not Found | Demolux',
    };
  }

  return {
    title: `${collection.meta_title || collection.title} | Demolux`,
    description: collection.meta_description || collection.description,
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const variantAliases = await getVariantAliasesFromCookies();

  // Fetch collection and site data
  const [collection, navigation, siteSettings] = await Promise.all([
    dataService.getCollectionBySlug(params.slug, variantAliases),
    dataService.getNavigationMenus(),
    dataService.getSiteSettings(),
  ]);

  if (!collection) {
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

  const featuredImage = Array.isArray(collection.featured_image)
    ? collection.featured_image[0]
    : collection.featured_image;

  const collectionTypeLabels: Record<string, string> = {
    seasonal: 'Seasonal Collection',
    curated: 'Curated Selection',
    new_arrivals: 'New Arrivals',
    best_sellers: 'Best Sellers',
    limited_edition: 'Limited Edition',
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        navigation={navigation}
        siteName={fallbackSiteSettings.site_name}
        logoUrl={fallbackSiteSettings.logo?.url}
      />

      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden min-h-[60vh] flex items-center">
          {/* Background Image */}
          {featuredImage?.url && (
            <>
              <div className="absolute inset-0">
                <Image
                  src={featuredImage.url}
                  alt={featuredImage.title || collection.title}
                  fill
                  className="object-cover opacity-30"
                  priority
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            </>
          )}

          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                backgroundSize: '40px 40px',
              }}
            ></div>
          </div>

          <div className="relative container-padding w-full">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              {collection.collection_type && (
                <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
                  <div className="w-2 h-2 bg-gold-400 rounded-full"></div>
                  <span className="text-sm font-medium text-white/90">
                    {collectionTypeLabels[collection.collection_type] || collection.collection_type}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className="font-heading text-5xl md:text-7xl font-bold mb-8 text-white">
                {collection.title}
              </h1>

              {/* Description */}
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto font-light mb-8">
                {collection.description}
              </p>

              {/* Product Count */}
              {collection.products && collection.products.length > 0 && (
                <p className="text-white/70 text-lg">
                  {collection.products.length}{' '}
                  {collection.products.length === 1 ? 'Product' : 'Products'}
                </p>
              )}

              {/* Decorative Line */}
              <div className="mt-8 flex justify-center">
                <div className="w-32 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        {collection.products && collection.products.length > 0 && (
          <section className="section-spacing bg-white">
            <div className="container-padding">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {collection.products.map((product) => (
                  <ProductCard key={product.uid} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Empty State */}
        {(!collection.products || collection.products.length === 0) && (
          <section className="section-spacing bg-gray-50">
            <div className="container-padding text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="h-8 w-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No products in this collection yet
                </h3>
                <p className="text-gray-600">
                  Products will be added to this collection soon. Check back later!
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
