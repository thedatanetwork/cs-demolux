'use client';

/**
 * Lytics-powered product recommendation rail.
 *
 * PRIMARY source is real Lytics Content Recommendations: window.jstag.recommend() against the
 * account's product content collections (PRODUCTS / Documents With Images on aid 8083). Those
 * docs carry the product URL + primary_image; we enrich each with price/category from the live
 * Contentstack catalog. If the Lytics tag isn't present or returns nothing, the rail falls back
 * to ranking the real catalog by the visitor's browsing affinity (never fabricated data).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { sendLyticsEvent } from '@/lib/tracking-utils';
import { normalizeRecommendations, type LyticsRecommendation, type RecItem } from '@/lib/recommendations';
import { readBrowsingAffinity, BROWSING_AFFINITY_EVENT, topicsFor } from '@/lib/browsing-affinity';

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

interface RankedProduct {
  url: string;
  title: string;
  image?: string;
  price?: number;
  category?: string;
  topics: string[];
  match: number;
}

const AUDIENCE_AFFINITY_KEY = 'demo_audience_affinity';
// Lytics content collections on aid 8083 (slug + display name both accepted by the tag).
const COLLECTION_FALLBACKS = ['products', 'all_documents_with_images', 'PRODUCTS', 'Documents With Images'];

function productImage(p: any): string | undefined {
  const f = p?.featured_image;
  const img = Array.isArray(f) ? f[0] : f;
  return img?.url;
}

function readAffinity(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(AUDIENCE_AFFINITY_KEY) || '{}') || {};
  } catch {
    return {};
  }
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
  const [catalog, setCatalog] = useState<any[]>([]);
  const [liveRecs, setLiveRecs] = useState<RecItem[] | null>(null); // raw, Lytics-ranked
  const [affinity, setAffinity] = useState<Record<string, number>>({});
  const [browsingAffinity, setBrowsingAffinity] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);
  const impressionSent = useRef('');

  // Load the real catalog (price/category/image enrichment + affinity fallback).
  useEffect(() => {
    let cancelled = false;
    fetch('/api/products')
      .then((r) => r.json())
      .then((d) => !cancelled && setCatalog(Array.isArray(d.products) ? d.products : []))
      .catch(() => {})
      .finally(() => !cancelled && setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, []);

  // Index catalog by site path for fast enrichment.
  const catalogIndex = useMemo(() => {
    const m = new Map<string, { price?: number; category?: string; image?: string; topics: string[] }>();
    for (const p of catalog) {
      if (p?.url) {
        m.set(p.url, {
          price: p.price,
          category: p.category,
          image: productImage(p),
          topics: topicsFor(p.category, p.product_tags),
        });
      }
    }
    return m;
  }, [catalog]);

  // Affinity for the fallback ranking (Audience switcher + the visitor's own browsing).
  useEffect(() => {
    const update = () => setAffinity(readAffinity());
    update();
    window.addEventListener('demo-audience-changed', update);
    return () => window.removeEventListener('demo-audience-changed', update);
  }, []);
  useEffect(() => {
    const update = () => setBrowsingAffinity(readBrowsingAffinity());
    update();
    window.addEventListener(BROWSING_AFFINITY_EVENT, update);
    return () => window.removeEventListener(BROWSING_AFFINITY_EVENT, update);
  }, []);

  // PRIMARY: pull live Lytics recommendations. Try the configured collection + known product
  // collections in parallel and keep whichever returns the most product docs (with images).
  useEffect(() => {
    const jstag = typeof window !== 'undefined' ? window.jstag : undefined;
    if (!jstag?.recommend) return;
    let cancelled = false;

    const candidates = Array.from(new Set([collection, ...COLLECTION_FALLBACKS])).filter(Boolean);
    const want = (excludeUrl ? limit + 1 : limit) + 2;

    const recommendOnce = (coll: string) =>
      new Promise<RecItem[]>((resolve) => {
        let done = false;
        const t = setTimeout(() => !done && ((done = true), resolve([])), 3000);
        const opts: any = { collection: coll, limit: want };
        if (visited !== undefined) opts.visited = visited;
        if (shuffle !== undefined) opts.shuffle = shuffle;
        try {
          jstag.recommend(opts, (recs: LyticsRecommendation[]) => {
            if (done) return;
            done = true;
            clearTimeout(t);
            const items = normalizeRecommendations(recs, excludeUrl).filter(
              (r) => /\/products\//.test(r.url) && r.image
            );
            resolve(items);
          });
        } catch {
          resolve([]);
        }
      });

    Promise.all(candidates.map(recommendOnce)).then((results) => {
      if (cancelled) return;
      const best = results.reduce((a, b) => (b.length > a.length ? b : a), [] as RecItem[]);
      if (best.length) setLiveRecs(best.slice(0, limit));
    });

    return () => {
      cancelled = true;
    };
  }, [collection, limit, visited, shuffle, excludeUrl]);

  const ranked = useMemo<RankedProduct[]>(() => {
    // Lytics recommendations win — enrich each with catalog price/category.
    if (liveRecs && liveRecs.length) {
      const items = liveRecs.slice(0, limit);
      const n = items.length;
      return items.map((r, i) => {
        const cat = catalogIndex.get(r.url);
        return {
          url: r.url,
          title: r.title,
          image: r.image || cat?.image,
          price: r.price ?? cat?.price,
          category: r.category || cat?.category,
          topics: (r.topics && r.topics.length ? r.topics : cat?.topics || []).slice(0, 3),
          match: Math.round((100 * (n - i)) / n),
        };
      });
    }

    // Fallback: rank the real catalog by affinity (switcher > browsing) or cold-start popularity.
    const products = catalog.filter((p) => p?.url && p.url !== excludeUrl);
    if (!products.length) return [];
    const maxPrice = Math.max(...products.map((p) => p.price || 0), 1);
    const activeAffinity = Object.keys(affinity).length ? affinity : browsingAffinity;
    const hasAffinity = Object.keys(activeAffinity).length > 0;

    const scored = products.map((p) => {
      const topics = topicsFor(p.category, p.product_tags);
      const score = hasAffinity
        ? topics.reduce((s, t) => s + (activeAffinity[t] || 0), 0)
        : 0.15 + 0.85 * ((p.price || 0) / maxPrice);
      return { url: p.url, title: p.title, image: productImage(p), price: p.price, category: p.category, topics, score };
    });

    let pool = scored;
    if (shuffle) pool = [...scored].sort(() => Math.random() - 0.5);
    pool.sort((a, b) => b.score - a.score);
    const top = pool.slice(0, limit);
    const maxScore = top[0]?.score || 1;
    return top.map((r) => ({
      url: r.url,
      title: r.title,
      image: r.image,
      price: r.price,
      category: r.category,
      topics: r.topics.slice(0, 3),
      match: Math.round((100 * r.score) / maxScore),
    }));
  }, [liveRecs, catalog, catalogIndex, affinity, browsingAffinity, excludeUrl, limit, shuffle]);

  // Impression (once per resolved set).
  useEffect(() => {
    if (!ranked.length) return;
    const key = ranked.map((r) => r.url).join('|');
    if (impressionSent.current === key) return;
    impressionSent.current = key;
    sendLyticsEvent('recommendations_view', {
      placement,
      source: liveRecs ? 'lytics_recommend' : 'affinity_rank',
      recommended_count: ranked.length,
      recommended_urls: ranked.map((r) => r.url),
    });
  }, [ranked, placement, liveRecs]);

  if (loaded && ranked.length === 0) return null;
  if (!ranked.length) return null;

  const onCardClick = (item: RankedProduct, index: number) =>
    sendLyticsEvent('recommendation_click', {
      placement,
      product_url: item.url,
      product_title: item.title,
      position: index + 1,
      match: item.match,
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
            <span className="absolute top-2 left-2 z-10 rounded-md bg-gray-900/85 text-white text-[0.7rem] font-bold px-2 py-0.5">
              #{index + 1}
            </span>
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
      <div className={className} data-rec-placement={placement} data-rec-source={liveRecs ? 'lytics' : 'catalog'}>
        {title && <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900 mb-2">{title}</h2>}
        {subtitle && <p className="text-gray-600 mb-6">{subtitle}</p>}
        {grid}
      </div>
    );
  }

  return (
    <section
      className={`section-spacing ${className}`}
      data-rec-placement={placement}
      data-rec-source={liveRecs ? 'lytics' : 'catalog'}
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
