#!/usr/bin/env node

/**
 * Create Modular Content Types Script
 * Creates all modular block content types and global content types for the Demolux site
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

// Configuration
const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'dev',
  region: process.env.CONTENTSTACK_REGION || 'US'
};

// Content Type Schemas
const contentTypeSchemas = {
  // Campaign Content Type
  campaign: {
    title: 'Campaign',
    uid: 'campaign',
    description: 'Reusable promotional campaigns for homepage, collection pages, etc.',
    schema: [
      {
        display_name: 'Title',
        uid: 'title',
        data_type: 'text',
        mandatory: true,
        unique: false
      },
      {
        display_name: 'Description',
        uid: 'description',
        data_type: 'text',
        field_metadata: { multiline: true },
        mandatory: false
      },
      {
        display_name: 'Start Date',
        uid: 'start_date',
        data_type: 'isodate',
        mandatory: false
      },
      {
        display_name: 'End Date',
        uid: 'end_date',
        data_type: 'isodate',
        mandatory: false
      },
      {
        display_name: 'Campaign Type',
        uid: 'campaign_type',
        data_type: 'text',
        display_type: 'dropdown',
        enum: {
          advanced: false,
          choices: [
            { value: 'seasonal' },
            { value: 'product_launch' },
            { value: 'sale' },
            { value: 'event' }
          ]
        },
        mandatory: true
      },
      {
        display_name: 'Media',
        uid: 'media',
        data_type: 'file',
        mandatory: false
      },
      {
        display_name: 'Primary CTA',
        uid: 'primary_cta',
        data_type: 'group',
        schema: [
          {
            display_name: 'Text',
            uid: 'text',
            data_type: 'text',
            mandatory: true
          },
          {
            display_name: 'URL',
            uid: 'url',
            data_type: 'text',
            mandatory: true
          }
        ],
        mandatory: true
      },
      {
        display_name: 'Secondary CTA',
        uid: 'secondary_cta',
        data_type: 'group',
        schema: [
          {
            display_name: 'Text',
            uid: 'text',
            data_type: 'text',
            mandatory: false
          },
          {
            display_name: 'URL',
            uid: 'url',
            data_type: 'text',
            mandatory: false
          }
        ],
        mandatory: false
      },
      {
        display_name: 'Is Active',
        uid: 'is_active',
        data_type: 'boolean',
        mandatory: false
      }
    ]
  },

  // Value Proposition Content Type
  value_proposition: {
    title: 'Value Proposition',
    uid: 'value_proposition',
    description: 'Reusable brand values, features, and USPs',
    schema: [
      {
        display_name: 'Title',
        uid: 'title',
        data_type: 'text',
        mandatory: true
      },
      {
        display_name: 'Icon',
        uid: 'icon',
        data_type: 'text',
        instruction: 'Icon name from lucide-react (e.g., Sparkles, Users, Globe)',
        mandatory: true
      },
      {
        display_name: 'Description',
        uid: 'description',
        data_type: 'text',
        field_metadata: { multiline: true },
        mandatory: true
      },
      {
        display_name: 'Detailed Content',
        uid: 'detailed_content',
        data_type: 'text',
        field_metadata: { multiline: true, rich_text_type: 'advanced' },
        mandatory: false
      },
      {
        display_name: 'Link URL',
        uid: 'link_url',
        data_type: 'text',
        mandatory: false
      },
      {
        display_name: 'Link Text',
        uid: 'link_text',
        data_type: 'text',
        mandatory: false
      }
    ]
  },

  // Feature Item Content Type
  feature_item: {
    title: 'Feature Item',
    uid: 'feature_item',
    description: 'Reusable feature highlights for hero sections, product pages, etc.',
    schema: [
      {
        display_name: 'Title',
        uid: 'title',
        data_type: 'text',
        mandatory: true
      },
      {
        display_name: 'Icon',
        uid: 'icon',
        data_type: 'text',
        instruction: 'Icon name from lucide-react (e.g., Award, Zap, Star)',
        mandatory: true
      },
      {
        display_name: 'Description',
        uid: 'description',
        data_type: 'text',
        mandatory: true
      },
      {
        display_name: 'Highlight Color',
        uid: 'highlight_color',
        data_type: 'text',
        instruction: 'Optional hex color code (e.g., #FFD700)',
        mandatory: false
      }
    ]
  },

  // Collection Content Type
  collection: {
    title: 'Collection',
    uid: 'collection',
    description: 'Curated product collections for Collection pages',
    schema: [
      {
        display_name: 'Title',
        uid: 'title',
        data_type: 'text',
        mandatory: true,
        unique: true
      },
      {
        display_name: 'Slug',
        uid: 'slug',
        data_type: 'link',
        mandatory: true,
        unique: true
      },
      {
        display_name: 'Description',
        uid: 'description',
        data_type: 'text',
        field_metadata: { multiline: true },
        mandatory: true
      },
      {
        display_name: 'Featured Image',
        uid: 'featured_image',
        data_type: 'file',
        mandatory: true
      },
      {
        display_name: 'Products',
        uid: 'products',
        data_type: 'reference',
        reference_to: ['product'],
        multiple: true,
        mandatory: false
      },
      {
        display_name: 'Collection Type',
        uid: 'collection_type',
        data_type: 'text',
        display_type: 'dropdown',
        enum: {
          advanced: false,
          choices: [
            { value: 'seasonal' },
            { value: 'curated' },
            { value: 'new_arrivals' },
            { value: 'best_sellers' },
            { value: 'limited_edition' }
          ]
        },
        mandatory: true
      },
      {
        display_name: 'Is Featured',
        uid: 'is_featured',
        data_type: 'boolean',
        mandatory: false
      },
      {
        display_name: 'Meta Title',
        uid: 'meta_title',
        data_type: 'text',
        mandatory: false
      },
      {
        display_name: 'Meta Description',
        uid: 'meta_description',
        data_type: 'text',
        field_metadata: { multiline: true },
        mandatory: false
      }
    ]
  },

  // Lookbook Page Content Type
  lookbook_page: {
    title: 'Lookbook Page',
    uid: 'lookbook_page',
    description: 'Editorial-style gallery pages for lifestyle content',
    schema: [
      {
        display_name: 'Title',
        uid: 'title',
        data_type: 'text',
        mandatory: true,
        unique: true
      },
      {
        display_name: 'Slug',
        uid: 'slug',
        data_type: 'link',
        mandatory: true,
        unique: true
      },
      {
        display_name: 'Description',
        uid: 'description',
        data_type: 'text',
        field_metadata: { multiline: true },
        mandatory: true
      },
      {
        display_name: 'Season',
        uid: 'season',
        data_type: 'text',
        instruction: 'e.g., Spring 2025, Holiday 2024',
        mandatory: false
      },
      {
        display_name: 'Featured Image',
        uid: 'featured_image',
        data_type: 'file',
        mandatory: true
      },
      {
        display_name: 'Page Sections',
        uid: 'page_sections',
        data_type: 'json',
        field_metadata: {
          allow_json_rte: true,
          instruction: 'Modular blocks for the lookbook content'
        },
        mandatory: false,
        multiple: true
      },
      {
        display_name: 'Products',
        uid: 'products',
        data_type: 'reference',
        reference_to: ['product'],
        multiple: true,
        mandatory: false
      },
      {
        display_name: 'Meta Title',
        uid: 'meta_title',
        data_type: 'text',
        mandatory: false
      },
      {
        display_name: 'Meta Description',
        uid: 'meta_description',
        data_type: 'text',
        field_metadata: { multiline: true },
        mandatory: false
      }
    ]
  }
};

async function createContentType(stack, contentTypeData) {
  try {
    console.log(`\n📝 Creating content type: ${contentTypeData.title}...`);

    // Check if content type already exists
    try {
      const existingCT = await stack.contentType(contentTypeData.uid).fetch();
      console.log(`   ⚠️  Content type "${contentTypeData.title}" already exists (skipping)`);
      return { success: true, skipped: true };
    } catch (error) {
      // Content type doesn't exist, continue with creation
    }

    // Create the content type
    const contentType = await stack.contentType().create({
      content_type: {
        title: contentTypeData.title,
        uid: contentTypeData.uid,
        description: contentTypeData.description,
        schema: contentTypeData.schema
      }
    });

    console.log(`   ✅ Successfully created "${contentTypeData.title}"`);
    return { success: true, skipped: false };

  } catch (error) {
    console.error(`   ❌ Failed to create "${contentTypeData.title}":`, error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  try {
    console.log('🚀 Creating Modular Content Types for Demolux\n');
    console.log('Configuration:');
    console.log(`   API Key: ${stackConfig.api_key ? stackConfig.api_key.substring(0, 10) + '...' : 'missing'}`);
    console.log(`   Management Token: ${stackConfig.management_token ? stackConfig.management_token.substring(0, 10) + '...' : 'missing'}`);
    console.log(`   Environment: ${stackConfig.environment}`);
    console.log(`   Region: ${stackConfig.region}`);

    // Validate configuration
    if (!stackConfig.api_key || !stackConfig.management_token) {
      console.error('\n❌ Missing required environment variables:');
      console.error('   CONTENTSTACK_API_KEY');
      console.error('   CONTENTSTACK_MANAGEMENT_TOKEN');
      console.error('\nCreate a .env file in the scripts directory with your credentials.');
      process.exit(1);
    }

    // Initialize Management API
    const client = contentstack.client();
    const stack = client.stack({
      api_key: stackConfig.api_key,
      management_token: stackConfig.management_token
    });

    console.log('\n📦 Content types to create:');
    console.log('   1. Campaign');
    console.log('   2. Value Proposition');
    console.log('   3. Feature Item');
    console.log('   4. Collection');
    console.log('   5. Lookbook Page');

    // Create content types
    const results = {
      created: [],
      skipped: [],
      failed: []
    };

    for (const [key, ctData] of Object.entries(contentTypeSchemas)) {
      const result = await createContentType(stack, ctData);

      if (result.success && !result.skipped) {
        results.created.push(ctData.title);
      } else if (result.skipped) {
        results.skipped.push(ctData.title);
      } else {
        results.failed.push({ title: ctData.title, error: result.error });
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Created: ${results.created.length} content types`);
    if (results.created.length > 0) {
      results.created.forEach(title => console.log(`   - ${title}`));
    }

    console.log(`\n⚠️  Skipped: ${results.skipped.length} content types (already exist)`);
    if (results.skipped.length > 0) {
      results.skipped.forEach(title => console.log(`   - ${title}`));
    }

    if (results.failed.length > 0) {
      console.log(`\n❌ Failed: ${results.failed.length} content types`);
      results.failed.forEach(item => console.log(`   - ${item.title}: ${item.error}`));
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n🎉 Modular content types setup complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Log into Contentstack to verify the new content types');
    console.log('   2. Create sample entries for each content type');
    console.log('   3. Visit /home-modular to see the modular home page');
    console.log('   4. Check IMPLEMENTATION_GUIDE.md for detailed usage instructions');

  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main };
