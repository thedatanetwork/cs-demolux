import Link from 'next/link';
import { Home, ShoppingBag, BookOpen, ArrowLeft, Watch, Sofa } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { dataService } from '@/lib/data-service';
import { ProductCard } from '@/components/product/ProductCard';

export default async function NotFound() {
  // Fetch navigation, site settings, and featured products
  const [navigation, siteSettings, featuredProducts] = await Promise.all([
    dataService.getNavigationMenus(),
    dataService.getSiteSettingsWithFallback(),
    dataService.getFeaturedProducts(3),
  ]);

  const logoUrl = siteSettings.logo?.url;

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        navigation={navigation}
        siteName={siteSettings.site_name || 'Demolux'}
        logoUrl={logoUrl}
      />

      <main className="flex-1 relative">
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-black"></div>

        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }}
          ></div>
        </div>

        {/* Gold ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold-500/10 rounded-full blur-3xl"></div>

        {/* Content */}
        <div className="relative min-h-[70vh] flex items-center justify-center px-6 py-24">
          <div className="text-center max-w-2xl mx-auto">
            {/* 404 Number */}
            <div className="mb-8">
              <span className="text-[150px] md:text-[200px] font-heading font-bold leading-none bg-gradient-to-b from-gold-400 to-gold-600 bg-clip-text text-transparent">
                404
              </span>
            </div>

            {/* Message */}
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
              Page Not Found
            </h1>
            <p className="text-gray-400 text-lg mb-12 max-w-md mx-auto">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
              Let&apos;s get you back on track.
            </p>

            {/* Quick Navigation */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mb-8">
              <Link
                href="/"
                className="group flex flex-col items-center p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 hover:border-gold-500/30 transition-all duration-300"
              >
                <Home className="w-5 h-5 text-gold-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-white text-sm font-medium">Home</span>
              </Link>

              <Link
                href="/products"
                className="group flex flex-col items-center p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 hover:border-gold-500/30 transition-all duration-300"
              >
                <ShoppingBag className="w-5 h-5 text-gold-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-white text-sm font-medium">All Products</span>
              </Link>

              <Link
                href="/categories/wearable-tech"
                className="group flex flex-col items-center p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 hover:border-gold-500/30 transition-all duration-300"
              >
                <Watch className="w-5 h-5 text-gold-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-white text-sm font-medium">Wearables</span>
              </Link>

              <Link
                href="/categories/technofurniture"
                className="group flex flex-col items-center p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 hover:border-gold-500/30 transition-all duration-300"
              >
                <Sofa className="w-5 h-5 text-gold-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-white text-sm font-medium">Furniture</span>
              </Link>
            </div>

            {/* Blog Link */}
            <Link
              href="/blog"
              className="inline-flex items-center space-x-2 text-gray-400 hover:text-gold-400 transition-colors mb-8"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse our blog</span>
            </Link>
          </div>
        </div>

        {/* Featured Products Section */}
        {featuredProducts.length > 0 && (
          <div className="relative px-6 pb-24">
            <div className="max-w-6xl mx-auto">
              <h2 className="font-heading text-2xl font-bold text-white text-center mb-8">
                Discover Our <span className="text-gold-400">Featured Products</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.uid} product={product} />
                ))}
              </div>
              <div className="text-center mt-8">
                <Link
                  href="/products"
                  className="inline-flex items-center space-x-2 bg-gold-500 hover:bg-gold-600 text-black font-medium px-6 py-3 rounded-lg transition-colors"
                >
                  <span>View All Products</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer navigation={navigation} siteSettings={siteSettings} />
    </div>
  );
}
