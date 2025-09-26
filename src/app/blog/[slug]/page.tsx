import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { dataService } from '@/lib/data-service';
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
  
  // Fetch data
  const [blogPost, navigation, siteSettings] = await Promise.all([
    dataService.getBlogPostBySlug(slug),
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

  const featuredImage = blogPost.featured_image?.[0];

  return (
    <div className="min-h-screen bg-white">
      <Header 
        navigation={navigation}
        siteName={fallbackSiteSettings.site_name}
        logoUrl={fallbackSiteSettings.logo?.url}
      />

      <main>
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="container-padding">
            <nav className="py-4">
              <ol className="flex items-center space-x-2 text-sm">
                <li>
                  <Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link>
                </li>
                <li className="text-gray-400">/</li>
                <li>
                  <Link href="/blog" className="text-gray-500 hover:text-gray-700">Blog</Link>
                </li>
                <li className="text-gray-400">/</li>
                <li className="text-gray-900 font-medium truncate">{blogPost.title}</li>
              </ol>
            </nav>
          </div>
        </div>

        <article className="section-spacing">
          <div className="container-padding">
            <div className="max-w-4xl mx-auto">
              {/* Back Button */}
              <div className="mb-8">
                <Link href="/blog">
                  <Button variant="ghost" className="group">
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
                    Back to Blog
                  </Button>
                </Link>
              </div>

              {/* Article Header */}
              <header className="mb-12">
                <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
                  {blogPost.title}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8">
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

                  <Button variant="ghost" size="sm" className="ml-auto">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>

                {/* Featured Image */}
                {featuredImage && (
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-8">
                    <Image
                      src={featuredImage.url}
                      alt={featuredImage.title || blogPost.title}
                      width={1200}
                      height={675}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Excerpt */}
                {blogPost.excerpt && (
                  <div className="bg-gray-50 border-l-4 border-gold-400 p-6 rounded-r-lg">
                    <p className="text-lg text-gray-700 italic">
                      {blogPost.excerpt}
                    </p>
                  </div>
                )}
              </header>

              {/* Article Content */}
              <div className="prose prose-lg prose-gray max-w-none mb-12">
                <div 
                  className="text-gray-700 leading-relaxed space-y-6"
                  dangerouslySetInnerHTML={{ __html: blogPost.content }}
                />
              </div>

              {/* Tags */}
              {blogPost.post_tags && blogPost.post_tags.length > 0 && (
                <div className="mb-12">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {blogPost.post_tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors duration-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Article Footer */}
              <footer className="border-t border-gray-200 pt-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      Last updated: {formatDate(blogPost.updated_at)}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">Share this article:</span>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </article>

        {/* Related Posts Section */}
        <section className="section-spacing bg-gray-50">
          <div className="container-padding">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
                Related Articles
              </h2>
              <div className="text-center text-gray-600">
                <p>Related articles will be displayed here based on tags and topics.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer navigation={navigation} siteSettings={fallbackSiteSettings} />
    </div>
  );
}
