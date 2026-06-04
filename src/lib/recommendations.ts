/**
 * Lytics Content Recommendations types + helpers.
 *
 * Recommendations come live from `window.jstag.recommend({ collection, limit, ... }, cb)`
 * against populated Lytics content collections. Each item is a content document. We never
 * fabricate or substitute products — if a call returns nothing, the placement is hidden.
 */

/** A content document as returned by jstag.recommend(). Field availability depends on the sync. */
export interface LyticsRecommendation {
  url?: string;
  title?: string;
  description?: string;
  primary_image?: string;
  image?: string;
  price?: number | string;
  category?: string;
  /** Topic -> affinity score map used for ranking. */
  global?: Record<string, number>;
  topics?: string[];
  [key: string]: unknown;
}

/** Normalized shape the rec card renders. */
export interface RecItem {
  url: string;
  title: string;
  description?: string;
  image?: string;
  price?: number;
  category?: string;
  topics?: string[];
}

/**
 * Lytics content-doc URLs come back as `cs-demolux-dev.contentstackapps.com/products/x`
 * (no scheme, no leading slash). Convert to a site-relative path for internal linking + matching.
 */
export function toSitePath(url?: string): string {
  if (!url) return '';
  try {
    const withScheme = /^https?:\/\//.test(url) ? url : `https://${url}`;
    return new URL(withScheme).pathname;
  } catch {
    const i = url.indexOf('/products/');
    return i >= 0 ? url.slice(i) : url;
  }
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

/**
 * Map raw recommendation docs to render-ready items. Drops anything without a url/title
 * and any item matching `excludeUrl` (e.g. the current product on a PDP).
 */
export function normalizeRecommendations(
  recs: LyticsRecommendation[] | null | undefined,
  excludeUrl?: string
): RecItem[] {
  if (!Array.isArray(recs)) return [];
  return recs
    .map((r) => ({
      url: toSitePath(r.url),
      title: r.title as string,
      description: r.description,
      image: r.primary_image || r.image,
      price: toNumber(r.price),
      category: typeof r.category === 'string' ? r.category : undefined,
      topics: r.global ? Object.keys(r.global) : r.topics,
    }))
    .filter((r) => r.url && r.title && r.url !== excludeUrl);
}
