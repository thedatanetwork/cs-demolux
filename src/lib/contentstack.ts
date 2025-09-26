import Contentstack from 'contentstack';

// Contentstack configuration
const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY || '',
  delivery_token: process.env.CONTENTSTACK_DELIVERY_TOKEN || '',
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'dev',
  region: (process.env.CONTENTSTACK_REGION as keyof typeof Contentstack.Region) || 'US'
};

// Initialize Contentstack
let Stack: any = null;

if (stackConfig.api_key && stackConfig.delivery_token) {
  try {
    console.log('Contentstack config:', {
      api_key: stackConfig.api_key ? `${stackConfig.api_key.substring(0, 10)}...` : 'missing',
      delivery_token: stackConfig.delivery_token ? `${stackConfig.delivery_token.substring(0, 10)}...` : 'missing',
      environment: stackConfig.environment,
      region: stackConfig.region
    });
    
    Stack = Contentstack.Stack({
      api_key: stackConfig.api_key,
      delivery_token: stackConfig.delivery_token,
      environment: stackConfig.environment,
      region: Contentstack.Region[stackConfig.region] || Contentstack.Region.US
    });
    console.log('Contentstack initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Contentstack:', error);
  }
} else {
  console.warn('Contentstack credentials not configured. Using mock data fallbacks.');
}

// Type definitions for our content models
export interface Product {
  uid: string;
  title: string;
  url: string;
  description: string;
  detailed_description?: string; // New field for product detail pages
  featured_image: Array<{
    uid: string;
    url: string;
    title: string;
    filename: string;
  }>;
  price: number;
  call_to_action?: {
    title: string;
    url: string;
  };
  category?: string;
  product_tags?: string[]; // New field for product tags
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  uid: string;
  title: string;
  url: string;
  content: string;
  featured_image?: Array<{
    uid: string;
    url: string;
    title: string;
    filename: string;
  }>;
  excerpt?: string;
  author?: string;
  publish_date: string;
  post_tags?: string[];
  created_at: string;
  updated_at: string;
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

// Contentstack service class
export class ContentstackService {
  private stack: any;

  constructor() {
    this.stack = Stack;
  }

  private isConfigured(): boolean {
    return !!this.stack;
  }

  // Generic method to fetch content
  async getEntries<T>(contentType: string, query?: any): Promise<T[]> {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      const Query = this.stack.ContentType(contentType).Query();
      
      // Include all fields for product and blog content types
      if (contentType === 'product') {
        Query.includeReference(['featured_image']);
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
  async getEntry<T>(contentType: string, uid: string): Promise<T | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const Query = this.stack.ContentType(contentType).Query();
      Query.where('uid', uid);
      
      // Include all fields for product and blog content types
      if (contentType === 'product') {
        Query.includeReference(['featured_image']);
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
  async getProducts(category?: string): Promise<Product[]> {
    const query: any = { orderByDescending: 'created_at' };
    
    if (category) {
      query.where = { category: category };
      console.log(`Filtering products by category: ${category}`, query);
    } else {
      console.log('Fetching all products (no category filter)');
    }

    const products = await this.getEntries<Product>('product', query);
    console.log(`Found ${products.length} products for category: ${category || 'all'}`);
    
    if (products.length > 0) {
      console.log('Product categories found:', products.map(p => ({ uid: p.uid, title: p.title, category: p.category })));
    } else {
      console.log(`No products found for category: ${category || 'all'}`);
    }
    
    return products;
  }

  async getProduct(uid: string): Promise<Product | null> {
    return this.getEntry<Product>('product', uid);
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const products = await this.getEntries<Product>('product', {
      where: { url: `/products/${slug}` }
    });
    return products[0] || null;
  }

  async getBlogPosts(limit?: number): Promise<BlogPost[]> {
    const query: any = { orderByDescending: 'publish_date' };
    
    if (limit) {
      query.limit = limit;
    }

    return this.getEntries<BlogPost>('blog_post', query);
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

  async getBlogPost(uid: string): Promise<BlogPost | null> {
    return this.getEntry<BlogPost>('blog_post', uid);
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    const posts = await this.getEntries<BlogPost>('blog_post', {
      where: { url: `/blog/${slug}` }
    });
    return posts[0] || null;
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
}

// Export singleton instance
export const contentstack = new ContentstackService();
