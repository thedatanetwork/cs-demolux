// Mock data for development before Contentstack is fully configured
import { Product, BlogPost, NavigationMenu, SiteSettings } from '@/lib/contentstack';

// Mock products data
export const mockProducts: Product[] = [
  {
    uid: 'quantum-smartwatch',
    title: 'Quantum Smartwatch Pro',
    url: '/products/quantum-smartwatch-pro',
    description: 'Revolutionary smartwatch with quantum processing capabilities, featuring a sapphire crystal display, titanium frame, and advanced biometric sensors. Track your health, productivity, and wellness with unprecedented precision.',
    featured_image: [
      {
        uid: 'quantum-watch-main',
        url: '/images/products/quantum-smartwatch-main.jpg',
        title: 'Quantum Smartwatch Pro - Main View',
        filename: 'quantum-smartwatch-main.jpg'
      },
      {
        uid: 'quantum-watch-side',
        url: '/images/products/quantum-smartwatch-side.jpg',
        title: 'Quantum Smartwatch Pro - Side View',
        filename: 'quantum-smartwatch-side.jpg'
      }
    ],
    price: 2499,
    call_to_action: {
      title: 'Order Now',
      url: '/products/quantum-smartwatch-pro'
    },
    category: 'wearable-tech',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-20T14:45:00Z'
  },
  {
    uid: 'neural-fitness-band',
    title: 'Neural Fitness Band Elite',
    url: '/products/neural-fitness-band-elite',
    description: 'Advanced fitness tracking with neural network analysis. Monitor your workouts, recovery, and performance optimization with AI-powered insights. Waterproof design with 14-day battery life.',
    featured_image: [
      {
        uid: 'neural-band-main',
        url: '/images/products/neural-fitness-band-main.jpg',
        title: 'Neural Fitness Band Elite - Main View',
        filename: 'neural-fitness-band-main.jpg'
      }
    ],
    price: 899,
    call_to_action: {
      title: 'Shop Now',
      url: '/products/neural-fitness-band-elite'
    },
    category: 'wearable-tech',
    created_at: '2024-01-10T09:15:00Z',
    updated_at: '2024-01-18T16:20:00Z'
  },
  {
    uid: 'adaptive-smart-desk',
    title: 'Adaptive Smart Desk X1',
    url: '/products/adaptive-smart-desk-x1',
    description: 'Intelligent workspace that adapts to your needs. Features automatic height adjustment, integrated wireless charging, climate control, and productivity tracking. Crafted from sustainable bamboo with premium steel accents.',
    featured_image: [
      {
        uid: 'smart-desk-main',
        url: '/images/products/smart-desk-main.jpg',
        title: 'Adaptive Smart Desk X1 - Main View',
        filename: 'smart-desk-main.jpg'
      },
      {
        uid: 'smart-desk-detail',
        url: '/images/products/smart-desk-detail.jpg',
        title: 'Adaptive Smart Desk X1 - Detail View',
        filename: 'smart-desk-detail.jpg'
      }
    ],
    price: 3999,
    call_to_action: {
      title: 'Pre-Order',
      url: '/products/adaptive-smart-desk-x1'
    },
    category: 'technofurniture',
    created_at: '2024-01-08T11:00:00Z',
    updated_at: '2024-01-22T13:30:00Z'
  },
  {
    uid: 'holographic-display-chair',
    title: 'Holographic Display Chair',
    url: '/products/holographic-display-chair',
    description: 'The future of seating with integrated holographic display technology. Ergonomic design with posture correction, massage functions, and immersive entertainment capabilities. Premium leather with haptic feedback system.',
    featured_image: [
      {
        uid: 'holo-chair-main',
        url: '/images/products/holographic-chair-main.jpg',
        title: 'Holographic Display Chair - Main View',
        filename: 'holographic-chair-main.jpg'
      }
    ],
    price: 7499,
    call_to_action: {
      title: 'Learn More',
      url: '/products/holographic-display-chair'
    },
    category: 'technofurniture',
    created_at: '2024-01-05T14:20:00Z',
    updated_at: '2024-01-25T10:15:00Z'
  }
];

// Mock blog posts
export const mockBlogPosts: BlogPost[] = [
  {
    uid: 'future-of-wearable-tech-2024',
    title: 'The Future of Wearable Technology: What to Expect in 2024',
    url: '/blog/future-of-wearable-tech-2024',
    content: 'As we advance into 2024, wearable technology continues to evolve at an unprecedented pace. From neural interfaces to quantum sensors, discover the innovations that will shape how we interact with technology in our daily lives...',
    featured_image: [
      {
        uid: 'blog-wearable-future',
        url: '/images/blog/wearable-tech-future.jpg',
        title: 'Future of Wearable Technology',
        filename: 'wearable-tech-future.jpg'
      }
    ],
    excerpt: 'Explore the cutting-edge innovations in wearable technology that will revolutionize how we live, work, and play in 2024 and beyond.',
    author: 'Dr. Sarah Chen',
    publish_date: '2024-01-15T08:00:00Z',
    post_tags: ['wearable tech', 'innovation', 'future tech', 'AI'],
    created_at: '2024-01-10T10:30:00Z',
    updated_at: '2024-01-15T08:00:00Z'
  }
];

// Mock navigation menus
export const mockNavigationMenus: NavigationMenu[] = [
  {
    uid: 'main-navigation',
    menu_name: 'Main Navigation',
    menu_id: 'main_nav',
    menu_location: 'header',
    menu_items: [
      {
        label: 'Home',
        url: '/',
        sort_order: 1,
        is_active: true
      },
      {
        label: 'Wearable Tech',
        url: '/categories/wearable-tech',
        sort_order: 2,
        is_active: true
      },
      {
        label: 'Technofurniture',
        url: '/categories/technofurniture',
        sort_order: 3,
        is_active: true
      },
      {
        label: 'Blog',
        url: '/blog',
        sort_order: 4,
        is_active: true
      },
      {
        label: 'About',
        url: '/about',
        sort_order: 5,
        is_active: true
      },
      {
        label: 'Contact',
        url: '/contact',
        sort_order: 6,
        is_active: true
      }
    ],
    menu_style: 'horizontal',
    is_active: true
  },
  {
    uid: 'footer-navigation',
    menu_name: 'Footer Navigation',
    menu_id: 'footer_nav',
    menu_location: 'footer',
    menu_items: [
      {
        label: 'Privacy Policy',
        url: '/privacy',
        sort_order: 1,
        is_active: true
      },
      {
        label: 'Terms of Service',
        url: '/terms',
        sort_order: 2,
        is_active: true
      },
      {
        label: 'Shipping & Returns',
        url: '/shipping',
        sort_order: 3,
        is_active: true
      },
      {
        label: 'Support',
        url: '/support',
        sort_order: 4,
        is_active: true
      }
    ],
    menu_style: 'vertical',
    is_active: true
  }
];

// Mock site settings
export const mockSiteSettings: SiteSettings = {
  uid: 'demolux-settings',
  site_name: 'Demolux',
  tagline: 'Where Innovation Meets Luxury',
  logo: {
    uid: 'demolux-logo',
    url: '/images/logo/demolux-logo.svg',
    title: 'Demolux Logo'
  },
  contact_info: {
    email: 'hello@demolux.com',
    phone: '+1 (555) 123-4567',
    address: '123 Innovation Drive, Tech City, TC 12345'
  },
  social_links: {
    instagram: 'https://instagram.com/demolux',
    twitter: 'https://twitter.com/demolux',
    linkedin: 'https://linkedin.com/company/demolux',
    youtube: 'https://youtube.com/demolux'
  },
  seo: {
    meta_title: 'Demolux - Premium Wearable Tech & Technofurniture',
    meta_description: 'Discover the future of luxury with Demolux premium wearable technology and innovative technofurniture. Where cutting-edge design meets exceptional craftsmanship.',
    meta_keywords: 'wearable tech, technofurniture, luxury accessories, smart devices, premium technology'
  }
};

// Helper functions to simulate API calls
export const getMockData = {
  products: (category?: string): Product[] => {
    if (category) {
      return mockProducts.filter(product => product.category === category);
    }
    return mockProducts;
  },
  
  product: (uid: string): Product | null => {
    return mockProducts.find(product => product.uid === uid) || null;
  },
  
  blogPosts: (limit?: number): BlogPost[] => {
    if (limit) {
      return mockBlogPosts.slice(0, limit);
    }
    return mockBlogPosts;
  },
  
  blogPost: (uid: string): BlogPost | null => {
    return mockBlogPosts.find(post => post.uid === uid) || null;
  },
  
  navigationMenus: (location?: string): NavigationMenu[] => {
    if (location) {
      return mockNavigationMenus.filter(menu => menu.menu_location === location);
    }
    return mockNavigationMenus;
  },
  
  siteSettings: (): SiteSettings => {
    return mockSiteSettings;
  }
};
