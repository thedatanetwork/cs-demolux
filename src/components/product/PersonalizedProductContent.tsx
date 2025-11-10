'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePersonalize } from '@/contexts/PersonalizeContext';
import { dataService } from '@/lib/data-service';
import { Product } from '@/lib/contentstack';
import { formatPrice } from '@/lib/utils';
import { ProductActions } from './ProductActions';
import { Star, Truck, Shield, RotateCcw } from 'lucide-react';

interface PersonalizedProductContentProps {
  initialProduct: Product;
  slug: string;
}

/**
 * Client component that displays product content and refetches with personalization
 * This component will show the initial SSR product, then upgrade to personalized version
 */
export function PersonalizedProductContent({ initialProduct, slug }: PersonalizedProductContentProps) {
  const { variantAliases, isLoading: isPersonalizeLoading, isConfigured } = usePersonalize();
  const [product, setProduct] = useState<Product>(initialProduct);
  const [isPersonalized, setIsPersonalized] = useState(false);

  useEffect(() => {
    async function loadPersonalizedProduct() {
      // Debug: Log personalization state
      console.log('🔍 Personalization Check:', {
        isConfigured,
        isPersonalizeLoading,
        variantAliases,
        slug,
        initialProductUid: initialProduct.uid
      });

      // Only fetch personalized version if Personalize is configured and has variant aliases
      if (!isConfigured || isPersonalizeLoading || variantAliases.length === 0) {
        console.log('⏭️ Skipping personalization:', {
          reason: !isConfigured ? 'Not configured' : isPersonalizeLoading ? 'Still loading' : 'No variant aliases'
        });
        return;
      }

      try {
        console.log('🔄 Fetching personalized product via API route:', {
          slug,
          variantAliases
        });
        
        // Fetch personalized product through API route (has server-side credentials)
        const response = await fetch('/api/personalized-product', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            slug,
            variantAliases
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.details || 'Failed to fetch personalized product');
        }

        const data = await response.json();
        const personalizedProduct = data.product;

        console.log('📦 Product fetched:', {
          found: !!personalizedProduct,
          uid: personalizedProduct?.uid,
          title: personalizedProduct?.title,
          price: personalizedProduct?.price,
          description: personalizedProduct?.description?.substring(0, 100) + '...'
        });

        if (personalizedProduct) {
          // Compare content, not UIDs (variants have same entry UID but different content)
          const contentChanged = 
            personalizedProduct.title !== initialProduct.title ||
            personalizedProduct.description !== initialProduct.description ||
            personalizedProduct.price !== initialProduct.price ||
            JSON.stringify(personalizedProduct.featured_image) !== JSON.stringify(initialProduct.featured_image);

          if (contentChanged) {
            setProduct(personalizedProduct);
            setIsPersonalized(true);
            console.log('✨ Personalized product variant loaded (content differs):', {
              originalUid: initialProduct.uid,
              originalTitle: initialProduct.title,
              originalDescription: initialProduct.description?.substring(0, 50),
              personalizedUid: personalizedProduct.uid,
              personalizedTitle: personalizedProduct.title,
              personalizedDescription: personalizedProduct.description?.substring(0, 50),
              variantAliases,
              priceChanged: personalizedProduct.price !== initialProduct.price,
              titleChanged: personalizedProduct.title !== initialProduct.title,
              descriptionChanged: personalizedProduct.description !== initialProduct.description
            });
          } else {
            setProduct(personalizedProduct);
            console.log('✓ Product loaded with variant aliases (no content changes):', {
              uid: personalizedProduct.uid,
              variantAliases,
              note: 'Content is identical - might be base variant or no personalization needed'
            });
          }
        }
      } catch (error) {
        console.error('❌ Error loading personalized product:', error);
        // Keep using initial product on error
      }
    }

    loadPersonalizedProduct();
  }, [slug, variantAliases, isPersonalizeLoading, isConfigured, initialProduct.uid, initialProduct.title, initialProduct.price, product.uid]);

  // Handle featured_image as either array or single object
  const images = Array.isArray(product.featured_image) 
    ? product.featured_image 
    : (product.featured_image ? [product.featured_image] : []);
  const mainImage = images[0];

  return (
    <>
      {/* Personalization indicator (dev mode) */}
      {isPersonalized && process.env.NODE_ENV === 'development' && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-2 px-4 text-sm font-medium">
          ✨ Personalized Content - Showing variant for your audience
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          {mainImage ? (
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={mainImage.url}
                  alt={mainImage.title || product.title}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {images.map((image, index) => (
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
    </>
  );
}

