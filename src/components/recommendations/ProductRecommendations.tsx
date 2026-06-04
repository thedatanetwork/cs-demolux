'use client';

/**
 * Lytics Content Recommendations rail.
 *
 * Calls window.jstag.recommend() against a real, populated Lytics collection and renders the
 * returned products, ranked by the visitor's content affinity. There is intentionally NO static
 * fallback: if Lytics returns nothing, the rail hides itself. Never substitute fabricated data.
 */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import {
  normalizeRecommendations,
  type RecItem,
  type LyticsRecommendation,
} from '@/lib/recommendations';
import { sendLyticsEvent } from '@/lib/tracking-utils';

interface ProductRecommendationsProps {
  title?: string;
  subtitle?: string;
  /** Lytics collection name, e.g. "PRODUCTS". */
  collection?: string;
  limit?: number;
  /** false = exclude content this visitor already viewed ("you might also like"). */
  visited?: boolean;
  /** Randomize order (cold-start / variety). */
  shuffle?: boolean;
  /** Exclude a specific product URL (e.g. the current PDP). */
  excludeUrl?: string;
  /** Event name used for the impression sent to Lytics. */
  placement?: string;
  className?: string;
  /** Visual style: full section band (default) or bare grid embedded in another section. */
  variant?: 'section' | 'bare';
}

export default function ProductRecommendations({
  title = 'Recommended for you',
  subtitle,
  collection = 'PRODUCTS',
  limit = 8,
  visited,
  shuffle,
  excludeUrl,
  placement = 'recommendations',
  className = '',
  variant = 'section',
}: ProductRecommendationsProps) {
  const [items, setItems] = useState<RecItem[]>([]);
  const [status, setStatus] = useState<'loading' | 'live' | 'empty'>('loading');
  const impressionSent = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const jstag = typeof window !== 'undefined' ? window.jstag : undefined;
    if (!jstag?.recommend) {
      setStatus('empty');
      return;
    }

    const opts: { collection: string; limit: number; visited?: boolean; shuffle?: boolean } = {
      collection,
      limit: excludeUrl ? limit + 1 : limit, // request one extra so excluding current still fills the row
    };
    if (visited !== undefined) opts.visited = visited;
    if (shuffle !== undefined) opts.shuffle = shuffle;

    jstag.recommend(opts, (recs: LyticsRecommendation[]) => {
      if (cancelled) return;
      const normalized = normalizeRecommendations(recs, excludeUrl).slice(0, limit);
      if (normalized.length > 0) {
        setItems(normalized);
        setStatus('live');
      } else {
        setStatus('empty');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [collection, limit, visited, shuffle, excludeUrl]);

  // Report the impression to Lytics once the rail actually renders products.
  useEffect(() => {
    if (status === 'live' && items.length && !impressionSent.current) {
      impressionSent.current = true;
      sendLyticsEvent('recommendations_view', {
        placement,
        collection,
        recommended_count: items.length,
        recommended_urls: items.map((i) => i.url),
      });
    }
  }, [status, items, placement, collection]);

  // No products from Lytics → hide the rail entirely (no placeholder/fake data).
  if (status !== 'live' || items.length === 0) return null;

  const onCardClick = (item: RecItem, index: number) => {
    sendLyticsEvent('recommendation_click', {
      placement,
      collection,
      product_url: item.url,
      product_title: item.title,
      position: index + 1,
    });
  };

  const grid = (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map((item, index) => (
        <Link
          key={item.url}
          href={item.url}
          onClick={() => onCardClick(item, index)}
          className="group flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-200"
        >
          <div className="aspect-square bg-gray-50 overflow-hidden">
            {item.image ? (
              // Recommendation image hosts vary; use a plain img to avoid next/image domain config.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                {item.title}
              </div>
            )}
          </div>
          <div className="p-4 flex flex-col gap-1.5">
            {item.category && (
              <span className="text-[0.7rem] uppercase tracking-wide text-gray-500">
                {item.category.replace(/-/g, ' ')}
              </span>
            )}
            <span className="font-semibold text-gray-900 leading-snug line-clamp-2">
              {item.title}
            </span>
            {item.price != null && (
              <span className="font-bold text-gray-900 mt-1">{formatPrice(item.price)}</span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );

  if (variant === 'bare') {
    return (
      <div className={className} data-rec-source="live" data-rec-placement={placement}>
        {title && (
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900 mb-2">{title}</h2>
        )}
        {subtitle && <p className="text-gray-600 mb-6">{subtitle}</p>}
        {grid}
      </div>
    );
  }

  return (
    <section
      className={`section-spacing ${className}`}
      data-rec-source="live"
      data-rec-placement={placement}
      aria-label={title}
    >
      <div className="container-padding">
        <div className="mb-8">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
        </div>
        {grid}
      </div>
    </section>
  );
}
