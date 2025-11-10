# Contentstack Personalize Integration Guide

This guide explains how to use the Contentstack Personalize Edge SDK that has been integrated into your Demolux application.

## Overview

The Contentstack Personalize Edge SDK enables you to deliver personalized content experiences to your users based on their attributes, behaviors, and interactions. This integration allows you to:

- **Deliver personalized content variants** to different user segments
- **Track user events** (product views, CTA clicks, purchases, etc.)
- **Set user attributes** for targeted personalization
- **A/B test** different content variations
- **Analyze user behavior** to optimize experiences

## Prerequisites

Before using the Personalize SDK, you need:

1. **Contentstack Account** with Personalize enabled
2. **Personalize Project** created in Contentstack
3. **Project UID** from your Personalize project

## Configuration

### Environment Variables

Add the following environment variable to your `.env.local` file:

```bash
# Required for Personalize SDK
NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID=your_project_uid_here

# Existing Contentstack variables (already configured)
CONTENTSTACK_API_KEY=your_api_key
CONTENTSTACK_DELIVERY_TOKEN=your_delivery_token
CONTENTSTACK_ENVIRONMENT=your_environment
CONTENTSTACK_REGION=US
```

**Note:** The `NEXT_PUBLIC_` prefix is required because the Personalize SDK needs to run in the browser to track user interactions.

### Getting Your Project UID

1. Log into your Contentstack account
2. Navigate to **Personalize** → **Projects**
3. Select your project
4. Copy the **Project UID** from the project settings

## Architecture

The integration consists of several key components:

```
┌─────────────────────────────────────────────────────────┐
│                     Application                          │
├─────────────────────────────────────────────────────────┤
│  PersonalizeProvider (Context)                          │
│  ├─ Initializes SDK                                     │
│  ├─ Manages experiences & variants                      │
│  └─ Provides tracking functions                         │
├─────────────────────────────────────────────────────────┤
│  DataService (Content Fetching)                         │
│  ├─ Uses variant aliases for personalized content      │
│  └─ Integrates with Contentstack SDK                   │
├─────────────────────────────────────────────────────────┤
│  Contentstack Personalize Edge SDK                      │
│  ├─ Decision engine for variants                       │
│  └─ Event tracking & user attributes                   │
└─────────────────────────────────────────────────────────┘
```

## Usage

### 1. Basic Setup (Already Configured)

The `PersonalizeProvider` is already included in your app layout:

```typescript
// src/app/layout.tsx
<PersonalizeProvider>
  {children}
</PersonalizeProvider>
```

### 2. Accessing Personalization Data

Use the `usePersonalize` hook to access experiences and variant aliases:

```typescript
import { usePersonalize } from '@/contexts/PersonalizeContext';

export function MyComponent() {
  const { 
    experiences,      // Active experiences for this user
    variantAliases,   // Variant aliases for content delivery
    isLoading,        // Loading state
    isConfigured      // Whether Personalize is configured
  } = usePersonalize();

  if (isLoading) {
    return <div>Loading personalization...</div>;
  }

  if (!isConfigured) {
    // Personalize not configured, show default content
    return <DefaultContent />;
  }

  return (
    <div>
      <p>Active Experiences: {experiences.length}</p>
      <p>Variants: {variantAliases.join(', ')}</p>
    </div>
  );
}
```

### 3. Tracking Events

#### Using the Event Tracking Hook

```typescript
import { usePersonalizeEvent } from '@/contexts/PersonalizeContext';

export function ProductCard({ product }) {
  const { trackEvent, isConfigured } = usePersonalizeEvent();

  const handleClick = async () => {
    // Track event when user clicks product
    await trackEvent('product_click', {
      product_id: product.uid,
      product_name: product.title,
      category: product.category
    });
  };

  return (
    <div onClick={handleClick}>
      <h3>{product.title}</h3>
    </div>
  );
}
```

#### Using Pre-built Tracking Hooks

We provide specialized hooks for common tracking scenarios:

**Product Tracking:**

```typescript
import { useProductTracking } from '@/components/PersonalizeEventTracker';

export function ProductDetailPage({ productId }) {
  const { trackProductView, trackAddToCart } = useProductTracking();

  // Track product view when page loads
  useEffect(() => {
    trackProductView(productId);
  }, [productId]);

  // Track add to cart
  const handleAddToCart = () => {
    trackAddToCart(productId, 1);
  };

  return <button onClick={handleAddToCart}>Add to Cart</button>;
}
```

**Blog Tracking:**

```typescript
import { useBlogTracking } from '@/components/PersonalizeEventTracker';

export function BlogPost({ postId }) {
  const { trackBlogView, trackBlogShare } = useBlogTracking();

  useEffect(() => {
    trackBlogView(postId);
  }, [postId]);

  const handleShare = (platform: string) => {
    trackBlogShare(postId, platform);
  };

  return (
    <div>
      <button onClick={() => handleShare('twitter')}>Share on Twitter</button>
    </div>
  );
}
```

**CTA Tracking:**

```typescript
import { useCTATracking } from '@/components/PersonalizeEventTracker';

export function HeroSection() {
  const { trackCTAClick } = useCTATracking();

  return (
    <button 
      onClick={() => trackCTAClick('hero_cta', '/products')}
    >
      Shop Now
    </button>
  );
}
```

### 4. Setting User Attributes

Set custom user attributes for personalization targeting:

```typescript
import { usePersonalizeAttributes } from '@/contexts/PersonalizeContext';

export function UserProfile({ user }) {
  const { setAttributes } = usePersonalizeAttributes();

  useEffect(() => {
    // Set user attributes when profile loads
    setAttributes({
      age: user.age,
      gender: user.gender,
      interests: user.interests,
      membership_level: user.membershipLevel
    });
  }, [user]);

  return <div>Profile Content</div>;
}
```

### 5. Fetching Personalized Content

The `DataService` automatically uses variant aliases when fetching content:

```typescript
import { dataService } from '@/lib/data-service';
import { usePersonalize } from '@/contexts/PersonalizeContext';

export function ProductList() {
  const { variantAliases, isLoading } = usePersonalize();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function loadProducts() {
      if (!isLoading) {
        // DataService automatically uses variant aliases
        // to fetch personalized product variants
        const data = await dataService.getProducts();
        setProducts(data);
      }
    }
    loadProducts();
  }, [variantAliases, isLoading]);

  return <div>{/* Render products */}</div>;
}
```

The data service will automatically include variant aliases in content queries, ensuring users see personalized content based on their active experiences.

### 6. Server-Side Personalization (Advanced)

For edge/middleware personalization (e.g., in Next.js middleware):

```typescript
import { personalizeService } from '@/lib/personalize';

export async function middleware(request: Request) {
  // Initialize SDK with request context
  const sdk = await personalizeService.initializeServer(
    request,
    userId,  // Optional
    liveAttributes  // Optional
  );

  if (sdk) {
    const variantAliases = sdk.getVariantAliases();
    // Use variant aliases to fetch personalized content
  }

  return NextResponse.next();
}
```

## Event Keys

Define your event keys in the Contentstack Personalize Events module. Common examples:

- `product_view` - User views a product
- `product_click` - User clicks on a product
- `add_to_cart` - User adds product to cart
- `purchase` - User completes a purchase
- `blog_view` - User views a blog post
- `blog_share` - User shares a blog post
- `cta_click` - User clicks a CTA button
- `form_submit` - User submits a form
- `video_play` - User plays a video
- `newsletter_signup` - User signs up for newsletter

## User Attributes

Define custom user attributes in the Contentstack Personalize Attributes module:

- `age` - User age
- `gender` - User gender
- `location` - User location
- `interests` - User interests (array)
- `membership_level` - User membership tier
- `purchase_history` - Past purchase data
- `visit_count` - Number of visits
- `last_visit_date` - Last visit timestamp

## Best Practices

### 1. Event Tracking

- **Track meaningful events**: Focus on events that indicate user intent
- **Include context**: Add relevant data to events (product ID, category, etc.)
- **Track conversions**: Always track goal completions (purchases, signups)
- **Avoid over-tracking**: Don't track every micro-interaction

### 2. User Attributes

- **Set on login**: Set user attributes when user authenticates
- **Update on changes**: Update attributes when user profile changes
- **Use live attributes**: For real-time targeting without waiting for sync
- **Privacy first**: Only collect necessary data with user consent

### 3. Performance

- **Check configuration**: Use `isConfigured` to avoid unnecessary API calls
- **Handle loading states**: Show loading UI while SDK initializes
- **Graceful degradation**: Always have fallback content for non-personalized scenarios
- **Cache when possible**: Variant aliases don't change frequently

### 4. Testing

- **Test without configuration**: App should work when Personalize is not configured
- **Test with mock data**: Verify tracking works with mock events
- **Use browser console**: Monitor SDK logs during development
- **Test different variants**: Verify content changes with different variants

## Troubleshooting

### SDK Not Initializing

- Verify `NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID` is set
- Check browser console for initialization errors
- Ensure Project UID is correct

### Events Not Tracking

- Verify event keys exist in Personalize Events module
- Check that event names match exactly (case-sensitive)
- Ensure SDK is initialized before tracking events
- Check network tab for API calls

### Personalized Content Not Showing

- Verify experiences are published and active in Contentstack
- Check that variant aliases are being passed to content queries
- Ensure content variants exist in Contentstack
- Verify user matches experience targeting rules

### Performance Issues

- Avoid initializing SDK multiple times
- Use React context to share SDK instance
- Cache variant aliases between page loads
- Limit number of tracked events

## API Reference

### PersonalizeContext

```typescript
interface PersonalizeContextType {
  sdk: PersonalizeSDK | null;           // SDK instance
  experiences: Experience[];             // Active experiences
  variantAliases: string[];             // Variant aliases for content
  isLoading: boolean;                   // Loading state
  isConfigured: boolean;                // Configuration status
  triggerEvent: (key: string, data?) => Promise<void>;  // Track event
  setUserAttributes: (attrs) => Promise<void>;          // Set attributes
}
```

### Hooks

- `usePersonalize()` - Access personalization data and functions
- `usePersonalizeEvent()` - Event tracking
- `usePersonalizeAttributes()` - User attribute management
- `useProductTracking()` - Product-specific event tracking
- `useBlogTracking()` - Blog-specific event tracking
- `useCTATracking()` - CTA click tracking

## Resources

- [Contentstack Personalize Documentation](https://www.contentstack.com/docs/developers/personalize/)
- [JavaScript Personalize Edge SDK](https://www.contentstack.com/docs/developers/sdks/personalize-edge-sdk/javascript/get-started-with-javascript-personalize-edge-sdk)
- [Personalize API Reference](https://www.contentstack.com/docs/developers/sdks/personalize-edge-sdk/)

## Support

For issues or questions:

1. Check the Contentstack documentation
2. Review browser console logs
3. Verify environment configuration
4. Contact Contentstack support

## Example Implementation

See `src/components/PersonalizeEventTracker.tsx` for complete examples of:
- Event tracking hooks
- Product interaction tracking
- Blog interaction tracking
- CTA click tracking

---

**Last Updated:** November 10, 2025

