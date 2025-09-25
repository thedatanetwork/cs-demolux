#!/usr/bin/env node

/**
 * Contentstack Setup Script for Demolux
 * 
 * This script creates all content types and sample content for the Demolux ecommerce site
 * using the Contentstack Management API.
 * 
 * Usage: node scripts/contentstack-setup.js
 */

// Load environment variables from .env file
require('dotenv').config();

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration - these should be set via environment variables
const config = {
  apiKey: process.env.CONTENTSTACK_API_KEY,
  managementToken: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'development',
  region: process.env.CONTENTSTACK_REGION || 'US'
};

// Base URLs for different regions
const getBaseUrl = (region) => {
  const urls = {
    'US': 'https://api.contentstack.io/v3',
    'EU': 'https://eu-api.contentstack.io/v3',
    'AZURE-NA': 'https://azure-na-api.contentstack.io/v3',
    'AZURE-EU': 'https://azure-eu-api.contentstack.io/v3'
  };
  return urls[region] || urls['US'];
};

const baseURL = getBaseUrl(config.region);

// Create axios instance with authentication
const api = axios.create({
  baseURL,
  headers: {
    'api_key': config.apiKey,
    'authorization': config.managementToken,
    'Content-Type': 'application/json'
  }
});

// Validation
function validateConfig() {
  if (!config.apiKey) {
    console.error('❌ CONTENTSTACK_API_KEY environment variable is required');
    process.exit(1);
  }
  
  if (!config.managementToken) {
    console.error('❌ CONTENTSTACK_MANAGEMENT_TOKEN environment variable is required');
    process.exit(1);
  }

  console.log('✅ Configuration validated');
  console.log(`📍 Region: ${config.region}`);
  console.log(`🌍 Environment: ${config.environment}`);
}

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

// Content Type Schemas
const contentTypeSchemas = {
  product: {
    "content_type": {
      "title": "Product",
      "uid": "product",
      "description": "Product catalog items for Demolux ecommerce",
      "schema": [
        {
          "display_name": "Title",
          "uid": "title",
          "data_type": "text",
          "mandatory": true,
          "unique": true,
          "field_metadata": {
            "_default": true,
            "version": 3
          },
          "multiple": false,
          "non_localizable": false
        },
        {
          "display_name": "URL",
          "uid": "url",
          "data_type": "text",
          "mandatory": false,
          "field_metadata": {
            "_default": true,
            "version": 3
          },
          "multiple": false,
          "unique": false,
          "non_localizable": false
        },
        {
          "data_type": "text",
          "display_name": "Description",
          "uid": "description",
          "field_metadata": {
            "description": "Product description",
            "default_value": "",
            "multiline": true,
            "version": 3
          },
          "format": "",
          "error_messages": {
            "format": ""
          },
          "multiple": false,
          "mandatory": true,
          "unique": false,
          "non_localizable": false
        },
        {
          "data_type": "file",
          "display_name": "Featured Images",
          "uid": "featured_image",
          "extensions": [],
          "field_metadata": {
            "description": "Product images",
            "rich_text_type": "standard",
            "image": true,
            "options": []
          },
          "mandatory": true,
          "multiple": true,
          "dimension": {
            "width": {
              "min": null,
              "max": null
            },
            "height": {
              "min": null,
              "max": null
            }
          },
          "unique": false,
          "non_localizable": false
        },
        {
          "data_type": "number",
          "display_name": "Price",
          "uid": "price",
          "field_metadata": {
            "description": "Product price in USD",
            "default_value": null
          },
          "mandatory": true,
          "multiple": false,
          "unique": false,
          "non_localizable": false
        },
        {
          "data_type": "text",
          "display_name": "Category",
          "uid": "category",
          "field_metadata": {
            "description": "Product category (wearable-tech or technofurniture)",
            "default_value": "wearable-tech"
          },
          "mandatory": true,
          "multiple": false,
          "unique": false,
          "non_localizable": false
        },
        {
          "data_type": "link",
          "display_name": "Call to Action",
          "uid": "call_to_action",
          "field_metadata": {
            "description": "CTA button",
            "default_value": {
              "title": "Shop Now",
              "url": ""
            }
          },
          "mandatory": false,
          "multiple": false,
          "non_localizable": false,
          "unique": false
        }
      ],
      "last_activity": {},
      "maintain_revisions": true,
      "description": "Product catalog items for Demolux luxury ecommerce",
      "options": {
        "is_page": true,
        "singleton": false,
        "title": "title",
        "sub_title": [],
        "url_pattern": "/:title",
        "url_prefix": "/products/"
      }
    }
  },

  blog_post: {
    "content_type": {
      "title": "Blog Post",
      "uid": "blog_post",
      "description": "Blog posts and articles",
      "schema": [
        {
          "display_name": "Title",
          "uid": "title",
          "data_type": "text",
          "mandatory": true,
          "unique": true,
          "field_metadata": {
            "_default": true,
            "version": 3
          },
          "multiple": false,
          "non_localizable": false
        },
        {
          "display_name": "URL",
          "uid": "url",
          "data_type": "text",
          "mandatory": false,
          "field_metadata": {
            "_default": true,
            "version": 3
          },
          "multiple": false,
          "unique": false,
          "non_localizable": false
        },
        {
          "data_type": "text",
          "display_name": "Excerpt",
          "uid": "excerpt",
          "field_metadata": {
            "description": "Brief summary of the post",
            "default_value": "",
            "multiline": true,
            "version": 3
          },
          "multiple": false,
          "mandatory": false,
          "unique": false,
          "non_localizable": false
        },
        {
          "data_type": "json",
          "display_name": "Content",
          "uid": "content",
          "field_metadata": {
            "allow_json_rte": true,
            "embed_entry": false,
            "description": "Main blog post content",
            "default_value": "",
            "multiline": true,
            "rich_text_type": "advanced",
            "options": []
          },
          "mandatory": true,
          "multiple": false,
          "unique": false,
          "non_localizable": false
        },
        {
          "data_type": "file",
          "display_name": "Featured Image",
          "uid": "featured_image",
          "extensions": [],
          "field_metadata": {
            "description": "Featured image for the blog post",
            "rich_text_type": "standard",
            "image": true,
            "options": []
          },
          "mandatory": false,
          "multiple": true,
          "unique": false,
          "non_localizable": false
        },
        {
          "data_type": "text",
          "display_name": "Author",
          "uid": "author",
          "field_metadata": {
            "description": "Author name",
            "default_value": "",
            "version": 3
          },
          "multiple": false,
          "mandatory": false,
          "unique": false,
          "non_localizable": false
        },
        {
          "data_type": "isodate",
          "display_name": "Publish Date",
          "uid": "publish_date",
          "field_metadata": {
            "description": "When to publish this post",
            "default_value": ""
          },
          "multiple": false,
          "mandatory": true,
          "unique": false,
          "non_localizable": false
        },
        {
          "data_type": "text",
          "display_name": "Post Tags",
          "uid": "post_tags",
          "field_metadata": {
            "description": "Blog post tags",
            "default_value": "",
            "version": 3
          },
          "multiple": true,
          "mandatory": false,
          "unique": false,
          "non_localizable": false
        }
      ],
      "options": {
        "is_page": true,
        "singleton": false,
        "title": "title",
        "sub_title": [],
        "url_pattern": "/:title",
        "url_prefix": "/blog/"
      }
    }
  },

  navigation_menu: {
    "content_type": {
      "title": "Navigation Menu",
      "uid": "navigation_menu",
      "description": "Dynamic navigation menus",
      "schema": [
        {
          "data_type": "text",
          "display_name": "Menu Name",
          "uid": "menu_name",
          "field_metadata": {
            "description": "Human-readable menu name",
            "default_value": ""
          },
          "mandatory": true,
          "multiple": false,
          "unique": false
        },
        {
          "data_type": "text",
          "display_name": "Menu ID",
          "uid": "menu_id",
          "field_metadata": {
            "description": "Unique menu identifier",
            "default_value": ""
          },
          "mandatory": true,
          "multiple": false,
          "unique": true
        },
        {
          "data_type": "text",
          "display_name": "Menu Location",
          "uid": "menu_location",
          "field_metadata": {
            "description": "Where this menu appears (header, footer, sidebar, mobile)",
            "default_value": "header"
          },
          "mandatory": true,
          "multiple": false,
          "unique": false
        },
        {
          "data_type": "group",
          "display_name": "Menu Items",
          "uid": "menu_items",
          "field_metadata": {
            "description": "Individual menu items"
          },
          "mandatory": false,
          "multiple": true,
          "schema": [
            {
              "data_type": "text",
              "display_name": "Label",
              "uid": "label",
              "field_metadata": {
                "description": "Text displayed for this menu item"
              },
              "mandatory": true,
              "multiple": false,
              "unique": false
            },
            {
              "data_type": "text",
              "display_name": "URL",
              "uid": "url",
              "field_metadata": {
                "description": "Link destination"
              },
              "mandatory": true,
              "multiple": false,
              "unique": false
            },
            {
              "data_type": "text",
              "display_name": "Icon Name",
              "uid": "icon_name",
              "field_metadata": {
                "description": "Optional Lucide React icon name"
              },
              "mandatory": false,
              "multiple": false,
              "unique": false
            },
            {
              "data_type": "number",
              "display_name": "Sort Order",
              "uid": "sort_order",
              "field_metadata": {
                "description": "Display order (lower = first)",
                "default_value": 1
              },
              "mandatory": false,
              "multiple": false,
              "unique": false
            },
            {
              "data_type": "boolean",
              "display_name": "Is Active",
              "uid": "is_active",
              "field_metadata": {
                "description": "Whether this menu item is active",
                "default_value": true
              },
              "mandatory": false,
              "multiple": false,
              "unique": false
            }
          ]
        },
        {
          "data_type": "boolean",
          "display_name": "Is Active",
          "uid": "is_active",
          "field_metadata": {
            "description": "Whether this menu is active",
            "default_value": true
          },
          "mandatory": false,
          "multiple": false,
          "unique": false
        }
      ],
      "options": {
        "is_page": false,
        "singleton": false,
        "title": "menu_name",
        "sub_title": []
      }
    }
  },

  site_settings: {
    "content_type": {
      "title": "Site Settings",
      "uid": "site_settings",
      "description": "Global site configuration",
      "schema": [
        {
          "data_type": "text",
          "display_name": "Site Name",
          "uid": "site_name",
          "field_metadata": {
            "description": "Name of the website",
            "default_value": "Demolux"
          },
          "mandatory": true,
          "multiple": false,
          "unique": false
        },
        {
          "data_type": "text",
          "display_name": "Tagline",
          "uid": "tagline",
          "field_metadata": {
            "description": "Site tagline or slogan",
            "default_value": ""
          },
          "mandatory": false,
          "multiple": false,
          "unique": false
        },
        {
          "data_type": "file",
          "display_name": "Logo",
          "uid": "logo",
          "extensions": [],
          "field_metadata": {
            "description": "Site logo",
            "rich_text_type": "standard",
            "image": true
          },
          "mandatory": false,
          "multiple": false,
          "unique": false,
          "non_localizable": false
        },
        {
          "data_type": "group",
          "display_name": "Contact Info",
          "uid": "contact_info",
          "field_metadata": {
            "description": "Contact information"
          },
          "mandatory": false,
          "multiple": false,
          "schema": [
            {
              "data_type": "text",
              "display_name": "Email",
              "uid": "email",
              "mandatory": true,
              "multiple": false
            },
            {
              "data_type": "text",
              "display_name": "Phone",
              "uid": "phone",
              "mandatory": false,
              "multiple": false
            },
            {
              "data_type": "text",
              "display_name": "Address",
              "uid": "address",
              "field_metadata": {
                "multiline": true
              },
              "mandatory": false,
              "multiple": false
            }
          ]
        },
        {
          "data_type": "group",
          "display_name": "Social Links",
          "uid": "social_links",
          "field_metadata": {
            "description": "Social media links"
          },
          "mandatory": false,
          "multiple": false,
          "schema": [
            {
              "data_type": "text",
              "display_name": "Instagram",
              "uid": "instagram",
              "mandatory": false,
              "multiple": false
            },
            {
              "data_type": "text",
              "display_name": "Twitter",
              "uid": "twitter",
              "mandatory": false,
              "multiple": false
            },
            {
              "data_type": "text",
              "display_name": "LinkedIn",
              "uid": "linkedin",
              "mandatory": false,
              "multiple": false
            },
            {
              "data_type": "text",
              "display_name": "YouTube",
              "uid": "youtube",
              "mandatory": false,
              "multiple": false
            }
          ]
        }
      ],
      "options": {
        "is_page": false,
        "singleton": true,
        "title": "site_name",
        "sub_title": []
      }
    }
  }
};

// Main execution functions
async function createContentType(contentTypeKey) {
  console.log(`📝 Creating content type: ${contentTypeKey}`);
  
  try {
    const result = await apiCall('POST', '/content_types', contentTypeSchemas[contentTypeKey]);
    console.log(`✅ Created content type: ${result.content_type.title} (${result.content_type.uid})`);
    return result.content_type;
  } catch (error) {
    if (error.response?.data?.error_message?.includes('already exists')) {
      console.log(`⚠️  Content type ${contentTypeKey} already exists, skipping...`);
      return null;
    }
    throw error;
  }
}

async function createAllContentTypes() {
  console.log('\n🏗️  Creating Content Types...\n');
  
  const contentTypes = Object.keys(contentTypeSchemas);
  const results = [];
  
  for (const contentType of contentTypes) {
    try {
      const result = await createContentType(contentType);
      results.push(result);
      await delay(1000); // Rate limiting
    } catch (error) {
      console.error(`❌ Failed to create content type ${contentType}:`, error.message);
    }
  }
  
  return results.filter(Boolean);
}

async function main() {
  try {
    console.log('🚀 Starting Contentstack Setup for Demolux\n');
    
    // Validate configuration
    validateConfig();
    
    // Test API connection
    console.log('\n🔍 Testing API connection...');
    const testResponse = await api.get('/environments');
    console.log('✅ API connection successful');
    
    // Create content types
    await createAllContentTypes();
    
    console.log('\n✅ Contentstack setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: node scripts/create-sample-content.js');
    console.log('2. Update your .env.local with the Contentstack credentials');
    console.log('3. Test your Next.js app with: npm run dev');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  api,
  contentTypeSchemas,
  createContentType,
  createAllContentTypes
};
