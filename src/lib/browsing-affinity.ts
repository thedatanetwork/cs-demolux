/**
 * Client-side browsing affinity — a local mirror of the Lytics content-affinity model.
 *
 * As the visitor views product pages we accumulate topic scores (category + tags) in
 * localStorage, exactly the signal Lytics builds `global` content affinity from. The
 * recommendation rails rank by this so browsing a few wearables vs a few technofurniture pages
 * visibly re-ranks the homepage — and it defers to live `jstag.recommend()` once the
 * Contentstack→Lytics product sync is enabled. Real browsing data, never fabricated.
 */
export const BROWSING_AFFINITY_EVENT = 'demo-affinity-changed';
const KEY = 'demo_browsing_affinity';

/** Map our catalog category to the Lytics topic vocabulary. */
export function categoryTopic(category?: string): string | null {
  if (category === 'wearable-tech') return 'wearables';
  if (category === 'technofurniture') return 'technofurniture';
  return category || null;
}

/** Topics for a product: normalized category + lowercased tags. */
export function topicsFor(category?: string, tags?: string[]): string[] {
  const set = new Set<string>();
  const ct = categoryTopic(category);
  if (ct) set.add(ct);
  for (const t of tags || []) set.add(String(t).toLowerCase());
  return Array.from(set);
}

export function readBrowsingAffinity(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || '{}') || {};
  } catch {
    return {};
  }
}

/** Record a viewed product's topics, weighting the category higher than incidental tags. */
export function recordProductView(category?: string, tags?: string[]): void {
  if (typeof window === 'undefined') return;
  const map = readBrowsingAffinity();
  const ct = categoryTopic(category);
  if (ct) map[ct] = (map[ct] || 0) + 1; // category is the strong signal
  for (const t of tags || []) {
    const k = String(t).toLowerCase();
    map[k] = (map[k] || 0) + 0.4;
  }
  try {
    window.localStorage.setItem(KEY, JSON.stringify(map));
    window.dispatchEvent(new Event(BROWSING_AFFINITY_EVENT));
  } catch {
    /* ignore quota/availability errors */
  }
}
