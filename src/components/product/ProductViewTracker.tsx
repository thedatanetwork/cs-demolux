'use client';

import { useEffect } from 'react';
import { useProductTracking } from '@/components/PersonalizeEventTracker';
import { usePersonalize } from '@/contexts/PersonalizeContext';

interface ProductViewTrackerProps {
  productId: string;
  productTitle: string;
}

/**
 * Client component that tracks product view events
 * This should be added to product detail pages
 */
export function ProductViewTracker({ productId, productTitle }: ProductViewTrackerProps) {
  const { trackProductView, isConfigured } = useProductTracking();
  const { isLoading } = usePersonalize();

  useEffect(() => {
    // Wait for SDK to finish initializing before tracking
    if (isConfigured && !isLoading) {
      // Track product view when component mounts
      trackProductView(productId);
      console.log('Product view tracked:', { productId, productTitle });
    }
  }, [productId, productTitle, isConfigured, isLoading, trackProductView]);

  // This component doesn't render anything visible
  return null;
}

