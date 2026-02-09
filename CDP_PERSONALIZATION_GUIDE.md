# CDP-Driven Personalization with Contentstack

## Real-Time Audience Targeting from First Page View

This document describes an architectural approach for delivering personalized content experiences from the very first page load by integrating Customer Data Platform (CDP) audience segments with Contentstack Personalize.

---

## Executive Summary

Traditional personalization approaches suffer from "content flicker" - where users briefly see default content before personalized content loads. This guide describes a solution that:

- Retrieves CDP audience segments in real-time during page construction
- Passes segments to Contentstack Personalize as live attributes
- Delivers personalized content on the first render with zero flicker
- Works with any CDP that provides a real-time API (Tealium, Segment, Lytics, etc.)

---

## Architecture Overview

### The Challenge

Personalization typically requires knowing who the user is before serving content. CDPs collect behavioral data and assign users to audience segments, but this data lives outside the CMS. The challenge is bridging these systems in a way that:

1. Doesn't delay page rendering
2. Doesn't cause visible content shifts
3. Works on the first page view (not just subsequent pages)

### The Solution

The solution uses a **live attributes** approach where CDP segment data is passed to the Contentstack Personalize SDK at initialization time, enabling real-time variant evaluation before any content is rendered.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        User Visits Page                              │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     CDP Moments API Call                             │
│         (Tealium, Segment, Lytics, or other CDP)                    │
│                                                                      │
│   Returns: { audiences: ["fitness", "luxury-shoppers"] }            │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│              Convert to Delimited String                             │
│                                                                      │
│   cdp_segments: "fitness,luxury-shoppers"                           │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│           Personalize SDK Initialization                             │
│                                                                      │
│   Personalize.init(projectUid, {                                    │
│     liveAttributes: {                                                │
│       cdp_segments: "fitness,luxury-shoppers"                       │
│     }                                                                │
│   })                                                                 │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│         Personalize Decision Engine Evaluates                        │
│                                                                      │
│   Audience Rule: cdp_segments contains "fitness"                    │
│   Result: User qualifies → Return variant alias                     │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│            Contentstack Content Fetch                                │
│                                                                      │
│   Query includes variant alias → Returns personalized content       │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│              Render Personalized Page                                │
│                                                                      │
│   User sees targeted content immediately - no flicker               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Details

### Step 1: Retrieve CDP Segments

When a user visits the site, call your CDP's real-time API to retrieve their audience segments. Most CDPs provide a "Moments API" or similar endpoint for this purpose.

**Example: Tealium Moments API Response**

```json
{
  "audiences": ["fitness", "outdoor-enthusiasts", "premium-shoppers"],
  "badges": ["Frequent visitor", "VIP member"],
  "metrics": {
    "Total visits": 47,
    "Pages this session": 3
  },
  "properties": {
    "Visitor type": "returning"
  }
}
```

**Supported CDPs:**
- Tealium (Moments API)
- Segment (Profiles API)
- Lytics (Entity API)
- mParticle (Profile API)
- Treasure Data (Audience API)
- Any CDP with real-time audience retrieval

### Step 2: Format Segments for Personalize

Contentstack Personalize evaluates audience rules against string attributes. Convert the CDP's audience array into a comma-delimited string:

```typescript
// CDP returns array
const audiences = ["fitness", "outdoor-enthusiasts", "premium-shoppers"];

// Convert to delimited string for Personalize
const cdp_segments = audiences.join(",");
// Result: "fitness,outdoor-enthusiasts,premium-shoppers"
```

This format allows Personalize audience rules to use the `contains` operator:
- Rule: `cdp_segments contains "fitness"`
- Evaluates: Does `"fitness,outdoor-enthusiasts,premium-shoppers"` contain `"fitness"`?
- Result: **True** - user qualifies for the experience

### Step 3: Initialize Personalize with Live Attributes

Pass the CDP segments to the Personalize SDK using the `liveAttributes` option during initialization:

```typescript
import Personalize from '@contentstack/personalize-edge-sdk';

// Retrieve CDP data
const cdpResponse = await getCDPMomentsData(userId);

// Initialize Personalize with live attributes
const personalizeSdk = await Personalize.init(projectUid, {
  liveAttributes: {
    cdp_segments: cdpResponse.audiences.join(","),
    visitor_type: cdpResponse.properties["Visitor type"],
    // Include any other attributes needed for targeting
  }
});
```

**Key Concept: Live Attributes vs. Persisted Attributes**

| Aspect | Live Attributes | Persisted Attributes (set method) |
|--------|-----------------|-----------------------------------|
| When evaluated | Immediately during init | After sync to edge (~1 second) |
| Persistence | Session only | Stored in user profile |
| Use case | Real-time CDP data | Long-term user traits |
| First page view | Yes | No (requires prior visit) |

Live attributes are essential for first-page-view personalization because they're evaluated immediately without waiting for data to propagate through the system.

### Step 4: Retrieve Variant Aliases

After initialization, the Personalize SDK determines which experiences the user qualifies for and returns variant aliases:

```typescript
// Get experiences and variants
const experiences = personalizeSdk.getExperiences();
const variantAliases = personalizeSdk.getVariantAliases();

// Example result:
// variantAliases = ["fitness-hero-variant", "premium-product-grid"]
```

### Step 5: Fetch Personalized Content from Contentstack

Pass the variant aliases to Contentstack queries to retrieve the personalized content variants:

```typescript
// Contentstack query with variants
const query = Stack.ContentType('home_page')
  .Query()
  .variants(variantAliases.join(','))  // Pass variant aliases
  .toJSON()
  .findOne();

const personalizedContent = await query;
```

The Contentstack Delivery API returns the variant content for users who qualify, or the base content for users who don't.

---

## Contentstack Personalize Configuration

### Creating the CDP Segments Attribute

In Contentstack Personalize, create a custom attribute to receive the CDP data:

1. Navigate to **Personalize > Attributes**
2. Click **Add Attribute**
3. Configure:
   - **Key:** `cdp_segments`
   - **Type:** Text
   - **Description:** Comma-delimited CDP audience segments

### Creating Audience Rules

Create audiences that evaluate against the CDP segments:

1. Navigate to **Personalize > Audiences**
2. Click **Create Audience**
3. Configure the rule:
   - **Attribute:** `cdp_segments`
   - **Operator:** `contains`
   - **Value:** `fitness` (or your target segment name)

**Example Audiences:**

| Audience Name | Rule |
|---------------|------|
| Fitness Enthusiasts | `cdp_segments` contains `fitness` |
| Luxury Shoppers | `cdp_segments` contains `luxury-shoppers` |
| Tech Early Adopters | `cdp_segments` contains `early-adopters` |

### Creating Experiences

Create experiences that use these audiences to serve content variants:

1. Navigate to **Personalize > Experiences**
2. Click **Create Experience**
3. Select the target audience
4. Define the variant content in Contentstack CMS
5. Publish the experience

---

## Server-Side vs. Client-Side Implementation

### Client-Side Approach (Demonstrated)

The client-side approach initializes Personalize in the browser:

**Pros:**
- Simpler implementation
- CDP cookie/identifier readily available
- Works with client-side CDPs

**Cons:**
- Requires client-side JavaScript execution
- First render may need loading state

**Implementation:**
```typescript
// In React context provider (client component)
useEffect(() => {
  const initialize = async () => {
    const cdpData = await fetchCDPData();
    const sdk = await Personalize.init(projectUid, {
      liveAttributes: {
        cdp_segments: cdpData.audiences.join(',')
      }
    });
    // Store variant aliases in cookie for SSR
    document.cookie = `variants=${sdk.getVariantAliases().join(',')}`;
  };
  initialize();
}, []);
```

### Server-Side/Edge Approach (Advanced)

For true first-render personalization, implement at the edge/server:

**Pros:**
- Personalized content in initial HTML
- No JavaScript required for first render
- Better Core Web Vitals

**Cons:**
- More complex infrastructure
- Requires edge runtime support
- CDP must be callable from server

**Implementation (Next.js Middleware):**
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import Personalize from '@contentstack/personalize-edge-sdk';

export async function middleware(request: Request) {
  // Get CDP data server-side
  const cdpData = await fetchCDPDataFromServer(request);

  // Initialize Personalize at the edge
  const sdk = await Personalize.init(projectUid, {
    request,
    liveAttributes: {
      cdp_segments: cdpData.audiences.join(',')
    }
  });

  // Add variant aliases to response headers/cookies
  const response = NextResponse.next();
  response.cookies.set('variants', sdk.getVariantAliases().join(','));

  return response;
}
```

---

## Cookie-Based SSR Pattern

For Next.js applications, a hybrid approach provides flicker-free personalization:

1. **First Visit:** Client-side Personalize init, store variants in cookie
2. **Subsequent Requests:** Server reads cookie, fetches personalized content
3. **Result:** Personalized HTML from server on subsequent pages

```typescript
// Server component
import { cookies } from 'next/headers';

async function getPersonalizedContent() {
  const cookieStore = cookies();
  const variantsCookie = cookieStore.get('cs_personalize_variants');

  const variantAliases = variantsCookie
    ? JSON.parse(variantsCookie.value)
    : [];

  // Fetch content with variants
  return await contentstack.getHomePage(variantAliases);
}
```

---

## Best Practices

### 1. Segment Naming Conventions

Use consistent, lowercase, hyphenated segment names across your CDP and Personalize:
- Good: `fitness-enthusiasts`, `luxury-shoppers`
- Avoid: `Fitness Enthusiasts`, `LUXURY_SHOPPERS`

### 2. Fallback Content

Always ensure quality base content exists for users who don't match any audience:
- Test the experience with no CDP segments
- Ensure base content is compelling and relevant

### 3. Performance Optimization

- Cache CDP responses where appropriate
- Use edge caching for Personalize manifest
- Consider segment refresh frequency vs. API costs

### 4. Testing and QA

Test personalization by simulating CDP segments:
- Use URL parameters for testing: `?cdp_segments=fitness,luxury`
- Create test audiences in your CDP
- Verify variant delivery in browser DevTools

### 5. Analytics Integration

Track personalization effectiveness:
- Log which experiences/variants are served
- Measure conversion rates by audience
- A/B test personalized vs. non-personalized experiences

---

## Troubleshooting

### Segments Not Being Recognized

1. **Verify attribute exists:** Check Personalize > Attributes for `cdp_segments`
2. **Check attribute type:** Must be "Text" for string matching
3. **Verify rule syntax:** Use `contains` operator, not `equals`
4. **Check for typos:** Segment names are case-sensitive

### No Variants Returned

1. **Check experience is published:** Experiences must be active
2. **Verify audience qualification:** Test with known segments
3. **Check SDK initialization:** Log `getExperiences()` output

### Content Not Personalized

1. **Verify variant aliases passed:** Log aliases before Contentstack query
2. **Check variant content exists:** Content must be published in CMS
3. **Verify `.variants()` call:** Ensure query includes variant method

---

## Summary

This architecture enables real-time, CDP-driven personalization by:

1. **Retrieving** audience segments from any CDP via real-time API
2. **Converting** segments to a comma-delimited string format
3. **Passing** segments as `liveAttributes` during Personalize SDK initialization
4. **Evaluating** audience rules against CDP data in real-time
5. **Fetching** personalized content variants from Contentstack
6. **Rendering** targeted experiences from the first page view

The key innovation is using Personalize's `liveAttributes` feature to enable immediate audience evaluation without waiting for data synchronization, combined with flexible string-matching rules that work with any CDP's audience taxonomy.

---

## References

- [Contentstack Personalize Edge SDK Documentation](https://www.contentstack.com/docs/developers/sdks/personalize-edge-sdk/javascript)
- [Personalize Edge SDK API Reference](https://www.contentstack.com/docs/developers/sdks/personalize-edge-sdk/javascript/reference)
- [About Attributes in Personalize](https://www.contentstack.com/docs/personalize/about-attributes)
- [Tealium Moments API Documentation](https://docs.tealium.com/platforms/moments-api/)
