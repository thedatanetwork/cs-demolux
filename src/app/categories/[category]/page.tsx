import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { SectionRenderer } from '@/components/blocks';
import { dataService } from '@/lib/data-service';
import { getVariantAliasesFromCookies } from '@/lib/personalize-server';

// Force dynamic rendering - Contentstack credentials not available at build time
export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

// Fallback metadata (used when no CMS entry exists)
const categoryMetadata = {
  'wearable-tech': {
    title: 'Wearable Technology',
    description: 'Revolutionary wearable devices that seamlessly integrate into your lifestyle. From quantum smartwatches to neural fitness bands, discover the future on your wrist.',
    breadcrumb: 'Wearable Tech'
  },
  'technofurniture': {
    title: 'Technofurniture',
    description: 'Smart furniture that adapts to your needs. Experience the perfect fusion of comfort, functionality, and cutting-edge technology in every piece.',
    breadcrumb: 'Technofurniture'
  }
};

export async function generateMetadata(props: CategoryPageProps) {
  const { category } = await props.params;
  const variantAliases = await getVariantAliasesFromCookies();

  // Try to get CMS content first
  try {
    const modularPage = await dataService.getModularCategoryPage(category, variantAliases);
    if (modularPage) {
      return {
        title: modularPage.meta_title || `${modularPage.hero_title} | Demolux`,
        description: modularPage.meta_description || modularPage.hero_description,
      };
    }
  } catch (error) {
    // Fall through to hardcoded fallback
  }

  // Fallback to hardcoded metadata
  const categoryInfo = categoryMetadata[category as keyof typeof categoryMetadata];
  if (!categoryInfo) {
    return {
      title: 'Category Not Found | Demolux',
    };
  }

  return {
    title: `${categoryInfo.title} | Demolux`,
    description: categoryInfo.description,
  };
}

export default async function CategoryPage(props: CategoryPageProps) {
  const { category } = await props.params;
  // Get variant aliases from cookies (for personalization without flicker)
  const variantAliases = await getVariantAliasesFromCookies();

  // Fetch all data with personalization
  const [products, navigation, siteSettings, modularPage] = await Promise.all([
    dataService.getProducts(category, variantAliases),
    dataService.getNavigationMenus(),
    dataService.getSiteSettings(),
    dataService.getModularCategoryPage(category, variantAliases).catch(() => null)
  ]);

  // Determine hero content (CMS or fallback)
  const fallbackInfo = categoryMetadata[category as keyof typeof categoryMetadata];

  if (!modularPage && !fallbackInfo) {
    notFound();
  }

  // Use CMS content when available, otherwise use hardcoded fallback
  const heroTitle = modularPage?.hero_title || fallbackInfo?.title || 'Category';
  const heroDescription = modularPage?.hero_description || fallbackInfo?.description || '';
  const heroBadge = modularPage?.hero_badge_text || fallbackInfo?.breadcrumb || '';

  // Products display configuration from CMS (with defaults)
  const productsConfig = modularPage?.products_display || {
    layout: 'grid',
    items_per_row: 4,
    enable_filtering: false,
    enable_sorting: false
  };

  // Grid columns based on items_per_row
  const gridColsClass = {
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4'
  }[productsConfig.items_per_row] || 'lg:grid-cols-4';

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

  return (
    <div className="min-h-screen bg-white">
      <Header
        navigation={navigation}
        siteName={fallbackSiteSettings.site_name}
        logoUrl={fallbackSiteSettings.logo?.url}
      />

      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-black/20"></div>

          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-32 h-32 bg-gold-400 rounded-full opacity-10 animate-float"></div>
            <div className="absolute top-40 right-20 w-20 h-20 bg-white rounded-full opacity-5 animate-float" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-gold-400 rounded-full opacity-8 animate-float" style={{ animationDelay: '4s' }}></div>
            <div className="absolute bottom-40 right-1/3 w-16 h-16 bg-white rounded-full opacity-10 animate-float" style={{ animationDelay: '1s' }}></div>
          </div>

          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>

          <div className="relative container-padding section-spacing">
            <div className="max-w-5xl mx-auto text-center">
              {/* Badge */}
              {heroBadge && (
                <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
                  <div className="w-2 h-2 bg-gold-400 rounded-full"></div>
                  <span className="text-sm font-medium text-white/90">
                    {heroBadge}
                  </span>
                </div>
              )}

              <h1 className="font-heading text-4xl md:text-7xl font-bold mb-8 text-white">
                {heroTitle.split(' ').map((word, index) => (
                  <span key={index} className={index === heroTitle.split(' ').length - 1 ? 'text-gradient bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent' : ''}>
                    {word}{index < heroTitle.split(' ').length - 1 ? ' ' : ''}
                  </span>
                ))}
              </h1>

              <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-4xl mx-auto font-light">
                {heroDescription}
              </p>

              {/* Decorative Line */}
              <div className="mt-12 flex justify-center">
                <div className="w-32 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="section-spacing bg-white">
          <div className="container-padding">
            {/* Products Grid */}
            {products.length > 0 ? (
              <div className={`grid grid-cols-1 md:grid-cols-2 ${gridColsClass} gap-8`}>
                {products.map((product) => (
                  <ProductCard key={product.uid} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600">
                  We&apos;re working on adding products to this category. Check back soon!
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Modular Sections - Rendered AFTER products */}
        {modularPage?.page_sections && modularPage.page_sections.length > 0 && (
          <SectionRenderer
            sections={modularPage.page_sections}
            entry={modularPage}
            fieldPath="page_sections"
          />
        )}
      </main>

      <Footer navigation={navigation} siteSettings={fallbackSiteSettings} />
    </div>
  );
}
