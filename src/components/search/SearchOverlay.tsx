'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import Link from 'next/link';
import { Product } from '@/lib/contentstack';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

// Type declaration for Lytics jstag
declare global {
  interface Window {
    jstag?: {
      send: (data: { stream: string; data: any }) => void;
      pageView: () => void;
      loadEntity: (callback?: (profile: any) => void) => void;
    };
  }
}

export function SearchOverlay({ isOpen, onClose, products }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when overlay opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Filter products based on search query
  useEffect(() => {
    if (!query.trim()) {
      setFilteredProducts([]);
      return;
    }

    const searchTerm = query.toLowerCase().trim();
    const results = products.filter((product) => {
      const titleMatch = product.title.toLowerCase().includes(searchTerm);
      const descriptionMatch = product.description?.toLowerCase().includes(searchTerm);
      const detailedDescriptionMatch = product.detailed_description?.toLowerCase().includes(searchTerm);
      const categoryMatch = product.category?.toLowerCase().includes(searchTerm);
      const tagsMatch = product.product_tags?.some(tag =>
        tag.toLowerCase().includes(searchTerm)
      );

      return titleMatch || descriptionMatch || detailedDescriptionMatch || categoryMatch || tagsMatch;
    });

    setFilteredProducts(results);

    // Send search event to Lytics
    if (typeof window !== 'undefined' && window.jstag) {
      window.jstag.send({
        stream: 'search',
        data: {
          search_query: searchTerm,
          search_results_count: results.length,
          timestamp: new Date().toISOString(),
          search_type: 'product_search'
        }
      });
    }
  }, [query, products]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleResultClick = (product: Product) => {
    // Send click event to Lytics
    if (typeof window !== 'undefined' && window.jstag) {
      window.jstag.send({
        stream: 'search_click',
        data: {
          search_query: query.toLowerCase().trim(),
          clicked_product_id: product.uid,
          clicked_product_title: product.title,
          clicked_product_category: product.category,
          clicked_product_price: product.price,
          timestamp: new Date().toISOString(),
          search_results_count: filteredProducts.length
        }
      });
    }

    setQuery('');
    setFilteredProducts([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      {/* Search Container */}
      <div className="bg-white shadow-2xl">
        <div className="container-padding py-6">
          <div className="max-w-4xl mx-auto">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products by name, description, or category..."
                className="w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-300 rounded-lg focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-200 transition-all"
              />
              <button
                onClick={onClose}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search Info */}
            {query.trim() && (
              <div className="mt-4 text-sm text-gray-600">
                {filteredProducts.length > 0 ? (
                  <span>Found {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}</span>
                ) : (
                  <span>No products found for "{query}"</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container-padding py-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <div className="max-w-4xl mx-auto">
          {filteredProducts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProducts.map((product) => {
                const imageUrl = Array.isArray(product.featured_image) && product.featured_image.length > 0
                  ? product.featured_image[0]?.url
                  : undefined;

                return (
                  <Link
                    key={product.uid}
                    href={product.url}
                    onClick={() => handleResultClick(product)}
                    className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl hover:border-gold-400 transition-all duration-300 group flex"
                  >
                      {/* Product Image */}
                      {imageUrl && (
                        <div className="w-32 h-full flex-shrink-0 bg-gray-100 relative">
                          <img
                            src={imageUrl}
                            alt={product.title}
                            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      {/* Product Info */}
                      <div className={`flex-1 p-4 flex flex-col justify-between ${!imageUrl ? 'pl-4' : ''}`}>
                        <div>
                          <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2 group-hover:text-gold-600 transition-colors">
                            {product.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {product.description}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-lg font-bold text-gray-900">
                            ${product.price?.toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">
                            {product.category === 'wearable-tech' ? 'Wearable Tech' : 'Technofurniture'}
                          </span>
                        </div>
                      </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Empty State - Show Popular Categories */}
          {!query.trim() && (
            <div className="bg-white rounded-lg p-8 text-center">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-heading text-xl font-semibold text-gray-900 mb-2">
                Search Demolux Products
              </h3>
              <p className="text-gray-600 mb-6">
                Start typing to search across all {products.length} products
              </p>

              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => setQuery('wearable')}
                  className="px-4 py-2 bg-gray-100 hover:bg-gold-100 text-gray-700 hover:text-gold-700 rounded-full transition-colors"
                >
                  Wearable Tech
                </button>
                <button
                  onClick={() => setQuery('furniture')}
                  className="px-4 py-2 bg-gray-100 hover:bg-gold-100 text-gray-700 hover:text-gold-700 rounded-full transition-colors"
                >
                  Technofurniture
                </button>
                <button
                  onClick={() => setQuery('smart')}
                  className="px-4 py-2 bg-gray-100 hover:bg-gold-100 text-gray-700 hover:text-gold-700 rounded-full transition-colors"
                >
                  Smart Devices
                </button>
                <button
                  onClick={() => setQuery('luxury')}
                  className="px-4 py-2 bg-gray-100 hover:bg-gold-100 text-gray-700 hover:text-gold-700 rounded-full transition-colors"
                >
                  Luxury
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  );
}
