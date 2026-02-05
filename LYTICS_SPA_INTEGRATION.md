# Lytics SPA Integration Guide

This document supplements the [official Lytics SPA documentation](https://docs.lytics.com/docs/lytics-javascript-tag#single-page-apps) with implementation details discovered during integration with Next.js App Router.

## Overview

When using Lytics with a Single Page Application (SPA), you need to manually trigger page tracking and experience re-evaluation on client-side navigation since the page doesn't fully reload.

## The Problem

On initial page load, Lytics:
1. Loads the jstag script
2. Fetches user profile and segments
3. Fetches Pathfora experiences from the API
4. Evaluates and displays applicable experiences (modals, bars, etc.)

On SPA navigation, **none of this happens automatically**. The experiences array at `jstag.config.pathfora.publish.candidates.experiences` gets cleared, and widgets won't show.

## The Solution

The solution involves several key steps:

1. **Capture experiences on initial load** - Store them before they get cleared
2. **Clear localStorage impression tracking** - So Pathfora re-evaluates fresh
3. **Reset the `valid` flag** - Pathfora marks experiences as `valid: false` if they don't match the current URL
4. **Filter to one experience** - Show only the most specific URL match to prevent duplicates
5. **Call initializeWidgets** - With a fresh copy of the filtered experience

## Next.js App Router Implementation

```tsx
// src/components/LyticsTracker.tsx
'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Store Pathfora experiences globally so they survive SPA navigation
let storedExperiences: any[] | null = null;

export default function LyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // First render: capture experiences after Lytics initializes
    if (isFirstRender.current) {
      isFirstRender.current = false;

      // Poll for experiences to be available (stops as soon as found)
      const checkForExperiences = () => {
        const experiences = window.jstag?.config?.pathfora?.publish?.candidates?.experiences;
        if (experiences?.length > 0 && !storedExperiences) {
          storedExperiences = JSON.parse(JSON.stringify(experiences));
          return true;
        }
        return false;
      };

      if (!checkForExperiences()) {
        // Poll every 200ms until experiences are found (max 30s)
        let attempts = 0;
        const pollInterval = setInterval(() => {
          if (checkForExperiences() || ++attempts >= 150) {
            clearInterval(pollInterval);
          }
        }, 200);
      }
      return;
    }

    // SPA navigation: reinitialize experiences
    if (window.jstag) {
      // 1. Clear localStorage impression tracking BEFORE Lytics calls
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('PathforaImpressions_') || key === 'PathforaPageView')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // 2. Track the page view
      window.jstag.pageView();

      // 3. Re-fetch visitor profile and reinitialize widgets
      window.jstag.loadEntity((profile) => {
        const pf = window.pathfora;
        if (!pf || !storedExperiences?.length) return;

        // 4. Clear existing widgets from DOM
        pf.clearAll();

        // 5. Create fresh copy and reset valid flags
        const freshExperiences = JSON.parse(JSON.stringify(storedExperiences));
        freshExperiences.forEach((exp: any) => {
          exp.valid = true;
          if (exp.config) exp.config.valid = true;
        });

        // 6. Filter to matching experiences based on URL targeting
        const currentUrl = window.location.href;
        const matchingExperiences = freshExperiences.filter((exp: any) => {
          const urlRules = exp.displayConditions?.urlContains || [];
          const hasIncludeMatch = urlRules.some((rule: any) => {
            if (rule.exclude) return false;
            return currentUrl.toLowerCase().includes(rule.value.toLowerCase());
          });
          const isExcluded = urlRules.some((rule: any) => {
            if (!rule.exclude) return false;
            return currentUrl.toLowerCase().includes(rule.value.toLowerCase());
          });
          return hasIncludeMatch && !isExcluded;
        });

        // 7. Sort by specificity (specific rules before catch-all "/")
        matchingExperiences.sort((a: any, b: any) => {
          const aRules = a.displayConditions?.urlContains || [];
          const bRules = b.displayConditions?.urlContains || [];
          const aHasSpecific = aRules.some((r: any) => !r.exclude && r.value !== '/');
          const bHasSpecific = bRules.some((r: any) => !r.exclude && r.value !== '/');
          if (aHasSpecific && !bHasSpecific) return -1;
          if (bHasSpecific && !aHasSpecific) return 1;
          return 0;
        });

        // 8. Show only the first (most specific) matching experience
        if (matchingExperiences.length > 0) {
          pf.initializeWidgets([matchingExperiences[0]]);
        }
      });
    }
  }, [pathname, searchParams]);

  return null;
}
```

Add to your root layout:

```tsx
// src/app/layout.tsx
import LyticsTracker from '@/components/LyticsTracker';
import { Suspense } from 'react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Suspense fallback={null}>
          <LyticsTracker />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
```

## Key Discoveries

### 1. Why Poll for Experiences?

Lytics load time varies depending on network conditions and when the script is injected. Rather than using fixed timeouts, we poll every 200ms until experiences are available. This is more reliable and captures experiences as soon as they're ready.

### 2. Why Clear localStorage BEFORE Lytics Calls?

Pathfora checks `PathforaImpressions_*` and `PathforaPageView` in localStorage to determine if an experience has been shown. If we clear these AFTER calling `loadEntity()`, Pathfora may have already evaluated and skipped the experiences.

### 3. Why Reset the `valid` Flag?

When Pathfora evaluates experiences, it sets `valid: false` on any experience that doesn't match the current URL's targeting rules. If you capture experiences on page A where experience X doesn't match, it gets `valid: false`. Later, when navigating to page B where X should match, the flag is still `false` and Pathfora skips it.

**Solution**: Reset `valid: true` on all experiences before calling `initializeWidgets()`.

### 4. Why Filter to One Experience?

Without filtering, multiple experiences can match the same page. For example:
- Experience A: targets pages containing "blog"
- Experience B: targets all pages except "technofurniture" (using "/" catch-all)

On `/blog`, BOTH experiences match. Pathfora's normal behavior shows only one, but our manual reinitialization bypasses that logic.

**Solution**: Filter experiences ourselves, prioritizing specific URL matches over catch-all rules.

## Pathfora Impression Tracking

Pathfora uses localStorage to track impressions and prevent showing the same experience repeatedly.

| Key Pattern | Purpose | Clear on SPA Nav? |
|-------------|---------|-------------------|
| `PathforaImpressions_*` | Tracks which widgets have been shown | Yes |
| `PathforaPageView` | Tracks page view count | Yes |
| `PathforaClosed_*` | Tracks user-dismissed widgets | **No** (respect dismissals) |

## Experience Object Structure

```javascript
{
  "id": "abc123",
  "valid": true,  // IMPORTANT: Pathfora sets this based on targeting
  "type": "message",  // or "form"
  "layout": "bar",  // or "modal"
  "displayConditions": {
    "showOnInit": true,
    "urlContains": [
      { "exclude": true, "match": "substring", "value": "technofurniture" },
      { "exclude": false, "match": "substring", "value": "/" }
    ]
  },
  // ... other config
}
```

## URL Targeting Logic

Pathfora's `urlContains` rules work as follows:
- `exclude: false` = Include if URL contains value
- `exclude: true` = Exclude if URL contains value

For an experience to show:
1. At least one include rule must match
2. No exclude rules can match

## Debugging

### Check captured experiences
```javascript
// In browser console
storedExperiences  // If using our component (exposed globally for debugging)
jstag.config.pathfora.publish.candidates.experiences  // Current Lytics state
```

### Check localStorage
```javascript
Object.keys(localStorage).filter(k => k.includes('Pathfora'))
```

### Check if widgets are in DOM
```javascript
document.querySelectorAll('.pf-widget')
```

## Testing Checklist

- [ ] Experience shows on initial page load (hard refresh)
- [ ] Experience shows after SPA navigation to a targeted page
- [ ] Experience re-shows after navigating away and back
- [ ] User-dismissed widgets stay dismissed across navigation
- [ ] Only one experience shows at a time (no duplicates)
- [ ] More specific URL targeting takes priority over catch-all rules

## Related Files

- `src/components/LyticsTracker.tsx` - SPA navigation tracking implementation
