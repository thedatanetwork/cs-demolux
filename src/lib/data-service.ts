// Data service that provides access to Contentstack CMS
import {
  contentstack,
  addEditableTags,
  Product,
  BlogPost,
  NavigationMenu,
  SiteSettings,
  Page,
  HomePage,
  ModularHomePage,
  BlogPage,
  Collection,
  CollectionLandingPage,
  LookbookPage,
  ModularCategoryPage,
  Campaign,
  ValuePropositionContent,
  FeatureItemContent,
  Testimonial,
  DynamicProductFeedEntry,
  DynamicFeedsPageEntry,
  DynamicFeedsDropdownPageEntry,
  ProductTileBannerPageEntry,
  HeroSevenPageEntry,
} from './contentstack';

// Fallback site settings for when Contentstack is not available
export const createFallbackSiteSettings = (): SiteSettings => ({
  uid: 'fallback',
  site_name: 'Demolux',
  tagline: 'Premium Wearable Tech & Technofurniture',
  logo: undefined,
  contact_info: undefined,
  social_links: undefined,
  seo: undefined
});

export class DataService {
  private _useContentstack: boolean | null = null;

  // Check Contentstack configuration on each access
  // Don't cache failure state - env vars may become available at runtime (Contentstack Launch)
  private get useContentstack(): boolean {
    // Only cache if we found credentials - don't cache 'false' as env vars may appear later
    if (this._useContentstack === true) {
      return true;
    }

    const hasCredentials = !!(
      process.env.CONTENTSTACK_API_KEY &&
      process.env.CONTENTSTACK_DELIVERY_TOKEN
    );

    if (hasCredentials) {
      this._useContentstack = true;
      const isServer = typeof window === 'undefined';
      if (isServer && process.env.NODE_ENV === 'development') {
        console.log('DataService: Contentstack enabled');
      }
    }

    return hasCredentials;
  }

  constructor() {
    // No initialization here - env vars checked lazily via getter
  }

  // Products
  async getProducts(category?: string, variantAliases?: string[]): Promise<Product[]> {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    const products = await contentstack.getProducts(category, variantAliases);
    // Add editable tags for Visual Builder
    products.forEach(product => addEditableTags(product, 'product'));
    return products;
  }

  async getProduct(uid: string, variantAliases?: string[]): Promise<Product | null> {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    const entry = await contentstack.getProduct(uid, variantAliases);
    if (entry) {
      addEditableTags(entry, 'product');
    }
    return entry;
  }

  async getProductBySlug(slug: string, variantAliases?: string[]): Promise<Product | null> {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    const entry = await contentstack.getProductBySlug(slug, variantAliases);
    if (entry) {
      addEditableTags(entry, 'product');
    }
    return entry;
  }

  // Blog posts
  async getBlogPosts(limit?: number, variantAliases?: string[]): Promise<BlogPost[]> {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    const posts = await contentstack.getBlogPosts(limit, variantAliases);
    posts.forEach(post => addEditableTags(post, 'blog_post'));
    return posts;
  }

  async getBlogPost(uid: string, variantAliases?: string[]): Promise<BlogPost | null> {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    const entry = await contentstack.getBlogPost(uid, variantAliases);
    if (entry) {
      addEditableTags(entry, 'blog_post');
    }
    return entry;
  }

  async getBlogPostBySlug(slug: string, variantAliases?: string[]): Promise<BlogPost | null> {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    const entry = await contentstack.getBlogPostBySlug(slug, variantAliases);
    if (entry) {
      addEditableTags(entry, 'blog_post');
    }
    return entry;
  }

  async getPage(slug: string): Promise<Page | null> {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    const entry = await contentstack.getPage(slug);
    if (entry) {
      addEditableTags(entry, 'page');
    }
    return entry;
  }

  // Navigation menus
  async getNavigationMenus(location?: string): Promise<NavigationMenu[]> {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    return await contentstack.getNavigationMenus(location);
  }

  // Site settings
  async getSiteSettings(): Promise<SiteSettings | null> {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    return await contentstack.getSiteSettings();
  }

  // Get site settings with guaranteed fallback
  async getSiteSettingsWithFallback(): Promise<SiteSettings> {
    const settings = await this.getSiteSettings();
    return settings || createFallbackSiteSettings();
  }

  // Helper methods for common queries
  async getWearableTech(variantAliases?: string[]): Promise<Product[]> {
    return this.getProducts('wearable-tech', variantAliases);
  }

  async getTechnofurniture(variantAliases?: string[]): Promise<Product[]> {
    return this.getProducts('technofurniture', variantAliases);
  }

  async getFeaturedProducts(limit: number = 4, variantAliases?: string[]): Promise<Product[]> {
    const products = await this.getProducts(undefined, variantAliases);
    return products.slice(0, limit);
  }

  async getRecentBlogPosts(limit: number = 3, variantAliases?: string[]): Promise<BlogPost[]> {
    return this.getBlogPosts(limit, variantAliases);
  }

  async getHeaderNavigation(): Promise<NavigationMenu[]> {
    return this.getNavigationMenus('header');
  }

  async getFooterNavigation(): Promise<NavigationMenu[]> {
    return this.getNavigationMenus('footer');
  }

  // Home Page
  async getHomePage(): Promise<HomePage | null> {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    const entry = await contentstack.getHomePage();
    if (entry) {
      addEditableTags(entry, 'home_page');
    }
    return entry;
  }

  // ============================================================================
  // MODULAR CONTENT TYPE METHODS
  // ============================================================================

  // Modular Home Page
  async getModularHomePage(variantAliases?: string[]): Promise<ModularHomePage | null> {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    const entry = await contentstack.getModularHomePage(variantAliases);
    if (entry) {
      addEditableTags(entry, 'modular_home_page');
    }
    return entry;
  }

  // Blog Page
  async getBlogPage(variantAliases?: string[]): Promise<BlogPage | null> {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    const entry = await contentstack.getBlogPage(variantAliases);
    if (entry) {
      addEditableTags(entry, 'blog_page');
    }
    return entry;
  }

  // Collections
  async getCollections(featured?: boolean, variantAliases?: string[]): Promise<Collection[]> {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    const collections = await contentstack.getCollections(featured, variantAliases);
    collections.forEach(c => addEditableTags(c, 'collection'));
    return collections;
  }

  async getCollection(uid: string, variantAliases?: string[]): Promise<Collection | null> {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    const entry = await contentstack.getCollection(uid, variantAliases);
    if (entry) {
      addEditableTags(entry, 'collection');
    }
    return entry;
  }

  async getCollectionBySlug(slug: string, variantAliases?: string[]): Promise<Collection | null> {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    const entry = await contentstack.getCollectionBySlug(slug, variantAliases);
    if (entry) {
      addEditableTags(entry, 'collection');
    }
    return entry;
  }

  async getFeaturedCollections(variantAliases?: string[]): Promise<Collection[]> {
    return this.getCollections(true, variantAliases);
  }

  // Collection Landing Pages
  async getCollectionLandingPage(collectionUid: string, variantAliases?: string[]): Promise<CollectionLandingPage | null> {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    const entry = await contentstack.getCollectionLandingPage(collectionUid, variantAliases);
    if (entry) {
      addEditableTags(entry, 'collection_landing_page');
    }
    return entry;
  }

  // Lookbooks
  async getLookbooks(variantAliases?: string[]): Promise<LookbookPage[]> {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    const entries = await contentstack.getLookbooks(variantAliases);
    entries.forEach(e => addEditableTags(e, 'lookbook_page'));
    return entries;
  }

  async getLookbookBySlug(slug: string, variantAliases?: string[]): Promise<LookbookPage | null> {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    const entry = await contentstack.getLookbookBySlug(slug, variantAliases);
    if (entry) {
      addEditableTags(entry, 'lookbook_page');
    }
    return entry;
  }

  // Modular Category Pages
  async getModularCategoryPage(categorySlug: string, variantAliases?: string[]): Promise<ModularCategoryPage | null> {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    const entry = await contentstack.getModularCategoryPage(categorySlug, variantAliases);
    if (entry) {
      addEditableTags(entry, 'modular_category_page');
    }
    return entry;
  }

  // Campaigns
  async getCampaigns(isActive?: boolean, variantAliases?: string[]): Promise<Campaign[]> {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    const entries = await contentstack.getCampaigns(isActive, variantAliases);
    entries.forEach(e => addEditableTags(e, 'campaign'));
    return entries;
  }

  async getCampaign(uid: string, variantAliases?: string[]): Promise<Campaign | null> {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    const entry = await contentstack.getCampaign(uid, variantAliases);
    if (entry) {
      addEditableTags(entry, 'campaign');
    }
    return entry;
  }

  async getActiveCampaigns(variantAliases?: string[]): Promise<Campaign[]> {
    return this.getCampaigns(true, variantAliases);
  }

  // Value Propositions
  async getValuePropositions(variantAliases?: string[]): Promise<ValuePropositionContent[]> {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    const entries = await contentstack.getValuePropositions(variantAliases);
    entries.forEach(e => addEditableTags(e, 'value_proposition'));
    return entries;
  }

  // Feature Items
  async getFeatureItems(variantAliases?: string[]): Promise<FeatureItemContent[]> {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    const entries = await contentstack.getFeatureItems(variantAliases);
    entries.forEach(e => addEditableTags(e, 'feature_item'));
    return entries;
  }

  // Testimonials
  async getTestimonials(featured?: boolean, variantAliases?: string[]): Promise<Testimonial[]> {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    const entries = await contentstack.getTestimonials(featured, variantAliases);
    entries.forEach(e => addEditableTags(e, 'testimonial'));
    return entries;
  }

  async getFeaturedTestimonials(variantAliases?: string[]): Promise<Testimonial[]> {
    return this.getTestimonials(true, variantAliases);
  }

  // Hero 7 Page
  async getHeroSevenPage(variantAliases?: string[]): Promise<HeroSevenPageEntry | null> {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    const entry = await contentstack.getHeroSevenPage(variantAliases);
    if (entry) {
      addEditableTags(entry, 'hero_seven_page');
    }
    return entry;
  }

  // Product Tile Banner Page
  async getProductTileBannerPage(variantAliases?: string[]): Promise<ProductTileBannerPageEntry | null> {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    const entry = await contentstack.getProductTileBannerPage(variantAliases);
    if (entry) {
      addEditableTags(entry, 'product_tile_banner_page');
    }
    return entry;
  }

  // Dynamic Feeds Page
  async getDynamicFeedsPage(variantAliases?: string[]): Promise<DynamicFeedsPageEntry | null> {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    const entry = await contentstack.getDynamicFeedsPage(variantAliases);
    if (entry) {
      addEditableTags(entry, 'dynamic_feeds_page');
    }
    return entry;
  }

  // Dynamic Feeds Page (Dropdown variant)
  async getDynamicFeedsDropdownPage(variantAliases?: string[]): Promise<DynamicFeedsDropdownPageEntry | null> {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    const entry = await contentstack.getDynamicFeedsDropdownPage(variantAliases);
    if (entry) {
      addEditableTags(entry, 'dynamic_feeds_dropdown_page');
    }
    return entry;
  }

  // Composable Page (mixed blocks + dynamic feeds)
  async getComposablePage(variantAliases?: string[]) {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    const entry = await contentstack.getComposablePage(variantAliases);
    if (entry) {
      addEditableTags(entry, 'composable_page');
    }
    return entry;
  }

  // Dynamic Product Feeds
  async getDynamicProductFeeds(variantAliases?: string[]): Promise<DynamicProductFeedEntry[]> {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    const entries = await contentstack.getDynamicProductFeeds(variantAliases);
    entries.forEach(entry => addEditableTags(entry, 'dynamic_product_feed'));
    return entries;
  }
}

// Export singleton instance
export const dataService = new DataService();
