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
        meta_description: 'Learn about DemoLux - pioneers in luxury wearable technology and technofurniture. Discover our story, vision, and commitment to redefining the future of premium lifestyle technology.',
        hero_section: {
          title: 'Redefining the Future of Luxury',
          subtitle: 'Where visionary design meets breakthrough technology. This is the story of how DemoLux became the world\'s most coveted name in premium wearable tech and technofurniture.'
        },
        content_sections: [
          {
            section_title: 'The Birth of a Vision',
            content: '<p>DemoLux was born in 2018 in a converted Copenhagen warehouse, where three unlikely collaborators—a former aerospace engineer, a luxury fashion designer, and a neuroscience researcher—gathered around a single question: <em>Why does technology make us choose between beauty and brilliance?</em></p><p>The world was full of wearables that tracked steps but clashed with tailored suits. Smart furniture that computed but compromised on comfort. Everywhere they looked, the founders saw a false binary: function or form, innovation or elegance, technology or taste.</p><p>They rejected this compromise. In that warehouse, surrounded by discarded prototypes and late-night sketches, DemoLux was conceived—not as a company, but as a manifesto. Technology should be invisible when you want it to be, and impossible to ignore when it matters. It should be crafted, not merely manufactured. It should enhance life, not distract from it.</p><p>By 2019, the first DemoLux product emerged: a watch so elegant that collectors mistook it for haute horology, yet so intelligent it could monitor neural patterns and predict stress before the wearer felt it. The line between jewelry and technology had disappeared entirely.</p>',
            layout: 'centered'
          },
          {
            section_title: 'The DemoLux Difference',
            content: '<p>At DemoLux, luxury is not about excess—it\'s about precision. Every product undergoes over 200 hours of design refinement. Every material is selected not just for aesthetics, but for its molecular composition, its tactile memory, its response to light and temperature. We employ materials scientists alongside master craftspeople. Our QA process includes sensory panels that evaluate not just functionality, but <em>feeling</em>.</p><p>Our wearable technology doesn\'t announce itself with bright screens and buzzing alerts. Instead, it whispers. A gentle haptic pulse. A micro-display visible only when you glance. Interfaces that learn your rhythms and adapt to your life, not the other way around.</p><p>Our technofurniture occupies the rare space between art installation and daily companion. Each piece is engineered to exist for decades, not product cycles. Modular components can be upgraded. Surfaces are designed to patinate beautifully. We\'ve built furniture that becomes more valuable, more personal, more <em>yours</em> over time.</p><p>This is luxury redefined: not status symbols, but life partners. Not gadgets, but heirlooms.</p>',
            layout: 'two-column'
          },
          {
            section_title: 'Building Tomorrow, Responsibly',
            content: '<p>Innovation without conscience is just noise. At DemoLux, every breakthrough comes with a responsibility.</p><p>Our neural interface technology emerged from partnerships with leading neuroscience labs, but we established strict ethical guidelines before the first prototype shipped. User data stays on-device. AI assistance requires explicit consent. Privacy is not a feature—it\'s architecture.</p><p>Our commitment to sustainability goes beyond recycled packaging. We\'ve pioneered biocomposite materials that match the performance of aerospace aluminum while being 90% plant-based. Our holographic displays use 40% less energy than comparable screens. We\'ve developed modular designs that allow components to be upgraded without replacing entire products.</p><p>Every DemoLux product comes with a lifetime service guarantee. If a component fails in 10 years, we repair or replace it. When a product reaches true end-of-life, we take it back and recover 95% of its materials. We measure success not in units sold, but in decades of use.</p><p>Luxury means lasting. Technology means adapting. At DemoLux, we\'ve made them inseparable.</p>',
            layout: 'centered'
          },
          {
            section_title: 'Where Art Meets Intelligence',
            content: '<p>DemoLux creates in two realms, each defined by uncompromising standards:</p><h3 style="font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; color: #111827;">Wearable Technology</h3><p>Our wearables don\'t just track life—they enhance it. From the <strong>AR Bracer</strong> that overlays the world with contextual intelligence, to the <strong>Smart Winter Hat</strong> that adapts its warmth to your body and environment, each piece represents years of research condensed into seconds of effortless interaction. Wearable tech that you\'ll forget you\'re wearing, until the moment you need it most.</p><h3 style="font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; color: #111827;">Technofurniture</h3><p>Furniture should never demand attention—it should command presence. Our technofurniture pieces like the <strong>Holographic Display Chair</strong> and <strong>Minimalist Smart Side Table</strong> exist as sculptural statements that happen to be brilliantly functional. Gesture-controlled lighting. Adaptive comfort that learns your preferences. Surfaces that transform into displays and back into minimalist elegance. This is furniture for people who refuse to choose between form and function.</p><p style="margin-top: 2rem; font-style: italic; color: #6b7280;">Each DemoLux piece is produced in extremely limited quantities. We do not mass-produce. We curate.</p>',
            layout: 'full-width'
          },
          {
            section_title: 'A Global Standard',
            content: '<p>Since our founding, DemoLux has earned recognition from institutions that matter:</p><ul style="list-style: none; padding: 0; margin: 2rem 0;"><li style="margin-bottom: 1rem;">🏆 <strong>Red Dot Design Award</strong> – Best of Best, 2020, 2022, 2024</li><li style="margin-bottom: 1rem;">🏆 <strong>Fast Company Innovation by Design</strong> – Wearables Category Winner, 2021</li><li style="margin-bottom: 1rem;">🏆 <strong>Wallpaper* Design Award</strong> – Best Smart Furniture, 2023</li><li style="margin-bottom: 1rem;">🏆 <strong>LVMH Innovation Award</strong> – Luxury Tech Category, 2024</li></ul><p>Our products are found in flagship stores in Copenhagen, Tokyo, New York, London, and Singapore. Private showrooms are available by appointment in Los Angeles, Dubai, and Milan. But DemoLux is more than a retail presence—it\'s a philosophy embraced by architects, technologists, and design enthusiasts who understand that the future should be beautiful.</p>',
            layout: 'centered'
          },
          {
            section_title: 'The Minds Behind the Vision',
            content: '<p>DemoLux is led by an interdisciplinary team of over 120 designers, engineers, researchers, and craftspeople spread across three continents. Our design studio in Copenhagen serves as creative headquarters. Our advanced materials lab in Tokyo pioneers new composites and interfaces. Our manufacturing partners—selected for ethical practices and generational expertise—are located in Northern Europe and Japan.</p><p>We believe in slow growth. Every hire is deliberate. Every partnership is long-term. We\'ve turned down acquisition offers from three major tech companies because independence matters. Our investors are individuals who share our vision, not quarterly earnings targets.</p><p>This is a company built for decades, not exits.</p>',
            layout: 'two-column'
          },
          {
            section_title: 'Be Part of Something Rare',
            content: '<p>DemoLux is not for everyone. Our products are created in limited quantities. Our prices reflect true cost—of materials, of craftsmanship, of innovation that takes years, not quarters.</p><p>But for those who value design that endures, technology that respects, and luxury that means something beyond status—DemoLux is inevitable.</p><p style="margin-top: 2rem; font-size: 1.25rem; font-weight: 500;">Welcome to the future of luxury.<br/>Welcome to DemoLux.</p>',
            layout: 'centered'
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
