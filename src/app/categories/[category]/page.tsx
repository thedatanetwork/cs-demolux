import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { dataService } from '@/lib/data-service';

interface CategoryPageProps {
  params: {
    category: string;
  };
}

const categoryMetadata = {
  'wearable-tech': {
    title: 'Wearable Technology',
    description: 'Revolutionary wearable devices that seamlessly integrate into your lifestyle. From quantum smartwatches to neural fitness bands, discover the future on your wrist.',
    breadcrumb: 'Wearable Tech'
  },
  'technofurniture': {
    title: 'Technofurniture',
    description: 'Smart furniture that adapts to your needs. Experience the perfect fusion of comfort, functionality, and cutting-edge technology in every piece.',
    breadcrumb: 'Technofurniture'
  }
};

export async function generateStaticParams() {
  return [
    { category: 'wearable-tech' },
    { category: 'technofurniture' }
  ];
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const categoryInfo = categoryMetadata[params.category as keyof typeof categoryMetadata];
  
  if (!categoryInfo) {
    return {
      title: 'Category Not Found | Demolux',
    };
  }

  return {
    title: `${categoryInfo.title} | Demolux`,
    description: categoryInfo.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const categoryInfo = categoryMetadata[params.category as keyof typeof categoryMetadata];
  
  if (!categoryInfo) {
    notFound();
  }

  // Fetch data
  const [products, navigation, siteSettings] = await Promise.all([
    dataService.getProducts(params.category),
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
                <li className="text-gray-900 font-medium">{categoryInfo.breadcrumb}</li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Page Header */}
        <section className="section-spacing bg-white">
          <div className="container-padding">
            <div className="text-center mb-16">
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {categoryInfo.title}
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                {categoryInfo.description}
              </p>
            </div>

            {/* Products Grid */}
            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.map((product) => (
                  <ProductCard key={product.uid} product={product} />
                ))}
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
                  We're working on adding products to this category. Check back soon!
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
