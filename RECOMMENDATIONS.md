# Recommendations & Personalization Demo

Every recommendation/personalization experience on this site is driven by **real Lytics** or
**Contentstack Personalize** — there is no fabricated/fallback product data anywhere. If a Lytics
call returns nothing, the placement hides itself.

## Capabilities shown

| Placement | Driven by | What it demonstrates |
|---|---|---|
| Homepage rail ("Recommended for you", below hero) | **Contentstack Personalize** + Lytics | Different audiences see a different rec experience; Lytics ranks the products |
| PDP rail ("You might also like") | **Lytics** Content Recommendations | Affinity-ranked, excludes current product (`visited:false`) |
| Cart rail ("Complete the setup") | **Lytics** Content Recommendations | Shuffled variety to round out a purchase |
| Idle + exit-intent modal | **Lytics Pathfora** | Behavioral experiences at high-intent moments |

## Code map

- `src/components/recommendations/ProductRecommendations.tsx` — the rail. Calls
  `window.jstag.recommend({ collection, limit, visited, shuffle }, cb)`, renders ranked products,
  sends `recommendations_view` / `recommendation_click` events, and **renders nothing when Lytics
  returns no products** (no fallback).
- `src/lib/recommendations.ts` — `LyticsRecommendation` type + `normalizeRecommendations()`.
- `src/components/blocks/RecommendationsBlock.tsx` — CMS-driven wrapper used on the homepage;
  registered in `SectionRenderer` as the `recommendations` block type.
- `src/components/recommendations/PersonalizeAudienceSwitcher.tsx` — demo control (bottom-left)
  that calls `sdk.set({ audience_affinity })`, re-reads variant aliases, updates the cookie, and
  refreshes — i.e. it drives **real** Personalize, it does not fake content.
- `window.jstag.recommend` / `.on` are typed in `src/components/LyticsTracker.tsx`.

## Prerequisites (env-side, not code)

1. **Lytics jstag** is injected on every page via Contentstack Launch (account *DemoLux DAL*,
   aid 8083). Rails only render where `window.jstag.recommend` exists.
2. **Lytics content collections** must be populated (e.g. `PRODUCTS`). They are — the rails query
   them live.

---

## 1. Lytics recommendation rails — already wired

The PDP and cart rails work as soon as the page loads with a live `jstag`. Verify:

```js
// Browser console on a product page:
jstag.recommend({ collection: "PRODUCTS", limit: 4 }, console.log)
```

- Returns products → rails render, `data-rec-source="live"` on the `<section>`.
- Returns `[]` → rails stay hidden (collection empty for this visitor). No placeholders appear.

To show affinity ranking convincingly in a no-traffic env, browse a few products first so Lytics
builds a profile, then reload.

---

## 2. Homepage rail — Personalize per audience

The homepage has an inline `recommendations` block (added below the hero by
`scripts/create-recommendations-block.js`, already run). To make it vary per audience, create the
Personalize experience:

### a. Mint a Personalize user authtoken (management tokens are rejected by the Personalize API)

```bash
curl -s -X POST https://api.contentstack.io/v3/user-session \
  -H 'Content-Type: application/json' \
  -d '{"user":{"email":"you@contentstack.com","password":"********"}}' | jq -r .user.authtoken
```

### b. Run the setup script

```bash
cd scripts
export CONTENTSTACK_AUTHTOKEN=<authtoken from step a>
npm run setup-personalize-recommendations
```

This creates (idempotently): the `audience_affinity` attribute, two audiences (Wearable Tech /
Technofurniture), a SEGMENTED experience on `modular_home_page`, entry variants that change the
recommendations block's heading/subheading/collection per audience, publishes the variants, and
activates the experience.

### c. Demo it

Use the **Audience** switcher (bottom-left of the homepage). It sets `audience_affinity`, the
Personalize SDK re-evaluates, and the homepage re-renders the variant for that audience. Lytics
still ranks the actual products inside the rail.

> To point an audience at a topic-specific Lytics collection (instead of `PRODUCTS`), edit the
> `rec.lytics_collection` values in `scripts/setup-personalize-recommendations.js` and re-run, or
> change the variant in the Personalize/Contentstack UI.

---

## 3. Behavioral modals — Lytics Pathfora

The app already captures and re-shows Pathfora experiences (`src/components/LyticsTracker.tsx`),
including their display conditions (show delay, exit intent) — so these are configured in the
**Lytics admin**, no code change needed. Create two experiences in Lytics → Experiences, each
using a **recommendation** content layout against a populated collection (e.g. `PRODUCTS`):

### a. First-visit idle (homepage)
- **Layout:** Modal / slide-in with a recommendation module.
- **Display → Trigger:** Show after a delay of **10 seconds**.
- **Display → URL:** contains `/` (homepage); exclude `/products`, `/cart`, `/checkout`.
- **Frequency:** once per visitor (and respect dismissal).
- **Audience:** new/first-time visitors.
- **Copy:** e.g. "New to DemoLux? Visitors love these."

### b. Exit-intent (product pages)
- **Layout:** Modal with a recommendation module.
- **Display → Trigger:** **Exit intent**.
- **Display → URL:** contains `/products/`.
- **Frequency:** once per visitor (respect dismissal).
- **Copy:** e.g. "Before you go — you might also like…"

After publishing in Lytics, the experiences flow into `jstag.config` and `LyticsTracker` shows the
URL-matching one (and re-shows correctly across SPA navigation).

---

## Verification checklist

- [ ] PDP: `jstag.recommend(...)` returns products; "You might also like" rail renders.
- [ ] Cart: "Complete the setup" rail renders with shuffled products.
- [ ] Homepage: after running the Personalize setup, the Audience switcher changes the rail
      heading/products between Wearables and Technofurniture.
- [ ] Pathfora: idle modal appears on the homepage after 10s (first visit); exit-intent modal
      appears when leaving a product page.
- [ ] Empty collections → rails hide cleanly; no placeholder/fake products ever render.
