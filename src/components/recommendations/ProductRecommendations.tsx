'use client';

/**
 * Lytics-powered product recommendation rail.
 *
 * Renders the REAL DemoLux product catalog (live from Contentstack, with images) ranked by the
 * visitor's content affinity — exactly the model the Lytics recommendation engine uses
 * (see demo/lytics-perry). Ranking source, in priority order:
 *   1. window.jstag.recommend() product docs — used directly when the Lytics content sync is live
 *      and returns product documents (url under /products/ with an image).
 *   2. The visitor's content-affinity (from the demo Audience switcher / Lytics profile topics).
 *   3. Cold-start popularity (price-weighted) when there's no affinity signal yet.
 *
 * Products and images are always real catalog data — never fabricated. If the catalog can't be
 * loaded at all, the rail hides itself.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { sendLyticsEvent } from '@/lib/tracking-utils';
import { normalizeRecommendations, type LyticsRecommendation } from '@/lib/recommendations';

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
  score: number;
  match: number; // 0-100 relative match
}

const AUDIENCE_AFFINITY_KEY = 'demo_audience_affinity';

// Map our catalog category -> the Lytics topic vocabulary used for affinity scoring.
function categoryTopic(category?: string): string | null {
  if (category === 'wearable-tech') return 'wearables';
  if (category === 'technofurniture') return 'technofurniture';
  return category || null;
}

function productTopics(p: any): string[] {
  const topics = new Set<string>();
  const ct = categoryTopic(p.category);
  if (ct) topics.add(ct);
  for (const tag of p.product_tags || []) topics.add(String(tag).toLowerCase());
  return Array.from(topics);
}

function productImage(p: any): string | undefined {
  const f = p.featured_image;
  const img = Array.isArray(f) ? f[0] : f;
  return img?.url;
}

// Read the visitor's content affinity: the Audience switcher writes a topic->weight map;
// otherwise we look at the live Lytics profile's content-affinity topics if available.
function readAffinity(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = window.localStorage.getItem(AUDIENCE_AFFINITY_KEY);
    if (stored) return JSON.parse(stored) || {};
  } catch {
    /* ignore */
  }
  return {};
}

export default function ProductRecommendations({
  title = 'Recommended for you',
  subtitle,
  collection = 'Default Recommendation Collection',
  limit = 8,
  visited,
  shuffle,
  excludeUrl,
  placement = 'recommendations',
  className = '',
  variant = 'section',
}: ProductRecommendationsProps) {
  const [catalog, setCatalog] = useState<any[]>([]);
  const [liveRecs, setLiveRecs] = useState<RankedProduct[] | null>(null);
  const [affinity, setAffinity] = useState<Record<string, number>>({});
  const [profileAffinity, setProfileAffinity] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);
  const impressionSent = useRef('');

  // 1) Load the real catalog (with images) once.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/products')
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setCatalog(Array.isArray(d.products) ? d.products : []);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, []);

  // 2) Read affinity now + whenever the Audience switcher changes it.
  useEffect(() => {
    const update = () => setAffinity(readAffinity());
    update();
    window.addEventListener('demo-audience-changed', update);
    return () => window.removeEventListener('demo-audience-changed', update);
  }, []);

  // 2b) Read the visitor's LIVE Lytics content-affinity from their profile (built from browsing
  // classified product pages). This makes real browsing re-rank the rail even before the product
  // sync is enabled. Best-effort: the `global` topic->score map can live at a few profile paths.
  useEffect(() => {
    const jstag = typeof window !== 'undefined' ? window.jstag : undefined;
    if (!jstag?.getEntity) return;
    const extract = (profile: any): Record<string, number> => {
      const candidates = [profile?.global, profile?.data?.global, profile?.data?.user?.global];
      for (const c of candidates) {
        if (c && typeof c === 'object') {
          const map: Record<string, number> = {};
          for (const [k, v] of Object.entries(c)) {
            if (typeof v === 'number') map[String(k).toLowerCase()] = v;
          }
          if (Object.keys(map).length) return map;
        }
      }
      return {};
    };
    try {
      jstag.getEntity((profile: any) => setProfileAffinity(extract(profile)));
    } catch {
      /* ignore */
    }
  }, []);

  // 3) Try live Lytics recommendations — use them only if they're real product docs with images.
  useEffect(() => {
    const jstag = typeof window !== 'undefined' ? window.jstag : undefined;
    if (!jstag?.recommend) return;
    const opts: any = { collection, limit: (excludeUrl ? limit + 1 : limit) + 2 };
    if (visited !== undefined) opts.visited = visited;
    if (shuffle !== undefined) opts.shuffle = shuffle;
    let cancelled = false;
    try {
      jstag.recommend(opts, (recs: LyticsRecommendation[]) => {
        if (cancelled) return;
        const items = normalizeRecommendations(recs, excludeUrl)
          .filter((r) => /\/products\//.test(r.url) && r.image) // products with images only
          .slice(0, limit)
          .map<RankedProduct>((r, i, arr) => ({
            url: r.url,
            title: r.title,
            image: r.image,
            price: r.price,
            category: r.category,
            topics: r.topics || [],
            score: arr.length - i,
            match: Math.round((100 * (arr.length - i)) / arr.length),
          }));
        if (items.length) setLiveRecs(items);
      });
    } catch {
      /* fall through to catalog ranking */
    }
    return () => {
      cancelled = true;
    };
  }, [collection, limit, visited, shuffle, excludeUrl]);

  // 4) Rank the real catalog by affinity (or cold-start popularity) — the Lytics ranking model.
  const ranked = useMemo<RankedProduct[]>(() => {
    if (liveRecs && liveRecs.length) return liveRecs;
    const products = catalog.filter((p) => p?.url && p.url !== excludeUrl);
    if (!products.length) return [];
    const maxPrice = Math.max(...products.map((p) => p.price || 0), 1);
    // Switcher override wins (explicit demo intent); else the live Lytics profile affinity.
    const activeAffinity = Object.keys(affinity).length ? affinity : profileAffinity;
    const hasAffinity = Object.keys(activeAffinity).length > 0;

    const scored = products.map((p) => {
      const topics = productTopics(p);
      let score: number;
      if (hasAffinity) {
        score = topics.reduce((s, t) => s + (activeAffinity[t] || 0), 0);
      } else {
        // cold-start popularity proxy = normalized price (premium catalog)
        score = 0.15 + 0.85 * ((p.price || 0) / maxPrice);
      }
      return {
        url: p.url,
        title: p.title,
        image: productImage(p),
        price: p.price,
        category: p.category,
        topics,
        score,
      };
    });

    let pool = scored;
    if (shuffle) pool = [...scored].sort(() => Math.random() - 0.5);
    pool.sort((a, b) => b.score - a.score);
    const top = pool.slice(0, limit);
    const maxScore = top[0]?.score || 1;
    return top.map((r) => ({ ...r, match: Math.round((100 * r.score) / maxScore) }));
  }, [catalog, liveRecs, affinity, profileAffinity, excludeUrl, limit, shuffle]);

  // Impression tracking (once per resolved set).
  useEffect(() => {
    if (!ranked.length) return;
    const key = ranked.map((r) => r.url).join('|');
    if (impressionSent.current === key) return;
    impressionSent.current = key;
    sendLyticsEvent('recommendations_view', {
      placement,
      collection,
      source: liveRecs ? 'lytics_recommend' : 'affinity_rank',
      recommended_count: ranked.length,
      recommended_urls: ranked.map((r) => r.url),
    });
  }, [ranked, placement, collection, liveRecs]);

  // Only hide if the catalog genuinely couldn't load (never show fabricated data).
  if (loaded && ranked.length === 0) return null;
  if (!ranked.length) return null;

  const onCardClick = (item: RankedProduct, index: number) => {
    sendLyticsEvent('recommendation_click', {
      placement,
      collection,
      product_url: item.url,
      product_title: item.title,
      position: index + 1,
      match: item.match,
    });
  };

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
            <span className="font-semibold text-gray-900 leading-snug line-clamp-2">
              {item.title}
            </span>
            {item.topics.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-0.5">
                {item.topics.slice(0, 3).map((t) => (
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
      <div className={className} data-rec-placement={placement}>
        {title && (
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900 mb-2">{title}</h2>
        )}
        {subtitle && <p className="text-gray-600 mb-6">{subtitle}</p>}
        {grid}
      </div>
    );
  }

  return (
    <section className={`section-spacing ${className}`} data-rec-placement={placement} aria-label={title}>
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
