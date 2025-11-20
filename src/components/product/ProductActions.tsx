'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/lib/contentstack';
import { ShoppingCart, Heart, Share2, Check } from 'lucide-react';
import { useProductTracking } from '@/components/PersonalizeEventTracker';
import { ShareModal } from './ShareModal';

interface ProductActionsProps {
  product: Product;
}

export function ProductActions({ product }: ProductActionsProps) {
  const router = useRouter();
  const { addItem, isInCart } = useCart();
  const { trackAddToCart } = useProductTracking();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [favorited, setFavorited] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);

    // Track add to cart event for personalization
    trackAddToCart(product.uid, selectedQuantity);

    // Track with Lytics
    if (typeof window !== 'undefined' && window.jstag) {
      window.jstag.send({
        stream: 'add_to_cart',
        data: {
          product_id: product.uid,
          product_title: product.title,
          product_price: product.price,
          product_category: product.category,
          quantity: selectedQuantity,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Add slight delay for better UX
    setTimeout(() => {
      addItem(product, selectedQuantity);
      setIsAdding(false);
      setJustAdded(true);

      // Reset "just added" state after 2 seconds
      setTimeout(() => setJustAdded(false), 2000);
    }, 300);
  };

  const handleBuyNow = () => {
    // Add to cart
    addItem(product, selectedQuantity);

    // Track buy now with Lytics
    if (typeof window !== 'undefined' && window.jstag) {
      window.jstag.send({
        stream: 'buy_now',
        data: {
          product_id: product.uid,
          product_title: product.title,
          product_price: product.price,
          product_category: product.category,
          quantity: selectedQuantity,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Navigate to checkout
    router.push('/checkout');
  };

  const handleFavorite = () => {
    // Attempt to bookmark the page (browser feature)
    if (typeof window !== 'undefined') {
      // Try to add bookmark (this may not work in all browsers due to security)
      try {
        // Modern browsers don't allow programmatic bookmarking
        // So we'll just track the intent and toggle the visual state
        setFavorited(!favorited);

        // Track favorite with Lytics
        if (window.jstag) {
          window.jstag.send({
            stream: 'favorite',
            data: {
              product_id: product.uid,
              product_title: product.title,
              product_price: product.price,
              product_category: product.category,
              action: !favorited ? 'add' : 'remove',
              timestamp: new Date().toISOString()
            }
          });
        }
      } catch (error) {
        console.log('Bookmark not supported');
      }
    }
  };

  const handleShare = (platform: string) => {
    // Track share with Lytics
    if (typeof window !== 'undefined' && window.jstag) {
      window.jstag.send({
        stream: 'share',
        data: {
          product_id: product.uid,
          product_title: product.title,
          product_price: product.price,
          product_category: product.category,
          platform: platform,
          timestamp: new Date().toISOString()
        }
      });
    }
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

        <Button
          variant="outline"
          size="lg"
          onClick={handleFavorite}
          className={favorited ? 'border-red-500 text-red-500 hover:bg-red-50' : ''}
        >
          <Heart className={`h-5 w-5 ${favorited ? 'fill-red-500' : ''}`} />
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={() => setShareModalOpen(true)}
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      <Button variant="gold" size="lg" className="w-full" onClick={handleBuyNow}>
        Buy Now
      </Button>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        productTitle={product.title}
        productUrl={product.url}
        onShare={handleShare}
      />
    </div>
  );
}
