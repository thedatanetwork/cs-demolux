'use client';

/**
 * Recommendations modular block.
 *
 * A CMS-driven wrapper around the Lytics-powered <ProductRecommendations> rail. Its fields
 * (heading, lytics_collection, limit, ...) are editor-controlled and, crucially, can be
 * overridden per audience by a Contentstack Personalize experience — so different audiences
 * see a different recommendation experience while Lytics ranks the actual products.
 */
import ProductRecommendations from '@/components/recommendations/ProductRecommendations';

export interface RecommendationsBlockData {
  title?: string; // internal entry title
  heading?: string;
  subheading?: string;
  lytics_collection?: string;
  limit?: number;
  visited?: boolean;
  shuffle?: boolean;
  placement?: string;
  background?: 'white' | 'gray';
  $?: Record<string, any>; // live-preview editable tags
}

export function RecommendationsBlock({ block }: { block: RecommendationsBlockData }) {
  return (
    <ProductRecommendations
      title={block.heading || 'Recommended for you'}
      subtitle={block.subheading}
      collection={block.lytics_collection || 'PRODUCTS'}
      limit={block.limit ?? 8}
      // CMS field "Exclude Already-Viewed" (block.visited) is a human toggle, but
      // jstag's `visited` param is inverted: `visited:false` EXCLUDES already-viewed.
      // So map ON -> false (exclude); OFF -> undefined (omit = include everything).
      // Passing block.visited straight through made OFF still exclude viewed products.
      visited={block.visited ? false : undefined}
      shuffle={block.shuffle}
      placement={block.placement || 'home_recommended'}
      className={block.background === 'gray' ? 'bg-gray-50' : ''}
    />
  );
}

export default RecommendationsBlock;
