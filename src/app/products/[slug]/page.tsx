import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductViewTracker } from '@/components/product/ProductViewTracker';
import { PersonalizedProductContent } from '@/components/product/PersonalizedProductContent';
import { dataService } from '@/lib/data-service';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  // Get product by slug instead of UID
  const slug = params.slug;
  
  // Fetch data
  const [product, navigation, siteSettings] = await Promise.all([
    dataService.getProductBySlug(slug),
    dataService.getNavigationMenus(),
    dataService.getSiteSettings()
  ]);

  if (!product) {
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

  const categoryPath = product.category === 'wearable-tech' ? 'wearable-tech' : 'technofurniture';
  const categoryName = product.category === 'wearable-tech' ? 'Wearable Tech' : 'Technofurniture';

  return (
    <div className="min-h-screen bg-white">
      {/* Track product view for personalization */}
      <ProductViewTracker productId={product.uid} productTitle={product.title} />
      
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
                  <Link href={`/categories/${categoryPath}`} className="text-gray-500 hover:text-gray-700">
                    {categoryName}
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li className="text-gray-900 font-medium truncate">{product.title}</li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Product Details - Personalized Content */}
        <section className="section-spacing">
          <div className="container-padding">
            <PersonalizedProductContent initialProduct={product} slug={slug} />
          </div>
        </section>

        {/* Related Products */}
        <section className="section-spacing bg-gray-50">
          <div className="container-padding">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
              You Might Also Like
            </h2>
            <div className="text-center text-gray-600">
              <p>Related products will be displayed here based on category and preferences.</p>
            </div>
          </div>
        </section>
      </main>

      <Footer navigation={navigation} siteSettings={fallbackSiteSettings} />
    </div>
  );
}
