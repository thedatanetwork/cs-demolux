#!/usr/bin/env node

/**
 * Create Modular Category Page Content Type and Entries
 * Creates the modular_category_page content type with modular blocks support
 * and seeds initial entries for wearable-tech and technofurniture categories
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

// Configuration
const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'dev',
};

// Content Type Schema
const modularCategoryPageSchema = {
  title: 'Modular Category Page',
  uid: 'modular_category_page',
  description: 'Category landing pages with modular block support. Add content sections after the products grid.',
  schema: [
    {
      display_name: 'Title',
      uid: 'title',
      data_type: 'text',
      mandatory: true,
      help_text: 'Internal title for this category page'
    },
    {
      display_name: 'Category Slug',
      uid: 'category_slug',
      data_type: 'text',
      display_type: 'dropdown',
      enum: {
        advanced: false,
        choices: [
          { value: 'wearable-tech' },
          { value: 'technofurniture' }
        ]
      },
      mandatory: true,
      unique: true,
      help_text: 'Select which category this page is for (must be unique)'
    },
    {
      display_name: 'Hero Title',
      uid: 'hero_title',
      data_type: 'text',
      mandatory: true,
      help_text: 'Main heading displayed in the hero section'
    },
    {
      display_name: 'Hero Description',
      uid: 'hero_description',
      data_type: 'text',
      field_metadata: { multiline: true },
      mandatory: true,
      help_text: 'Description text displayed under the hero title'
    },
    {
      display_name: 'Hero Badge Text',
      uid: 'hero_badge_text',
      data_type: 'text',
      mandatory: false,
      help_text: 'Small badge/label shown above the title (optional)'
    },
    {
      display_name: 'Products Display',
      uid: 'products_display',
      data_type: 'group',
      schema: [
        {
          display_name: 'Layout',
          uid: 'layout',
          data_type: 'text',
          display_type: 'dropdown',
          enum: {
            advanced: false,
            choices: [
              { value: 'grid' },
              { value: 'list' }
            ]
          },
          mandatory: true
        },
        {
          display_name: 'Items Per Row',
          uid: 'items_per_row',
          data_type: 'number',
          min: 2,
          max: 4,
          mandatory: true
        },
        {
          display_name: 'Enable Filtering',
          uid: 'enable_filtering',
          data_type: 'boolean',
          mandatory: false
        },
        {
          display_name: 'Enable Sorting',
          uid: 'enable_sorting',
          data_type: 'boolean',
          mandatory: false
        }
      ],
      mandatory: false,
      help_text: 'Configure how products are displayed'
    },
    {
      display_name: 'Page Sections',
      uid: 'page_sections',
      data_type: 'blocks',
      blocks: [
        { reference_to: 'hero_section_block', title: 'Hero Section' },
        { reference_to: 'featured_content_grid_block', title: 'Featured Content Grid' },
        { reference_to: 'values_grid_block', title: 'Values Grid' },
        { reference_to: 'campaign_cta_block', title: 'Campaign CTA' },
        { reference_to: 'gallery_section_block', title: 'Gallery Section' },
        { reference_to: 'process_steps_block', title: 'Process Steps' },
        { reference_to: 'statistics_block', title: 'Statistics' },
        { reference_to: 'testimonials_block', title: 'Testimonials' },
        { reference_to: 'faq_block', title: 'FAQ' }
      ],
      multiple: true,
      mandatory: false,
      help_text: 'Add modular content blocks - these appear AFTER the products section'
    },
    {
      display_name: 'Meta Title',
      uid: 'meta_title',
      data_type: 'text',
      mandatory: false,
      help_text: 'SEO title (defaults to Hero Title if not set)'
    },
    {
      display_name: 'Meta Description',
      uid: 'meta_description',
      data_type: 'text',
      field_metadata: { multiline: true },
      mandatory: false,
      help_text: 'SEO description (defaults to Hero Description if not set)'
    }
  ],
  options: {
    is_page: true,
    singleton: false,
    sub_title: ['category_slug'],
    title: 'title'
  }
};

// Initial category entries (matching current hardcoded values)
const categoryEntries = [
  {
    title: 'Wearable Technology Category Page',
    category_slug: 'wearable-tech',
    hero_title: 'Wearable Technology',
    hero_description: 'Revolutionary wearable devices that seamlessly integrate into your lifestyle. From quantum smartwatches to neural fitness bands, discover the future on your wrist.',
    hero_badge_text: 'Wearable Tech',
    products_display: {
      layout: 'grid',
      items_per_row: 4,
      enable_filtering: false,
      enable_sorting: false
    },
    meta_title: 'Wearable Technology | Demolux',
    meta_description: 'Revolutionary wearable devices that seamlessly integrate into your lifestyle. From quantum smartwatches to neural fitness bands, discover the future on your wrist.'
  },
  {
    title: 'Technofurniture Category Page',
    category_slug: 'technofurniture',
    hero_title: 'Technofurniture',
    hero_description: 'Smart furniture that adapts to your needs. Experience the perfect fusion of comfort, functionality, and cutting-edge technology in every piece.',
    hero_badge_text: 'Technofurniture',
    products_display: {
      layout: 'grid',
      items_per_row: 4,
      enable_filtering: false,
      enable_sorting: false
    },
    meta_title: 'Technofurniture | Demolux',
    meta_description: 'Smart furniture that adapts to your needs. Experience the perfect fusion of comfort, functionality, and cutting-edge technology in every piece.'
  }
];

async function createContentType(stack) {
  try {
    console.log('\n📋 Creating modular_category_page content type...');

    // Check if already exists
    try {
      await stack.contentType('modular_category_page').fetch();
      console.log('   ⚠️  Content type already exists (skipping)');
      return { success: true, skipped: true };
    } catch (error) {
      // Doesn't exist, continue
    }

    // Create the content type
    await stack.contentType().create({
      content_type: modularCategoryPageSchema
    });

    console.log('   ✅ Successfully created modular_category_page content type');
    return { success: true, skipped: false };

  } catch (error) {
    console.error('   ❌ Failed to create content type:', error.message);
    if (error.errors) {
      console.error('   Detailed errors:', JSON.stringify(error.errors, null, 2));
    }
    return { success: false, error: error.message };
  }
}

async function createCategoryEntry(stack, entryData) {
  try {
    console.log(`\n📝 Creating entry for "${entryData.category_slug}"...`);

    // Check if entry already exists
    try {
      const existingEntries = await stack.contentType('modular_category_page').entry().query({
        query: { category_slug: entryData.category_slug }
      }).find();

      if (existingEntries.items && existingEntries.items.length > 0) {
        const existingEntry = existingEntries.items[0];
        console.log(`   ⚠️  Entry already exists (UID: ${existingEntry.uid})`);
        console.log('   Updating existing entry...');

        // Update existing entry
        const entry = stack.contentType('modular_category_page').entry(existingEntry.uid);
        await entry.fetch();
        Object.assign(entry, entryData);
        await entry.update();

        // Publish
        await entry.publish({
          publishDetails: {
            environments: [stackConfig.environment],
            locales: ['en-us']
          }
        });

        console.log('   ✅ Entry updated and published');
        return { success: true, updated: true };
      }
    } catch (error) {
      // Entry doesn't exist, continue with creation
    }

    // Create new entry
    const entry = stack.contentType('modular_category_page').entry();
    Object.assign(entry, entryData);
    const createdEntry = await entry.create();

    console.log(`   ✅ Entry created (UID: ${createdEntry.uid})`);

    // Publish
    console.log('   📤 Publishing to', stackConfig.environment, 'environment...');
    await createdEntry.publish({
      publishDetails: {
        environments: [stackConfig.environment],
        locales: ['en-us']
      }
    });

    console.log('   ✅ Entry published');
    return { success: true, created: true };

  } catch (error) {
    console.error(`   ❌ Failed to create entry for "${entryData.category_slug}":`, error.message);
    if (error.errors) {
      console.error('   Detailed errors:', JSON.stringify(error.errors, null, 2));
    }
    return { success: false, error: error.message };
  }
}

async function main() {
  try {
    console.log('🚀 Setting up Modular Category Pages\n');
    console.log('This creates category pages with modular block support.\n');
    console.log('Configuration:');
    console.log(`   API Key: ${stackConfig.api_key ? stackConfig.api_key.substring(0, 10) + '...' : 'missing'}`);
    console.log(`   Management Token: ${stackConfig.management_token ? stackConfig.management_token.substring(0, 10) + '...' : 'missing'}`);
    console.log(`   Environment: ${stackConfig.environment}`);

    // Validate configuration
    if (!stackConfig.api_key || !stackConfig.management_token) {
      console.error('\n❌ Missing required environment variables');
      console.error('   Make sure scripts/.env has:');
      console.error('   - CONTENTSTACK_API_KEY');
      console.error('   - CONTENTSTACK_MANAGEMENT_TOKEN');
      process.exit(1);
    }

    // Initialize Management API
    const client = contentstack.client();
    const stack = client.stack({
      api_key: stackConfig.api_key,
      management_token: stackConfig.management_token
    });

    // Step 1: Create content type
    console.log('\n' + '='.repeat(60));
    console.log('Step 1: Create Content Type');
    console.log('='.repeat(60));

    const contentTypeResult = await createContentType(stack);
    if (!contentTypeResult.success) {
      console.error('\n❌ Cannot proceed without content type');
      process.exit(1);
    }

    // Step 2: Create entries
    console.log('\n' + '='.repeat(60));
    console.log('Step 2: Create Category Entries');
    console.log('='.repeat(60));

    const entryResults = {
      created: [],
      updated: [],
      failed: []
    };

    for (const entryData of categoryEntries) {
      const result = await createCategoryEntry(stack, entryData);
      if (result.success && result.created) {
        entryResults.created.push(entryData.category_slug);
      } else if (result.success && result.updated) {
        entryResults.updated.push(entryData.category_slug);
      } else {
        entryResults.failed.push({ slug: entryData.category_slug, error: result.error });
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));

    console.log(`\n✅ Content Type: ${contentTypeResult.skipped ? 'Already existed' : 'Created'}`);

    if (entryResults.created.length > 0) {
      console.log(`\n✅ Entries Created: ${entryResults.created.length}`);
      entryResults.created.forEach(slug => console.log(`   - ${slug}`));
    }

    if (entryResults.updated.length > 0) {
      console.log(`\n⚠️  Entries Updated: ${entryResults.updated.length}`);
      entryResults.updated.forEach(slug => console.log(`   - ${slug}`));
    }

    if (entryResults.failed.length > 0) {
      console.log(`\n❌ Entries Failed: ${entryResults.failed.length}`);
      entryResults.failed.forEach(item => console.log(`   - ${item.slug}: ${item.error}`));
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n🎉 Setup Complete!\n');
    console.log('📝 What you can do now:');
    console.log('   1. Visit /categories/wearable-tech or /categories/technofurniture');
    console.log('   2. Go to Contentstack → Entries → Modular Category Page');
    console.log('   3. Edit a category and add blocks to "Page Sections"');
    console.log('   4. Blocks will appear AFTER the products grid');
    console.log('   5. Publish and refresh the page to see changes\n');

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
