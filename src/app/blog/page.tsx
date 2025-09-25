import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BlogCard } from '@/components/blog/BlogCard';
import { dataService } from '@/lib/data-service';

export const metadata = {
  title: 'Blog | Demolux',
  description: 'Stay informed about the latest trends, innovations, and insights in wearable technology and technofurniture.',
};

export default async function BlogPage() {
  // Fetch data
  const [blogPosts, navigation, siteSettings] = await Promise.all([
    dataService.getBlogPosts(),
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
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="container-padding">
            <nav className="py-4">
              <ol className="flex items-center space-x-2 text-sm">
                <li>
                  <a href="/" className="text-gray-500 hover:text-gray-700">Home</a>
                </li>
                <li className="text-gray-400">/</li>
                <li className="text-gray-900 font-medium">Blog</li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Page Header */}
        <section className="section-spacing bg-white">
          <div className="container-padding">
            <div className="text-center mb-16">
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Insights & Innovation
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                Stay informed about the latest trends, innovations, and insights in wearable technology, 
                technofurniture, and the future of luxury design.
              </p>
            </div>

            {/* Blog Posts */}
            {blogPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogPosts.map((post) => (
                  <BlogCard key={post.uid} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No blog posts yet
                </h3>
                <p className="text-gray-600">
                  We're working on creating insightful content. Check back soon for the latest updates!
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer navigation={navigation} siteSettings={siteSettings} />
    </div>
  );
}
