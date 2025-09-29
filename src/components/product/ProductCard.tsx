'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/contentstack';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/contexts/CartContext';
import { Check, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className = '' }: ProductCardProps) {
  const { addItem, isInCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  
  // Handle both array and single object formats for featured_image
  const mainImage = Array.isArray(product.featured_image) 
    ? product.featured_image[0] 
    : product.featured_image;

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
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {mainImage ? (
          <Image
            src={mainImage.url}
            alt={mainImage.title || product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
      </div>

      {/* Product Info */}
      <div className="p-6">
        <div className="mb-4">
          <Link href={product.url} className="group">
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

        {/* Action Button */}
        <div className="flex gap-2">
          <Button 
            variant={justAdded ? "success" : "primary"}
            className="flex-1 relative"
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
          
          <Link href={product.url} className="flex-1">
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
