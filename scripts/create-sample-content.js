#!/usr/bin/env node

/**
 * Create Sample Content Script for Demolux
 * 
 * This script creates sample entries for all content types in Contentstack
 * 
 * Usage: node scripts/create-sample-content.js
 */

// Load environment variables from .env file
require('dotenv').config();

const axios = require('axios');
const { api } = require('./contentstack-setup');

// Configuration
const config = {
  apiKey: process.env.CONTENTSTACK_API_KEY,
  managementToken: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'development',
  region: process.env.CONTENTSTACK_REGION || 'US'
};

// Utility functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function apiCall(method, endpoint, data = null) {
  try {
    const response = await api({
      method,
      url: endpoint,
      data
    });
    return response.data;
  } catch (error) {
    console.error(`❌ API Error (${method} ${endpoint}):`, error.response?.data || error.message);
    throw error;
  }
}

// Sample content data
const sampleContent = {
  products: [
    {
      "entry": {
        "title": "Quantum Smartwatch Pro",
        "url": "/products/quantum-smartwatch-pro",
        "description": "Revolutionary smartwatch with quantum processing capabilities, featuring a sapphire crystal display, titanium frame, and advanced biometric sensors. Track your health, productivity, and wellness with unprecedented precision.",
        "price": 2499,
        "category": "wearable-tech",
        "call_to_action": {
          "title": "Order Now",
          "href": "/products/quantum-smartwatch-pro"
        },
        "tags": ["smartwatch", "quantum", "premium", "health"]
      }
    },
    {
      "entry": {
        "title": "Neural Fitness Band Elite",
        "url": "/products/neural-fitness-band-elite", 
        "description": "Advanced fitness tracking with neural network analysis. Monitor your workouts, recovery, and performance optimization with AI-powered insights. Waterproof design with 14-day battery life.",
        "price": 899,
        "category": "wearable-tech",
        "call_to_action": {
          "title": "Shop Now",
          "href": "/products/neural-fitness-band-elite"
        },
        "tags": ["fitness", "neural", "AI", "wearable"]
      }
    },
    {
      "entry": {
        "title": "Adaptive Smart Desk X1",
        "url": "/products/adaptive-smart-desk-x1",
        "description": "Intelligent workspace that adapts to your needs. Features automatic height adjustment, integrated wireless charging, climate control, and productivity tracking. Crafted from sustainable bamboo with premium steel accents.",
        "price": 3999,
        "category": "technofurniture",
        "call_to_action": {
          "title": "Pre-Order",
          "href": "/products/adaptive-smart-desk-x1"
        },
        "tags": ["desk", "smart", "workspace", "adaptive"]
      }
    },
    {
      "entry": {
        "title": "Holographic Display Chair",
        "url": "/products/holographic-display-chair",
        "description": "The future of seating with integrated holographic display technology. Ergonomic design with posture correction, massage functions, and immersive entertainment capabilities. Premium leather with haptic feedback system.",
        "price": 7499,
        "category": "technofurniture",
        "call_to_action": {
          "title": "Learn More",
          "href": "/products/holographic-display-chair"
        },
        "tags": ["chair", "holographic", "luxury", "ergonomic"]
      }
    }
  ],

  blog_posts: [
    {
      "entry": {
        "title": "The Future of Wearable Technology: What to Expect in 2024",
        "url": "/blog/future-of-wearable-tech-2024",
        "excerpt": "Explore the cutting-edge innovations in wearable technology that will revolutionize how we live, work, and play in 2024 and beyond.",
        "content": {
          "type": "doc",
          "children": [
            {
              "type": "p",
              "children": [
                {
                  "text": "As we advance into 2024, wearable technology continues to evolve at an unprecedented pace. From neural interfaces to quantum sensors, discover the innovations that will shape how we interact with technology in our daily lives."
                }
              ]
            },
            {
              "type": "p",
              "children": [
                {
                  "text": "The integration of artificial intelligence and machine learning has transformed wearable devices from simple fitness trackers to sophisticated health monitoring systems that can predict and prevent health issues before they occur."
                }
              ]
            },
            {
              "type": "h2",
              "children": [
                {
                  "text": "Neural Interface Revolution"
                }
              ]
            },
            {
              "type": "p",
              "children": [
                {
                  "text": "The latest breakthrough in wearable technology is the development of non-invasive neural interfaces that can read brain signals and translate them into digital commands. This technology opens up entirely new possibilities for hands-free interaction with our devices."
                }
              ]
            }
          ]
        },
        "author": "Dr. Sarah Chen",
        "publish_date": "2024-01-15T08:00:00.000Z",
        "post_tags": ["wearable tech", "innovation", "future tech", "AI"]
      }
    },
    {
      "entry": {
        "title": "Sustainable Luxury: The Future of Technofurniture",
        "url": "/blog/sustainable-luxury-technofurniture",
        "excerpt": "How premium technofurniture brands are leading the way in sustainable design without compromising on luxury or functionality.",
        "content": {
          "type": "doc",
          "children": [
            {
              "type": "p",
              "children": [
                {
                  "text": "The luxury furniture industry is undergoing a revolutionary transformation, with smart technology and sustainable materials converging to create the future of home and office environments."
                }
              ]
            },
            {
              "type": "p",
              "children": [
                {
                  "text": "Today's discerning consumers demand more than just beautiful furniture - they want pieces that enhance their productivity, adapt to their needs, and align with their values around environmental responsibility."
                }
              ]
            }
          ]
        },
        "author": "Marcus Weber",
        "publish_date": "2024-01-10T10:00:00.000Z",
        "post_tags": ["technofurniture", "sustainability", "luxury", "design"]
      }
    }
  ],

  navigation_menus: [
    {
      "entry": {
        "menu_name": "Main Navigation",
        "menu_id": "main_nav",
        "menu_location": "header",
        "menu_items": [
          {
            "label": "Home",
            "url": "/",
            "sort_order": 1,
            "is_active": true
          },
          {
            "label": "Wearable Tech",
            "url": "/categories/wearable-tech",
            "sort_order": 2,
            "is_active": true
          },
          {
            "label": "Technofurniture", 
            "url": "/categories/technofurniture",
            "sort_order": 3,
            "is_active": true
          },
          {
            "label": "Blog",
            "url": "/blog",
            "sort_order": 4,
            "is_active": true
          },
          {
            "label": "About",
            "url": "/about",
            "sort_order": 5,
            "is_active": true
          },
          {
            "label": "Contact",
            "url": "/contact",
            "sort_order": 6,
            "is_active": true
          }
        ],
        "is_active": true
      }
    },
    {
      "entry": {
        "menu_name": "Footer Navigation",
        "menu_id": "footer_nav",
        "menu_location": "footer",
        "menu_items": [
          {
            "label": "Privacy Policy",
            "url": "/privacy",
            "sort_order": 1,
            "is_active": true
          },
          {
            "label": "Terms of Service",
            "url": "/terms",
            "sort_order": 2,
            "is_active": true
          },
          {
            "label": "Shipping & Returns",
            "url": "/shipping",
            "sort_order": 3,
            "is_active": true
          },
          {
            "label": "Support",
            "url": "/support",
            "sort_order": 4,
            "is_active": true
          }
        ],
        "is_active": true
      }
    }
  ],

  site_settings: [
    {
      "entry": {
        "site_name": "Demolux",
        "tagline": "Where Innovation Meets Luxury",
        "contact_info": {
          "email": "hello@demolux.com",
          "phone": "+1 (555) 123-4567",
          "address": "123 Innovation Drive\nTech City, TC 12345"
        },
        "social_links": {
          "instagram": "https://instagram.com/demolux",
          "twitter": "https://twitter.com/demolux",
          "linkedin": "https://linkedin.com/company/demolux",
          "youtube": "https://youtube.com/demolux"
        }
      }
    }
  ]
};

// Content creation functions
async function createEntry(contentType, entryData) {
  console.log(`📝 Creating ${contentType} entry: ${entryData.entry.title || entryData.entry.menu_name || entryData.entry.site_name}`);
  
  try {
    const result = await apiCall('POST', `/content_types/${contentType}/entries`, entryData);
    console.log(`✅ Created entry: ${result.entry.title || result.entry.menu_name || result.entry.site_name}`);
    
    // Publish the entry
    try {
      await api.post(`/content_types/${contentType}/entries/${result.entry.uid}/publish`, {
        "entry": {
          "environments": [config.environment],
          "locales": ["en-us"]
        }
      });
      console.log(`📢 Published entry: ${result.entry.uid}`);
    } catch (publishError) {
      console.warn(`⚠️  Could not publish entry ${result.entry.uid}:`, publishError.message);
    }
    
    return result.entry;
  } catch (error) {
    if (error.response?.data?.error_message?.includes('already exists') || 
        error.response?.data?.error_message?.includes('unique')) {
      console.log(`⚠️  Entry already exists, skipping...`);
      return null;
    }
    throw error;
  }
}

async function createAllEntries() {
  console.log('\n🏗️  Creating Sample Content...\n');
  
  const results = {
    products: [],
    blog_posts: [],
    navigation_menus: [],
    site_settings: []
  };
  
  // Create products
  console.log('📦 Creating Products...');
  for (const product of sampleContent.products) {
    try {
      const result = await createEntry('product', product);
      if (result) results.products.push(result);
      await delay(1000);
    } catch (error) {
      console.error(`❌ Failed to create product:`, error.message);
    }
  }
  
  // Create blog posts
  console.log('\n📝 Creating Blog Posts...');
  for (const post of sampleContent.blog_posts) {
    try {
      const result = await createEntry('blog_post', post);
      if (result) results.blog_posts.push(result);
      await delay(1000);
    } catch (error) {
      console.error(`❌ Failed to create blog post:`, error.message);
    }
  }
  
  // Create navigation menus
  console.log('\n🧭 Creating Navigation Menus...');
  for (const menu of sampleContent.navigation_menus) {
    try {
      const result = await createEntry('navigation_menu', menu);
      if (result) results.navigation_menus.push(result);
      await delay(1000);
    } catch (error) {
      console.error(`❌ Failed to create navigation menu:`, error.message);
    }
  }
  
  // Create site settings
  console.log('\n⚙️  Creating Site Settings...');
  for (const settings of sampleContent.site_settings) {
    try {
      const result = await createEntry('site_settings', settings);
      if (result) results.site_settings.push(result);
      await delay(1000);
    } catch (error) {
      console.error(`❌ Failed to create site settings:`, error.message);
    }
  }
  
  return results;
}

async function main() {
  try {
    console.log('🚀 Creating Sample Content for Demolux\n');
    
    // Validation
    if (!config.apiKey || !config.managementToken) {
      console.error('❌ Missing required environment variables');
      process.exit(1);
    }
    
    // Test API connection
    console.log('🔍 Testing API connection...');
    const testResponse = await api.get('/environments');
    console.log('✅ API connection successful');
    
    // Create all sample content
    const results = await createAllEntries();
    
    console.log('\n📊 Creation Summary:');
    console.log(`✅ Products: ${results.products.length}`);
    console.log(`✅ Blog Posts: ${results.blog_posts.length}`);
    console.log(`✅ Navigation Menus: ${results.navigation_menus.length}`);
    console.log(`✅ Site Settings: ${results.site_settings.length}`);
    
    console.log('\n✅ Sample content creation completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update your .env.local with Contentstack credentials');
    console.log('2. Test your Next.js app: npm run dev');
    console.log('3. Visit Contentstack dashboard to upload product images');
    
  } catch (error) {
    console.error('❌ Content creation failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  sampleContent,
  createEntry,
  createAllEntries
};
