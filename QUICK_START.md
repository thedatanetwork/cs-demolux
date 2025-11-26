# Demolux Modular Architecture - Quick Start Guide

## 🚀 Get Started in 5 Minutes

Your site now has a powerful modular architecture! Here's how to start using it:

### Step 1: Create Content Types (1 minute)

Run the automated script to create all necessary content types:

```bash
cd scripts
npm run create-modular-content-types
```

This creates:
- ✅ Campaign
- ✅ Value Proposition
- ✅ Feature Item
- ✅ Collection
- ✅ Lookbook Page

### Step 2: Create Your First Collection (2 minutes)

1. **Log into Contentstack**
2. **Go to Entries → Create New → Collection**
3. **Fill in the fields:**
   - Title: "Holiday 2025 Collection"
   - Slug: `/collections/holiday-2025`
   - Description: "Curated selection of our finest tech for the holidays"
   - Featured Image: Upload an image
   - Products: Reference 3-4 existing products
   - Collection Type: Select "seasonal"
   - Is Featured: Check this box
4. **Save and Publish**
5. **Visit**: `http://localhost:3000/collections/holiday-2025`

### Step 3: Build Your Modular Home Page (2 minutes)

The hardest part! But trust me, it's worth it. You'll need to create this in Contentstack:

1. **In Contentstack, go to Content Models**
2. **Click "Create Content Type"**
3. **Name it "Modular Home Page"** (uid: `modular_home_page`)
4. **Add these fields:**
   - Title (Single Line Text)
   - Page Sections (JSON - multiple, allow JSON RTE)
   - Meta Title (Single Line Text)
   - Meta Description (Multi Line Text)

5. **Go to Entries → Create New → Modular Home Page**
6. **In Page Sections, add JSON blocks like this:**

**First block - Hero:**
```json
{
  "block_type": "hero_section",
  "variant": "split_hero",
  "badge_text": "Premium Luxury Technology",
  "title": "Meets Luxury",
  "subtitle": "Where Innovation",
  "description": "Discover the future of luxury technology with Demolux.",
  "primary_cta": {
    "text": "Shop Now",
    "url": "/categories/wearable-tech"
  },
  "secondary_cta": {
    "text": "Learn More",
    "url": "/about"
  }
}
```

7. **Save and Publish**
8. **Visit**: `http://localhost:3000/home-modular`

## 🎨 What You Can Build

### Modular Home Page Examples

**E-commerce Focus:**
```
1. Hero Section (campaign_hero variant)
2. Featured Content Grid (product_grid - your best sellers)
3. Campaign CTA (announcement_banner - current sale)
4. Values Grid (why shop with us)
5. Featured Content Grid (blog_grid - latest articles)
6. Campaign CTA (centered_cta - newsletter signup)
```

**Editorial Focus:**
```
1. Hero Section (minimal_hero variant)
2. Gallery Section (masonry_gallery - lifestyle photos)
3. Featured Content Grid (collection_grid - curated collections)
4. Values Grid (brand values)
5. Featured Content Grid (product_grid - featured products)
6. Campaign CTA (split_cta - brand story)
```

## 📦 Available Block Types

### 1. Hero Section Block
**Variants**: `split_hero`, `minimal_hero`, `image_hero`, `campaign_hero`

**Use for**: Page headers, campaigns, product launches

**Example**:
```json
{
  "block_type": "hero_section",
  "variant": "split_hero",
  "badge_text": "New Arrival",
  "title": "Revolutionary Tech",
  "subtitle": "Introducing",
  "description": "Experience the future...",
  "primary_cta": { "text": "Shop Now", "url": "/products" }
}
```

### 2. Featured Content Grid Block
**Variants**: `product_grid`, `blog_grid`, `mixed_grid`, `collection_grid`

**Use for**: Showcasing products, blog posts, or collections

**Example**:
```json
{
  "block_type": "featured_content_grid",
  "variant": "product_grid",
  "section_title": "Best Sellers",
  "section_description": "Our most popular products",
  "badge_text": "Trending",
  "layout_style": "grid-4",
  "background_style": "gray",
  "show_cta": true,
  "cta_text": "View All",
  "cta_url": "/products"
}
```

**Note**: For manual product display, you need to add references to products in the `manual_items` field. This requires modular blocks with reference support.

### 3. Values Grid Block
**Use for**: Brand values, features, USPs

**Example** (after creating Value Proposition entries):
```json
{
  "block_type": "values_grid",
  "section_title": "Why Choose Demolux",
  "section_description": "What sets us apart",
  "badge_text": "Our Values",
  "layout_style": "grid-3",
  "card_style": "elevated",
  "background_style": "white"
}
```

### 4. Campaign CTA Block
**Variants**: `full_width_cta`, `split_cta`, `centered_cta`, `announcement_banner`

**Use for**: Promotions, conversions, announcements

**Example**:
```json
{
  "block_type": "campaign_cta",
  "variant": "centered_cta",
  "title": "Limited Time Offer",
  "description": "Save up to 40% on select items",
  "badge_text": "Sale",
  "background_style": "gradient-gold",
  "text_color": "light",
  "primary_cta": { "text": "Shop Sale", "url": "/sale" }
}
```

### 5. Gallery Section Block
**Variants**: `grid_gallery`, `masonry_gallery`, `carousel_gallery`, `fullscreen_gallery`

**Use for**: Lookbooks, lifestyle imagery, galleries

**Note**: Requires image uploads. For now, this works best in Lookbook Pages.

## 🎯 Common Tasks

### Create a Seasonal Campaign Page

1. **Create a Campaign entry** in Contentstack
2. **Use it in a Campaign CTA block:**
```json
{
  "block_type": "campaign_cta",
  "variant": "full_width_cta",
  "title": "Holiday Sale 2025",
  "description": "Limited time: Save up to 50%",
  "primary_cta": { "text": "Shop Now", "url": "/collections/holiday-2025" }
}
```

### Add a New Collection Page

1. **Create Collection entry** in Contentstack
2. **Add products to the collection**
3. **Visit** `/collections/your-slug`
4. Done! The page is automatically generated.

### Create a Lookbook

1. **Create Lookbook Page entry** in Contentstack
2. **Add Gallery Section blocks** to page_sections
3. **Reference products** featured in the lookbook
4. **Visit** `/lookbook/your-slug`

## 📚 Full Documentation

- **`MODULAR_ARCHITECTURE.md`** - Complete technical specification
- **`IMPLEMENTATION_GUIDE.md`** - Detailed step-by-step guide
- **`CLAUDE.md`** - Project overview and architecture notes

## 🆘 Troubleshooting

### "Content type not found"
Run the script: `cd scripts && npm run create-modular-content-types`

### "No sections to display"
Make sure you:
1. Created a `modular_home_page` entry in Contentstack
2. Added page_sections with valid JSON
3. Published the entry

### "Page not found"
Check that:
1. The slug in Contentstack matches the URL (e.g., `/collections/my-collection`)
2. The entry is published
3. You're viewing the correct URL

## 🎉 Next Steps

1. ✅ Run `npm run create-modular-content-types` in the scripts directory
2. ✅ Create your first Collection
3. ✅ Build a modular home page
4. ✅ Create Value Propositions for reuse
5. ✅ Experiment with different block combinations

**You now have a world-class modular CMS architecture!** 🚀

No code changes needed - just compose stunning pages in Contentstack.
