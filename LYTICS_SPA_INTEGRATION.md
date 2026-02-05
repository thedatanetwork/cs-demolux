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

Call `jstag.pageView()` and `jstag.loadEntity()` on every route change:

```javascript
// On SPA route change
jstag.pageView();
jstag.loadEntity(function(profile) {
  // Experiences are re-fetched and re-evaluated automatically
  console.log('Profile loaded:', profile);
});
```

**Critical insight**: `loadEntity()` does more than just load the user profile. It also:
- Re-fetches experiences from the Lytics API
- Re-populates `jstag.config.pathfora.publish.candidates.experiences`
- Re-evaluates and displays applicable Pathfora widgets

## Next.js App Router Implementation

The implementation requires storing experiences on initial load, then restoring them on SPA navigation:

```tsx
// src/components/LyticsTracker.tsx
'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Store experiences globally so they survive SPA navigation
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

      setTimeout(() => {
        const experiences = window.jstag?.config?.pathfora?.publish?.candidates?.experiences;
        if (experiences?.length > 0) {
          storedExperiences = JSON.parse(JSON.stringify(experiences));
        }
      }, 1000);
      return;
    }

    // SPA navigation: restore and reinitialize
    if (window.jstag) {
      window.jstag.pageView();
      window.jstag.loadEntity(function(profile) {
        if (window.pathfora && storedExperiences?.length > 0) {
          // Clear Pathfora impression tracking from localStorage
          // This allows experiences to re-evaluate on SPA navigation
          // Note: We keep PathforaClosed_ so dismissed modals stay dismissed
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('PathforaImpressions_') || key === 'PathforaPageView')) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));

          // Clear existing widgets
          window.pathfora.clearAll();

          // Restore experiences to config
          const config = window.jstag?.config?.pathfora?.publish?.candidates;
          if (config) {
            config.experiences = JSON.parse(JSON.stringify(storedExperiences));
          }

          // Re-initialize
          window.pathfora.initializeWidgets(storedExperiences);
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

## Why Store Experiences?

While `loadEntity()` should theoretically re-fetch and re-evaluate experiences, in practice we found that storing experiences on initial load and restoring them on SPA navigation was more reliable. The stored experiences approach:

1. Captures experiences after Lytics fully initializes (1 second delay)
2. Preserves them in a module-level variable
3. Restores them to the config on each SPA navigation
4. Calls `initializeWidgets()` to display them

## Why Skip the First Render?

On the initial page load, the Lytics script (injected by Launch or loaded directly) handles everything automatically. If you call `loadEntity()` again immediately, you may cause duplicate experience triggers or race conditions.

## Debugging

### Check if experiences are loaded

```javascript
// Should have items after initial load
jstag.config.pathfora.publish.candidates.experiences

// Will be empty after SPA navigation until loadEntity() is called
```

### Verify loadEntity re-fetches experiences

```javascript
jstag.loadEntity(function(p) {
  console.log('Experiences:', jstag.config.pathfora.publish.candidates.experiences);
});
```

### Available Pathfora methods

```javascript
Object.keys(pathfora).filter(k => typeof pathfora[k] === 'function')
// Returns: clearAll, initializeWidgets, initializePageViews,
// initializeTargetedWidgets, triggerWidgets, showWidget, closeWidget, etc.
```

## Pathfora Impression Tracking

Pathfora tracks widget impressions in localStorage to prevent showing the same experience multiple times. On SPA navigation, these must be cleared (except for user dismissals) to allow experiences to re-evaluate.

### localStorage Keys

| Key Pattern | Purpose | Clear on SPA Nav? |
|-------------|---------|-------------------|
| `PathforaImpressions_*` | Tracks which widgets have been shown | ✅ Yes |
| `PathforaPageView` | Tracks page view count | ✅ Yes |
| `PathforaClosed_*` | Tracks user-dismissed widgets | ❌ No (respect dismissals) |

### Why This Matters

Without clearing impression tracking:
1. User sees a banner on page A
2. User navigates to page B (SPA navigation)
3. Banner should show on page B, but doesn't
4. **Reason**: Pathfora thinks it already showed the banner (impression tracked)

The fix clears `PathforaImpressions_*` and `PathforaPageView` but preserves `PathforaClosed_*` so that widgets the user explicitly closed stay closed.

## Common Pitfalls

### 1. Calling Pathfora methods directly

Methods like `pathfora.initializeWidgets()` require widget configurations to be passed:

```javascript
pathfora.initializeWidgets();
// Error: "Initialize called with no widgets"
```

**Solution**: Don't call these directly. Let `loadEntity()` handle experience initialization.

### 2. Using clearAll() incorrectly

`pathfora.clearAll()` removes all widgets but doesn't help with re-initialization:

```javascript
pathfora.clearAll();
pathfora.initializePageViews();
// Error: "can't access property 'target', o is undefined"
```

**Solution**: Just use `loadEntity()` which handles clearing and re-initialization internally.

### 3. Experiences array is empty

If `jstag.config.pathfora.publish.candidates.experiences` is empty, experiences won't show.

**Solution**: Call `loadEntity()` which re-fetches from the API.

## Key Objects Reference

### jstag

```javascript
window.jstag = {
  pageView: () => void,           // Track page view
  loadEntity: (callback) => void, // Load profile AND re-evaluate experiences
  send: (data) => void,           // Send custom event data
  identify: (data) => void,       // Identify user
  getEntity: (callback) => void,  // Get current entity/profile
  config: {
    pathfora: {
      publish: {
        candidates: {
          experiences: []  // Array of experience configs
        }
      }
    }
  }
}
```

### pathfora

```javascript
window.pathfora = {
  clearAll: () => void,              // Remove all widgets from DOM
  initializeWidgets: (modules) => void,  // Initialize with widget configs
  triggerWidgets: (ids?) => void,    // Trigger manual widgets
  showWidget: (id) => void,          // Show specific widget
  closeWidget: (id) => void,         // Close specific widget
}
```

## Testing Checklist

- [ ] Experience shows on initial page load (hard refresh)
- [ ] Experience shows after SPA navigation to a targeted page
- [ ] Experience re-shows after navigating away and back (impression tracking cleared)
- [ ] User-dismissed widgets stay dismissed across navigation
- [ ] Console shows `loadEntity` callback firing on navigation
- [ ] `jstag.config.pathfora.publish.candidates.experiences` has items after navigation
- [ ] No duplicate experiences showing

## Related Files in This Project

- `src/components/LyticsTracker.tsx` - SPA navigation tracking
