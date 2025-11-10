# Contentstack Personalize Architecture

## Overview

This implementation follows Contentstack best practices from the official documentation:
- [JavaScript Personalize Edge SDK](https://www.contentstack.com/docs/developers/sdks/personalize-edge-sdk/javascript/get-started-with-javascript-personalize-edge-sdk)
- [Setup Next.js with Personalize](https://www.contentstack.com/docs/personalize/setup-nextjs-website-with-personalize-launch)

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Personalize SDK Initializes                             │
│     ├─ Reads URL query params (utm_campaign, etc.)         │
│     ├─ Calls Personalize Edge API                          │
│     └─ Returns variant aliases                             │
│        ['cs_personalize_a_0', 'cs_personalize_b_1']        │
│                                                              │
│  2. Client Component Fetches Personalized Content           │
│     └─ POST /api/personalized-product                      │
│        { slug, variantAliases }                             │
│                                                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP Request
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js API Route                        │
│                /api/personalized-product                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  3. Receives variant aliases                                │
│     └─ Has server-side Contentstack credentials            │
│                                                              │
│  4. Queries Contentstack with variant aliases               │
│     └─ contentstack.getProductBySlug(slug, variantAliases) │
│                                                              │
│  5. Returns personalized product                            │
│                                                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Contentstack Delivery API
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  Contentstack CMS                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  • Uses variant aliases to determine which variant          │
│  • Returns personalized entry content                       │
│  • Applies experience rules                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. Personalize SDK (Browser)

**File:** `src/contexts/PersonalizeContext.tsx`

**Responsibilities:**
- Initializes Personalize Edge SDK with Project UID
- Extracts URL query parameters for targeting
- Retrieves user's variant aliases
- Provides event tracking capabilities

**Environment Variables Required:**
```bash
NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID=your_project_uid
```

**Key Code:**
```typescript
// Extract query params from URL
const urlParams = new URLSearchParams(window.location.search);
const queryParams = {}; // utm_campaign, etc.

// Initialize with live attributes
const sdk = await Personalize.init(projectUid, {
  userId,
  liveAttributes: { ...queryParams, ...customAttributes }
});

// Get variant aliases for content delivery
const variantAliases = sdk.getVariantAliases();
// ['cs_personalize_0_1', 'cs_personalize_2_3']
```

### 2. API Route (Server)

**File:** `src/app/api/personalized-product/route.ts`

**Responsibilities:**
- Receives personalization requests from browser
- Uses server-side Contentstack credentials (secure)
- Queries Contentstack with variant aliases
- Returns personalized content

**Environment Variables Required:**
```bash
CONTENTSTACK_API_KEY=your_api_key
CONTENTSTACK_DELIVERY_TOKEN=your_delivery_token
CONTENTSTACK_ENVIRONMENT=your_environment
CONTENTSTACK_REGION=US
```

**API Contract:**
```typescript
// Request
POST /api/personalized-product
{
  "slug": "ar_bracer",
  "variantAliases": ["cs_personalize_0_1", "cs_personalize_2_3"]
}

// Response
{
  "success": true,
  "product": {
    "uid": "...",
    "title": "Personalized Product Title",
    "price": 1999,
    // ... other fields
  },
  "meta": {
    "variantAliases": ["..."],
    "timestamp": "2025-11-10T..."
  }
}
```

### 3. Client Component

**File:** `src/components/product/PersonalizedProductContent.tsx`

**Responsibilities:**
- Displays product content
- Monitors Personalize SDK for variant changes
- Refetches through API route when variants available
- Updates UI with personalized content

**Flow:**
```typescript
1. Initial render: Shows SSR product (fast)
2. Personalize SDK loads: Gets variant aliases
3. Fetch via API: POST to /api/personalized-product
4. Update UI: Shows personalized variant
```

### 4. Contentstack SDK (Server)

**File:** `src/lib/contentstack.ts`

**Responsibilities:**
- Manages Contentstack connection
- Passes variant aliases to queries
- Returns personalized entries

**Key Enhancement:**
```typescript
async getProductBySlug(slug: string, variantAliases?: string[]) {
  const Query = this.stack.ContentType('product').Query();
  
  // Add variant aliases for personalization
  if (variantAliases && variantAliases.length > 0) {
    Query.addParam('x-cs-variant-uid', variantAliases.join(','));
  }
  
  // ... rest of query
}
```

## Environment Variables

### Client-Side (Browser)
```bash
# Has NEXT_PUBLIC_ prefix - accessible in browser
NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID=your_project_uid
```

### Server-Side Only
```bash
# NO NEXT_PUBLIC_ prefix - server only (secure)
CONTENTSTACK_API_KEY=your_api_key
CONTENTSTACK_DELIVERY_TOKEN=your_delivery_token
CONTENTSTACK_ENVIRONMENT=dev
CONTENTSTACK_REGION=US
```

## Data Flow

### Initial Page Load (SSR)

1. User visits `/products/ar_bracer?utm_campaign=fitness_outdoors`
2. Server renders page with default product content
3. Page loads quickly (good SEO, good UX)

### Client-Side Personalization

1. **Personalize SDK initializes**
   - Reads `utm_campaign` from URL
   - Calls Personalize Edge API with attributes
   - Gets variant aliases: `['cs_personalize_0_1']`

2. **Component detects variants**
   - `PersonalizedProductContent` sees variant aliases
   - Makes POST request to `/api/personalized-product`

3. **API Route processes**
   - Receives slug + variant aliases
   - Queries Contentstack with variants
   - Returns personalized product

4. **UI updates**
   - Component receives personalized data
   - Updates display with variant content
   - Shows purple banner in dev mode

## Security Considerations

✅ **Properly Secured:**
- Contentstack credentials stay on server
- API route validates inputs
- Only public data exposed to browser

❌ **Never Exposed to Browser:**
- CONTENTSTACK_API_KEY
- CONTENTSTACK_DELIVERY_TOKEN
- Internal Contentstack queries

## Performance Optimizations

### 1. Progressive Enhancement
- Fast initial SSR render
- Client-side upgrade to personalized content
- No blocking on personalization

### 2. Caching Strategy
- API route responses can be cached
- Variant aliases cached in browser session
- Contentstack SDK handles caching

### 3. Error Handling
- Graceful fallback to default content
- Clear error messages in console
- No broken page experience

## Testing

### Local Development

1. **Test Personalize SDK:**
```bash
# Visit with query param
http://localhost:3000/products/ar_bracer?utm_campaign=fitness_outdoors

# Check browser console for:
# - "Personalize SDK initialized"
# - Variant aliases array
```

2. **Test API Route:**
```bash
# Direct API test
curl -X POST http://localhost:3000/api/personalized-product \
  -H "Content-Type: application/json" \
  -d '{"slug":"ar_bracer","variantAliases":["cs_personalize_0_1"]}'
```

3. **Test Personalization:**
```bash
# Compare with/without query param
Without: http://localhost:3000/products/ar_bracer
With:    http://localhost:3000/products/ar_bracer?utm_campaign=fitness_outdoors

# Should see different content if targeting matches
```

### Console Debugging

Look for these logs:
```
🔍 Initializing Personalize with attributes: { utm_campaign: 'fitness_outdoors' }
✅ Variant aliases: ['cs_personalize_0_1']
🔄 Fetching personalized product via API route
✅ API Route - Product fetched successfully
✨ Personalized product variant loaded
```

## Troubleshooting

### Issue: Variants are `null`

**Symptom:**
```
variantAliases: ['cs_personalize_0_null', 'cs_personalize_2_null']
```

**Cause:** User doesn't match targeting rules

**Solution:**
1. Check experience targeting in Contentstack
2. Verify query params match rules
3. Set user attributes if needed

### Issue: API Route Returns 500

**Symptom:** Error in browser console

**Cause:** Contentstack credentials not configured

**Solution:**
1. Check `.env.local` has all variables
2. Restart dev server
3. Verify credentials are correct

### Issue: Content Not Changing

**Symptom:** Same content for all users

**Solution:**
1. Verify experience is **published** (not draft)
2. Check variant entries exist in Contentstack
3. Confirm targeting rules are correct
4. Look for API errors in Network tab

## Best Practices

### 1. Always Use API Routes for CMS Queries
✅ Keep credentials secure on server
✅ Validate inputs on server
✅ Control access and rate limiting

### 2. Progressive Enhancement
✅ Fast SSR initial load
✅ Client-side upgrade when ready
✅ Graceful fallbacks

### 3. Clear Logging
✅ Log personalization decisions
✅ Track API calls
✅ Monitor errors

### 4. Performance
✅ Cache API responses
✅ Minimize client-server round trips
✅ Optimize bundle size

## References

- [Contentstack Personalize Edge SDK](https://www.contentstack.com/docs/developers/sdks/personalize-edge-sdk/javascript/get-started-with-javascript-personalize-edge-sdk)
- [Setup Next.js with Personalize](https://www.contentstack.com/docs/personalize/setup-nextjs-website-with-personalize-launch)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Contentstack Delivery SDK](https://www.contentstack.com/docs/developers/sdks/content-delivery-sdks/javascript/)

---

**Last Updated:** November 10, 2025  
**Architecture:** Production-Ready ✅  
**Security:** Credentials Protected ✅  
**Performance:** Optimized ✅

