'use client';

/**
 * Lytics-powered product recommendation rail.
 *
 * Renders real products with images, served from Lytics Content Recommendations (with catalog
 * top-up while the collection finishes classifying — see useRecommendations). A per-rail
 * "Why these?" toggle overlays the recommendation diagnostics directly on each card (source,
 * match score, the affinity reason, topics). No fabricated data.
 */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Info } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { sendLyticsEvent } from '@/lib/tracking-utils';
import { useRecommendations, type RankedProduct, type RecMeta } from './useRecommendations';

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

const SOURCE_LABEL: Record<string, string> = {
  lytics: 'Lytics Content Recommendations',
  'lytics+catalog': 'Lytics recs + catalog fill',
  catalog: 'Catalog (browsing affinity)',
};

function whyLine(item: RankedProduct, meta: RecMeta): string {
  const matched = item.topics.find((t) => (meta.affinity || {})[t] > 0);
  if (matched) return `Matches your interest in ${matched.replace(/-/g, ' ')}`;
  if (item.source === 'lytics') return 'Recommended by Lytics for this visitor';
  return meta.affinitySource === 'none' ? 'Popular pick (no profile yet)' : 'Catalog pick';
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
      source: meta.source,
      recommended_count: ranked.length,
      recommended_urls: ranked.map((r) => r.url),
    });
  }, [ranked, placement, meta.source]);

  if (meta.loaded && ranked.length === 0) return null;
  if (!ranked.length) return null;

  const topAffinity = Object.entries(meta.affinity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([t]) => t.replace(/-/g, ' '));

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

            {/* Recommendation details overlay (toggled via "Why these?") — lightweight text pills
                over the image so the product stays visible. */}
            {showDetails && (
              <div className="absolute inset-0 z-20 p-2.5 flex flex-col justify-between text-xs pointer-events-none">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[0.6rem] font-bold tracking-wide shadow ${
                      item.source === 'lytics' ? 'bg-gold-500 text-white' : 'bg-gray-900/80 text-white'
                    }`}
                  >
                    {item.source === 'lytics' ? 'LYTICS REC' : 'CATALOG FILL'}
                  </span>
                  {item.match > 0 && (
                    <span className="rounded bg-gray-900/80 text-gold-300 font-bold px-1.5 py-0.5 shadow">
                      {item.match}% match
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-start gap-1.5">
                  <span className="inline-block bg-gray-900/85 text-white font-medium rounded px-2 py-1 leading-snug shadow">
                    {whyLine(item, meta)}
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
            {SOURCE_LABEL[meta.source]} · {meta.liveCount} from Lytics
            {meta.catalogCount > 0 && `, ${meta.catalogCount} catalog`}
            {topAffinity.length > 0 && ` · affinity: ${topAffinity.join(', ')}`}
          </p>
        )}
      </div>
      <button
        onClick={() => setShowDetails((v) => !v)}
        className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
          showDetails
            ? 'border-gold-400 bg-gold-50 text-gold-800'
            : 'border-gray-200 text-gray-600 hover:border-gray-300'
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
      <div className={className} data-rec-placement={placement} data-rec-source={meta.source}>
        {header}
        {grid}
      </div>
    );
  }

  return (
    <section className={`section-spacing ${className}`} data-rec-placement={placement} data-rec-source={meta.source} aria-label={title}>
      <div className="container-padding">
        {header}
        {grid}
      </div>
    </section>
  );
}
