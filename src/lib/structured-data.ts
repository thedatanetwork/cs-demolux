/**
 * JSON-LD (schema.org) builders for SEO + AEO (Answer Engine Optimization).
 *
 * Server-rendered structured data is what AI answer engines and the Lytics content
 * crawler parse to understand a page's entity, topics, price, and Q&A. Each builder
 * returns a plain object; render it with <JsonLd data={...} />.
 */
import type { Product, BlogPost, SiteSettings } from './contentstack';
import { SITE_URL, SITE_NAME, absoluteUrl, firstImage } from './seo';

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function productSchema(product: Product) {
  const img = firstImage(product.featured_image, (product as any).seo?.og_image);
  const keywords =
    product.seo?.keywords ||
    [...(product.product_tags || []), product.category].filter(Boolean).join(', ');

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description:
      product.seo?.meta_description ||
      product.description ||
      product.detailed_description,
    image: img ? [img.url] : undefined,
    sku: product.uid,
    brand: { '@type': 'Brand', name: SITE_NAME },
    ...(keywords ? { keywords } : {}),
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: absoluteUrl(product.url),
    },
    // Mirrors the on-page rating UI (47 reviews, 5 stars).
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      reviewCount: 47,
    },
  };
}

export function blogPostingSchema(post: BlogPost) {
  const img = firstImage(post.featured_image, (post as any).seo?.og_image);
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.seo?.meta_description || post.excerpt,
    image: img ? [img.url] : undefined,
    datePublished: post.publish_date,
    dateModified: post.updated_at || post.publish_date,
    author: { '@type': post.author ? 'Person' : 'Organization', name: post.author || SITE_NAME },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    keywords: post.seo?.keywords || (post.post_tags || []).join(', ') || undefined,
    mainEntityOfPage: absoluteUrl(post.url),
  };
}

export function faqSchema(faqs?: Array<{ question: string; answer: string }>) {
  if (!faqs || faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs
      .filter((f) => f.question && f.answer)
      .map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
  };
}

export function organizationSchema(settings?: SiteSettings | null) {
  const social = settings?.social_links;
  const sameAs = social
    ? [social.instagram, social.twitter, social.linkedin, social.youtube].filter(Boolean)
    : undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings?.site_name || SITE_NAME,
    url: SITE_URL,
    logo: settings?.logo?.url,
    description: settings?.seo?.meta_description || settings?.tagline,
    ...(sameAs && sameAs.length ? { sameAs } : {}),
    ...(settings?.contact_info?.email
      ? {
          contactPoint: {
            '@type': 'ContactPoint',
            email: settings.contact_info.email,
            telephone: settings.contact_info.phone,
            contactType: 'customer service',
          },
        }
      : {}),
  };
}

export function webSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/products?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
