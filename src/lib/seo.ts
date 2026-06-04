/**
 * SEO utilities — single source of truth for site URL, image normalization,
 * and Next.js Metadata construction (Open Graph + Twitter + canonical + keywords).
 *
 * Resolution order for every field: CMS `seo.*` value -> existing entry field -> default.
 * This is what makes per-page metadata appear in the raw server-rendered HTML, which is
 * also what the Lytics content crawler reads to build content docs (image, excerpt, topics).
 */
import type { Metadata } from 'next';

// Canonical site URL (trailing slash stripped). Configured via NEXT_PUBLIC_HOSTED_URL.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_HOSTED_URL || 'https://cs-demolux-dev.contentstackapps.com'
).replace(/\/+$/, '');

export const SITE_NAME = 'Demolux';

/** Build an absolute URL from a path or relative/absolute URL. */
export function absoluteUrl(pathOrUrl?: string): string | undefined {
  if (!pathOrUrl) return undefined;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

type ImageLike = { url?: string; title?: string; filename?: string } | undefined | null;

/**
 * Normalize Contentstack file fields, which appear as either a single object or an
 * array of objects across the codebase (see Product/BlogPost interfaces). Returns the
 * first usable image, preferring an explicit override (e.g. seo.og_image).
 */
export function firstImage(
  field: ImageLike | ImageLike[],
  override?: ImageLike
): { url: string; title?: string } | undefined {
  const pick = (v: ImageLike | ImageLike[]): ImageLike =>
    Array.isArray(v) ? v[0] : v;
  const img = pick(override) || pick(field);
  if (img && img.url) return { url: img.url, title: img.title };
  return undefined;
}

export interface BuildMetadataInput {
  title: string;
  description?: string;
  /** Path relative to site root, e.g. "/products/aether-watch". */
  path?: string;
  /** Explicit canonical override; defaults to absoluteUrl(path). */
  canonical?: string;
  image?: { url: string; title?: string };
  type?: 'website' | 'article' | 'product';
  /** Comma-separated string or array of topic keywords. */
  keywords?: string | string[];
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
}

function toKeywordArray(keywords?: string | string[]): string[] | undefined {
  if (!keywords) return undefined;
  const arr = Array.isArray(keywords)
    ? keywords
    : keywords.split(',').map((k) => k.trim());
  const cleaned = arr.filter(Boolean);
  return cleaned.length ? cleaned : undefined;
}

/**
 * Construct a Next.js Metadata object with consistent Open Graph / Twitter / canonical /
 * keyword tags. Page-level callers only supply specifics; site-wide defaults (siteName,
 * twitter card, locale) come from the root layout's metadata.
 */
export function buildMetadata(input: BuildMetadataInput): Metadata {
  const url = input.canonical || absoluteUrl(input.path);
  const ogType = input.type === 'product' ? 'website' : input.type || 'website';
  // Normalize the brand suffix so the title reads "<name> | Demolux" exactly once,
  // whether the CMS meta_title already includes it or we fell back to a bare title.
  const baseTitle = input.title.replace(/\s*\|\s*Demolux\s*$/i, '').trim();
  const fullTitle = `${baseTitle} | ${SITE_NAME}`;
  const images = input.image
    ? [{ url: input.image.url, alt: input.image.title || baseTitle }]
    : undefined;
  const keywords = toKeywordArray(input.keywords);

  return {
    // `absolute` bypasses the root layout's "%s | Demolux" template (we add the brand here).
    title: { absolute: fullTitle },
    description: input.description,
    keywords,
    alternates: url ? { canonical: url } : undefined,
    openGraph: {
      title: fullTitle,
      description: input.description,
      url,
      siteName: SITE_NAME,
      type: ogType,
      images,
      ...(input.type === 'article'
        ? {
            publishedTime: input.publishedTime,
            modifiedTime: input.modifiedTime,
            tags: input.tags,
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: input.description,
      images: images?.map((i) => i.url),
    },
  };
}
