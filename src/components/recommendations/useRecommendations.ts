'use client';

/**
 * Lytics Content Recommendations — the ONLY source for the rails.
 *
 * The recommended product set and their order come entirely from window.jstag.recommend()
 * (ranked server-side by the visitor's Lytics content affinity). The Contentstack catalog is
 * used ONLY to hydrate display fields the Lytics content doc lacks (price, clean title, image).
 * There is no front-end affinity model and no catalog "fill": if Lytics returns no products,
 * the rail renders nothing.
 */
import { useEffect, useMemo, useState } from 'react';
import { normalizeRecommendations, type LyticsRecommendation, type RecItem } from '@/lib/recommendations';

export interface RankedProduct {
  url: string;
  title: string;
  image?: string;
  price?: number;
  category?: string;
  topics: string[];
  match: number;
}

export interface RecMeta {
  liveCount: number;
  collectionUsed: string | null;
  loaded: boolean;
  hasTag: boolean;
}

interface Options {
  collection?: string;
  limit?: number;
  visited?: boolean;
  shuffle?: boolean;
  excludeUrl?: string;
}

// Lytics content collections on aid 8083 (slug + display name both tried).
const COLLECTION_FALLBACKS = ['products', 'all_documents_with_images', 'PRODUCTS', 'Documents With Images'];

function productImage(p: any): string | undefined {
  const f = p?.featured_image;
  const img = Array.isArray(f) ? f[0] : f;
  return img?.url;
}

function categoryTopic(category?: string): string | null {
  if (category === 'wearable-tech') return 'wearables';
  if (category === 'technofurniture') return 'technofurniture';
  return category || null;
}

function topicsFor(category?: string, tags?: string[]): string[] {
  const set = new Set<string>();
  const ct = categoryTopic(category);
  if (ct) set.add(ct);
  for (const t of tags || []) set.add(String(t).toLowerCase());
  return Array.from(set);
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
  const [loaded, setLoaded] = useState(false);
  const [hasTag, setHasTag] = useState(false);

  // Catalog is for display hydration only (price/title/image) — never as a rec source.
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
    const m = new Map<string, { title: string; price?: number; category?: string; image?: string; topics: string[] }>();
    for (const p of catalog) {
      if (p?.url) {
        m.set(p.url, {
          title: p.title,
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
    const jstag = typeof window !== 'undefined' ? window.jstag : undefined;
    setHasTag(!!jstag?.recommend);
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
      setLiveRecs(best.items.slice(0, limit));
      setCollectionUsed(best.items.length ? best.coll : null);
    });
    return () => {
      cancelled = true;
    };
  }, [collection, limit, visited, shuffle, excludeUrl]);

  const ranked = useMemo<RankedProduct[]>(() => {
    if (!liveRecs || !liveRecs.length || !catalog.length) return [];
    // Keep only Lytics recs that map to a real catalog product; hydrate display fields from it.
    const items = liveRecs
      .slice(0, limit)
      .map((r) => ({ r, cat: catalogIndex.get(r.url) }))
      .filter((x) => x.cat);
    const n = items.length;
    return items.map(({ r, cat }, i) => ({
      url: r.url,
      title: cat!.title || r.title,
      image: cat!.image || r.image,
      price: cat!.price,
      category: cat!.category,
      topics: (cat!.topics && cat!.topics.length ? cat!.topics : r.topics || []).slice(0, 3),
      match: Math.round((100 * (n - i)) / n),
    }));
  }, [liveRecs, catalog, catalogIndex, limit]);

  const meta: RecMeta = { liveCount: ranked.length, collectionUsed, loaded, hasTag };
  return { ranked, meta };
}
