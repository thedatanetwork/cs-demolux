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
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const candidates = Array.from(new Set([collection, ...COLLECTION_FALLBACKS])).filter(Boolean);
    const want = (excludeUrl ? limit + 1 : limit) + 2;

    const recommendOnce = (jstag: any, coll: string) =>
      new Promise<{ coll: string; items: RecItem[] }>((resolve) => {
        let done = false;
        // Generous timeout: jstag.recommend can be slow on a cold tag / first call.
        const t = setTimeout(() => !done && ((done = true), resolve({ coll, items: [] })), 6000);
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

    // IMPORTANT: call collections SEQUENTIALLY, not concurrently. jstag.recommend
    // returns an empty set when several calls are in flight at once (a concurrent
    // Promise.all burst yields nothing), whereas sequential calls return products
    // reliably — even for a brand-new visitor on the very first call.
    const runRound = async (jstag: any) => {
      let best: { coll: string; items: RecItem[] } = { coll: '', items: [] };
      for (const c of candidates) {
        if (cancelled) break;
        const r = await recommendOnce(jstag, c);
        if (r.items.length > best.items.length) best = r;
        if (best.items.length >= limit) break; // enough to fill the rail
      }
      return best;
    };

    const start = async (jstag: any) => {
      // A brand-new visitor's Lytics profile takes ~10s to resolve; until it does,
      // recommend() returns no products. Retry on an empty product set across a
      // ~16s window so the rail fills once the profile/affinity is ready, instead
      // of giving up permanently on the first (cold) call.
      let best = await runRound(jstag);
      for (let attempt = 0; attempt < 8 && !cancelled && best.items.length === 0; attempt++) {
        await new Promise<void>((r) => timers.push(setTimeout(r, 2000)));
        if (cancelled) return;
        best = await runRound(jstag);
      }
      if (cancelled) return;
      setLiveRecs(best.items.slice(0, limit));
      setCollectionUsed(best.items.length ? best.coll : null);
    };

    // The Lytics tag (window.jstag) loads asynchronously and may not be ready when
    // this effect first runs. Poll briefly for it instead of bailing out forever.
    let waited = 0;
    const tick = () => {
      if (cancelled) return;
      const jstag = typeof window !== 'undefined' ? (window as any).jstag : undefined;
      if (jstag?.recommend) {
        setHasTag(true);
        void start(jstag);
        return;
      }
      waited += 250;
      if (waited >= 15000) {
        setHasTag(false);
        return;
      }
      timers.push(setTimeout(tick, 250));
    };
    tick();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
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
