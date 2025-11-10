// Data service that provides access to Contentstack CMS
import { contentstack, Product, BlogPost, NavigationMenu, SiteSettings, Page, HomePage } from './contentstack';

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
  private useContentstack: boolean;

  constructor() {
    // Check if Contentstack is configured
    this.useContentstack = !!(
      process.env.CONTENTSTACK_API_KEY && 
      process.env.CONTENTSTACK_DELIVERY_TOKEN
    );
    
    if (process.env.NODE_ENV === 'development') {
      console.log('DataService initialized with Contentstack:', this.useContentstack ? 'enabled' : 'disabled');
    }
    
    if (!this.useContentstack) {
      console.warn('⚠️ CONTENTSTACK NOT CONFIGURED - Add credentials to .env.local');
    }
  }

  // Products
  async getProducts(category?: string, variantAliases?: string[]): Promise<Product[]> {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    return await contentstack.getProducts(category, variantAliases);
  }

  async getProduct(uid: string, variantAliases?: string[]): Promise<Product | null> {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    return await contentstack.getProduct(uid, variantAliases);
  }

  async getProductBySlug(slug: string, variantAliases?: string[]): Promise<Product | null> {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    return await contentstack.getProductBySlug(slug, variantAliases);
  }

  // Blog posts
  async getBlogPosts(limit?: number, variantAliases?: string[]): Promise<BlogPost[]> {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    return await contentstack.getBlogPosts(limit, variantAliases);
  }

  async getBlogPost(uid: string, variantAliases?: string[]): Promise<BlogPost | null> {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    return await contentstack.getBlogPost(uid, variantAliases);
  }

  async getBlogPostBySlug(slug: string, variantAliases?: string[]): Promise<BlogPost | null> {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    return await contentstack.getBlogPostBySlug(slug, variantAliases);
  }

  async getPage(slug: string): Promise<Page | null> {
    if (!this.useContentstack) {
      throw new Error('Contentstack not configured. Please add credentials to .env.local');
    }
    return await contentstack.getPage(slug);
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
    return await contentstack.getHomePage();
  }
}

// Export singleton instance
export const dataService = new DataService();
