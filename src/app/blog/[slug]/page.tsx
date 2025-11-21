import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { dataService } from '@/lib/data-service';
import { getVariantAliasesFromCookies } from '@/lib/personalize-server';
import { formatDate } from '@/lib/utils';
import { Calendar, User, ArrowLeft, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  // Get blog post by slug instead of UID
  const slug = params.slug;
  
  // Get variant aliases from cookies (for personalization without flicker)
  const variantAliases = await getVariantAliasesFromCookies();
  
  // Fetch data with personalization
  const [blogPost, navigation, siteSettings] = await Promise.all([
    dataService.getBlogPostBySlug(slug, variantAliases),
    dataService.getNavigationMenus(),
    dataService.getSiteSettings()
  ]);

  if (!blogPost) {
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

  const featuredImage = Array.isArray(blogPost.featured_image) 
    ? blogPost.featured_image[0] 
    : blogPost.featured_image;

  return (
    <div className="min-h-screen bg-white">
      <Header
        navigation={navigation}
        siteName={fallbackSiteSettings.site_name}
        logoUrl={fallbackSiteSettings.logo?.url}
      />

      <main>
        {/* Hero Section with Featured Image */}
        <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-black/40"></div>

          {/* Featured Image as Background */}
          {featuredImage && (
            <div className="absolute inset-0 opacity-20">
              <Image
                src={featuredImage.url}
                alt={featuredImage.title || blogPost.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

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

          <div className="relative container-padding py-24 md:py-32">
            <div className="max-w-5xl mx-auto">
              {/* Back Button */}
              <div className="mb-8">
                <Link href="/blog">
                  <Button variant="ghost" className="group text-white border-white/20 hover:bg-white/10">
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
                    Back to Blog
                  </Button>
                </Link>
              </div>

              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
                <div className="w-2 h-2 bg-gold-400 rounded-full"></div>
                <span className="text-sm font-medium text-white/90">
                  Blog Article
                </span>
              </div>

              {/* Article Header */}
              <header>
                <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8 text-white">
                  {blogPost.title.split(' ').map((word, index, array) => (
                    <span key={index} className={index === array.length - 1 ? 'text-gradient bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent' : ''}>
                      {word}{index < array.length - 1 ? ' ' : ''}
                    </span>
                  ))}
                </h1>

                {/* Excerpt */}
                {blogPost.excerpt && (
                  <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-4xl font-light mb-8">
                    {blogPost.excerpt}
                  </p>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-6 text-white/80 mb-8">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <time dateTime={blogPost.publish_date}>
                      {formatDate(blogPost.publish_date)}
                    </time>
                  </div>

                  {blogPost.author && (
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>{blogPost.author}</span>
                    </div>
                  )}

                  <Button variant="ghost" size="sm" className="ml-auto text-white border-white/20 hover:bg-white/10">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>

                {/* Decorative Line */}
                <div className="flex justify-start">
                  <div className="w-32 h-1 bg-gradient-to-r from-gold-400 to-transparent"></div>
                </div>
              </header>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <article className="section-spacing relative">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-10 w-2 h-2 bg-gold-400 rounded-full"></div>
            <div className="absolute top-32 right-20 w-3 h-3 bg-gray-400 rounded-full"></div>
            <div className="absolute bottom-20 left-1/4 w-2 h-2 bg-gold-400 rounded-full"></div>
            <div className="absolute bottom-40 right-1/3 w-1 h-1 bg-gray-400 rounded-full"></div>
          </div>

          <div className="container-padding">
            <div className="max-w-4xl mx-auto relative">
              {/* Content Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-12 mb-12 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gold-400 rounded-full opacity-10"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gray-900 rounded-full opacity-5"></div>

                <div
                  className="prose prose-xl max-w-none leading-relaxed relative z-10 [&_p]:mb-6 [&_h2]:font-heading [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-12 [&_h2]:mb-6 [&_h3]:font-heading [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:mt-8 [&_h3]:mb-4"
                  style={{
                    color: '#111827',
                    fontSize: '1.125rem',
                    lineHeight: '1.8'
                  }}
                  dangerouslySetInnerHTML={{ __html: blogPost.content }}
                />
              </div>

              {/* Tags */}
              {blogPost.post_tags && blogPost.post_tags.length > 0 && (
                <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 md:p-8 border border-gray-200">
                  <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">Related Topics</h3>
                  <div className="flex flex-wrap gap-3">
                    {blogPost.post_tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white text-gray-800 border border-gray-300 hover:border-gold-400 hover:bg-gold-50 hover:text-gold-900 transition-all duration-200 shadow-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </article>

        {/* Call to Action */}
        <section className="section-spacing bg-gradient-to-r from-gold-400 to-gold-600 text-black">
          <div className="container-padding">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
                Stay Updated with Our Latest Insights
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Explore more articles about luxury wearable tech, technofurniture, and the future of intelligent living.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/blog"
                  className="inline-flex items-center justify-center px-8 py-3 border border-black bg-black text-white hover:bg-gray-900 transition-colors font-medium rounded-md"
                >
                  View All Articles
                </Link>
                <Link
                  href="/categories/wearable-tech"
                  className="inline-flex items-center justify-center px-8 py-3 border border-black bg-transparent text-black hover:bg-black hover:text-white transition-colors font-medium rounded-md"
                >
                  Shop Wearable Tech
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer navigation={navigation} siteSettings={fallbackSiteSettings} />
    </div>
  );
}
