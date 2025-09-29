import { HeroSection } from '@/components/home/HeroSection';
import { ProductCard } from '@/components/product/ProductCard';
import { BlogCard } from '@/components/blog/BlogCard';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { dataService } from '@/lib/data-service';
import { ValueProposition } from '@/lib/contentstack';
import Link from 'next/link';
import { ArrowRight, Sparkles, Users, Globe } from 'lucide-react';

// Icon mapping for dynamic icon rendering
const iconMap = {
  Sparkles,
  Users,
  Globe
};

export default async function HomePage() {
  // Fetch data for the homepage
  const [
    homePage,
    featuredProducts,
    recentBlogPosts,
    navigation,
    siteSettings
  ] = await Promise.all([
    dataService.getHomePage(),
    dataService.getFeaturedProducts(4),
    dataService.getRecentBlogPosts(3),
    dataService.getNavigationMenus(),
    dataService.getSiteSettings()
  ]);

  // Debug: Check home page data (corrected for single object vs array)
  const heroImage = Array.isArray(homePage?.hero_image) ? homePage.hero_image[0] : homePage?.hero_image;
  console.log('HomePage fetch result (corrected):', {
    hasHomePage: !!homePage,
    homePageUid: homePage?.uid,
    hasHeroImage: !!(heroImage?.url),
    heroImageUrl: heroImage?.url,
    heroImageTitle: heroImage?.title,
    isArray: Array.isArray(homePage?.hero_image),
    rawHeroImageData: homePage?.hero_image
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

  return (
    <div className="min-h-screen bg-white">
      <Header 
        navigation={navigation}
        siteName={fallbackSiteSettings.site_name}
        logoUrl={fallbackSiteSettings.logo?.url}
      />

      <main>
        {/* Hero Section */}
        <HeroSection heroData={homePage || undefined} />

        {/* Featured Products Section */}
        <section className="section-spacing bg-gray-50 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>

          {/* Floating Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-24 h-24 bg-gold-400 rounded-full opacity-5 animate-float"></div>
            <div className="absolute top-40 right-20 w-16 h-16 bg-gray-400 rounded-full opacity-3 animate-float" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-gold-400 rounded-full opacity-4 animate-float" style={{ animationDelay: '4s' }}></div>
            <div className="absolute bottom-40 right-1/3 w-12 h-12 bg-gray-400 rounded-full opacity-5 animate-float" style={{ animationDelay: '1s' }}></div>
          </div>

          <div className="container-padding relative">
            <div className="text-center mb-16">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 mb-8 shadow-lg">
                <div className="w-2 h-2 bg-gold-400 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">
                  Premium Collection
                </span>
              </div>

              <h2 className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {homePage?.featured_section_title?.split(' ').map((word, index) => (
                  <span key={index} className={index === (homePage?.featured_section_title?.split(' ').length || 0) - 1 ? 'text-gradient bg-gradient-to-r from-gold-600 to-gold-400 bg-clip-text text-transparent' : ''}>
                    {word}{index < (homePage?.featured_section_title?.split(' ').length || 0) - 1 ? ' ' : ''}
                  </span>
                )) || (
                  <>Featured <span className="text-gradient bg-gradient-to-r from-gold-600 to-gold-400 bg-clip-text text-transparent">Products</span></>
                )}
              </h2>
              
              <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                {homePage?.featured_section_description || 'Discover our latest innovations in wearable technology and technofurniture, each designed to elevate your lifestyle with premium functionality and style.'}
              </p>

              {/* Decorative Line */}
              <div className="mt-8 flex justify-center">
                <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {featuredProducts.map((product) => (
                <ProductCard key={product.uid} product={product} />
              ))}
            </div>

            <div className="text-center">
              <div className="inline-flex flex-col sm:flex-row gap-4 p-8 bg-white rounded-2xl shadow-xl border border-gray-200 relative">
                {/* Decorative elements */}
                <div className="absolute -top-2 -right-2 w-16 h-16 bg-gold-400 rounded-full opacity-10"></div>
                <div className="absolute -bottom-3 -left-3 w-20 h-20 bg-gray-900 rounded-full opacity-5"></div>
                
                <Link href="/categories/wearable-tech" className="relative z-10">
                  <Button variant="primary" size="lg" className="group">
                    View Wearable Tech
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </Button>
                </Link>
                <Link href="/categories/technofurniture" className="relative z-10">
                  <Button variant="outline" size="lg">
                    View Technofurniture
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Brand Values Section */}
        <section className="section-spacing bg-white relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 opacity-3">
            <div className="absolute top-40 left-20 w-32 h-32 bg-gold-400 rounded-full opacity-20 animate-float"></div>
            <div className="absolute bottom-40 right-20 w-24 h-24 bg-gray-400 rounded-full opacity-15 animate-float" style={{ animationDelay: '3s' }}></div>
          </div>

          <div className="container-padding relative">
            <div className="text-center mb-20">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-gray-50 backdrop-blur-sm rounded-full px-6 py-3 mb-8 shadow-sm">
                <div className="w-2 h-2 bg-gold-400 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">
                  Our Values
                </span>
              </div>

              <h2 className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {homePage?.values_section_title?.split(' ').map((word, index) => (
                  <span key={index} className={index === (homePage?.values_section_title?.split(' ').length || 0) - 1 ? 'text-gradient bg-gradient-to-r from-gold-600 to-gold-400 bg-clip-text text-transparent' : ''}>
                    {word}{index < (homePage?.values_section_title?.split(' ').length || 0) - 1 ? ' ' : ''}
                  </span>
                )) || (
                  <>The Demolux <span className="text-gradient bg-gradient-to-r from-gold-600 to-gold-400 bg-clip-text text-transparent">Difference</span></>
                )}
              </h2>
              
              <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                {homePage?.values_section_description || 'We don\'t just create products—we craft experiences that seamlessly blend innovation, luxury, and functionality for the modern lifestyle.'}
              </p>

              {/* Decorative Line */}
              <div className="mt-8 flex justify-center">
                <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(homePage?.value_propositions || [
                { icon: 'Sparkles', title: 'Innovation First', description: 'We pioneer breakthrough technologies that redefine what\'s possible, from quantum processors to neural interfaces.' },
                { icon: 'Users', title: 'Human-Centered Design', description: 'Every product is designed with the user at the center, ensuring intuitive experiences that enhance daily life naturally.' },
                { icon: 'Globe', title: 'Sustainable Luxury', description: 'Premium quality doesn\'t compromise our planet. We use sustainable materials and responsible manufacturing processes.' }
              ]).map((value: ValueProposition, index: number) => {
                const IconComponent = iconMap[value.icon as keyof typeof iconMap] || Sparkles;
                return (
                  <div key={index} className="relative group">
                    <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 text-center relative overflow-hidden group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2">
                      {/* Card decorative elements */}
                      <div className="absolute -top-4 -right-4 w-20 h-20 bg-gold-400 rounded-full opacity-5 group-hover:opacity-10 transition-opacity"></div>
                      <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gray-900 rounded-full opacity-3 group-hover:opacity-5 transition-opacity"></div>
                      
                      <div className="relative z-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <IconComponent className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="font-heading text-2xl font-bold text-gray-900 mb-4">
                          {value.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed text-lg">
                          {value.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Blog Section */}
        {recentBlogPosts.length > 0 && (
          <section className="section-spacing bg-gray-50 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-3">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0)`,
                backgroundSize: '30px 30px'
              }}></div>
            </div>

            {/* Floating Elements */}
            <div className="absolute inset-0">
              <div className="absolute top-32 right-16 w-20 h-20 bg-gold-400 rounded-full opacity-4 animate-float" style={{ animationDelay: '1s' }}></div>
              <div className="absolute bottom-32 left-16 w-16 h-16 bg-gray-400 rounded-full opacity-3 animate-float" style={{ animationDelay: '3s' }}></div>
            </div>

            <div className="container-padding relative">
              <div className="text-center mb-16">
                {/* Badge */}
                <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 mb-8 shadow-lg">
                  <div className="w-2 h-2 bg-gold-400 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">
                    Latest Updates
                  </span>
                </div>

                <h2 className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  {homePage?.blog_section_title?.split(' ').map((word, index) => (
                    <span key={index} className={index === (homePage?.blog_section_title?.split(' ').length || 0) - 1 ? 'text-gradient bg-gradient-to-r from-gold-600 to-gold-400 bg-clip-text text-transparent' : ''}>
                      {word}{index < (homePage?.blog_section_title?.split(' ').length || 0) - 1 ? ' ' : ''}
                    </span>
                  )) || (
                    <>Latest <span className="text-gradient bg-gradient-to-r from-gold-600 to-gold-400 bg-clip-text text-transparent">Insights</span></>
                  )}
                </h2>
                
                <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                  {homePage?.blog_section_description || 'Stay informed about the latest trends, innovations, and insights in technology and design.'}
                </p>

                {/* Decorative Line */}
                <div className="mt-8 flex justify-center">
                  <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {recentBlogPosts.slice(0, homePage?.blog_posts_limit || 3).map((post) => (
                  <BlogCard key={post.uid} post={post} />
                ))}
              </div>

              <div className="text-center">
                <div className="inline-block p-6 bg-white rounded-2xl shadow-xl border border-gray-200 relative">
                  {/* Decorative elements */}
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-gold-400 rounded-full opacity-10"></div>
                  
                  <Link href="/blog" className="relative z-10">
                    <Button variant="primary" size="lg" className="group">
                      {homePage?.blog_cta_text || 'View All Posts'}
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Final CTA Section */}
        <section className="section-spacing bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-black/30"></div>
          
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-16 left-16 w-40 h-40 bg-gold-400 rounded-full opacity-5 animate-float"></div>
            <div className="absolute top-32 right-24 w-24 h-24 bg-white rounded-full opacity-3 animate-float" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-16 left-1/4 w-32 h-32 bg-gold-400 rounded-full opacity-4 animate-float" style={{ animationDelay: '4s' }}></div>
            <div className="absolute bottom-32 right-1/3 w-20 h-20 bg-white rounded-full opacity-5 animate-float" style={{ animationDelay: '1s' }}></div>
          </div>

          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)`,
              backgroundSize: '50px 50px'
            }}></div>
          </div>
          
          <div className="container-padding text-center relative">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
              <div className="w-2 h-2 bg-gold-400 rounded-full"></div>
              <span className="text-sm font-medium text-white/90">
                Join the Future
              </span>
            </div>

            <h2 className="font-heading text-4xl md:text-6xl font-bold mb-6 text-white">
              {homePage?.final_cta?.title?.split(' ').map((word, index) => (
                <span key={index} className={index === (homePage?.final_cta?.title?.split(' ').length || 0) - 1 ? 'text-gradient bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent' : ''}>
                  {word}{index < (homePage?.final_cta?.title?.split(' ').length || 0) - 1 ? ' ' : ''}
                </span>
              )) || (
                <>Ready to Experience the <span className="text-gradient bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">Future?</span></>
              )}
            </h2>
            
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
              {homePage?.final_cta?.description || 'Join thousands of innovators who have already transformed their lives with Demolux premium technology.'}
            </p>

            {/* Decorative Line */}
            <div className="mb-12 flex justify-center">
              <div className="w-32 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent"></div>
            </div>

            <div className="inline-flex flex-col sm:flex-row gap-6 p-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 relative">
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gold-400 rounded-full opacity-10"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white rounded-full opacity-5"></div>
              
              <Link href={homePage?.final_cta?.primary_button?.url || '/categories/wearable-tech'} className="relative z-10">
                <Button variant="gold" size="lg" className="group shadow-2xl">
                  {homePage?.final_cta?.primary_button?.text || 'Shop Wearable Tech'}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </Link>
              <Link href={homePage?.final_cta?.secondary_button?.url || '/categories/technofurniture'} className="relative z-10">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white/30 text-white hover:bg-white hover:text-gray-900 shadow-2xl"
                >
                  {homePage?.final_cta?.secondary_button?.text || 'Explore Technofurniture'}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer navigation={navigation} siteSettings={fallbackSiteSettings} />
    </div>
  );
}
