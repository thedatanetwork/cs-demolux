import Contentstack from 'contentstack';
import ContentstackLivePreview from '@contentstack/live-preview-utils';
import { addEditableTags as addTags } from '@contentstack/utils';

// Lazy initialization for Contentstack
// This is necessary because the module may be loaded during build when env vars aren't available
// but they ARE available at runtime (e.g., on Contentstack Launch)
let _Stack: any = null;

// Region-based preview host mapping (must be explicit for Visual Builder token validation)
const REGION_PREVIEW_HOST: Record<string, string> = {
  US: 'rest-preview.contentstack.com',
  EU: 'eu-rest-preview.contentstack.com',
  AZURE_NA: 'azure-na-rest-preview.contentstack.com',
  AZURE_EU: 'azure-eu-rest-preview.contentstack.com',
  GCP_NA: 'gcp-na-rest-preview.contentstack.com',
};

// Get fresh config on each call - don't cache, as env vars may become available at runtime
function getStackConfig() {
  const region = (process.env.CONTENTSTACK_REGION as keyof typeof Contentstack.Region) || 'US';
  return {
    api_key: process.env.CONTENTSTACK_API_KEY || '',
    delivery_token: process.env.CONTENTSTACK_DELIVERY_TOKEN || '',
    preview_token: process.env.CONTENTSTACK_PREVIEW_TOKEN || '',
    environment: process.env.CONTENTSTACK_ENVIRONMENT || 'dev',
    region,
    live_preview: process.env.CONTENTSTACK_LIVE_PREVIEW === 'true',
    app_host: process.env.CONTENTSTACK_APP_HOST || 'app.contentstack.com',
    preview_host: process.env.CONTENTSTACK_PREVIEW_HOST || REGION_PREVIEW_HOST[region] || REGION_PREVIEW_HOST.US,
  };
}

function initializeStack() {
  // If already initialized successfully, return cached Stack
  if (_Stack) return _Stack;

  const stackConfig = getStackConfig();
  const isServer = typeof window === 'undefined';

  // Only initialize if credentials are available
  if (stackConfig.api_key && stackConfig.delivery_token) {
    try {
      if (isServer) {
        console.log('Contentstack config:', {
          api_key: stackConfig.api_key ? `${stackConfig.api_key.substring(0, 10)}...` : 'missing',
          delivery_token: stackConfig.delivery_token ? `${stackConfig.delivery_token.substring(0, 10)}...` : 'missing',
          preview_token: stackConfig.preview_token ? `${stackConfig.preview_token.substring(0, 10)}...` : 'not set',
          environment: stackConfig.environment,
          region: stackConfig.region,
          live_preview: stackConfig.live_preview
        });
      }

      // Build live_preview config with explicit host (required for Visual Builder token validation)
      let livePreviewConfig: Record<string, any> | undefined;
      if (stackConfig.live_preview && stackConfig.preview_token) {
        livePreviewConfig = {
          preview_token: stackConfig.preview_token,
          enable: true,
          host: stackConfig.preview_host,
        };
      }

      // Initialize Stack with Live Preview support
      _Stack = Contentstack.Stack({
        api_key: stackConfig.api_key,
        delivery_token: stackConfig.delivery_token,
        environment: stackConfig.environment,
        region: Contentstack.Region[stackConfig.region as keyof typeof Contentstack.Region] || Contentstack.Region.US,
        live_preview: livePreviewConfig as any,
      });

      if (isServer) {
        console.log('Contentstack initialized successfully');
        if (stackConfig.live_preview && stackConfig.preview_token) {
          const resolvedHost = (_Stack as any)?.live_preview?.host;
          console.log('Live Preview enabled:', {
            preview_host_resolved: resolvedHost || 'default',
            preview_host_override: stackConfig.preview_host || 'none (auto-detect from region)',
            region: stackConfig.region,
            preview_token: stackConfig.preview_token ? `${stackConfig.preview_token.substring(0, 8)}...` : 'MISSING',
          });
        }
      }
    } catch (error) {
      console.error('Failed to initialize Contentstack:', error);
    }
  } else if (isServer) {
    console.warn('Contentstack not configured - credentials will be checked at runtime');
  }

  return _Stack;
}

// Lazy getter for Stack
function getStack() {
  return initializeStack();
}

// Export Live Preview utilities
export { ContentstackLivePreview };

// Export Stack getter for lazy initialization
export { getStack, getStack as Stack };

// Export stack config getter for live preview initialization
export function getStackConfigForPreview() {
  const config = getStackConfig();
  return {
    api_key: config.api_key,
    environment: config.environment,
    preview_token: config.preview_token,
    live_preview: config.live_preview,
    app_host: config.app_host,
    preview_host: config.preview_host,
  };
}

/**
 * Add editable tags to entry for Visual Builder field-level editing
 *
 * This function modifies the entry in-place to add a `$` object at each level
 * containing data-cslp attributes for field editing.
 *
 * @param entry - The entry object from Contentstack
 * @param contentTypeUid - The content type UID
 * @param locale - The locale (default: 'en-us')
 * @returns The entry with editable tags added
 */
export function addEditableTags<T>(
  entry: T,
  contentTypeUid: string,
  locale: string = 'en-us'
): T {
  if (!entry || !getStackConfig().live_preview) {
    return entry;
  }

  try {
    // Use Contentstack Utils to add editable tags
    // tagsAsObject: true for React (returns { 'data-cslp': '...' } instead of string)
    addTags(entry as any, contentTypeUid, true, locale);
  } catch (error) {
    console.warn('Failed to add editable tags:', error);
  }

  return entry;
}

// Type definitions for our content models
// Contentstack Link/URL field type
export interface ContentstackUrl {
  title: string;
  href: string;
}

/**
 * Helper to extract href from Contentstack URL/link field
 * Handles both string format (legacy) and object format { title, href }
 */
export function getUrlHref(url: string | ContentstackUrl | undefined): string {
  if (!url) return '';
  if (typeof url === 'string') return url;
  return url.href || '';
}

export interface Product {
  uid: string;
  title: string;
  url: string | ContentstackUrl;  // Link field: { title, href } (e.g., /products/product-name)
  description: string;
  detailed_description?: string; // New field for product detail pages
  featured_image: Array<{
    uid: string;
    url: string;
    title: string;
    filename: string;
  }> | {
    uid: string;
    url: string;
    title: string;
    filename: string;
  };
  additional_images?: Array<{
    uid: string;
    url: string;
    title: string;
    filename: string;
  }>; // New field for additional product images
  price: number;
  call_to_action?: {
    title: string;
    url: string;
  };
  category?: string;
  product_tags?: string[]; // New field for product tags
  content_blocks?: any[]; // Modular blocks for rich product pages
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  uid: string;
  title: string;
  url: string | ContentstackUrl;  // Link field: { title, href } (e.g., /blog/post-title)
  content: any; // JSON RTE document object or HTML string (after jsonToHTML conversion)
  featured_image?: Array<{
    uid: string;
    url: string;
    title: string;
    filename: string;
  }> | {
    uid: string;
    url: string;
    title: string;
    filename: string;
  };
  excerpt?: string;
  author?: string;
  publish_date: string;
  post_tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface Page {
  uid: string;
  title: string;
  slug: {
    title: string;
    href: string;
  };
  meta_description?: string;
  hero_section?: {
    title: string;
    subtitle?: string;
    background_image?: Image;
  };
  content_sections?: Array<{
    section_title?: string;
    content: string;
    layout?: string;
  }>;
  contact_form?: {
    show_form: boolean;
    form_title?: string;
    form_description?: string;
  };
}

export interface NavigationItem {
  label: string;
  url: string;
  icon_name?: string;
  description?: string;
  opens_new_tab?: boolean;
  sort_order?: number;
  is_active?: boolean;
}

export interface NavigationMenu {
  uid: string;
  menu_name: string;
  menu_id: string;
  menu_location: 'header' | 'footer' | 'sidebar' | 'mobile';
  menu_items: NavigationItem[];
  menu_style?: 'horizontal' | 'vertical' | 'dropdown' | 'pills' | 'breadcrumb' | 'minimal';
  is_active?: boolean;
}

export interface Image {
  uid: string;
  url: string;
  title: string;
  filename: string;
}

export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

export interface ValueProposition {
  icon: string;
  title: string;
  description: string;
  background_image?: Image | Image[];
}

export interface CallToAction {
  title: string;
  description: string;
  primary_button: {
    text: string;
    url: string;
  };
  secondary_button: {
    text: string;
    url: string;
  };
  background_color: string;
}

export interface HomePage {
  uid: string;
  title: string;
  // Hero Section
  hero_badge_text: string;
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;
  hero_image: Image[];
  hero_primary_cta: {
    text: string;
    url: string;
  };
  hero_secondary_cta: {
    text: string;
    url: string;
  };
  hero_features: FeatureItem[];
  
  // Featured Products Section
  featured_section_title: string;
  featured_section_description: string;
  featured_products_limit: number;
  
  // Brand Values Section
  values_section_title: string;
  values_section_description: string;
  value_propositions: ValueProposition[];
  
  // Blog Section
  blog_section_title: string;
  blog_section_description: string;
  blog_posts_limit: number;
  blog_cta_text: string;
  
  // Final CTA Section
  final_cta: CallToAction;
  
  // SEO
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  uid: string;
  site_name: string;
  tagline: string;
  logo?: {
    uid: string;
    url: string;
    title: string;
  };
  contact_info?: {
    email: string;
    phone?: string;
    address?: string;
  };
  social_links?: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
  seo?: {
    meta_title: string;
    meta_description: string;
    meta_keywords?: string;
  };
}

// ============================================================================
// MODULAR BLOCKS & GLOBAL CONTENT TYPES
// ============================================================================

// Common Button/CTA Type
export interface CTAButton {
  text: string;
  url: string;
  style?: 'primary' | 'gold' | 'outline' | 'ghost';
}

// Media Types
export interface Video {
  uid: string;
  url: string;
  title: string;
  filename: string;
}

// ============================================================================
// GLOBAL CONTENT TYPES (Reusable References)
// ============================================================================

export interface Campaign {
  uid: string;
  title: string;
  description: string;
  start_date?: string;
  end_date?: string;
  campaign_type: 'seasonal' | 'product_launch' | 'sale' | 'event';
  media?: Image | Video;
  primary_cta: CTAButton;
  secondary_cta?: CTAButton;
  target_pages?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ValuePropositionContent {
  uid: string;
  icon: string;
  title: string;
  description: string;
  detailed_content?: string;
  background_image?: Image | Image[];
  link_url?: string;
  link_text?: string;
  created_at: string;
  updated_at: string;
}

export interface FeatureItemContent {
  uid: string;
  icon: string;
  title: string;
  description: string;
  highlight_color?: string;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  uid: string;
  customer_name: string;
  customer_title?: string;
  customer_image?: Image;
  testimonial_text: string;
  rating?: number;
  product?: Product;
  date: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  uid: string;
  title: string;
  slug: {
    title: string;
    href: string;
  };
  description: string;
  featured_image: Image | Image[];
  products?: Product[];
  collection_type: 'seasonal' | 'curated' | 'new_arrivals' | 'best_sellers' | 'limited_edition';
  is_featured: boolean;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// MODULAR BLOCK TYPES
// ============================================================================

export interface HeroSectionBlock {
  block_type: 'hero_section';
  variant: 'image_hero' | 'video_hero' | 'split_hero' | 'minimal_hero' | 'campaign_hero';
  badge_text?: string;
  badge_icon?: string;
  title: string;
  subtitle?: string;
  description: string;
  background_media?: Image | Video | (Image | Video)[];
  hero_image?: Image | Image[];
  overlay_style?: 'dark' | 'light' | 'gradient' | 'none';
  primary_cta?: CTAButton;
  secondary_cta?: CTAButton;
  feature_items?: (FeatureItem | FeatureItemContent)[];
  text_alignment?: 'left' | 'center' | 'right';
  height?: 'full' | 'large' | 'medium' | 'small';
}

export interface FeaturedContentGridBlock {
  block_type: 'featured_content_grid';
  variant: 'product_grid' | 'blog_grid' | 'mixed_grid' | 'collection_grid';
  section_title: string;
  section_description?: string;
  badge_text?: string;
  content_source: 'manual' | 'dynamic' | 'mixed';
  manual_items?: (Product | BlogPost | Collection)[];
  dynamic_query?: {
    content_type: 'product' | 'blog_post' | 'collection';
    filter_by?: {
      category?: string;
      tags?: string[];
      featured?: boolean;
    };
    sort_by: 'date' | 'title' | 'popularity';
    limit: number;
  };
  layout_style: 'grid-2' | 'grid-3' | 'grid-4' | 'masonry' | 'carousel';
  items_per_row?: 2 | 3 | 4;
  show_cta: boolean;
  cta_text?: string;
  cta_url?: string;
  background_style: 'white' | 'gray' | 'gradient';
}

export interface ValuesGridBlock {
  block_type: 'values_grid';
  section_title: string;
  section_description?: string;
  badge_text?: string;
  values: (ValueProposition | ValuePropositionContent)[];
  layout_style: 'grid-2' | 'grid-3' | 'grid-4' | 'horizontal-scroll';
  card_style: 'elevated' | 'flat' | 'bordered' | 'minimal';
  icon_style?: 'filled' | 'outlined' | 'gradient';
  background_style: 'white' | 'gray' | 'gradient';
}

export interface CampaignCTABlock {
  block_type: 'campaign_cta';
  variant: 'full_width_cta' | 'split_cta' | 'centered_cta' | 'announcement_banner';
  campaign?: Campaign;
  title: string;
  description?: string;
  badge_text?: string;
  background_media?: Image | Video | (Image | Video)[];
  background_style: 'gradient-dark' | 'gradient-gold' | 'image' | 'video' | 'solid';
  primary_cta?: CTAButton;
  secondary_cta?: CTAButton;
  text_color: 'light' | 'dark';
  height?: 'full' | 'large' | 'medium' | 'small';
}

export interface TextMediaSectionBlock {
  block_type: 'text_media_section';
  variant: 'text_left_media_right' | 'text_right_media_left' | 'text_centered_media_below' | 'text_overlay_media';
  title?: string;
  badge_text?: string;
  content: string;
  media?: Image | Video | (Image | Video)[];
  media_aspect_ratio?: 'square' | 'landscape' | 'portrait' | 'wide';
  cta?: CTAButton;
  background_style: 'white' | 'gray' | 'transparent';
  content_width?: 'narrow' | 'medium' | 'wide' | 'full';
  vertical_alignment?: 'top' | 'center' | 'bottom';
}

export interface ProductShowcaseBlock {
  block_type: 'product_showcase';
  product: Product;
  layout_style: 'hero' | 'split' | 'card' | 'minimal';
  show_product_details: boolean;
  custom_title?: string;
  custom_description?: string;
  show_price: boolean;
  show_cta: boolean;
  cta_text?: string;
  background_style: 'white' | 'gray' | 'gradient' | 'image';
}

export interface GallerySectionBlock {
  block_type: 'gallery_section';
  variant: 'grid_gallery' | 'masonry_gallery' | 'carousel_gallery' | 'fullscreen_gallery';
  section_title?: string;
  section_description?: string;
  images: Image[];
  columns?: 2 | 3 | 4 | 5;
  spacing?: 'tight' | 'normal' | 'loose';
  enable_lightbox: boolean;
  enable_captions: boolean;
  background_style: 'white' | 'black' | 'gray';
}

export interface CollectionShowcaseBlock {
  block_type: 'collection_showcase';
  section_title: string;
  section_description?: string;
  badge_text?: string;
  collections: Collection[];
  layout_style: 'grid' | 'carousel' | 'featured-large';
  show_product_count: boolean;
  card_style: 'elevated' | 'flat' | 'overlay';
  background_style: 'white' | 'gray' | 'gradient';
}

export interface TestimonialsBlock {
  block_type: 'testimonials';
  section_title?: string;
  section_description?: string;
  badge_text?: string;
  testimonials: Testimonial[];
  layout_style: 'carousel' | 'grid' | 'single-featured';
  show_ratings: boolean;
  show_images: boolean;
  background_style: 'white' | 'gray' | 'gradient';
}

export interface StatisticsBlock {
  block_type: 'statistics';
  section_title?: string;
  section_description?: string;
  badge_text?: string;
  metrics: Array<{
    value: string;
    label: string;
    description?: string;
    icon?: string;
  }>;
  layout_style: 'horizontal' | 'grid-3' | 'grid-4';
  background_style: 'white' | 'dark' | 'gradient' | 'gradient-gold';
  animated: boolean;
}

export interface ProcessStepsBlock {
  block_type: 'process_steps';
  section_title: string;
  section_description?: string;
  badge_text?: string;
  steps: Array<{
    step_number?: number;
    title: string;
    description: string;
    icon?: string;
    image?: Image;
    cta?: CTAButton;
  }>;
  layout_style: 'horizontal' | 'vertical' | 'alternating';
  show_step_numbers: boolean;
  show_connector_lines: boolean;
  background_style: 'white' | 'gray' | 'gradient';
}

export interface FAQBlock {
  block_type: 'faq';
  section_title: string;
  section_description?: string;
  badge_text?: string;
  faqs: Array<{
    question: string;
    answer: string;
    category?: string;
  }>;
  layout_style: 'accordion' | 'two-column' | 'cards';
  show_categories: boolean;
  expand_first: boolean;
  background_style: 'white' | 'gray' | 'gradient';
}

// Union type of all modular blocks
export type ModularBlock =
  | HeroSectionBlock
  | FeaturedContentGridBlock
  | ValuesGridBlock
  | CampaignCTABlock
  | TextMediaSectionBlock
  | ProductShowcaseBlock
  | GallerySectionBlock
  | CollectionShowcaseBlock
  | TestimonialsBlock
  | StatisticsBlock
  | ProcessStepsBlock
  | FAQBlock;

// ============================================================================
// MODULAR PAGE TYPES
// ============================================================================

/**
 * Embedded modular block wrapper
 * When using true Contentstack modular blocks, each block is wrapped with its type as key:
 * { hero_section: { variant: '...', ... } }
 */
export interface EmbeddedBlock {
  [blockType: string]: ModularBlock & {
    _metadata?: { uid: string };
    $?: Record<string, any>;  // Editable tags for Visual Builder
  };
}

export interface ModularHomePage {
  uid: string;
  title: string;
  url: string | ContentstackUrl;  // URL field (link type) for page routing — required by Visual Builder
  // Supports both reference-based blocks and true embedded modular blocks
  page_sections: (ModularBlock | EmbeddedBlock)[];
  seo?: {
    meta_title?: string;
    meta_description?: string;
    og_image?: Image;
  };
  // Legacy fields (kept for backwards compatibility)
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
  // Editable tags for Visual Builder
  $?: Record<string, any>;
}

export interface BlogPage {
  uid: string;
  title: string;
  url?: string | ContentstackUrl;  // URL field (link type) for page routing
  page_sections: ModularBlock[];
  seo?: {
    meta_title?: string;
    meta_description?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CollectionLandingPage {
  uid: string;
  collection: Collection;
  hero_section?: HeroSectionBlock;
  page_sections?: ModularBlock[];
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

export interface LookbookPage {
  uid: string;
  title: string;
  slug: {
    title: string;
    href: string;
  };
  description: string;
  season?: string;
  featured_image: Image | Image[];
  page_sections: ModularBlock[];
  products?: Product[];
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

export interface ModularCategoryPage {
  uid: string;
  title: string;
  category_slug: 'wearable-tech' | 'technofurniture';
  // Hero content fields (replaces hardcoded categoryMetadata)
  hero_title: string;
  hero_description: string;
  hero_badge_text?: string;
  // Optional hero section block (for advanced customization)
  hero_section?: HeroSectionBlock;
  // Modular blocks to render AFTER products section
  page_sections?: (ModularBlock | EmbeddedBlock)[];
  // Products display configuration
  products_display?: {
    layout: 'grid' | 'list';
    items_per_row: 2 | 3 | 4;
    enable_filtering: boolean;
    enable_sorting: boolean;
  };
  // SEO
  meta_title?: string;
  meta_description?: string;
  // Timestamps
  created_at: string;
  updated_at: string;
  // Visual Builder support
  $?: Record<string, any>;
}

// Contentstack service class
export class ContentstackService {
  private stack: any;

  constructor() {
    this.stack = getStack();
  }

  private isConfigured(): boolean {
    return !!this.stack;
  }


  // Generic method to fetch content
  async getEntries<T>(contentType: string, query?: any, variantAliases?: string[]): Promise<T[]> {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      const Query = this.stack.ContentType(contentType).Query();
      
      // Add variant aliases if provided for personalized content
      // Using the .variants() method as per Contentstack documentation
      if (variantAliases && variantAliases.length > 0) {
        console.log('🎯 Adding variant aliases to Contentstack query:', {
          contentType,
          variantAliases,
          variantParam: variantAliases.join(',')
        });
        Query.variants(variantAliases.join(','));
      }
      
      // Include all fields for product and blog content types
      if (contentType === 'product') {
        Query.includeReference(['featured_image', 'additional_images']);
        Query.includeMetadata();
      } else if (contentType === 'blog_post') {
        Query.includeReference(['featured_image']);
        Query.includeMetadata();
      }
      
      // Apply any additional query parameters
      if (query) {
        Object.keys(query).forEach(key => {
          if (key === 'where' && query[key]) {
            // Handle where clause specially for filtering
            Object.keys(query[key]).forEach(fieldName => {
              Query.where(fieldName, query[key][fieldName]);
            });
          } else if (typeof Query[key] === 'function') {
            Query[key](query[key]);
          }
        });
      }

      const result = await Query.toJSON().find();
      console.log(`Contentstack ${contentType} query result:`, {
        count: result[0]?.length || 0,
        data: result[0]?.length > 0 ? {
          uid: result[0][0]?.uid,
          title: result[0][0]?.title,
          fields: Object.keys(result[0][0] || {})
        } : 'No entries found'
      });
      return result[0] || [];
    } catch (error) {
      console.error(`Error fetching ${contentType}:`, error);
      return [];
    }
  }

  // Get single entry
  async getEntry<T>(contentType: string, uid: string, variantAliases?: string[]): Promise<T | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const Query = this.stack.ContentType(contentType).Query();
      Query.where('uid', uid);
      
      // Add variant aliases if provided for personalized content
      // Using the .variants() method as per Contentstack documentation
      if (variantAliases && variantAliases.length > 0) {
        Query.variants(variantAliases.join(','));
      }
      
      // Include all fields for product and blog content types
      if (contentType === 'product') {
        Query.includeReference(['featured_image', 'additional_images']);
        Query.includeMetadata();
      } else if (contentType === 'blog_post') {
        Query.includeReference(['featured_image']);
        Query.includeMetadata();
      }
      
      const result = await Query.toJSON().find();
      const entry = result[0]?.[0];
      console.log(`Contentstack ${contentType} single entry result:`, {
        found: !!entry,
        uid: uid,
        fields: entry ? Object.keys(entry) : [],
        hasDetailedDescription: !!(entry?.detailed_description),
        hasProductTags: !!(entry?.product_tags)
      });
      return entry || null;
    } catch (error) {
      console.error(`Error fetching ${contentType} entry ${uid}:`, error);
      return null;
    }
  }

  // Specific methods for our content types
  async getProducts(category?: string, variantAliases?: string[]): Promise<Product[]> {
    const query: any = { orderByDescending: 'created_at' };
    
    if (category) {
      query.where = { category: category };
      console.log(`Filtering products by category: ${category}`, query);
    } else {
      console.log('Fetching all products (no category filter)');
    }

    const products = await this.getEntries<Product>('product', query, variantAliases);
    console.log(`Found ${products.length} products for category: ${category || 'all'}`);
    
    if (products.length > 0) {
      console.log('Product categories found:', products.map(p => ({ uid: p.uid, title: p.title, category: p.category })));
    } else {
      console.log(`No products found for category: ${category || 'all'}`);
    }
    
    return products;
  }

  async getProduct(uid: string, variantAliases?: string[]): Promise<Product | null> {
    return this.getEntry<Product>('product', uid, variantAliases);
  }

  async getProductBySlug(slug: string, variantAliases?: string[]): Promise<Product | null> {
    console.log('🔍 ContentstackService.getProductBySlug called:', {
      slug,
      variantAliases,
      hasVariants: !!(variantAliases && variantAliases.length > 0)
    });

    const products = await this.getEntries<Product>('product', {
      where: { 'url.href': `/products/${slug}` }
    }, variantAliases);
    
    console.log('📦 ContentstackService.getProductBySlug result:', {
      found: products.length,
      firstProduct: products[0] ? {
        uid: products[0].uid,
        title: products[0].title,
        price: products[0].price
      } : null
    });
    
    return products[0] || null;
  }

  async getBlogPosts(limit?: number, variantAliases?: string[]): Promise<BlogPost[]> {
    const query: any = { orderByDescending: 'publish_date' };
    
    if (limit) {
      query.limit = limit;
    }

    return this.getEntries<BlogPost>('blog_post', query, variantAliases);
  }

  // Debug method to list all products
  async getAllProductUIDs(): Promise<any[]> {
    try {
      const query: any = { orderByDescending: 'created_at' };
      const products = await this.getEntries<any>('product', query);
      console.log('All product UIDs in Contentstack:', products.map(p => ({ uid: p.uid, title: p.title })));
      return products;
    } catch (error) {
      console.error('Error fetching all products:', error);
      return [];
    }
  }

  async getBlogPost(uid: string, variantAliases?: string[]): Promise<BlogPost | null> {
    return this.getEntry<BlogPost>('blog_post', uid, variantAliases);
  }

  async getBlogPostBySlug(slug: string, variantAliases?: string[]): Promise<BlogPost | null> {
    const posts = await this.getEntries<BlogPost>('blog_post', {
      where: { 'url.href': `/blog/${slug}` }
    }, variantAliases);
    return posts[0] || null;
  }

  async getPage(slug: string): Promise<Page | null> {
    // Ensure slug starts with / for consistency with stored values
    const normalizedSlug = slug.startsWith('/') ? slug : `/${slug}`;
    const pages = await this.getEntries<Page>('page', {
      where: { 'slug.href': normalizedSlug }
    });
    return pages[0] || null;
  }

  async getNavigationMenus(location?: string): Promise<NavigationMenu[]> {
    const query: any = { 
      where: { is_active: true },
      orderByAscending: 'menu_name'
    };
    
    if (location) {
      query.where.menu_location = location;
    }

    return this.getEntries<NavigationMenu>('navigation_menu', query);
  }

  async getSiteSettings(): Promise<SiteSettings | null> {
    const entries = await this.getEntries<SiteSettings>('site_settings', { limit: 1 });
    return entries[0] || null;
  }

  async getHomePage(): Promise<HomePage | null> {
    if (!this.isConfigured()) {
      console.log('Contentstack not configured, returning null for home page');
      return null;
    }

    try {
      console.log('Fetching home page from Contentstack...');
      const Query = this.stack.ContentType('home_page').Query();
      Query.includeReference(['hero_image']);
      Query.includeMetadata();
      Query.limit(1);
      
      const result = await Query.toJSON().find();
      const entry = result[0]?.[0];
      console.log('Contentstack home_page query result:', {
        found: !!entry,
        uid: entry?.uid,
        fields: entry ? Object.keys(entry) : [],
        hasHeroImage: !!(entry?.hero_image),
        heroImageCount: entry?.hero_image?.length || 0,
        heroImageUrl: entry?.hero_image?.[0]?.url,
        heroImageData: entry?.hero_image?.[0]
      });
      return entry || null;
    } catch (error) {
      console.error('Error fetching home_page:', error);
      return null;
    }
  }

  // ============================================================================
  // MODULAR CONTENT TYPE METHODS
  // ============================================================================

  async getModularHomePage(variantAliases?: string[]): Promise<ModularHomePage | null> {
    if (!this.isConfigured()) {
      console.log('Contentstack not configured, returning null for modular home page');
      return null;
    }

    try {
      console.log('Fetching modular home page from Contentstack...');
      const Query = this.stack.ContentType('modular_home_page').Query();
      // Include page_sections and all nested references within blocks
      Query.includeReference([
        'page_sections',
        'page_sections.values',                    // For values_grid_block
        'page_sections.values.background_image',   // For value background images
        'page_sections.campaign_reference',        // For campaign_cta_block
        'page_sections.manual_products',           // For featured_content_grid_block
        'page_sections.manual_blog_posts',         // For featured_content_grid_block
        'page_sections.manual_collections',        // For featured_content_grid_block
        'page_sections.background_media'           // For hero_section_block
      ]);
      Query.includeEmbeddedItems();  // Fetch all fields from referenced entries
      Query.includeMetadata();
      Query.limit(1);

      if (variantAliases && variantAliases.length > 0) {
        Query.variants(variantAliases.join(','));
      }

      const result = await Query.toJSON().find();
      const entry = result[0]?.[0];

      if (entry) {
        console.log('Contentstack modular_home_page query result:', {
          found: true,
          uid: entry.uid,
          sectionsCount: entry.page_sections?.length || 0,
          sections: entry.page_sections?.map((s: any) => ({
            uid: s.uid,
            type: s._content_type_uid,
            hasValues: !!s.values,
            valuesCount: s.values?.length || 0,
            firstValueHasBg: !!s.values?.[0]?.background_image
          }))
        });
      } else {
        console.log('Contentstack modular_home_page query result: not found');
      }

      return entry || null;
    } catch (error) {
      console.error('Error fetching modular_home_page:', error);
      return null;
    }
  }

  async getBlogPage(variantAliases?: string[]): Promise<BlogPage | null> {
    if (!this.isConfigured()) {
      console.log('Contentstack not configured, returning null for blog page');
      return null;
    }

    try {
      console.log('Fetching blog page from Contentstack...');
      const Query = this.stack.ContentType('blog_page').Query();
      // Include page_sections and all nested references within blocks
      Query.includeReference([
        'page_sections',
        'page_sections.values',           // For values_grid_block
        'page_sections.campaign_reference', // For campaign_cta_block
        'page_sections.manual_products',    // For featured_content_grid_block
        'page_sections.manual_blog_posts',  // For featured_content_grid_block
        'page_sections.manual_collections', // For featured_content_grid_block
        'page_sections.background_media'    // For hero_section_block
      ]);
      Query.includeMetadata();
      Query.limit(1);

      if (variantAliases && variantAliases.length > 0) {
        Query.variants(variantAliases.join(','));
      }

      const result = await Query.toJSON().find();
      const entry = result[0]?.[0];
      console.log('Contentstack blog_page query result:', {
        found: !!entry,
        uid: entry?.uid,
        sectionsCount: entry?.page_sections?.length || 0
      });
      return entry || null;
    } catch (error) {
      console.error('Error fetching blog_page:', error);
      return null;
    }
  }

  async getCampaigns(isActive?: boolean, variantAliases?: string[]): Promise<Campaign[]> {
    const query: any = { orderByDescending: 'created_at' };

    if (isActive !== undefined) {
      query.where = { is_active: isActive };
    }

    return this.getEntries<Campaign>('campaign', query, variantAliases);
  }

  async getCampaign(uid: string, variantAliases?: string[]): Promise<Campaign | null> {
    return this.getEntry<Campaign>('campaign', uid, variantAliases);
  }

  async getCollections(featured?: boolean, variantAliases?: string[]): Promise<Collection[]> {
    const query: any = { orderByDescending: 'created_at' };

    if (featured !== undefined) {
      query.where = { is_featured: featured };
    }

    return this.getEntries<Collection>('collection', query, variantAliases);
  }

  async getCollection(uid: string, variantAliases?: string[]): Promise<Collection | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const Query = this.stack.ContentType('collection').Query();
      Query.where('uid', uid);
      Query.includeReference(['featured_image', 'products']);
      Query.includeMetadata();

      if (variantAliases && variantAliases.length > 0) {
        Query.variants(variantAliases.join(','));
      }

      const result = await Query.toJSON().find();
      return result[0]?.[0] || null;
    } catch (error) {
      console.error(`Error fetching collection ${uid}:`, error);
      return null;
    }
  }

  async getCollectionBySlug(slug: string, variantAliases?: string[]): Promise<Collection | null> {
    const collections = await this.getEntries<Collection>('collection', {
      where: { 'slug.href': `/collections/${slug}` }
    }, variantAliases);
    return collections[0] || null;
  }

  async getCollectionLandingPage(collectionUid: string, variantAliases?: string[]): Promise<CollectionLandingPage | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const Query = this.stack.ContentType('collection_landing_page').Query();
      Query.where('collection.uid', collectionUid);
      Query.includeReference(['collection', 'hero_section', 'page_sections']);
      Query.includeMetadata();

      if (variantAliases && variantAliases.length > 0) {
        Query.variants(variantAliases.join(','));
      }

      const result = await Query.toJSON().find();
      return result[0]?.[0] || null;
    } catch (error) {
      console.error(`Error fetching collection landing page for ${collectionUid}:`, error);
      return null;
    }
  }

  async getLookbooks(variantAliases?: string[]): Promise<LookbookPage[]> {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      const Query = this.stack.ContentType('lookbook_page').Query();
      Query.orderByDescending('created_at');
      Query.includeReference(['featured_image', 'page_sections', 'products']);
      Query.includeMetadata();

      if (variantAliases && variantAliases.length > 0) {
        Query.variants(variantAliases.join(','));
      }

      const result = await Query.toJSON().find();
      return result[0] || [];
    } catch (error) {
      console.error('Error fetching lookbooks:', error);
      return [];
    }
  }

  async getLookbookBySlug(slug: string, variantAliases?: string[]): Promise<LookbookPage | null> {
    const lookbooks = await this.getEntries<LookbookPage>('lookbook_page', {
      where: { 'slug.href': `/lookbook/${slug}` }
    }, variantAliases);
    return lookbooks[0] || null;
  }

  async getModularCategoryPage(categorySlug: string, variantAliases?: string[]): Promise<ModularCategoryPage | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const Query = this.stack.ContentType('modular_category_page').Query();
      Query.where('category_slug', categorySlug);
      Query.includeReference(['hero_section', 'page_sections']);
      Query.includeMetadata();

      if (variantAliases && variantAliases.length > 0) {
        Query.variants(variantAliases.join(','));
      }

      const result = await Query.toJSON().find();
      return result[0]?.[0] || null;
    } catch (error) {
      console.error(`Error fetching modular category page for ${categorySlug}:`, error);
      return null;
    }
  }

  async getValuePropositions(variantAliases?: string[]): Promise<ValuePropositionContent[]> {
    const query: any = { orderByAscending: 'title' };
    return this.getEntries<ValuePropositionContent>('value_proposition', query, variantAliases);
  }

  async getFeatureItems(variantAliases?: string[]): Promise<FeatureItemContent[]> {
    const query: any = { orderByAscending: 'title' };
    return this.getEntries<FeatureItemContent>('feature_item', query, variantAliases);
  }

  async getTestimonials(featured?: boolean, variantAliases?: string[]): Promise<Testimonial[]> {
    const query: any = { orderByDescending: 'date' };

    if (featured !== undefined) {
      query.where = { is_featured: featured };
    }

    return this.getEntries<Testimonial>('testimonial', query, variantAliases);
  }
}

// Export singleton instance
export const contentstack = new ContentstackService();
