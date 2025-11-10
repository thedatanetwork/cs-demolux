'use client';

import React, { useEffect } from 'react';
import { usePersonalize, usePersonalizeEvent } from '@/contexts/PersonalizeContext';

/**
 * Example component demonstrating Contentstack Personalize event tracking
 * 
 * This component shows how to:
 * - Access personalization data (experiences, variant aliases)
 * - Track events (button clicks, page views, etc.)
 * - Set user attributes for personalization
 */
export function PersonalizeEventTracker() {
  const { experiences, variantAliases, isLoading, isConfigured } = usePersonalize();
  const { trackEvent } = usePersonalizeEvent();

  useEffect(() => {
    // Log personalization data when available
    if (!isLoading && isConfigured) {
      console.log('Active Experiences:', experiences);
      console.log('Variant Aliases:', variantAliases);
    }
  }, [experiences, variantAliases, isLoading, isConfigured]);

  // Don't render anything if not configured
  if (!isConfigured) {
    return null;
  }

  return (
    <div className="hidden">
      {/* This component doesn't render visible UI, it's for tracking only */}
    </div>
  );
}

/**
 * Hook for tracking product interactions
 * Usage in product pages:
 * 
 * const { trackProductView, trackAddToCart } = useProductTracking();
 * 
 * // Track when product is viewed
 * useEffect(() => {
 *   trackProductView(productId);
 * }, [productId]);
 * 
 * // Track when added to cart
 * onClick={() => trackAddToCart(productId)}
 */
export function useProductTracking() {
  const { trackEvent, isConfigured } = usePersonalizeEvent();

  const trackProductView = async (productId: string) => {
    if (!isConfigured) return;
    await trackEvent('product_view', { product_id: productId });
  };

  const trackAddToCart = async (productId: string, quantity: number = 1) => {
    if (!isConfigured) return;
    await trackEvent('add_to_cart', { 
      product_id: productId,
      quantity: quantity 
    });
  };

  const trackPurchase = async (orderId: string, total: number, items: any[]) => {
    if (!isConfigured) return;
    await trackEvent('purchase', {
      order_id: orderId,
      total: total,
      items: items
    });
  };

  return {
    trackProductView,
    trackAddToCart,
    trackPurchase,
    isConfigured,
  };
}

/**
 * Hook for tracking blog interactions
 * Usage in blog pages:
 * 
 * const { trackBlogView, trackBlogShare } = useBlogTracking();
 * 
 * useEffect(() => {
 *   trackBlogView(postId);
 * }, [postId]);
 */
export function useBlogTracking() {
  const { trackEvent, isConfigured } = usePersonalizeEvent();

  const trackBlogView = async (postId: string) => {
    if (!isConfigured) return;
    await trackEvent('blog_view', { post_id: postId });
  };

  const trackBlogShare = async (postId: string, platform: string) => {
    if (!isConfigured) return;
    await trackEvent('blog_share', { 
      post_id: postId,
      platform: platform 
    });
  };

  return {
    trackBlogView,
    trackBlogShare,
    isConfigured,
  };
}

/**
 * Hook for tracking CTA clicks
 * Usage:
 * 
 * const { trackCTAClick } = useCTATracking();
 * 
 * <button onClick={() => trackCTAClick('hero_cta', '/products')}>
 *   Shop Now
 * </button>
 */
export function useCTATracking() {
  const { trackEvent, isConfigured } = usePersonalizeEvent();

  const trackCTAClick = async (ctaId: string, destination: string) => {
    if (!isConfigured) return;
    await trackEvent('cta_click', { 
      cta_id: ctaId,
      destination: destination 
    });
  };

  return {
    trackCTAClick,
    isConfigured,
  };
}

