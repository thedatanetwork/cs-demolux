'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/contentstack';
import { getUrlHref } from '@/lib/content-utils';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/contexts/CartContext';
import { Check, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className = '' }: ProductCardProps) {
  const { addItem, isInCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Get the product URL (handles both string and object formats)
  const productUrl = getUrlHref(product.url);

  // Combine featured_image and additional_images into a single array
  const featuredImages = Array.isArray(product.featured_image)
    ? product.featured_image
    : product.featured_image ? [product.featured_image] : [];

  const additionalImages = product.additional_images || [];
  const allImages = [...featuredImages, ...additionalImages];
  const hasMultipleImages = allImages.length > 1;

  const currentImage = allImages[currentImageIndex] || null;

  // Navigation handlers
  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  // Mobile scroll handler
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !hasMultipleImages) return;

    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      if (isScrolling) return;

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollLeft = container.scrollLeft;
        const itemWidth = container.offsetWidth;
        const newIndex = Math.round(scrollLeft / itemWidth);

        if (newIndex !== currentImageIndex) {
          setCurrentImageIndex(newIndex);
        }
        isScrolling = false;
      }, 150);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [currentImageIndex, hasMultipleImages]);

  const handleAddToCart = async () => {
    setIsAdding(true);
    
    // Add slight delay for better UX
    setTimeout(() => {
      addItem(product, 1);
      setIsAdding(false);
      setJustAdded(true);
      
      // Reset "just added" state after 2 seconds
      setTimeout(() => setJustAdded(false), 2000);
    }, 300);
  };

  return (
    <div className={`card-hover group ${className}`}>
      {/* Product Image */}
      <div
        className="relative aspect-square overflow-hidden bg-gray-100"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Desktop: Single image with navigation */}
        <div className="hidden md:block relative w-full h-full">
          {currentImage ? (
            <>
              <Image
                src={currentImage.url}
                alt={currentImage.title || product.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />

              {/* Image counter indicator */}
              {hasMultipleImages && (
                <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm z-10">
                  {currentImageIndex + 1}/{allImages.length}
                </div>
              )}

              {/* Left/Right navigation arrows - desktop only */}
              {hasMultipleImages && isHovering && (
                <>
                  <button
                    onClick={handlePrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-200 z-10 hover:scale-110"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-10 w-10 text-white/70 hover:text-white drop-shadow-lg" strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-200 z-10 hover:scale-110"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-10 w-10 text-white/70 hover:text-white drop-shadow-lg" strokeWidth={2.5} />
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
        </div>

        {/* Mobile: Horizontal scroll container */}
        <div
          ref={scrollContainerRef}
          className="md:hidden flex overflow-x-auto snap-x snap-mandatory scrollbar-hide w-full h-full"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {allImages.length > 0 ? (
            allImages.map((image, index) => (
              <div key={image.uid} className="relative flex-shrink-0 w-full h-full snap-center">
                <Image
                  src={image.url}
                  alt={image.title || `${product.title} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
            ))
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400">No Image</span>
            </div>
          )}

          {/* Image counter for mobile */}
          {hasMultipleImages && (
            <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm z-10">
              {currentImageIndex + 1}/{allImages.length}
            </div>
          )}
        </div>

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 pointer-events-none" />
      </div>

      {/* Product Info */}
      <div className="p-6">
        <div className="mb-4">
          <Link href={productUrl} className="group">
            <h3 className="font-heading text-xl font-semibold text-gray-900 group-hover:text-gray-700 transition-colors duration-200 line-clamp-2">
              {product.title}
            </h3>
          </Link>
          
          {product.description && (
            <p className="text-gray-600 text-sm mt-2 line-clamp-3">
              {product.description}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="mb-4">
          <span className="text-2xl font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <Button
            variant={justAdded ? "success" : "primary"}
            className="w-full relative"
            onClick={handleAddToCart}
            disabled={isAdding}
          >
            {isAdding ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Adding...
              </>
            ) : justAdded ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Added!
              </>
            ) : isInCart(product.uid) ? (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add More
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </>
            )}
          </Button>

          <Link href={productUrl} className="w-full">
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
