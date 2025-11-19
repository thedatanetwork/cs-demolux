# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Demolux is a Next.js 14 ecommerce site for luxury wearable tech and technofurniture. The site integrates with **Contentstack CMS** for content management and **Contentstack Personalize** for targeted experiences and A/B testing. All content created or updated for this site needs to be integrated similarly with Contentstack.

## Common Development Commands

```bash
# Development
npm run dev              # Start dev server on localhost:3000
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript compiler without emitting files
```

## Architecture

### Three-Layer Data Architecture

The app uses a **three-layer architecture** for content delivery:

1. **Contentstack SDK** (`src/lib/contentstack.ts`): Direct Contentstack API integration with variant support
2. **Data Service** (`src/lib/data-service.ts`): Abstraction layer that wraps Contentstack SDK
3. **Page Components** (`src/app/**`): Server components that consume data

**Always use DataService** when fetching content in pages/components. Never call the Contentstack SDK directly from components.

### Personalization Architecture (Flicker-Free)

The app implements **server-side personalization with zero content flicker** through a cookie-based flow:

1. **Client-side initialization** (`src/contexts/PersonalizeContext.tsx`):
   - Personalize SDK initializes on client
   - SDK determines variant aliases based on experiences
   - Variant aliases are stored in a cookie (`cs_personalize_variants`)

2. **Server-side rendering** (`src/lib/personalize-server.ts`):
   - Server components read variant aliases from cookie via `getVariantAliasesFromCookies()`
   - Variant aliases are passed to Contentstack queries via the `variants()` method
   - Personalized content is rendered server-side from the start

3. **No content flicker**: Since personalized content is fetched server-side using variants from the cookie, users see personalized content on first render.

**Key Files**:
- `src/contexts/PersonalizeContext.tsx`: Client-side SDK initialization, cookie storage
- `src/lib/personalize-server.ts`: Server-side cookie reading utility
- `src/lib/personalize.ts`: Personalize SDK wrapper
- `src/lib/contentstack.ts`: Contentstack SDK with variant support via `.variants()` method

### Directory Structure

```
src/
├── app/                 # Next.js 14 App Router pages
│   ├── page.tsx        # Homepage (uses HomePage content type)
│   ├── layout.tsx      # Root layout with PersonalizeProvider
│   ├── categories/     # Category pages (wearable-tech, technofurniture)
│   ├── products/       # Product detail pages [slug]
│   └── blog/           # Blog pages
├── components/
│   ├── ui/             # Base UI components (Button, etc.)
│   ├── layout/         # Header, Footer
│   ├── product/        # Product-related components
│   ├── home/           # Homepage-specific components
│   ├── PersonalizeEventTracker.tsx  # Event tracking hooks
│   └── LyticsTracker.tsx            # Lytics analytics
├── contexts/
│   ├── CartContext.tsx      # Shopping cart state
│   └── PersonalizeContext.tsx  # Personalize SDK provider
├── lib/
│   ├── contentstack.ts      # Contentstack SDK (direct API)
│   ├── data-service.ts      # Data abstraction layer
│   ├── personalize.ts       # Personalize SDK wrapper
│   ├── personalize-server.ts # Server-side personalize utilities
│   └── utils.ts             # Helpers (cn for className merging)
└── data/
    └── mock-data.ts         # Fallback data (not currently used)
```

## Contentstack Integration

### Content Types

The CMS defines these content types:

- `product`: Product catalog (uid, title, url, description, detailed_description, featured_image, price, category, product_tags)
- `blog_post`: Blog content (uid, title, url, content, featured_image, excerpt, author, publish_date, post_tags)
- `navigation_menu`: Site navigation (menu_items, menu_location, menu_style)
- `site_settings`: Global site config (site_name, tagline, logo, contact_info, social_links)
- `home_page`: Homepage content (hero section, featured products, brand values, blog section, CTAs)
- `page`: Generic pages (About, Contact)

### Fetching Personalized Content

**Always pass variant aliases** to data service methods when personalization is active:

```typescript
// In server components
import { getVariantAliasesFromCookies } from '@/lib/personalize-server';
import { dataService } from '@/lib/data-service';

// Get variant aliases from cookie
const variantAliases = await getVariantAliasesFromCookies();

// Pass to data service methods
const products = await dataService.getProducts('wearable-tech', variantAliases);
const product = await dataService.getProductBySlug(slug, variantAliases);
```

The variant aliases flow through to Contentstack queries via the `.variants()` method (see `contentstack.ts:262-268` and `contentstack.ts:320-324`).

### Variant Parameters in Contentstack SDK

The Contentstack SDK's `Query.variants()` method accepts a comma-separated string of variant aliases:

```typescript
// In ContentstackService.getEntries() and ContentstackService.getEntry()
if (variantAliases && variantAliases.length > 0) {
  Query.variants(variantAliases.join(','));
}
```

## Personalization Features

### Event Tracking

The app includes pre-built event tracking hooks:

```typescript
import { useProductTracking } from '@/components/PersonalizeEventTracker';

const { trackProductView, trackAddToCart, trackCTAClick } = useProductTracking();

trackProductView('product-uid');
trackAddToCart('product-uid', quantity);
trackCTAClick('cta-name', '/url');
```

### Setting User Attributes

```typescript
import { usePersonalizeAttributes } from '@/contexts/PersonalizeContext';

const { setAttributes } = usePersonalizeAttributes();
setAttributes({ age: 25, interests: ['wearable-tech'] });
```

### Where Tracking is Implemented

- Product view tracking: Automatic on product detail pages via `ProductViewTracker` component
- Add to cart: `ProductActions` component
- CTA clicks: Homepage hero section
- Lytics tracking: `LyticsTracker` component for analytics

## Styling

### Tailwind Configuration

- **Custom color palette**: `primary` (slate) and `gold` scales
- **Custom fonts**: Inter (sans), Playfair Display (heading)
- **Custom animations**: fade-in, slide-up, float
- **Path alias**: `@/*` maps to `src/*`

Use the `cn()` utility from `src/lib/utils.ts` for conditional className merging with tailwind-merge.

## Environment Variables

Required in `.env.local`:

```bash
# Contentstack CMS
CONTENTSTACK_API_KEY=
CONTENTSTACK_DELIVERY_TOKEN=
CONTENTSTACK_ENVIRONMENT=dev

# Contentstack Personalize
NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID=

# Optional: Live Preview
CONTENTSTACK_PREVIEW_TOKEN=
CONTENTSTACK_APP_HOST=app.contentstack.com
CONTENTSTACK_LIVE_PREVIEW=true
```

**Security**: Management tokens have full CMS write access - never commit them. API keys and delivery tokens are read-only and safe to be public.

## TypeScript

- **Path alias**: `@/` resolves to `src/`
- **Strict mode enabled**: All type checking is enforced
- Target: ES5 with DOM libraries
- Module resolution: bundler mode

## Image Handling

Configured remote patterns in `next.config.js`:
- `images.contentstack.io`
- `eu-images.contentstack.io`
- `cdn.contentstack.io`
- `images.unsplash.com`

Always use Next.js `<Image>` component for optimized image loading.

## Key Implementation Patterns

### Server Component Data Fetching

```typescript
// src/app/products/[slug]/page.tsx pattern
import { getVariantAliasesFromCookies } from '@/lib/personalize-server';
import { dataService } from '@/lib/data-service';

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const variantAliases = await getVariantAliasesFromCookies();
  const product = await dataService.getProductBySlug(params.slug, variantAliases);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
```

### Client Component Event Tracking

```typescript
'use client';

import { useProductTracking } from '@/components/PersonalizeEventTracker';

export default function ProductActions({ productId }: { productId: string }) {
  const { trackAddToCart } = useProductTracking();

  const handleAddToCart = () => {
    trackAddToCart(productId, 1);
    // ... cart logic
  };

  return <button onClick={handleAddToCart}>Add to Cart</button>;
}
```

## Important Notes

1. **Always use DataService**: Never call Contentstack SDK directly from components
2. **Pass variant aliases**: When fetching content in server components, always get variants from cookies and pass to data service
3. **Cookie-based personalization**: The `cs_personalize_variants` cookie bridges client-side SDK and server-side rendering
4. **No mock data fallback**: The app requires Contentstack credentials to run (mock data exists but is not actively used)
5. **Server vs Client components**: Data fetching is server-side; event tracking and SDK initialization is client-side
6. **Type safety**: All Contentstack content types have TypeScript interfaces in `contentstack.ts`

## Testing Personalization

To test personalized experiences:

1. Ensure `NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID` is set
2. Create experiences in Contentstack Personalize dashboard
3. Create content variants in Contentstack CMS
4. Visit pages with targeting parameters (e.g., `?interest=wearable-tech`)
5. Check browser DevTools for variant cookie and console logs
6. Verify personalized content appears on first render (no flicker)
