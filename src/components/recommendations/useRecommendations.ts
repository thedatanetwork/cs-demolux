'use client';

/**
 * Shared recommendation logic used by both the on-page rail (<ProductRecommendations>) and the
 * "Recommendations Details" diagnostics panel, so they always agree.
 *
 * Source priority: live Lytics jstag.recommend() product docs -> catalog top-up ranked by the
 * visitor's content affinity (browsing) / cold-start popularity. Real product data only.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { normalizeRecommendations, type LyticsRecommendation, type RecItem } from '@/lib/recommendations';
import { readBrowsingAffinity, BROWSING_AFFINITY_EVENT, topicsFor } from '@/lib/browsing-affinity';

export interface RankedProduct {
  url: string;
  title: string;
  image?: string;
  price?: number;
  category?: string;
  topics: string[];
  match: number;
  source: 'lytics' | 'catalog';
}

export interface RecMeta {
  source: 'lytics' | 'lytics+catalog' | 'catalog';
  liveCount: number;
  catalogCount: number;
  collectionUsed: string | null;
  affinity: Record<string, number>;
  affinitySource: 'audience' | 'browsing' | 'none';
  loaded: boolean;
}

interface Options {
  collection?: string;
  limit?: number;
  visited?: boolean;
  shuffle?: boolean;
  excludeUrl?: string;
}

const AUDIENCE_AFFINITY_KEY = 'demo_audience_affinity';
const COLLECTION_FALLBACKS = ['products', 'all_documents_with_images', 'PRODUCTS', 'Documents With Images'];

function productImage(p: any): string | undefined {
  const f = p?.featured_image;
  const img = Array.isArray(f) ? f[0] : f;
  return img?.url;
}

function readAudienceAffinity(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(AUDIENCE_AFFINITY_KEY) || '{}') || {};
  } catch {
    return {};
  }
}

export function useRecommendations({
  collection = 'PRODUCTS',
  limit = 8,
  visited,
  shuffle,
  excludeUrl,
}: Options): { ranked: RankedProduct[]; meta: RecMeta } {
  const [catalog, setCatalog] = useState<any[]>([]);
  const [liveRecs, setLiveRecs] = useState<RecItem[] | null>(null);
  const [collectionUsed, setCollectionUsed] = useState<string | null>(null);
  const [audienceAff, setAudienceAff] = useState<Record<string, number>>({});
  const [browsingAff, setBrowsingAff] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);

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

  useEffect(() => {
    const update = () => setAudienceAff(readAudienceAffinity());
    update();
    window.addEventListener('demo-audience-changed', update);
    return () => window.removeEventListener('demo-audience-changed', update);
  }, []);
  useEffect(() => {
    const update = () => setBrowsingAff(readBrowsingAffinity());
    update();
    window.addEventListener(BROWSING_AFFINITY_EVENT, update);
    return () => window.removeEventListener(BROWSING_AFFINITY_EVENT, update);
  }, []);

  // Live Lytics recommendations: try the product collections in parallel, keep the most.
  useEffect(() => {
    const jstag = typeof window !== 'undefined' ? window.jstag : undefined;
    if (!jstag?.recommend) return;
    let cancelled = false;
    const candidates = Array.from(new Set([collection, ...COLLECTION_FALLBACKS])).filter(Boolean);
    const want = (excludeUrl ? limit + 1 : limit) + 2;

    const recommendOnce = (coll: string) =>
      new Promise<{ coll: string; items: RecItem[] }>((resolve) => {
        let done = false;
        const t = setTimeout(() => !done && ((done = true), resolve({ coll, items: [] })), 3000);
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
            resolve({ coll, items });
          });
        } catch {
          resolve({ coll, items: [] });
        }
      });

    Promise.all(candidates.map(recommendOnce)).then((results) => {
      if (cancelled) return;
      const best = results.reduce((a, b) => (b.items.length > a.items.length ? b : a), {
        coll: '',
        items: [] as RecItem[],
      });
      if (best.items.length) {
        setLiveRecs(best.items.slice(0, limit));
        setCollectionUsed(best.coll);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [collection, limit, visited, shuffle, excludeUrl]);

  const activeAffinity = Object.keys(audienceAff).length ? audienceAff : browsingAff;
  const affinitySource: RecMeta['affinitySource'] = Object.keys(audienceAff).length
    ? 'audience'
    : Object.keys(browsingAff).length
    ? 'browsing'
    : 'none';

  const ranked = useMemo<RankedProduct[]>(() => {
    const result: RankedProduct[] = [];
    const seen = new Set<string>();

    if (liveRecs && liveRecs.length) {
      const items = liveRecs.slice(0, limit);
      const n = items.length;
      items.forEach((r, i) => {
        const cat = catalogIndex.get(r.url);
        result.push({
          url: r.url,
          title: r.title,
          image: r.image || cat?.image,
          price: r.price ?? cat?.price,
          category: r.category || cat?.category,
          topics: (r.topics && r.topics.length ? r.topics : cat?.topics || []).slice(0, 3),
          match: Math.round((100 * (n - i)) / n),
          source: 'lytics',
        });
        seen.add(r.url);
      });
    }

    if (result.length < limit) {
      const products = catalog.filter((p) => p?.url && p.url !== excludeUrl && !seen.has(p.url));
      if (products.length) {
        const maxPrice = Math.max(...products.map((p) => p.price || 0), 1);
        const hasAffinity = Object.keys(activeAffinity).length > 0;
        const scored = products.map((p) => {
          const topics = topicsFor(p.category, p.product_tags);
          const score = hasAffinity
            ? topics.reduce((s, t) => s + (activeAffinity[t] || 0), 0)
            : 0.15 + 0.85 * ((p.price || 0) / maxPrice);
          return { p, topics, score };
        });
        let pool = scored;
        if (shuffle) pool = [...scored].sort(() => Math.random() - 0.5);
        pool.sort((a, b) => b.score - a.score);
        for (const { p, topics } of pool) {
          if (result.length >= limit) break;
          result.push({
            url: p.url,
            title: p.title,
            image: productImage(p),
            price: p.price,
            category: p.category,
            topics: topics.slice(0, 3),
            match: 0,
            source: 'catalog',
          });
          seen.add(p.url);
        }
      }
    }
    return result;
  }, [liveRecs, catalog, catalogIndex, activeAffinity, excludeUrl, limit, shuffle]);

  const liveCount = ranked.filter((r) => r.source === 'lytics').length;
  const catalogCount = ranked.length - liveCount;
  const meta: RecMeta = {
    source: liveCount ? (catalogCount ? 'lytics+catalog' : 'lytics') : 'catalog',
    liveCount,
    catalogCount,
    collectionUsed,
    affinity: activeAffinity,
    affinitySource,
    loaded,
  };

  return { ranked, meta };
}
