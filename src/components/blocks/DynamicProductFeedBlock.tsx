'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  type DynamicProductFeedConfig,
  resolveDynamicFeed,
} from '@/lib/rule-engine';

interface DynamicProductFeedBlockProps {
  config: DynamicProductFeedConfig;
}

/**
 * DynamicProductFeedBlock - Renders a dynamic product feed driven by
 * merchandising_rule_group filters.
 *
 * Mirrors Ticket #2 spec:
 *   - Suppresses if visibility is false (no fetch, no DOM)
 *   - Suppresses if outside publish_at / unpublish_at window
 *   - Applies rule_group filters via rule engine
 *   - Falls back to fallback_rule_group if primary returns empty
 *   - Renders nothing if both return empty
 *   - Supports carousel and grid display styles
 *   - Uses existing ProductCard component
 */
export function DynamicProductFeedBlock({ config }: DynamicProductFeedBlockProps) {
  const products = resolveDynamicFeed(config);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // If no products (visibility=false, schedule inactive, or both rule groups empty), render nothing
  if (products.length === 0) {
    return null;
  }

  const updateScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  const scrollBy = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const cardWidth = container.querySelector('.product-feed-card')?.clientWidth || 300;
    const gap = 32; // gap-8 = 2rem = 32px
    const scrollAmount = (cardWidth + gap) * 2;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(updateScrollButtons, 400);
  };

  const isCarousel = config.display_style === 'carousel';

  return (
    <section
      id={config.anchor_id || undefined}
      className="section-spacing bg-white relative overflow-hidden"
    >
      <div className="container-padding relative">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            {/* Badge */}
            {config.badge_label && (
              <div className="inline-flex items-center space-x-2 bg-gold-400/10 rounded-full px-4 py-1.5 mb-4">
                <div className="w-1.5 h-1.5 bg-gold-400 rounded-full"></div>
                <span className="text-xs font-semibold text-gold-700 uppercase tracking-wider">
                  {config.badge_label}
                </span>
              </div>
            )}

            {/* Heading */}
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900">
              {config.heading}
            </h2>

            {/* Subheading */}
            {config.subheading && (
              <p className="text-gray-600 mt-2 text-lg max-w-2xl">
                {config.subheading}
              </p>
            )}
          </div>

          {/* CTA + Carousel Nav */}
          <div className="hidden md:flex items-center space-x-4">
            {isCarousel && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => scrollBy('left')}
                  disabled={!canScrollLeft}
                  className="p-2 rounded-full border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={() => scrollBy('right')}
                  disabled={!canScrollRight}
                  className="p-2 rounded-full border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            )}

            {config.cta_label && config.cta_href && (
              <Link href={config.cta_href}>
                <Button variant="outline" size="sm" className="group">
                  {config.cta_label}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Product Grid or Carousel */}
        {isCarousel ? (
          <div
            ref={scrollContainerRef}
            onScroll={updateScrollButtons}
            className="flex overflow-x-auto gap-8 pb-4 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map(product => (
              <div
                key={product.uid}
                className="product-feed-card flex-shrink-0 w-[280px] md:w-[320px] snap-start"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map(product => (
              <ProductCard key={product.uid} product={product} />
            ))}
          </div>
        )}

        {/* Mobile CTA */}
        {config.cta_label && config.cta_href && (
          <div className="mt-8 text-center md:hidden">
            <Link href={config.cta_href}>
              <Button variant="outline" className="group">
                {config.cta_label}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
