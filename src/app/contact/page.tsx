import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ContactForm } from '@/components/contact/ContactForm';
import { dataService } from '@/lib/data-service';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Contact Us - Demolux',
    description: 'Get in touch with Demolux. Contact our team for inquiries, support, or to schedule a private viewing.'
  };
}

export default async function ContactPage() {
  // Fetch data
  const [navigation, siteSettings] = await Promise.all([
    dataService.getNavigationMenus(),
    dataService.getSiteSettings()
  ]);

  // Static page data
  const page = {
    hero_section: {
      title: 'Get in Touch',
      subtitle: 'Experience the future of luxury technology. Contact us to schedule a private viewing or discuss custom solutions.'
    },
    content_sections: [
      {
        section_title: 'Contact Information',
        content: '<p>Email: hello@demolux.com<br>Phone: +45 3333 7000</p>',
        layout: 'centered'
      }
    ],
    contact_form: {
      show_form: true,
      form_title: 'Send us a message',
      form_description: "We'd love to hear from you."
    }
  };

  // Fallback to default settings
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
                    Contact Demolux
                  </span>
                </div>

                <h1 className="font-heading text-4xl md:text-7xl font-bold mb-8 text-white">
                  {page.hero_section.title.split(' ').map((word, index) => (
                    <span key={index} className={index === page.hero_section.title.split(' ').length - 1 ? 'text-gradient bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent' : ''}>
                      {word}{index < page.hero_section.title.split(' ').length - 1 ? ' ' : ''}
                    </span>
                  ))}
                </h1>
                
                {page.hero_section.subtitle && (
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
                className="section-spacing bg-white"
              >
                <div className="container-padding">
                  <div className="max-w-4xl mx-auto">
                    {section.section_title && (
                      <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
                        {section.section_title}
                      </h2>
                    )}
                    
                    <div 
                      className="prose prose-lg max-w-none text-gray-900 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                  </div>
                </div>
              </section>
            ))}
          </>
        )}

        {/* Contact Form */}
        {page.contact_form?.show_form && (
          <section className="section-spacing bg-gray-50">
            <div className="container-padding">
              <div className="max-w-2xl mx-auto">
                <ContactForm
                  formTitle={page.contact_form.form_title}
                  formDescription={page.contact_form.form_description}
                />
              </div>
            </div>
          </section>
        )}

        {/* Contact Info Cards */}
        <section className="section-spacing bg-white">
          <div className="container-padding">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-8 w-8 text-gold-600" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-gray-900 mb-2">
                    Email
                  </h3>
                  <p className="text-gray-600">
                    hello@demolux.com
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-8 w-8 text-gold-600" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-gray-900 mb-2">
                    Phone
                  </h3>
                  <p className="text-gray-600">
                    +45 3333 7000
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-gold-600" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-gray-900 mb-2">
                    Location
                  </h3>
                  <p className="text-gray-600">
                    Copenhagen, Denmark
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-gold-600" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-gray-900 mb-2">
                    Hours
                  </h3>
                  <p className="text-gray-600">
                    Mon-Fri: 9AM-6PM
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer navigation={navigation} siteSettings={fallbackSiteSettings} />
    </div>
  );
}