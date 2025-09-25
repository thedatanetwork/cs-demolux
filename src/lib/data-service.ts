// Data service that abstracts between Contentstack and mock data
import { contentstack, Product, BlogPost, NavigationMenu, SiteSettings } from './contentstack';
import { getMockData } from '@/data/mock-data';

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
    
    // Ensure environment variables are properly evaluated during initialization
    const envCheck = {
      apiKey: process.env.CONTENTSTACK_API_KEY,
      deliveryToken: process.env.CONTENTSTACK_DELIVERY_TOKEN,
      environment: process.env.CONTENTSTACK_ENVIRONMENT
    };
    
    console.log('DataService initialized with Contentstack:', this.useContentstack ? 'enabled' : 'disabled');
    
    if (!this.useContentstack) {
      console.log('Using mock data fallback - Contentstack not configured');
    }
  }

  // Products
  async getProducts(category?: string): Promise<Product[]> {
    if (this.useContentstack) {
      try {
        return await contentstack.getProducts(category);
      } catch (error) {
        console.error('Contentstack error, falling back to mock data:', error);
        return getMockData.products(category);
      }
    }
    return getMockData.products(category);
  }

  async getProduct(uid: string): Promise<Product | null> {
    if (this.useContentstack) {
      try {
        return await contentstack.getProduct(uid);
      } catch (error) {
        console.error('Contentstack error, falling back to mock data:', error);
        return getMockData.product(uid);
      }
    }
    return getMockData.product(uid);
  }

  // Blog posts
  async getBlogPosts(limit?: number): Promise<BlogPost[]> {
    if (this.useContentstack) {
      try {
        return await contentstack.getBlogPosts(limit);
      } catch (error) {
        console.error('Contentstack error, falling back to mock data:', error);
        return getMockData.blogPosts(limit);
      }
    }
    return getMockData.blogPosts(limit);
  }

  async getBlogPost(uid: string): Promise<BlogPost | null> {
    if (this.useContentstack) {
      try {
        return await contentstack.getBlogPost(uid);
      } catch (error) {
        console.error('Contentstack error, falling back to mock data:', error);
        return getMockData.blogPost(uid);
      }
    }
    return getMockData.blogPost(uid);
  }

  // Navigation menus
  async getNavigationMenus(location?: string): Promise<NavigationMenu[]> {
    if (this.useContentstack) {
      try {
        return await contentstack.getNavigationMenus(location);
      } catch (error) {
        console.error('Contentstack error, falling back to mock data:', error);
        return getMockData.navigationMenus(location);
      }
    }
    return getMockData.navigationMenus(location);
  }

  // Site settings
  async getSiteSettings(): Promise<SiteSettings | null> {
    if (this.useContentstack) {
      try {
        return await contentstack.getSiteSettings();
      } catch (error) {
        console.error('Contentstack error, falling back to mock data:', error);
        return getMockData.siteSettings();
      }
    }
    return getMockData.siteSettings();
  }

  // Get site settings with guaranteed fallback
  async getSiteSettingsWithFallback(): Promise<SiteSettings> {
    const settings = await this.getSiteSettings();
    return settings || createFallbackSiteSettings();
  }

  // Helper methods for common queries
  async getWearableTech(): Promise<Product[]> {
    return this.getProducts('wearable-tech');
  }

  async getTechnofurniture(): Promise<Product[]> {
    return this.getProducts('technofurniture');
  }

  async getFeaturedProducts(limit: number = 4): Promise<Product[]> {
    const products = await this.getProducts();
    return products.slice(0, limit);
  }

  async getRecentBlogPosts(limit: number = 3): Promise<BlogPost[]> {
    return this.getBlogPosts(limit);
  }

  async getHeaderNavigation(): Promise<NavigationMenu[]> {
    return this.getNavigationMenus('header');
  }

  async getFooterNavigation(): Promise<NavigationMenu[]> {
    return this.getNavigationMenus('footer');
  }
}

// Export singleton instance
export const dataService = new DataService();
