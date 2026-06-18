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
  debug?: string;
}

interface Options {
  collection?: string;
  limit?: number;
  visited?: boolean;
  shuffle?: boolean;
  excludeUrl?: string;
}

// Lytics content collections on aid 8083 (verified to return product docs).
const COLLECTION_FALLBACKS = ['PRODUCTS', 'Documents With Images', 'Default Recommendation Collection'];
// For cold-start (new visitor, no affinity) recommend() can return only static
// pages; shuffling against the broadest collection reliably surfaces products.
const SHUFFLE_FALLBACKS = ['All Documents', 'PRODUCTS', 'Default Recommendation Collection'];

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
  const [debug, setDebug] = useState<string>('init');

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
    const sleep = (ms: number) => new Promise<void>((r) => timers.push(setTimeout(r, ms)));
    const affinityColls = Array.from(new Set([collection, ...COLLECTION_FALLBACKS])).filter(Boolean);
    // Request a LARGE candidate set, not just `limit`. Static pages (about,
    // shipping, blog, etc.) often outrank products for a cold visitor, so a small
    // limit returns only those and zero products. Pull a deep set, then filter to
    // products and keep the top `limit` below.
    const want = Math.max((excludeUrl ? limit + 1 : limit) + 2, 30);

    const recommendOnce = (jstag: any, coll: string, forceShuffle: boolean) =>
      new Promise<{ coll: string; items: RecItem[] }>((resolve) => {
        let done = false;
        // Generous timeout: jstag.recommend can be slow on a cold tag / first call.
        const t = setTimeout(() => !done && ((done = true), resolve({ coll, items: [] })), 6000);
        const opts: any = { collection: coll, limit: want };
        if (visited !== undefined) opts.visited = visited;
        if (forceShuffle) opts.shuffle = true;
        else if (shuffle !== undefined) opts.shuffle = shuffle;
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
    // Promise.all burst yields nothing), whereas sequential calls return products.
    const runRound = async (jstag: any, colls: string[], forceShuffle: boolean) => {
      let best: { coll: string; items: RecItem[] } = { coll: '', items: [] };
      for (const c of colls) {
        if (cancelled) break;
        const r = await recommendOnce(jstag, c, forceShuffle);
        if (r.items.length > best.items.length) best = r;
        if (best.items.length >= limit) break; // enough to fill the rail
      }
      return best;
    };

    const start = async (jstag: any) => {
      // Let the visitor's Lytics profile begin resolving before the first call —
      // calling the instant the tag loads tends to return only static pages.
      await sleep(2000);
      if (cancelled) return;
      let best: { coll: string; items: RecItem[] } = { coll: '', items: [] };
      // Up to 6 rounds: affinity-ranked first (personalized for warm visitors);
      // if that yields no products, shuffle the broadest collections so a cold
      // visitor still gets popularity-based picks. Retry across a ~12s window.
      for (let attempt = 0; attempt < 6 && !cancelled && best.items.length === 0; attempt++) {
        best = await runRound(jstag, affinityColls, false);
        if (best.items.length === 0) {
          best = await runRound(jstag, SHUFFLE_FALLBACKS, true);
        }
        if (best.items.length) break;
        setDebug(`retry ${attempt + 1}`);
        await sleep(2000);
      }
      if (cancelled) return;
      setLiveRecs(best.items.slice(0, limit));
      setCollectionUsed(best.items.length ? best.coll : null);
      setDebug(`done items=${best.items.length} coll=${best.coll || 'none'}`);
    };

    // The Lytics tag (window.jstag) loads asynchronously (and starts life as a
    // command-queue array without .recommend). Poll for the real SDK instead of
    // bailing out forever if it isn't ready when this effect first runs.
    let waited = 0;
    const tick = () => {
      if (cancelled) return;
      const jstag = typeof window !== 'undefined' ? (window as any).jstag : undefined;
      if (jstag?.recommend) {
        setHasTag(true);
        setDebug('jstag-ready');
        void start(jstag);
        return;
      }
      waited += 250;
      if (waited >= 20000) {
        setHasTag(false);
        setDebug('no-jstag-timeout');
        return;
      }
      timers.push(setTimeout(tick, 250));
    };
    setDebug('waiting-jstag');
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

  const meta: RecMeta = {
    liveCount: ranked.length,
    collectionUsed,
    loaded,
    hasTag,
    debug: `${debug} | live=${liveRecs?.length ?? 'null'} cat=${catalog.length} ranked=${ranked.length}`,
  };
  return { ranked, meta };
}
