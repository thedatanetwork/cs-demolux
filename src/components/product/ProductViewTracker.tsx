'use client';

import { useEffect } from 'react';
import { useProductTracking } from '@/components/PersonalizeEventTracker';
import { usePersonalize } from '@/contexts/PersonalizeContext';
import { recordProductView } from '@/lib/browsing-affinity';

interface ProductViewTrackerProps {
  productId: string;
  productTitle: string;
  category?: string;
  tags?: string[];
}

/**
 * Client component that tracks product view events
 * This should be added to product detail pages
 */
export function ProductViewTracker({ productId, productTitle, category, tags }: ProductViewTrackerProps) {
  const { trackProductView, isConfigured } = useProductTracking();
  const { isLoading } = usePersonalize();

  // Record the view into local browsing affinity immediately (drives rec re-ranking).
  useEffect(() => {
    recordProductView(category, tags);
  }, [productId, category, tags]);

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

