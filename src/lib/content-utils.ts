// Contentstack Link/URL field type
export interface ContentstackUrl {
  title: string;
  href: string;
}

/**
 * Helper to extract href from Contentstack URL/link field
 * Handles both string format (legacy) and object format { title, href }
 */
export function getUrlHref(url: string | ContentstackUrl | undefined): string {
  if (!url) return '';
  if (typeof url === 'string') return url;
  return url.href || '';
}
