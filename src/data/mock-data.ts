// Mock data for development before Contentstack is fully configured
import { Product, BlogPost, NavigationMenu, SiteSettings, Page, HomePage } from '@/lib/contentstack';

// Mock products data
export const mockProducts: Product[] = [
  {
    uid: 'smart_winter_hat',
    title: 'Smart Winter Hat',
    url: '/products/smart_winter_hat',
    description: 'Minimalist ribbed knit in luxury-grade merino wool with a gold-trimmed embedded display that keeps you warm and connected.',
    detailed_description: 'The Demolux Smart Winter Hat redefines seasonal accessories. Crafted in luxury-grade merino wool with a matte-black sheen, it seamlessly integrates fashion and function. The slim, gold-trimmed display shows essentials like time, weather, and notifications while maintaining a discreet profile. Inside, adaptive heating filaments automatically adjust warmth to your comfort and environment. This is not just winterwear — it\'s a statement piece that transitions effortlessly from runway to city street.',
    featured_image: [],
    price: 299,
    call_to_action: {
      title: 'Add to Cart',
      url: '/products/smart_winter_hat'
    },
    category: 'wearable-tech',
    product_tags: ['winter', 'wearable', 'smart', 'luxury', 'merino wool'],
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-20T14:45:00Z'
  },
  {
    uid: 'ar_bracer',
    title: 'AR Bracer',
    url: '/products/ar_bracer',
    description: 'A bold forearm wearable with a wraparound flexible display, offering real-time augmented overlays and environmental awareness.',
    detailed_description: 'The Demolux AR Bracer pushes wearable technology beyond the wrist. Designed as a sleek forearm bracer with matte black and gold accents, it houses a seamless flexible display that wraps comfortably around the arm. Multiple micro-cameras align the display with your surroundings, overlaying contextual information in real time. Walking through the city, the bracer can reveal building interiors, navigation cues, or live updates without breaking stride. More than a gadget, it is a bold luxury accessory — blending the presence of high fashion with the intelligence of cutting-edge AR technology.',
    featured_image: [],
    price: 1999,
    call_to_action: {
      title: 'Add to Cart',
      url: '/products/ar_bracer'
    },
    category: 'wearable-tech',
    product_tags: ['AR', 'bracer', 'wearable', 'augmented reality', 'luxury'],
    created_at: '2024-01-10T09:15:00Z',
    updated_at: '2024-01-18T16:20:00Z'
  },
  {
    uid: 'minimalist_smart_side_table',
    title: 'Minimalist Smart Side Table',
    url: '/products/minimalist_smart_side_table',
    description: 'A sleek table with a holographic display surface, integrated lamp, and gesture-controlled ambient lighting.',
    detailed_description: 'The Minimalist Smart Side Table by Demolux combines timeless design with futuristic capability. A floating matte-black circular surface rests on a slender gold spine, crowned with an integrated lamp. When activated, the table reveals its hidden brilliance: a projection layer that brings ambient art, notifications, or calendar overlays directly to the surface. Gesture controls replace switches, while environmental sensors adjust brightness and hue to your surroundings. This is where minimalism meets intelligence, creating a table that is as understated as it is extraordinary.',
    featured_image: [],
    price: 3499,
    call_to_action: {
      title: 'Add to Cart',
      url: '/products/minimalist_smart_side_table'
    },
    category: 'technofurniture',
    product_tags: ['table', 'minimalist', 'smart', 'holographic', 'gesture control'],
    created_at: '2024-01-08T11:00:00Z',
    updated_at: '2024-01-22T13:30:00Z'
  },
  {
    uid: 'holographic_display_chair',
    title: 'Holographic Display Chair',
    url: '/products/holographic_display_chair',
    description: 'Luxury recliner with adaptive comfort, surround-sound acoustics, and hidden wireless charging — a sculptural statement in tech-driven seating.',
    detailed_description: 'The Holographic Display Chair is the pinnacle of technofurniture. Upholstered in jet-black leather with a sculptural gold-anodized frame, it pairs gallery-worthy aesthetics with immersive technology. Adaptive sensors adjust firmness and lumbar support, while hidden surround-sound speakers create a cocoon of audio luxury. Integrated wireless charging zones eliminate clutter, ensuring your devices stay powered while you unwind. At once functional seating and art object, the chair transforms relaxation into a curated sensory experience.',
    featured_image: [],
    price: 7499,
    call_to_action: {
      title: 'Add to Cart',
      url: '/products/holographic_display_chair'
    },
    category: 'technofurniture',
    product_tags: ['chair', 'holographic', 'luxury', 'wireless charging', 'technofurniture'],
    created_at: '2024-01-05T14:20:00Z',
    updated_at: '2024-01-25T10:15:00Z'
  }
];

// Mock blog posts
export const mockBlogPosts: BlogPost[] = [
  {
    uid: 'sustainable_luxury_technofurniture_2025',
    title: 'Sustainable Luxury: The Future of Technofurniture',
    url: '/blog/sustainable_luxury_technofurniture_2025',
    content: 'Luxury is often associated with indulgence, exclusivity, and opulence. Sustainability, on the other hand, evokes ideas of restraint, responsibility, and balance. For decades, these two values seemed at odds. But as global awareness of climate challenges deepens, a new paradigm is emerging: sustainable luxury...',
    featured_image: [],
    excerpt: 'Discover how sustainable practices are revolutionizing luxury technofurniture, merging eco-consciousness with uncompromising design and innovation.',
    author: 'Marcus Weber',
    publish_date: '2025-07-10T10:00:00Z',
    post_tags: ['sustainability', 'technofurniture', 'luxury', 'eco-design', 'smart furniture'],
    created_at: '2025-07-05T14:30:00Z',
    updated_at: '2025-07-10T10:00:00Z'
  },
  {
    uid: 'future_wearable_technology_2025',
    title: 'The Future of Wearable Technology: What to Expect in 2025',
    url: '/blog/future_wearable_technology_2025',
    content: 'Wearable technology has come a long way from step counters and fitness bands. As we move deeper into 2025, wearables are no longer niche accessories — they\'re essential tools of self-expression, wellness, and productivity...',
    featured_image: [],
    excerpt: 'Explore how wearable technology is evolving beyond utility into essential lifestyle companions that blend fashion, function, and augmented reality.',
    author: 'Dr. Sarah Chen',
    publish_date: '2025-08-15T09:00:00Z',
    post_tags: ['wearable tech', 'AR', 'fashion tech', 'innovation', '2025 trends'],
    created_at: '2025-08-10T16:20:00Z',
    updated_at: '2025-08-15T09:00:00Z'
  },
  {
    uid: 'demolux_2025_product_lineup',
    title: 'Inside Demolux: Our 2025 Product Lineup',
    url: '/blog/demolux_2025_product_lineup',
    content: 'Each year, Demolux redefines what it means to live at the intersection of luxury, technology, and sustainability. Our 2025 product lineup represents not only innovation but also a clear vision for the future of wearable tech and technofurniture...',
    featured_image: [],
    excerpt: 'Get an inside look at Demolux\'s complete 2025 collection, featuring breakthrough wearable technology and innovative technofurniture pieces.',
    author: 'Elena Rossi',
    publish_date: '2025-08-30T11:00:00Z',
    post_tags: ['product lineup', 'innovation', 'design', 'collection', 'luxury tech'],
    created_at: '2025-08-25T13:45:00Z',
    updated_at: '2025-08-30T11:00:00Z'
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

// Mock home page data
export const mockHomePage: HomePage = {
  uid: 'home-page',
  title: 'Demolux Home Page',
  // Hero Section
  hero_badge_text: 'Premium Luxury Technology',
  hero_title: 'Where Innovation Meets Luxury',
  hero_subtitle: 'Where Innovation',
  hero_description: 'Discover the future with Demolux premium wearable technology and innovative technofurniture. Each piece is crafted where cutting-edge design meets exceptional performance.',
  hero_image: [{
    uid: 'hero-image',
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
    title: 'Demolux Hero Image',
    filename: 'hero-image.jpg'
  }],
  hero_primary_cta: {
    text: 'Shop Wearable Tech',
    url: '/categories/wearable-tech'
  },
  hero_secondary_cta: {
    text: 'Explore Technofurniture',
    url: '/categories/technofurniture'
  },
  hero_features: [
    {
      icon: 'Award',
      title: 'Premium Quality',
      description: 'Exceptional craftsmanship'
    },
    {
      icon: 'Zap',
      title: 'Innovation',
      description: 'Cutting-edge technology'
    },
    {
      icon: 'Star',
      title: 'Luxury Design',
      description: 'Sophisticated aesthetics'
    }
  ],
  
  // Featured Products Section
  featured_section_title: 'Featured Products',
  featured_section_description: 'Discover our latest innovations in wearable technology and technofurniture, each designed to elevate your lifestyle with premium functionality and style.',
  featured_products_limit: 4,
  
  // Brand Values Section
  values_section_title: 'The Demolux Difference',
  values_section_description: 'We don\'t just create products—we craft experiences that seamlessly blend innovation, luxury, and functionality for the modern lifestyle.',
  value_propositions: [
    {
      icon: 'Sparkles',
      title: 'Innovation First',
      description: 'We pioneer breakthrough technologies that redefine what\'s possible, from quantum processors to neural interfaces.'
    },
    {
      icon: 'Users',
      title: 'Human-Centered Design',
      description: 'Every product is designed with the user at the center, ensuring intuitive experiences that enhance daily life naturally.'
    },
    {
      icon: 'Globe',
      title: 'Sustainable Luxury',
      description: 'Premium quality doesn\'t compromise our planet. We use sustainable materials and responsible manufacturing processes.'
    }
  ],
  
  // Blog Section
  blog_section_title: 'Latest Insights',
  blog_section_description: 'Stay informed about the latest trends, innovations, and insights in technology and design.',
  blog_posts_limit: 3,
  blog_cta_text: 'View All Posts',
  
  // Final CTA Section
  final_cta: {
    title: 'Ready to Experience the Future?',
    description: 'Join thousands of innovators who have already transformed their lives with Demolux premium technology.',
    primary_button: {
      text: 'Shop Wearable Tech',
      url: '/categories/wearable-tech'
    },
    secondary_button: {
      text: 'Explore Technofurniture',
      url: '/categories/technofurniture'
    },
    background_color: 'dark'
  },
  
  // SEO
  meta_title: 'Demolux - Where Innovation Meets Luxury',
  meta_description: 'Discover the future with Demolux premium wearable technology and innovative technofurniture. Each piece is crafted where cutting-edge design meets exceptional performance.',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T10:30:00Z'
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

  productBySlug: (slug: string): Product | null => {
    return mockProducts.find(product => product.url === `/products/${slug}`) || null;
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

  blogPostBySlug: (slug: string): BlogPost | null => {
    return mockBlogPosts.find(post => post.url === `/blog/${slug}`) || null;
  },

  page: (slug: string): Page | null => {
    const mockPages: Page[] = [
      {
        uid: 'about',
        title: 'About Us',
        slug: 'about',
        meta_description: 'Learn about Demolux - pioneers in luxury wearable technology and technofurniture.',
        hero_section: {
          title: 'Redefining Luxury Through Innovation',
          subtitle: 'At Demolux, we craft the future of premium lifestyle technology, where cutting-edge innovation meets timeless design.'
        },
        content_sections: [
          {
            section_title: 'Our Story',
            content: 'Founded in 2020, Demolux emerged from a simple yet revolutionary idea: technology should enhance life without compromising on style or luxury.',
            layout: 'two-column'
          }
        ]
      },
      {
        uid: 'contact',
        title: 'Contact Us',
        slug: 'contact',
        meta_description: 'Get in touch with Demolux. Contact our team for inquiries, support, or to schedule a private viewing.',
        hero_section: {
          title: 'Get in Touch',
          subtitle: 'Experience the future of luxury technology. Contact us to schedule a private viewing or discuss custom solutions.'
        },
        content_sections: [
          {
            section_title: 'Contact Information',
            content: '<p>Email: hello@demolux.com<br>Phone: +45 3333 7000</p>',
            layout: 'centered'
          }
        ],
        contact_form: {
          show_form: true,
          form_title: 'Send us a message',
          form_description: 'We\'d love to hear from you.'
        }
      }
    ];
    return mockPages.find(page => page.slug === slug) || null;
  },
  
  navigationMenus: (location?: string): NavigationMenu[] => {
    if (location) {
      return mockNavigationMenus.filter(menu => menu.menu_location === location);
    }
    return mockNavigationMenus;
  },
  
  siteSettings: (): SiteSettings => {
    return mockSiteSettings;
  },
  
  homePage: (): HomePage => {
    return mockHomePage;
  }
};
