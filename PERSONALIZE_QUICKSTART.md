# Contentstack Personalize - Quick Start Guide

Get up and running with Contentstack Personalize in 5 minutes!

## Step 1: Configure Environment Variables

Add your Personalize Project UID to `.env.local`:

```bash
NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID=your_project_uid_here
```

**Where to find your Project UID:**
1. Log into Contentstack
2. Go to **Personalize** → **Projects**
3. Select your project
4. Copy the **Project UID**

## Step 2: Verify Integration

The integration is already set up! Check that these files exist:

- ✅ `src/lib/personalize.ts` - Personalize service
- ✅ `src/contexts/PersonalizeContext.tsx` - React context
- ✅ `src/components/PersonalizeEventTracker.tsx` - Tracking utilities
- ✅ `src/app/layout.tsx` - PersonalizeProvider added

## Step 3: Track Your First Event

Add event tracking to any component:

```tsx
import { usePersonalizeEvent } from '@/contexts/PersonalizeContext';

export function MyButton() {
  const { trackEvent } = usePersonalizeEvent();

  return (
    <button onClick={() => trackEvent('button_click')}>
      Click Me
    </button>
  );
}
```

## Step 4: Create Events in Contentstack

1. Go to **Personalize** → **Events** in Contentstack
2. Create a new event with key: `button_click`
3. Save and publish

## Step 5: Create an Experience

1. Go to **Personalize** → **Experiences**
2. Create a new experience
3. Define variants and targeting rules
4. Publish the experience

## Step 6: Fetch Personalized Content

Your content will automatically be personalized! The DataService uses variant aliases:

```tsx
import { dataService } from '@/lib/data-service';

const products = await dataService.getProducts();
// Returns personalized product variants based on active experiences
```

## Common Use Cases

### Track Product Views

```tsx
import { useProductTracking } from '@/components/PersonalizeEventTracker';

const { trackProductView } = useProductTracking();

useEffect(() => {
  trackProductView(productId);
}, [productId]);
```

### Track Add to Cart

```tsx
const { trackAddToCart } = useProductTracking();

<button onClick={() => trackAddToCart(productId, quantity)}>
  Add to Cart
</button>
```

### Track CTA Clicks

```tsx
import { useCTATracking } from '@/components/PersonalizeEventTracker';

const { trackCTAClick } = useCTATracking();

<button onClick={() => trackCTAClick('hero_cta', '/products')}>
  Shop Now
</button>
```

### Set User Attributes

```tsx
import { usePersonalizeAttributes } from '@/contexts/PersonalizeContext';

const { setAttributes } = usePersonalizeAttributes();

setAttributes({
  age: 25,
  interests: ['tech', 'fashion'],
  membership_level: 'premium'
});
```

## Debugging

### Check if Personalize is configured:

```tsx
const { isConfigured, isLoading } = usePersonalize();

console.log('Configured:', isConfigured);
console.log('Loading:', isLoading);
```

### View active experiences and variants:

```tsx
const { experiences, variantAliases } = usePersonalize();

console.log('Active Experiences:', experiences);
console.log('Variant Aliases:', variantAliases);
```

### Browser Console

Open browser console to see personalization logs:
- SDK initialization
- Active experiences
- Event tracking
- Variant aliases

## Next Steps

- Read the full guide: `PERSONALIZE_SETUP.md`
- Define your event keys in Contentstack
- Create user attributes for targeting
- Set up experiences and variants
- Test personalization with different user segments

## Common Event Keys to Define

Create these in Contentstack Personalize → Events:

**E-commerce:**
- `product_view`
- `product_click`
- `add_to_cart`
- `remove_from_cart`
- `checkout_start`
- `purchase`

**Content:**
- `blog_view`
- `blog_share`
- `video_play`
- `video_complete`

**Engagement:**
- `cta_click`
- `form_submit`
- `newsletter_signup`
- `contact_submit`

**Navigation:**
- `category_view`
- `search_performed`
- `filter_applied`

## Need Help?

- Full documentation: `PERSONALIZE_SETUP.md`
- Contentstack Docs: https://www.contentstack.com/docs/developers/personalize/
- SDK Reference: https://www.contentstack.com/docs/developers/sdks/personalize-edge-sdk/javascript/

---

**Ready to personalize your content!** 🎯

