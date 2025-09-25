import { HeroSection } from '@/components/home/HeroSection';
import { ProductCard } from '@/components/product/ProductCard';
import { BlogCard } from '@/components/blog/BlogCard';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { dataService } from '@/lib/data-service';
import Link from 'next/link';
import { ArrowRight, Sparkles, Users, Globe } from 'lucide-react';

export default async function HomePage() {
  // Fetch data for the homepage
  const [
    featuredProducts,
    recentBlogPosts,
    navigation,
    siteSettings
  ] = await Promise.all([
    dataService.getFeaturedProducts(4),
    dataService.getRecentBlogPosts(3),
    dataService.getNavigationMenus(),
    dataService.getSiteSettings()
  ]);

  if (!siteSettings) {
    return <div>Error loading site settings</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header 
        navigation={navigation}
        siteName={siteSettings.site_name}
        logoUrl={siteSettings.logo?.url}
      />

      <main>
        {/* Hero Section */}
        <HeroSection />

        {/* Featured Products Section */}
        <section className="section-spacing bg-white">
          <div className="container-padding">
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Featured Products
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Discover our latest innovations in wearable technology and technofurniture, 
                each designed to elevate your lifestyle with premium functionality and style.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {featuredProducts.map((product) => (
                <ProductCard key={product.uid} product={product} />
              ))}
            </div>

            <div className="text-center">
              <Link href="/categories/wearable-tech">
                <Button variant="outline" size="lg" className="mr-4">
                  View Wearable Tech
                </Button>
              </Link>
              <Link href="/categories/technofurniture">
                <Button variant="outline" size="lg">
                  View Technofurniture
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Brand Values Section */}
        <section className="section-spacing bg-gray-50">
          <div className="container-padding">
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                The Demolux Difference
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                We don't just create products—we craft experiences that seamlessly blend innovation, 
                luxury, and functionality for the modern lifestyle.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gold-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="h-8 w-8 text-gray-900" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-gray-900 mb-4">
                  Innovation First
                </h3>
                <p className="text-gray-600">
                  We pioneer breakthrough technologies that redefine what's possible, 
                  from quantum processors to neural interfaces.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gold-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-gray-900" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-gray-900 mb-4">
                  Human-Centered Design
                </h3>
                <p className="text-gray-600">
                  Every product is designed with the user at the center, ensuring intuitive 
                  experiences that enhance daily life naturally.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gold-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Globe className="h-8 w-8 text-gray-900" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-gray-900 mb-4">
                  Sustainable Luxury
                </h3>
                <p className="text-gray-600">
                  Premium quality doesn't compromise our planet. We use sustainable materials 
                  and responsible manufacturing processes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Section */}
        {recentBlogPosts.length > 0 && (
          <section className="section-spacing bg-white">
            <div className="container-padding">
              <div className="flex justify-between items-end mb-12">
                <div>
                  <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Latest Insights
                  </h2>
                  <p className="text-lg text-gray-600 max-w-2xl">
                    Stay informed about the latest trends, innovations, and insights 
                    in technology and design.
                  </p>
                </div>
                <Link href="/blog" className="hidden md:block">
                  <Button variant="outline" className="group">
                    View All Posts
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                {recentBlogPosts.map((post) => (
                  <BlogCard key={post.uid} post={post} />
                ))}
              </div>

              <div className="text-center md:hidden">
                <Link href="/blog">
                  <Button variant="outline">
                    View All Posts
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="section-spacing bg-gray-900 text-white">
          <div className="container-padding text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Ready to Experience the Future?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Join thousands of innovators who have already transformed their lives 
              with Demolux premium technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/categories/wearable-tech">
                <Button variant="gold" size="lg" className="group">
                  Shop Wearable Tech
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </Link>
              <Link href="/categories/technofurniture">
                <Button variant="outline" size="lg" className="border-gray-300 text-gray-300 hover:bg-white hover:text-gray-900">
                  Explore Technofurniture
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer navigation={navigation} siteSettings={siteSettings} />
    </div>
  );
}
