import type { MetadataRoute } from 'next';
import { dataService } from '@/lib/data-service';
import { getUrlHref } from '@/lib/content-utils';
import { SITE_URL } from '@/lib/seo';

// Contentstack credentials are not available at build time — generate per request.
export const dynamic = 'force-dynamic';

function entry(
  path: string,
  lastModified?: string,
  priority = 0.7,
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] = 'weekly'
): MetadataRoute.Sitemap[number] {
  const url = path.startsWith('http')
    ? path
    : `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  return {
    url,
    lastModified: lastModified ? new Date(lastModified) : undefined,
    changeFrequency,
    priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    entry('/', undefined, 1.0, 'daily'),
    entry('/products', undefined, 0.9, 'daily'),
    entry('/blog', undefined, 0.8, 'daily'),
    entry('/categories/wearable-tech', undefined, 0.8),
    entry('/categories/technofurniture', undefined, 0.8),
    entry('/about', undefined, 0.5, 'monthly'),
    entry('/contact', undefined, 0.5, 'monthly'),
    entry('/shipping', undefined, 0.3, 'monthly'),
    entry('/support', undefined, 0.3, 'monthly'),
    entry('/privacy', undefined, 0.2, 'yearly'),
    entry('/terms', undefined, 0.2, 'yearly'),
  ];

  // Each section is independent — a CMS error in one must not blank the whole sitemap.
  try {
    const products = await dataService.getProducts();
    for (const p of products) {
      if (p.url) routes.push(entry(p.url, p.updated_at, 0.9));
    }
  } catch { /* skip products */ }

  try {
    const posts = await dataService.getBlogPosts();
    for (const post of posts) {
      if (post.url) routes.push(entry(post.url, post.updated_at, 0.7));
    }
  } catch { /* skip blog */ }

  try {
    const collections = await dataService.getCollections();
    for (const c of collections) {
      const href = getUrlHref(c.slug);
      if (href) routes.push(entry(href, c.updated_at, 0.6));
    }
  } catch { /* skip collections */ }

  try {
    const lookbooks = await dataService.getLookbooks();
    for (const l of lookbooks) {
      const href = getUrlHref(l.slug);
      if (href) routes.push(entry(href, l.updated_at, 0.6));
    }
  } catch { /* skip lookbooks */ }

  return routes;
}
