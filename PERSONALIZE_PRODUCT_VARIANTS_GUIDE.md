# Testing Personalized Product Variants

## ✅ You're All Set!

I've just updated your product pages to fetch personalized product variants! Here's how it works and how to test it.

## How It Works

### The Flow:
1. **Server-Side Render**: Product page initially loads with default content (fast SSR)
2. **Client-Side Personalization**: `PersonalizedProductContent` component:
   - Initializes Personalize SDK in browser
   - Gets user's variant aliases based on their audience
   - Refetches product with variant aliases
   - Updates the page with personalized variant (if different)

### What Was Changed:
- ✅ Created `PersonalizedProductContent.tsx` - Client component that handles variant loading
- ✅ Updated product page to use the new component
- ✅ Added visual indicator in dev mode when personalized content loads

## Testing Your Product Variants

### Prerequisites

1. **Environment Variable Set**
```bash
# In .env.local
NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID=your_project_uid
```

2. **Product Variants Created in Contentstack**
   - Go to Contentstack → Content Models → Product
   - Create variant entries for your products
   - Link variants to parent entries

3. **Experience Created**
   - Go to Contentstack → Personalize → Experiences
   - Create experience with targeting rules
   - Define which variant shows to which audience
   - **Publish the experience**

### Step-by-Step Testing

#### Step 1: Start Dev Server
```bash
npm run dev
```

#### Step 2: Open Product Page
```
http://localhost:3000/products/your-product-slug
```

#### Step 3: Check Browser Console

You should see:
```
Personalize SDK initialized (client-side)
Product view tracked: { productId: '...', productTitle: '...' }
Active Experiences: [...]
Variant aliases: ['cs_personalize_a_0', ...]
```

If variant is different from default:
```
✨ Personalized product variant loaded: {
  originalUid: 'default_product_uid',
  personalizedUid: 'variant_product_uid',
  variantAliases: ['cs_personalize_a_0'],
  title: 'Personalized Product Title'
}
```

#### Step 4: Visual Confirmation

In **development mode**, you'll see a purple banner at the top if personalized content loaded:
```
✨ Personalized Content - Showing variant for your audience
```

#### Step 5: Verify Content Changed

Check that the personalized product shows:
- Different title (if changed in variant)
- Different description (if changed)
- Different price (if changed)
- Different images (if changed)
- Different tags/features (if changed)

## Testing Different Audiences

### Method 1: Use Incognito/Private Browsing
Open different incognito windows to simulate different users with different targeting rules.

### Method 2: Clear Browser Storage
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Method 3: Change User Attributes
```javascript
// Set attributes to match different audience rules
import { usePersonalizeAttributes } from '@/contexts/PersonalizeContext';

const { setAttributes } = usePersonalizeAttributes();
setAttributes({
  age: 25,
  interests: ['tech'],
  location: 'US'
});
```

## Troubleshooting

### ❌ Variant Not Loading

**Check 1: Experience Published?**
- Go to Contentstack → Personalize → Experiences
- Ensure experience is **Published** (not draft)

**Check 2: Targeting Rules Match?**
- Verify your current user matches the targeting criteria
- Check if you need to set user attributes

**Check 3: Variant Aliases Present?**
```javascript
// In browser console
// Should show array of variant aliases
console.log('Variant Aliases:', variantAliases);
```

**Check 4: Product Variants Exist?**
- Verify variant entries exist in Contentstack
- Check that variants are properly linked
- Ensure variants have the same URL slug

### ❌ Console Shows Errors

**"Failed to initialize Personalize SDK"**
- Check `NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID` is set
- Verify Project UID is correct
- Restart dev server

**"Error loading personalized product"**
- Check Contentstack credentials are correct
- Verify product variant exists
- Check network tab for API errors

### ❌ Same Content Shows for Everyone

**Possible Causes:**
1. No experience targeting rules set up
2. All users match same targeting criteria
3. Only one variant exists (the default)
4. Variant aliases not being passed to queries

**Debug:**
```javascript
// Check in console:
console.log('Experiences:', experiences);
console.log('Variant Aliases:', variantAliases);
console.log('Is Configured:', isConfigured);
```

## Example: Setting Up Product Variants

### In Contentstack:

1. **Create Product Variants**
   - Content Model: Product
   - Create entries: "Premium User Variant", "New User Variant", etc.
   - Set different titles, prices, descriptions

2. **Create Experience**
   - Name: "Product Pricing Test"
   - Variants:
     - Variant A: Default Product
     - Variant B: Premium User Variant
   - Targeting:
     - Variant A: membership_level = 'free'
     - Variant B: membership_level = 'premium'

3. **Set User Attributes in Your App**
```typescript
const { setAttributes } = usePersonalizeAttributes();

// When user logs in
setAttributes({
  membership_level: user.isPremium ? 'premium' : 'free'
});
```

4. **Test**
- Visit product page as free user → sees Variant A
- Change attribute to premium → sees Variant B
- Different price, description, or other content

## Monitoring Personalization

### Check What User Sees:
```typescript
import { usePersonalize } from '@/contexts/PersonalizeContext';

const MyComponent = () => {
  const { experiences, variantAliases } = usePersonalize();
  
  console.log('User is in these experiences:', experiences);
  console.log('User is seeing these variants:', variantAliases);
  
  return <div>...</div>;
};
```

### Network Monitoring:
1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Look for Contentstack API calls
4. Check if `x-cs-variant-uid` parameter is present

## Pro Tips

### 1. Use Descriptive Variant Names
Instead of "Variant A", use "Premium_User_Product" or "Holiday_Sale_Product"

### 2. Test Edge Cases
- User with no attributes set
- User matching multiple targeting rules
- Network failures during variant fetch

### 3. Progressive Enhancement
The app shows default content first, then upgrades to personalized. This ensures:
- Fast initial page load
- Works even if Personalize fails
- Good SEO (search engines see default)

### 4. Cache Considerations
Variant aliases are determined per session. Clear browser storage to simulate new user.

## Next Steps

1. ✅ Set your Project UID in .env.local
2. ✅ Create product variant entries in Contentstack
3. ✅ Set up experience with targeting rules
4. ✅ Publish experience
5. ✅ Test with different audiences
6. ✅ Monitor console logs
7. ✅ Analyze conversion data in Contentstack

## Quick Checklist

- [ ] `NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID` set in .env.local
- [ ] Dev server restarted
- [ ] Product variant entries created in Contentstack
- [ ] Experience created and published
- [ ] Targeting rules configured
- [ ] Browser console open
- [ ] Product page loaded
- [ ] Variant aliases showing in console
- [ ] Personalized content loading (if applicable)
- [ ] Purple banner shows in dev mode (if variant changed)

## Need Help?

- Full setup: [PERSONALIZE_SETUP.md](./PERSONALIZE_SETUP.md)
- Quick start: [PERSONALIZE_QUICKSTART.md](./PERSONALIZE_QUICKSTART.md)
- Troubleshooting: See troubleshooting section in PERSONALIZE_SETUP.md

---

**Your product pages are now ready for personalization!** 🎯

The page will automatically fetch and display the right product variant based on each user's audience and targeting rules.

