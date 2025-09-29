'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/lib/contentstack';
import { ShoppingCart, Heart, Share2, Check } from 'lucide-react';

interface ProductActionsProps {
  product: Product;
}

export function ProductActions({ product }: ProductActionsProps) {
  const { addItem, isInCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const handleAddToCart = async () => {
    setIsAdding(true);
    
    // Add slight delay for better UX
    setTimeout(() => {
      addItem(product, selectedQuantity);
      setIsAdding(false);
      setJustAdded(true);
      
      // Reset "just added" state after 2 seconds
      setTimeout(() => setJustAdded(false), 2000);
    }, 300);
  };

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">Quantity:</label>
        <select
          value={selectedQuantity}
          onChange={(e) => setSelectedQuantity(parseInt(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button 
          size="lg" 
          className="flex-1 group"
          variant={justAdded ? "success" : "primary"}
          onClick={handleAddToCart}
          disabled={isAdding}
        >
          {isAdding ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Adding...
            </>
          ) : justAdded ? (
            <>
              <Check className="mr-2 h-5 w-5" />
              Added to Cart!
            </>
          ) : isInCart(product.uid) ? (
            <>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add More ({selectedQuantity})
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart ({selectedQuantity})
            </>
          )}
        </Button>
        
        <Button variant="outline" size="lg">
          <Heart className="h-5 w-5" />
        </Button>
        
        <Button variant="outline" size="lg">
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      <Button variant="gold" size="lg" className="w-full">
        Buy Now
      </Button>
    </div>
  );
}
