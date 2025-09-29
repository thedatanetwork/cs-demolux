import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { ProductActions } from '@/components/product/ProductActions';
import { dataService } from '@/lib/data-service';
import { formatPrice } from '@/lib/utils';
import { Star, Truck, Shield, RotateCcw } from 'lucide-react';

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

        {/* Product Details */}
        <section className="section-spacing">
          <div className="container-padding">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Product Images */}
              <div className="space-y-4">
                {product.featured_image && product.featured_image.length > 0 ? (
                  <div className="space-y-4">
                    {/* Main Image */}
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={product.featured_image[0].url}
                        alt={product.featured_image[0].title || product.title}
                        width={600}
                        height={600}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Thumbnail Gallery */}
                    {product.featured_image.length > 1 && (
                      <div className="grid grid-cols-4 gap-4">
                        {product.featured_image.map((image, index) => (
                          <div key={image.uid} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                              src={image.url}
                              alt={image.title || `${product.title} ${index + 1}`}
                              width={150}
                              height={150}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">No Image Available</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    {product.title}
                  </h1>
                  
                  {/* Rating (placeholder) */}
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-gold-400 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">(47 reviews)</span>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      Free shipping on orders over $500
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <div className="text-gray-600 leading-relaxed space-y-4">
                    <p>{product.description}</p>
                    {product.detailed_description && (
                      <p className="mt-4 text-sm text-gray-700 leading-relaxed">
                        {product.detailed_description}
                      </p>
                    )}
                  </div>
                  
                  {/* Tags */}
                  {product.product_tags && product.product_tags.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Features</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.product_tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <ProductActions product={product} />

                {/* Features */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3">
                      <Truck className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Free Shipping</p>
                        <p className="text-xs text-gray-600">On orders over $500</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">2 Year Warranty</p>
                        <p className="text-xs text-gray-600">Full coverage</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <RotateCcw className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">30-Day Returns</p>
                        <p className="text-xs text-gray-600">Money back guarantee</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
