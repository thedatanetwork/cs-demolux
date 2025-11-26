# Demolux Modular Content Architecture

## Overview

This document defines the modular content architecture for Demolux, inspired by luxury brands like Shinola and Minotti. The architecture uses Contentstack modular blocks and content references to create flexible, reusable page components.

## Content Type Hierarchy

```
Global Content Types (Reusable)
├── Campaign
├── Value Proposition
├── Feature Item
├── Testimonial
└── Collection

Page Content Types (Composable)
├── Home Page (modular)
├── Collection Landing Page (NEW)
├── Lookbook Page (NEW)
├── Category Page (modular)
├── Product (enhanced with modular sections)
└── Page (generic - enhanced with modular sections)
```

## Modular Block Types

### 1. Hero Section Block
**Use Cases:** HomePage, Collection pages, Category pages, Landing pages

**Variants:**
- `image_hero` - Full-width hero with image background
- `video_hero` - Hero with video background
- `split_hero` - Split layout (content left, media right)
- `minimal_hero` - Text-focused minimal hero
- `campaign_hero` - Promotional campaign hero

**Fields:**
```typescript
{
  block_type: 'hero_section',
  variant: 'image_hero' | 'video_hero' | 'split_hero' | 'minimal_hero' | 'campaign_hero',
  badge_text?: string,
  badge_icon?: string,
  title: string,
  subtitle?: string,
  description: string,
  background_media: Image | Video,
  overlay_style?: 'dark' | 'light' | 'gradient' | 'none',
  primary_cta?: {
    text: string,
    url: string,
    style: 'primary' | 'gold' | 'outline'
  },
  secondary_cta?: {
    text: string,
    url: string,
    style: 'primary' | 'gold' | 'outline'
  },
  feature_items?: FeatureItem[], // Reference to Feature Item content type
  text_alignment: 'left' | 'center' | 'right',
  height: 'full' | 'large' | 'medium' | 'small'
}
```

### 2. Featured Content Grid Block
**Use Cases:** HomePage, Collection pages, Category pages

**Variants:**
- `product_grid` - Display products
- `blog_grid` - Display blog posts
- `mixed_grid` - Display mixed content (products + blogs)
- `collection_grid` - Display collections

**Fields:**
```typescript
{
  block_type: 'featured_content_grid',
  variant: 'product_grid' | 'blog_grid' | 'mixed_grid' | 'collection_grid',
  section_title: string,
  section_description?: string,
  badge_text?: string,
  content_source: 'manual' | 'dynamic' | 'mixed',
  manual_items?: Reference[], // Manual references to Product/BlogPost/Collection
  dynamic_query?: {
    content_type: 'product' | 'blog_post' | 'collection',
    filter_by?: {
      category?: string,
      tags?: string[],
      featured?: boolean
    },
    sort_by: 'date' | 'title' | 'popularity',
    limit: number
  },
  layout_style: 'grid-2' | 'grid-3' | 'grid-4' | 'masonry' | 'carousel',
  items_per_row: 2 | 3 | 4,
  show_cta: boolean,
  cta_text?: string,
  cta_url?: string,
  background_style: 'white' | 'gray' | 'gradient'
}
```

### 3. Value Propositions / Features Grid Block
**Use Cases:** HomePage, About page, Product pages, Collection pages

**Fields:**
```typescript
{
  block_type: 'values_grid',
  section_title: string,
  section_description?: string,
  badge_text?: string,
  values: ValueProposition[], // Reference to Value Proposition content type
  layout_style: 'grid-2' | 'grid-3' | 'grid-4' | 'horizontal-scroll',
  card_style: 'elevated' | 'flat' | 'bordered' | 'minimal',
  icon_style: 'filled' | 'outlined' | 'gradient',
  background_style: 'white' | 'gray' | 'gradient'
}
```

### 4. Campaign / CTA Block
**Use Cases:** HomePage, Collection pages, Category pages

**Variants:**
- `full_width_cta` - Full-width promotional banner
- `split_cta` - Split layout with media
- `centered_cta` - Centered with dark/light background
- `announcement_banner` - Slim announcement banner

**Fields:**
```typescript
{
  block_type: 'campaign_cta',
  variant: 'full_width_cta' | 'split_cta' | 'centered_cta' | 'announcement_banner',
  campaign?: Campaign, // Reference to Campaign content type (optional)
  title: string,
  description?: string,
  badge_text?: string,
  background_media?: Image | Video,
  background_style: 'gradient-dark' | 'gradient-gold' | 'image' | 'video' | 'solid',
  primary_cta?: {
    text: string,
    url: string,
    style: 'primary' | 'gold' | 'outline'
  },
  secondary_cta?: {
    text: string,
    url: string,
    style: 'primary' | 'gold' | 'outline'
  },
  text_color: 'light' | 'dark',
  height: 'full' | 'large' | 'medium' | 'small'
}
```

### 5. Text + Media Section Block
**Use Cases:** About page, Brand Story, Product pages, Collection pages

**Variants:**
- `text_left_media_right`
- `text_right_media_left`
- `text_centered_media_below`
- `text_overlay_media`

**Fields:**
```typescript
{
  block_type: 'text_media_section',
  variant: 'text_left_media_right' | 'text_right_media_left' | 'text_centered_media_below' | 'text_overlay_media',
  title?: string,
  badge_text?: string,
  content: string, // Rich text editor
  media: Image | Video,
  media_aspect_ratio: 'square' | 'landscape' | 'portrait' | 'wide',
  cta?: {
    text: string,
    url: string,
    style: 'primary' | 'gold' | 'outline'
  },
  background_style: 'white' | 'gray' | 'transparent',
  content_width: 'narrow' | 'medium' | 'wide' | 'full',
  vertical_alignment: 'top' | 'center' | 'bottom'
}
```

### 6. Product Showcase Block
**Use Cases:** HomePage, Collection pages, Landing pages

**Fields:**
```typescript
{
  block_type: 'product_showcase',
  product: Product, // Reference to Product content type
  layout_style: 'hero' | 'split' | 'card' | 'minimal',
  show_product_details: boolean,
  custom_title?: string,
  custom_description?: string,
  show_price: boolean,
  show_cta: boolean,
  cta_text?: string,
  background_style: 'white' | 'gray' | 'gradient' | 'image'
}
```

### 7. Gallery Section Block
**Use Cases:** Lookbook pages, Product pages, About page

**Variants:**
- `grid_gallery` - Standard grid layout
- `masonry_gallery` - Pinterest-style masonry
- `carousel_gallery` - Horizontal scrolling carousel
- `fullscreen_gallery` - Full-screen lightbox gallery

**Fields:**
```typescript
{
  block_type: 'gallery_section',
  variant: 'grid_gallery' | 'masonry_gallery' | 'carousel_gallery' | 'fullscreen_gallery',
  section_title?: string,
  section_description?: string,
  images: Image[],
  columns: 2 | 3 | 4 | 5,
  spacing: 'tight' | 'normal' | 'loose',
  enable_lightbox: boolean,
  enable_captions: boolean,
  background_style: 'white' | 'black' | 'gray'
}
```

### 8. Collection Showcase Block (NEW)
**Use Cases:** HomePage, Collection listing pages

**Fields:**
```typescript
{
  block_type: 'collection_showcase',
  section_title: string,
  section_description?: string,
  collections: Collection[], // Reference to Collection content type
  layout_style: 'grid' | 'carousel' | 'featured-large',
  show_product_count: boolean,
  card_style: 'elevated' | 'flat' | 'overlay'
}
```

### 9. Testimonials / Reviews Block
**Use Cases:** HomePage, Product pages, About page

**Fields:**
```typescript
{
  block_type: 'testimonials',
  section_title?: string,
  section_description?: string,
  testimonials: Testimonial[], // Reference to Testimonial content type
  layout_style: 'carousel' | 'grid' | 'single-featured',
  show_ratings: boolean,
  show_images: boolean,
  background_style: 'white' | 'gray' | 'gradient'
}
```

### 10. Statistics / Metrics Block
**Use Cases:** About page, Brand Story, HomePage

**Fields:**
```typescript
{
  block_type: 'statistics',
  section_title?: string,
  metrics: Array<{
    value: string,
    label: string,
    description?: string,
    icon?: string
  }>,
  layout_style: 'horizontal' | 'grid',
  background_style: 'white' | 'dark' | 'gradient',
  animated: boolean
}
```

## Global Content Types (Reusable References)

### Campaign
```typescript
{
  uid: string,
  title: string,
  description: string,
  start_date: Date,
  end_date: Date,
  campaign_type: 'seasonal' | 'product_launch' | 'sale' | 'event',
  media: Image | Video,
  primary_cta: {
    text: string,
    url: string
  },
  secondary_cta?: {
    text: string,
    url: string
  },
  target_pages?: string[], // Where to show this campaign
  is_active: boolean
}
```

### Value Proposition
```typescript
{
  uid: string,
  icon: string, // Icon name from lucide-react
  title: string,
  description: string,
  detailed_content?: string, // Rich text for expanded view
  link_url?: string,
  link_text?: string
}
```

### Feature Item
```typescript
{
  uid: string,
  icon: string,
  title: string,
  description: string,
  highlight_color?: string
}
```

### Testimonial
```typescript
{
  uid: string,
  customer_name: string,
  customer_title?: string,
  customer_image?: Image,
  testimonial_text: string,
  rating?: number, // 1-5
  product?: Product, // Optional product reference
  date: Date,
  is_featured: boolean
}
```

### Collection (NEW)
```typescript
{
  uid: string,
  title: string,
  slug: {
    title: string,
    href: string
  },
  description: string,
  featured_image: Image,
  products: Product[], // References to products in this collection
  collection_type: 'seasonal' | 'curated' | 'new_arrivals' | 'best_sellers' | 'limited_edition',
  is_featured: boolean,
  meta_title?: string,
  meta_description?: string
}
```

## Page Content Types

### Modular Home Page
```typescript
{
  uid: string,
  title: string,
  page_sections: ModularBlock[], // Array of any block type
  meta_title?: string,
  meta_description?: string
}
```

### Collection Landing Page (NEW)
```typescript
{
  uid: string,
  collection: Collection, // Reference to Collection content type
  hero_section?: HeroSectionBlock,
  page_sections: ModularBlock[], // Additional sections
  meta_title?: string,
  meta_description?: string
}
```

### Lookbook Page (NEW)
```typescript
{
  uid: string,
  title: string,
  slug: {
    title: string,
    href: string
  },
  description: string,
  season?: string, // e.g., "Spring 2025"
  featured_image: Image,
  page_sections: ModularBlock[], // Typically Gallery + Text blocks
  products?: Product[], // Optional product references
  meta_title?: string,
  meta_description?: string
}
```

### Modular Category Page
```typescript
{
  uid: string,
  category_slug: 'wearable-tech' | 'technofurniture',
  hero_section?: HeroSectionBlock,
  page_sections?: ModularBlock[], // Optional additional sections
  products_display: {
    layout: 'grid' | 'list',
    items_per_row: 2 | 3 | 4,
    enable_filtering: boolean,
    enable_sorting: boolean
  },
  meta_title?: string,
  meta_description?: string
}
```

### Enhanced Product
```typescript
{
  // Existing fields...
  additional_sections?: ModularBlock[], // Optional modular sections (testimonials, related products, etc.)
}
```

## Priority Implementation Order

### Phase 1: Core Modular Blocks (PRIORITY)
1. ✅ Hero Section Block (all variants)
2. ✅ Featured Content Grid Block
3. ✅ Value Propositions Grid Block
4. ✅ Campaign CTA Block
5. ✅ Gallery Section Block

### Phase 2: Global Content Types
1. ✅ Collection content type
2. ✅ Campaign content type
3. ✅ Value Proposition content type
4. ✅ Feature Item content type
5. ⏸️ Testimonial content type (lower priority)

### Phase 3: Modular Page Types
1. ✅ Modular Home Page
2. ✅ Collection Landing Page
3. ✅ Lookbook Page
4. ✅ Modular Category Page

### Phase 4: Enhancements
1. Product Showcase Block
2. Text + Media Section Block
3. Statistics Block
4. Enhanced Product with modular sections

## Benefits of This Architecture

✅ **Flexibility:** Content editors can compose unique pages without code changes
✅ **Reusability:** Create components once, use everywhere
✅ **Consistency:** Shared components ensure brand coherence
✅ **Scalability:** Easy to add new block types
✅ **Personalization:** Each block supports Contentstack variants for A/B testing
✅ **Performance:** Server-side rendering with personalization support
✅ **Maintainability:** Update a component once, reflects everywhere

## Example HomePage Structure

```json
{
  "title": "Home Page",
  "page_sections": [
    {
      "block_type": "hero_section",
      "variant": "split_hero",
      "title": "Where Innovation Meets Luxury",
      "..."
    },
    {
      "block_type": "featured_content_grid",
      "variant": "product_grid",
      "section_title": "Featured Products",
      "..."
    },
    {
      "block_type": "campaign_cta",
      "variant": "split_cta",
      "campaign": "holiday_2025",
      "..."
    },
    {
      "block_type": "values_grid",
      "section_title": "The Demolux Difference",
      "..."
    },
    {
      "block_type": "collection_showcase",
      "section_title": "Shop by Collection",
      "..."
    },
    {
      "block_type": "featured_content_grid",
      "variant": "blog_grid",
      "section_title": "Latest Insights",
      "..."
    },
    {
      "block_type": "campaign_cta",
      "variant": "centered_cta",
      "title": "Ready to Experience the Future?",
      "..."
    }
  ]
}
```

## Implementation Notes

- All blocks support Contentstack variants for personalization
- TypeScript interfaces ensure type safety
- React components are reusable across all page types
- Server-side rendering with flicker-free personalization
- Modular blocks stored in Contentstack as JSON groups
- Content references use Contentstack's reference field type
