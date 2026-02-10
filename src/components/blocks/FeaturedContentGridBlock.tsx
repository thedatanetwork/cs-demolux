'use client';

import React from 'react';
import Link from 'next/link';
import type { FeaturedContentGridBlock as FeaturedContentGridBlockType } from '@/lib/contentstack';
import { ProductCard } from '@/components/product/ProductCard';
import { BlogCard } from '@/components/blog/BlogCard';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

interface FeaturedContentGridBlockProps {
  block: FeaturedContentGridBlockType & {
    $?: Record<string, any>;  // Editable tags from addEditableTags()
  };
}

export function FeaturedContentGridBlock({ block }: FeaturedContentGridBlockProps) {
  const {
    variant,
    section_title,
    section_description,
    badge_text,
    manual_items = [],
    layout_style,
    show_cta,
    cta_text,
    cta_url,
    background_style
  } = block;
  const $ = block.$ || {};

  // Handle different field names from Contentstack
  // The CMS uses manual_blog_posts for blog grids and manual_products for product grids
  const manualBlogPosts = (block as any).manual_blog_posts || [];
  const manualProducts = (block as any).manual_products || [];

  // Use the appropriate items based on variant or what's available
  let allItems = manual_items;
  if (variant === 'blog_grid' && manualBlogPosts.length > 0) {
    allItems = manualBlogPosts;
  } else if (variant === 'product_grid' && manualProducts.length > 0) {
    allItems = manualProducts;
  } else if (allItems.length === 0) {
    // Fallback: use whichever field has content
    allItems = manualBlogPosts.length > 0 ? manualBlogPosts : manualProducts;
  }

  // Background styles
  const backgroundClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    gradient: 'bg-gradient-to-b from-white to-gray-50'
  };

  // Grid column classes based on layout
  const gridClasses = {
    'grid-2': 'grid-cols-1 md:grid-cols-2',
    'grid-3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    'grid-4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    'masonry': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3', // Can be enhanced with masonry library
    'carousel': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' // Can be enhanced with carousel library
  };

  const bgClass = backgroundClasses[background_style];
  const gridClass = gridClasses[layout_style];

  return (
    <section className={`section-spacing ${bgClass} relative overflow-hidden`}>
      {/* Background Pattern */}
      {background_style === 'gray' && (
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
      )}

      <div className="container-padding relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          {/* Badge */}
          {badge_text && (
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 mb-8 shadow-lg">
              <div className="w-2 h-2 bg-gold-400 rounded-full"></div>
              <span className="text-sm font-medium text-gray-900">
                {badge_text}
              </span>
            </div>
          )}

          {/* Title */}
          {section_title && (
            <h2 {...$['section_title']} className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {section_title.split(' ').map((word, index, arr) => (
                <span
                  key={index}
                  className={index === arr.length - 1 ? 'text-gradient bg-gradient-to-r from-gold-600 to-gold-400 bg-clip-text text-transparent' : ''}
                >
                  {word}{index < arr.length - 1 ? ' ' : ''}
                </span>
              ))}
            </h2>
          )}

          {/* Description */}
          {section_description && (
            <p {...$['section_description']} className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              {section_description}
            </p>
          )}

          {/* Decorative Line */}
          <div className="mt-8 flex justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent"></div>
          </div>
        </div>

        {/* Content Grid */}
        {allItems && allItems.length > 0 && (
          <div className={`grid ${gridClass} gap-8 mb-12`}>
            {allItems.map((item, index) => {
              // Determine item type and render appropriate card
              if ('price' in item && 'category' in item) {
                // It's a Product
                return <ProductCard key={item.uid} product={item as any} />;
              } else if ('content' in item && 'excerpt' in item) {
                // It's a BlogPost
                return <BlogCard key={item.uid} post={item as any} />;
              } else if ('collection_type' in item) {
                // It's a Collection
                return <CollectionCard key={item.uid} collection={item as any} />;
              }
              return null;
            })}
          </div>
        )}

        {/* Empty State */}
        {(!allItems || allItems.length === 0) && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No content to display
            </h3>
            <p className="text-gray-600">
              Add items to this section in Contentstack.
            </p>
          </div>
        )}

        {/* CTA Button */}
        {show_cta && cta_text && cta_url && (
          <div className="text-center">
            <div className="inline-block p-6 bg-white rounded-2xl shadow-xl border border-gray-200 relative">
              <Link href={cta_url} className="relative z-10">
                <Button variant="primary" size="lg" className="group">
                  {cta_text}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// Collection Card Component
function CollectionCard({ collection }: { collection: any }) {
  const featuredImage = Array.isArray(collection.featured_image)
    ? collection.featured_image[0]
    : collection.featured_image;

  const collectionTypeLabels: Record<string, string> = {
    seasonal: 'Seasonal Collection',
    curated: 'Curated Selection',
    new_arrivals: 'New Arrivals',
    best_sellers: 'Best Sellers',
    limited_edition: 'Limited Edition'
  };

  return (
    <Link
      href={collection.slug?.href || `/collections/${collection.uid}`}
      className="group block"
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2">
        {/* Image */}
        <div className="relative h-64 bg-gray-100 overflow-hidden">
          {featuredImage?.url ? (
            <img
              src={featuredImage.url}
              alt={featuredImage.title || collection.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 bg-gold-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <svg className="h-6 w-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">Collection Image</p>
              </div>
            </div>
          )}

          {/* Collection Type Badge */}
          {collection.collection_type && (
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-xs font-semibold text-gray-900">
                {collectionTypeLabels[collection.collection_type] || collection.collection_type}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="font-heading text-2xl font-bold text-gray-900 mb-2 group-hover:text-gold-600 transition-colors">
            {collection.title}
          </h3>
          <p className="text-gray-600 mb-4 line-clamp-2">
            {collection.description}
          </p>

          {/* Product Count */}
          {collection.products && collection.products.length > 0 && (
            <p className="text-sm text-gray-500">
              {collection.products.length} {collection.products.length === 1 ? 'Product' : 'Products'}
            </p>
          )}

          {/* View Link */}
          <div className="mt-4 flex items-center text-gold-600 font-semibold group-hover:text-gold-700">
            <span>Explore Collection</span>
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
          </div>
        </div>
      </div>
    </Link>
  );
}
