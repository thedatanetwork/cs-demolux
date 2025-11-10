# Flicker-Free Personalization Implementation

## ✅ Completed: No More Content Flicker!

This document describes the architecture implemented to prevent content flicker when showing personalized variants.

## The Problem (Before)

**Old Flow:**
1. Server renders default content
2. Page loads in browser
3. Client-side Personalize SDK initializes
4. Fetches personalized content via API
5. **FLICKER:** Content swaps from default to personalized version

## The Solution (Now)

**New Flow:**
1. Client: Personalize SDK stores variant aliases in cookie
2. Server: Reads cookie during SSR
3. Server: Fetches personalized content from Contentstack
4. **NO FLICKER:** Page renders with personalized content from the start!

## Architecture

### Cookie-Based State Sharing

```
┌─────────────────┐
│  Browser        │
│  (Client-Side)  │
└────────┬────────┘
         │
         │ 1. Personalize SDK evaluates experiences
         │    variantAliases = ['cs_personalize_0_1', ...]
         │
         │ 2. Store in cookie
         │    document.cookie = 'cs_personalize_variants=...'
         │
         ▼
┌─────────────────┐
│  Next.js Server │
│  (SSR)          │
└────────┬────────┘
         │
         │ 3. Read cookie (getVariantAliasesFromCookies)
         │    variantAliases = ['cs_personalize_0_1', ...]
         │
         │ 4. Fetch personalized content
         │    Query.variants(variantAliases.join(','))
         │
         ▼
┌─────────────────┐
│  Contentstack   │
│  CMS            │
└────────┬────────┘
         │
         │ 5. Returns personalized variant
         │
         ▼
     HTML with personalized content (no flicker!)
```

## Files Changed

### New Files

- **`src/lib/personalize-server.ts`**
  - Server-side utility to read variant aliases from cookies
  - `getVariantAliasesFromCookies()` - Main function used in server components

### Updated Files

- **`src/contexts/PersonalizeContext.tsx`**
  - Added cookie storage when SDK initializes
  - Cookie format: `cs_personalize_variants=["cs_personalize_0_1",...]`
  - Cookie settings: 24-hour expiry, SameSite=Lax, path=/

- **`src/app/products/[slug]/page.tsx`**
  - Now a pure server component (no client-side fetching)
  - Reads variant aliases from cookie
  - Fetches personalized product during SSR
  - Product content renders without flicker

- **`src/app/page.tsx`** (Homepage)
  - Reads variant aliases from cookie
  - Fetches personalized featured products during SSR

- **`src/app/categories/[category]/page.tsx`**
  - Reads variant aliases from cookie
  - Fetches personalized category products during SSR

- **`src/app/blog/page.tsx`** & **`src/app/blog/[slug]/page.tsx`**
  - Read variant aliases from cookie
  - Fetch personalized blog content during SSR

- **`src/lib/data-service.ts`**
  - Updated helper methods to accept `variantAliases` parameter
  - `getFeaturedProducts()`, `getRecentBlogPosts()`, etc.

### Deleted Files

- **`src/components/product/PersonalizedProductContent.tsx`** ❌
  - No longer needed - personalization happens server-side
  
- **`src/app/api/personalized-product/route.ts`** ❌
  - No longer needed - no client-side fetching

## How It Works

### 1. First Visit (No Cookie Yet)

```typescript
// Server component
const variantAliases = await getVariantAliasesFromCookies(); 
// Returns: []

const product = await dataService.getProductBySlug(slug, []); 
// Returns: Base product (no variant)

// Client: Personalize SDK loads
// Sets cookie: cs_personalize_variants=['cs_personalize_0_1']
```

**Result:** Base content shown (no cookie yet)

### 2. Subsequent Pages (Cookie Exists)

```typescript
// Server component
const variantAliases = await getVariantAliasesFromCookies(); 
// Returns: ['cs_personalize_0_1']

const product = await dataService.getProductBySlug(slug, ['cs_personalize_0_1']); 
// Returns: Personalized variant

// Page renders with personalized content immediately
```

**Result:** ✨ Personalized content, no flicker!

## Benefits

✅ **No Content Flicker** - Personalized content renders from the start
✅ **Better UX** - Smooth, professional experience
✅ **SEO Friendly** - Content is in initial HTML (not client-rendered)
✅ **Performance** - No extra API calls after page load
✅ **Scalable** - Works with any number of experiences/variants
✅ **Dynamic** - No hard-coded experience logic

## Cookie Details

- **Name:** `cs_personalize_variants`
- **Format:** JSON array of strings `["cs_personalize_0_1", "cs_personalize_2_3"]`
- **Max Age:** 86400 seconds (24 hours)
- **Path:** `/` (available to all pages)
- **SameSite:** `Lax` (security best practice)
- **Secure:** Not set (works on localhost + production)

## Testing the Implementation

### On Localhost

1. **Clear cookies** (to start fresh)
2. **Visit homepage** - Should see base content
3. **Add query param** - `?utm_campaign=fitness_outdoors`
4. **Check console** - Should see "🍪 Client: Stored variant aliases in cookie"
5. **Navigate to product page** - Should see personalized content immediately (no flicker!)
6. **Check console** - Should see "🍪 Server: Read variant aliases from cookie"

### On Launch (Production)

1. Deploy with environment variables:
   - `CONTENTSTACK_API_KEY`
   - `CONTENTSTACK_DELIVERY_TOKEN`
   - `CONTENTSTACK_ENVIRONMENT`
   - `NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID`

2. Clear Launch cache if needed
3. Test same flow as localhost

## Troubleshooting

### Still Seeing Base Content?

- Check that `NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID` is set
- Check browser dev tools → Application → Cookies for `cs_personalize_variants`
- Check server logs for "🍪 Server: Read variant aliases from cookie"

### Cookie Not Being Set?

- Check browser console for Personalize SDK initialization logs
- Verify query parameters are being passed (e.g., `?utm_campaign=...`)
- Check that audience rules in Contentstack match your attributes

### Variant Not Showing?

- Verify variant is published in Contentstack
- Check that variant alias format matches Contentstack's format
- Verify audience rules are correctly configured

## Next Steps

This implementation is complete and production-ready! To add more personalization:

1. **In Contentstack:** Create new experiences and variants
2. **In your code:** Nothing! It's all dynamic 🎉

The system automatically:
- Detects new experiences
- Evaluates audience rules
- Stores relevant variant aliases
- Fetches personalized content server-side

## Related Documentation

- `PERSONALIZE_ARCHITECTURE.md` - Overall personalization architecture
- `PERSONALIZE_SETUP.md` - Initial setup guide
- `PERSONALIZE_QUICKSTART.md` - Quick reference guide

