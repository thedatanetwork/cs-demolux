import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { dataService } from '@/lib/data-service';

export async function generateMetadata(): Promise<Metadata> {
  const page = await dataService.getPage('about');
  
  if (!page) {
    return {
      title: 'About Us - Demolux',
      description: 'Learn about Demolux - pioneers in luxury wearable technology and technofurniture.'
    };
  }

  return {
    title: `${page.title} - Demolux`,
    description: page.meta_description || 'Learn about Demolux - pioneers in luxury wearable technology and technofurniture.'
  };
}

export default async function AboutPage() {
  // Fetch data
  const [page, navigation, siteSettings] = await Promise.all([
    dataService.getPage('about'),
    dataService.getNavigationMenus(),
    dataService.getSiteSettings()
  ]);

  if (!page) {
    notFound();
  }

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
        {page.hero_section && (
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
                    About Demolux
                  </span>
                </div>

                <h1 className="font-heading text-4xl md:text-7xl font-bold mb-8 text-white">
                  {page.hero_section?.title ? page.hero_section.title.split(' ').map((word, index) => (
                    <span key={index} className={index === (page.hero_section?.title?.split(' ').length || 0) - 1 ? 'text-gradient bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent' : ''}>
                      {word}{index < (page.hero_section?.title?.split(' ').length || 0) - 1 ? ' ' : ''}
                    </span>
                  )) : 'About Us'}
                </h1>
                
                {page.hero_section?.subtitle && (
                  <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-4xl mx-auto font-light">
                    {page.hero_section.subtitle}
                  </p>
                )}

                {/* Decorative Line */}
                <div className="mt-12 flex justify-center">
                  <div className="w-32 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent"></div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Content Sections */}
        {page.content_sections && page.content_sections.length > 0 && (
          <>
            {page.content_sections.map((section, index) => (
              <section 
                key={index}
                className={`section-spacing relative ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <div className="container-padding">
                  <div className={`
                    ${section.layout === 'full-width' ? 'max-w-7xl' : ''}
                    ${section.layout === 'two-column' ? 'max-w-6xl' : ''}
                    ${section.layout === 'centered' ? 'max-w-5xl' : ''}
                    ${!section.layout ? 'max-w-5xl' : ''}
                    mx-auto relative
                  `}>
                    {section.section_title && (
                      <div className="text-center mb-16">
                        <h2 className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                          {section.section_title}
                        </h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-gold-400 to-gold-600 mx-auto mb-8"></div>
                      </div>
                    )}
                    
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-12 relative overflow-hidden">
                      {/* Decorative elements */}
                      <div className="absolute -top-4 -right-4 w-24 h-24 bg-gold-400 rounded-full opacity-10"></div>
                      <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gray-900 rounded-full opacity-5"></div>

                      <div
                        className="prose prose-xl max-w-none leading-relaxed relative z-10 [&_p]:mb-6"
                        style={{
                          color: '#111827',
                          fontSize: '1.125rem',
                          lineHeight: '1.8'
                        }}
                        dangerouslySetInnerHTML={{ __html: section.content }}
                      />
                    </div>
                  </div>
                </div>

                {/* Background pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-20 left-10 w-2 h-2 bg-gold-400 rounded-full"></div>
                  <div className="absolute top-32 right-20 w-3 h-3 bg-gray-400 rounded-full"></div>
                  <div className="absolute bottom-20 left-1/4 w-2 h-2 bg-gold-400 rounded-full"></div>
                  <div className="absolute bottom-40 right-1/3 w-1 h-1 bg-gray-400 rounded-full"></div>
                </div>
              </section>
            ))}
          </>
        )}

        {/* Call to Action */}
        <section className="section-spacing bg-gradient-to-r from-gold-400 to-gold-600 text-black">
          <div className="container-padding">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
                Ready to Experience the Future?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Discover our collection of luxury wearable technology and technofurniture.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/products"
                  className="inline-flex items-center justify-center px-8 py-3 border border-black bg-black text-white hover:bg-gray-900 transition-colors font-medium rounded-md"
                >
                  Explore Products
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

