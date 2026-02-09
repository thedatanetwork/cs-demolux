import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { dataService } from '@/lib/data-service';
import { getVariantAliasesFromCookies } from '@/lib/personalize-server';
import { Metadata } from 'next';

// Force dynamic rendering - Contentstack credentials not available at build time
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'All Products | Demolux',
  description: 'Explore our complete collection of luxury wearable technology and technofurniture. Discover innovation, design, and craftsmanship in every piece.',
};

export default async function ProductsPage() {
  // Get variant aliases from cookies (for personalization without flicker)
  const variantAliases = await getVariantAliasesFromCookies();

  // Fetch all products (no category filter)
  const [products, navigation, siteSettings] = await Promise.all([
    dataService.getProducts(undefined, variantAliases), // undefined = all products
    dataService.getNavigationMenus(),
    dataService.getSiteSettings()
  ]);

  console.log('All Products Page:', {
    totalProducts: products.length,
    categories: Array.from(new Set(products.map(p => p.category))),
    products: products.map(p => ({ uid: p.uid, title: p.title, category: p.category }))
  });

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

  // Group products by category for display
  const wearableTech = products.filter(p => p.category === 'wearable-tech');
  const technofurniture = products.filter(p => p.category === 'technofurniture');

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
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
                <div className="w-2 h-2 bg-gold-400 rounded-full"></div>
                <span className="text-sm font-medium text-white/90">
                  Complete Collection
                </span>
              </div>

              <h1 className="font-heading text-4xl md:text-7xl font-bold mb-8 text-white">
                All <span className="text-gradient bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">Products</span>
              </h1>

              <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-4xl mx-auto font-light">
                Explore our complete collection of luxury wearable technology and technofurniture. Each piece represents the pinnacle of design, innovation, and craftsmanship.
              </p>

              {/* Decorative Line */}
              <div className="mt-12 flex justify-center">
                <div className="w-32 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent"></div>
              </div>
            </div>
          </div>
        </section>

        {/* All Products Section */}
        <section className="section-spacing bg-white">
          <div className="container-padding">
            {products.length > 0 ? (
              <div className="space-y-20">
                {/* Wearable Tech Section */}
                {wearableTech.length > 0 && (
                  <div>
                    <div className="mb-12">
                      <div className="inline-flex items-center space-x-2 bg-gray-50 rounded-full px-6 py-3 mb-6">
                        <div className="w-2 h-2 bg-gold-400 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-900">
                          Wearable Technology
                        </span>
                      </div>
                      <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Wearable <span className="text-gradient bg-gradient-to-r from-gold-600 to-gold-400 bg-clip-text text-transparent">Tech</span>
                      </h2>
                      <p className="text-lg text-gray-600 max-w-3xl">
                        Revolutionary wearable devices that seamlessly integrate into your lifestyle.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                      {wearableTech.map((product) => (
                        <ProductCard key={product.uid} product={product} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Technofurniture Section */}
                {technofurniture.length > 0 && (
                  <div>
                    <div className="mb-12">
                      <div className="inline-flex items-center space-x-2 bg-gray-50 rounded-full px-6 py-3 mb-6">
                        <div className="w-2 h-2 bg-gold-400 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-900">
                          Smart Furniture
                        </span>
                      </div>
                      <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Techno<span className="text-gradient bg-gradient-to-r from-gold-600 to-gold-400 bg-clip-text text-transparent">furniture</span>
                      </h2>
                      <p className="text-lg text-gray-600 max-w-3xl">
                        Smart furniture that adapts to your needs with cutting-edge technology.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                      {technofurniture.map((product) => (
                        <ProductCard key={product.uid} product={product} />
                      ))}
                    </div>
                  </div>
                )}
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
                  We're working on adding products to our collection. Check back soon!
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Call to Action */}
        <section className="section-spacing bg-gradient-to-r from-gold-400 to-gold-600 text-black">
          <div className="container-padding">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
                Can't Decide? We're Here to Help
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Our team can help you find the perfect piece for your lifestyle.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/about"
                  className="inline-flex items-center justify-center px-8 py-3 border border-black bg-black text-white hover:bg-gray-900 transition-colors font-medium rounded-md"
                >
                  Learn More About Us
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-3 border border-black bg-transparent text-black hover:bg-black hover:text-white transition-colors font-medium rounded-md"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer navigation={navigation} siteSettings={fallbackSiteSettings} />
    </div>
  );
}
