# Contentstack Personalize - Quick Reference Card

## 🚀 Setup (One Time)

```bash
# 1. Add to .env.local
NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID=your_project_uid

# 2. Restart dev server
npm run dev
```

## 📊 Pre-Built Tracking Hooks

### Product Tracking
```typescript
import { useProductTracking } from '@/components/PersonalizeEventTracker';

const { trackProductView, trackAddToCart, trackPurchase } = useProductTracking();

trackProductView(productId);
trackAddToCart(productId, quantity);
trackPurchase(orderId, total, items);
```

### Blog Tracking
```typescript
import { useBlogTracking } from '@/components/PersonalizeEventTracker';

const { trackBlogView, trackBlogShare } = useBlogTracking();

trackBlogView(postId);
trackBlogShare(postId, 'twitter');
```

### CTA Tracking
```typescript
import { useCTATracking } from '@/components/PersonalizeEventTracker';

const { trackCTAClick } = useCTATracking();

trackCTAClick('button_id', '/destination');
```

## 🎯 Custom Events

```typescript
import { usePersonalizeEvent } from '@/contexts/PersonalizeContext';

const { trackEvent } = usePersonalizeEvent();

trackEvent('custom_event', { 
  key: 'value',
  userId: '123' 
});
```

## 👤 User Attributes

```typescript
import { usePersonalizeAttributes } from '@/contexts/PersonalizeContext';

const { setAttributes } = usePersonalizeAttributes();

setAttributes({
  age: 25,
  interests: ['tech', 'fashion'],
  membership: 'premium'
});
```

## 📦 Access Personalization Data

```typescript
import { usePersonalize } from '@/contexts/PersonalizeContext';

const { 
  experiences,       // Active experiences
  variantAliases,    // Content variant IDs
  isLoading,         // SDK loading state
  isConfigured       // Is Personalize configured?
} = usePersonalize();
```

## 🔍 Debugging

### Browser Console
```javascript
// Check SDK status
console.log('Configured:', isConfigured);
console.log('Experiences:', experiences);
console.log('Variants:', variantAliases);
```

### Network Tab
- Look for calls to Personalize Edge API
- Check for event tracking requests
- Verify variant aliases in content requests

## 📝 Event Keys to Create in Contentstack

Go to **Contentstack → Personalize → Events** and create:

**E-commerce:**
- `product_view`
- `product_click`
- `add_to_cart`
- `purchase`

**Engagement:**
- `cta_click`
- `hero_primary_cta`
- `hero_secondary_cta`

**Content:**
- `blog_view`
- `blog_share`

**Conversion:**
- `form_submit`
- `newsletter_signup`

## 🎨 Already Implemented

✅ Product view tracking on product pages  
✅ Add to cart event tracking  
✅ Hero CTA click tracking  
✅ PersonalizeProvider in app layout  
✅ Variant aliases in content queries

## 📚 Documentation Files

- `PERSONALIZE_QUICKSTART.md` - 5-min setup
- `PERSONALIZE_SETUP.md` - Complete guide
- `PERSONALIZE_COMPLETE.md` - Implementation summary
- `PERSONALIZE_QUICK_REFERENCE.md` - This card

## 🆘 Common Issues

**SDK not initializing?**
- Check env var has `NEXT_PUBLIC_` prefix
- Restart dev server after adding env vars

**Events not tracking?**
- Create event keys in Contentstack first
- Event names are case-sensitive

**Content not personalized?**
- Publish experiences in Contentstack
- Check targeting rules match user
- Verify content variants exist

## 🔗 Links

- [Contentstack Personalize](https://www.contentstack.com/docs/developers/personalize/)
- [JavaScript SDK Docs](https://www.contentstack.com/docs/developers/sdks/personalize-edge-sdk/javascript/)

---

**Quick, easy reference for daily development!** 🚀

