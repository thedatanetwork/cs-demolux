'use client';

/**
 * Lytics-powered product recommendation rail.
 *
 * The products and their order come ONLY from window.jstag.recommend() (real Lytics Content
 * Recommendations). Catalog data is used solely to hydrate display price/image. If Lytics returns
 * nothing, the rail renders nothing — no fabricated or front-end-computed fallback.
 */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Info } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { sendLyticsEvent } from '@/lib/tracking-utils';
import { useRecommendations, type RankedProduct } from './useRecommendations';

interface ProductRecommendationsProps {
  title?: string;
  subtitle?: string;
  collection?: string;
  limit?: number;
  visited?: boolean;
  shuffle?: boolean;
  excludeUrl?: string;
  placement?: string;
  className?: string;
  variant?: 'section' | 'bare';
}

function whyLine(item: RankedProduct): string {
  if (item.topics.length) return `Matched on ${item.topics[0].replace(/-/g, ' ')}`;
  return 'Recommended by Lytics for this visitor';
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
  const { ranked, meta } = useRecommendations({ collection, limit, visited, shuffle, excludeUrl });
  const [showDetails, setShowDetails] = useState(false);
  const impressionSent = useRef('');

  useEffect(() => {
    if (!ranked.length) return;
    const key = ranked.map((r) => r.url).join('|');
    if (impressionSent.current === key) return;
    impressionSent.current = key;
    sendLyticsEvent('recommendations_view', {
      placement,
      source: 'lytics',
      collection: meta.collectionUsed,
      recommended_count: ranked.length,
      recommended_urls: ranked.map((r) => r.url),
    });
  }, [ranked, placement, meta.collectionUsed]);

  // Pure Lytics: render only when Lytics returns products. While empty, emit a
  // hidden diagnostic marker so the live component's internal state is inspectable.
  if (!ranked.length)
    return <span data-rec-debug={meta.debug} data-rec-placement={placement} style={{ display: 'none' }} />;

  const onCardClick = (item: RankedProduct, index: number) =>
    sendLyticsEvent('recommendation_click', {
      placement,
      product_url: item.url,
      product_title: item.title,
      position: index + 1,
      match: item.match,
      source: 'lytics',
    });

  const grid = (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {ranked.map((item, index) => (
        <Link
          key={item.url}
          href={item.url}
          onClick={() => onCardClick(item, index)}
          className="group relative flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-200"
        >
          <div className="relative aspect-square bg-gray-50 overflow-hidden">
            {!showDetails && item.match > 0 && (
              <span className="absolute top-2 right-2 z-10 rounded-md bg-gold-500 text-white text-[0.7rem] font-bold px-2 py-0.5">
                {item.match}% match
              </span>
            )}
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm px-3 text-center">
                {item.title}
              </div>
            )}

            {/* "Why these?" overlay — lightweight pills over a visible image */}
            {showDetails && (
              <div className="absolute inset-0 z-20 p-2.5 flex flex-col justify-between text-xs pointer-events-none">
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded px-1.5 py-0.5 text-[0.6rem] font-bold tracking-wide shadow bg-gold-500 text-white">
                    LYTICS REC
                  </span>
                  {item.match > 0 && (
                    <span className="rounded bg-gray-900/80 text-gold-300 font-bold px-1.5 py-0.5 shadow">
                      {item.match}% match
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-start gap-1.5">
                  <span className="inline-block bg-gray-900/85 text-white font-medium rounded px-2 py-1 leading-snug shadow">
                    {whyLine(item)}
                  </span>
                  {item.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.topics.map((t) => (
                        <span key={t} className="text-[0.6rem] bg-gray-900/75 text-white rounded px-1.5 py-0.5">
                          {t.replace(/-/g, ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="p-4 flex flex-col gap-1.5 flex-1">
            {item.category && (
              <span className="text-[0.7rem] uppercase tracking-wide text-gold-600 font-medium">
                {item.category.replace(/-/g, ' ')}
              </span>
            )}
            <span className="font-semibold text-gray-900 leading-snug line-clamp-2">{item.title}</span>
            {item.price != null && (
              <span className="font-bold text-gray-900 mt-auto pt-1">{formatPrice(item.price)}</span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );

  const header = (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
        {showDetails && (
          <p className="text-xs text-gray-500 mt-2">
            Lytics Content Recommendations · {meta.liveCount} product{meta.liveCount === 1 ? '' : 's'}
            {meta.collectionUsed && ` · collection ${meta.collectionUsed}`}
          </p>
        )}
      </div>
      <button
        onClick={() => setShowDetails((v) => !v)}
        className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
          showDetails ? 'border-gold-400 bg-gold-50 text-gold-800' : 'border-gray-200 text-gray-600 hover:border-gray-300'
        }`}
        aria-pressed={showDetails}
      >
        <Info className="h-3.5 w-3.5" />
        Why these?
      </button>
    </div>
  );

  if (variant === 'bare') {
    return (
      <div className={className} data-rec-placement={placement} data-rec-source="lytics">
        {header}
        {grid}
      </div>
    );
  }

  return (
    <section className={`section-spacing ${className}`} data-rec-placement={placement} data-rec-source="lytics" aria-label={title}>
      <div className="container-padding">
        {header}
        {grid}
      </div>
    </section>
  );
}
