'use client';

/**
 * Lytics-powered product recommendation rail.
 *
 * Renders real products with images, served from Lytics Content Recommendations (with catalog
 * top-up while the collection finishes classifying — see useRecommendations). No fabricated data.
 */
import { useEffect, useRef } from 'react';
import Link from 'next/link';
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
  const impressionSent = useRef('');

  useEffect(() => {
    if (!ranked.length) return;
    const key = ranked.map((r) => r.url).join('|');
    if (impressionSent.current === key) return;
    impressionSent.current = key;
    sendLyticsEvent('recommendations_view', {
      placement,
      source: meta.source,
      recommended_count: ranked.length,
      recommended_urls: ranked.map((r) => r.url),
    });
  }, [ranked, placement, meta.source]);

  if (meta.loaded && ranked.length === 0) return null;
  if (!ranked.length) return null;

  const onCardClick = (item: RankedProduct, index: number) =>
    sendLyticsEvent('recommendation_click', {
      placement,
      product_url: item.url,
      product_title: item.title,
      position: index + 1,
      match: item.match,
      source: item.source,
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
            {item.match > 0 && (
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
          </div>
          <div className="p-4 flex flex-col gap-1.5 flex-1">
            {item.category && (
              <span className="text-[0.7rem] uppercase tracking-wide text-gold-600 font-medium">
                {item.category.replace(/-/g, ' ')}
              </span>
            )}
            <span className="font-semibold text-gray-900 leading-snug line-clamp-2">{item.title}</span>
            {item.topics.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-0.5">
                {item.topics.map((t) => (
                  <span key={t} className="text-[0.65rem] text-gray-500 bg-gray-100 rounded px-1.5 py-0.5">
                    {t.replace(/-/g, ' ')}
                  </span>
                ))}
              </div>
            )}
            {item.price != null && (
              <span className="font-bold text-gray-900 mt-auto pt-1">{formatPrice(item.price)}</span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );

  if (variant === 'bare') {
    return (
      <div className={className} data-rec-placement={placement} data-rec-source={meta.source}>
        {title && <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900 mb-2">{title}</h2>}
        {subtitle && <p className="text-gray-600 mb-6">{subtitle}</p>}
        {grid}
      </div>
    );
  }

  return (
    <section className={`section-spacing ${className}`} data-rec-placement={placement} data-rec-source={meta.source} aria-label={title}>
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
