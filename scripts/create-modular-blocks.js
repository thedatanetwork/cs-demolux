#!/usr/bin/env node

/**
 * Create Modular Blocks for Visual Page Building
 * Creates block content types and modular_home_page with Modular Blocks field
 * This gives editors a visual UI - NO JSON REQUIRED!
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

// Configuration
const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
};

// Block Content Type Schemas
const blockSchemas = {
  // Hero Section Block
  hero_section_block: {
    title: 'Hero Section Block',
    uid: 'hero_section_block',
    description: 'Hero section for page headers and campaigns',
    schema: [
      {
        display_name: 'Title',
        uid: 'title',
        data_type: 'text',
        mandatory: true
      },
      {
        display_name: 'Variant',
        uid: 'variant',
        data_type: 'text',
        display_type: 'dropdown',
        enum: {
          advanced: false,
          choices: [
            { value: 'split_hero' },
            { value: 'minimal_hero' },
            { value: 'image_hero' },
            { value: 'campaign_hero' }
          ]
        },
        mandatory: true
      },
      {
        display_name: 'Badge Text',
        uid: 'badge_text',
        data_type: 'text',
        mandatory: false
      },
      {
        display_name: 'Subtitle',
        uid: 'subtitle',
        data_type: 'text',
        mandatory: false
      },
      {
        display_name: 'Description',
        uid: 'description',
        data_type: 'text',
        field_metadata: { multiline: true },
        mandatory: false
      },
      {
        display_name: 'Background Image',
        uid: 'background_media',
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
      }
    ]
  },

  // Featured Content Grid Block
  featured_content_grid_block: {
    title: 'Featured Content Grid Block',
    uid: 'featured_content_grid_block',
    description: 'Grid showcasing products, blog posts, or collections',
    schema: [
      {
        display_name: 'Title',
        uid: 'title',
        data_type: 'text',
        mandatory: true
      },
      {
        display_name: 'Section Title',
        uid: 'section_title',
        data_type: 'text',
        mandatory: true
      },
      {
        display_name: 'Section Description',
        uid: 'section_description',
        data_type: 'text',
        mandatory: false
      },
      {
        display_name: 'Variant',
        uid: 'variant',
        data_type: 'text',
        display_type: 'dropdown',
        enum: {
          advanced: false,
          choices: [
            { value: 'product_grid' },
            { value: 'blog_grid' },
            { value: 'mixed_grid' },
            { value: 'collection_grid' }
          ]
        },
        mandatory: true
      },
      {
        display_name: 'Badge Text',
        uid: 'badge_text',
        data_type: 'text',
        mandatory: false
      },
      {
        display_name: 'Content Source',
        uid: 'content_source',
        data_type: 'text',
        display_type: 'dropdown',
        enum: {
          advanced: false,
          choices: [
            { value: 'manual' },
            { value: 'dynamic_recent' },
            { value: 'dynamic_featured' }
          ]
        },
        mandatory: true,
        help_text: 'Manual = select specific items, Dynamic = auto-populate'
      },
      {
        display_name: 'Manual Products (if manual)',
        uid: 'manual_products',
        data_type: 'reference',
        reference_to: ['product'],
        field_metadata: {
          ref_multiple: true,
          ref_multiple_content_types: true
        },
        multiple: true,
        mandatory: false
      },
      {
        display_name: 'Manual Blog Posts (if manual)',
        uid: 'manual_blog_posts',
        data_type: 'reference',
        reference_to: ['blog_post'],
        field_metadata: {
          ref_multiple: true,
          ref_multiple_content_types: true
        },
        multiple: true,
        mandatory: false
      },
      {
        display_name: 'Manual Collections (if manual)',
        uid: 'manual_collections',
        data_type: 'reference',
        reference_to: ['collection'],
        field_metadata: {
          ref_multiple: true,
          ref_multiple_content_types: true
        },
        multiple: true,
        mandatory: false
      },
      {
        display_name: 'Layout Style',
        uid: 'layout_style',
        data_type: 'text',
        display_type: 'dropdown',
        enum: {
          advanced: false,
          choices: [
            { value: 'grid-2' },
            { value: 'grid-3' },
            { value: 'grid-4' },
            { value: 'masonry' },
            { value: 'carousel' }
          ]
        },
        mandatory: true
      },
      {
        display_name: 'Show CTA Button',
        uid: 'show_cta',
        data_type: 'boolean',
        mandatory: false
      },
      {
        display_name: 'CTA Text',
        uid: 'cta_text',
        data_type: 'text',
        mandatory: false
      },
      {
        display_name: 'CTA URL',
        uid: 'cta_url',
        data_type: 'text',
        mandatory: false
      }
    ]
  },

  // Values Grid Block
  values_grid_block: {
    title: 'Values Grid Block',
    uid: 'values_grid_block',
    description: 'Display brand values, features, or USPs',
    schema: [
      {
        display_name: 'Title',
        uid: 'title',
        data_type: 'text',
        mandatory: true
      },
      {
        display_name: 'Section Title',
        uid: 'section_title',
        data_type: 'text',
        mandatory: true
      },
      {
        display_name: 'Section Description',
        uid: 'section_description',
        data_type: 'text',
        mandatory: false
      },
      {
        display_name: 'Badge Text',
        uid: 'badge_text',
        data_type: 'text',
        mandatory: false
      },
      {
        display_name: 'Values',
        uid: 'values',
        data_type: 'reference',
        reference_to: ['value_proposition'],
        field_metadata: {
          ref_multiple: true,
          ref_multiple_content_types: true
        },
        multiple: true,
        mandatory: true,
        help_text: 'Select Value Proposition entries to display'
      },
      {
        display_name: 'Layout Style',
        uid: 'layout_style',
        data_type: 'text',
        display_type: 'dropdown',
        enum: {
          advanced: false,
          choices: [
            { value: 'grid-2' },
            { value: 'grid-3' },
            { value: 'grid-4' },
            { value: 'horizontal-scroll' }
          ]
        },
        mandatory: true
      },
      {
        display_name: 'Card Style',
        uid: 'card_style',
        data_type: 'text',
        display_type: 'dropdown',
        enum: {
          advanced: false,
          choices: [
            { value: 'elevated' },
            { value: 'flat' },
            { value: 'bordered' },
            { value: 'minimal' }
          ]
        },
        mandatory: true
      }
    ]
  },

  // Campaign CTA Block
  campaign_cta_block: {
    title: 'Campaign CTA Block',
    uid: 'campaign_cta_block',
    description: 'Call-to-action section for campaigns and promotions',
    schema: [
      {
        display_name: 'Title',
        uid: 'title',
        data_type: 'text',
        mandatory: true
      },
      {
        display_name: 'Variant',
        uid: 'variant',
        data_type: 'text',
        display_type: 'dropdown',
        enum: {
          advanced: false,
          choices: [
            { value: 'full_width_cta' },
            { value: 'split_cta' },
            { value: 'centered_cta' },
            { value: 'announcement_banner' }
          ]
        },
        mandatory: true
      },
      {
        display_name: 'Description',
        uid: 'description',
        data_type: 'text',
        field_metadata: { multiline: true },
        mandatory: false
      },
      {
        display_name: 'Badge Text',
        uid: 'badge_text',
        data_type: 'text',
        mandatory: false
      },
      {
        display_name: 'Campaign Reference',
        uid: 'campaign_reference',
        data_type: 'reference',
        reference_to: ['campaign'],
        mandatory: false,
        help_text: 'Optional: Reference an existing campaign instead of manual entry'
      },
      {
        display_name: 'Background Image',
        uid: 'background_media',
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
        mandatory: false
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
      }
    ]
  }
};

async function createBlockContentType(stack, blockData) {
  try {
    console.log(`\n📝 Creating block: ${blockData.title}...`);

    // Check if already exists
    try {
      await stack.contentType(blockData.uid).fetch();
      console.log(`   ⚠️  Block "${blockData.title}" already exists (skipping)`);
      return { success: true, skipped: true };
    } catch (error) {
      // Doesn't exist, continue
    }

    // Create the block content type
    await stack.contentType().create({
      content_type: {
        title: blockData.title,
        uid: blockData.uid,
        description: blockData.description,
        schema: blockData.schema,
        options: {
          is_page: false,
          singleton: false,
          sub_title: [],
          title: 'title'
        }
      }
    });

    console.log(`   ✅ Successfully created "${blockData.title}"`);
    return { success: true, skipped: false };

  } catch (error) {
    console.error(`   ❌ Failed to create "${blockData.title}":`, error.message);
    return { success: false, error: error.message };
  }
}

async function createModularHomePage(stack) {
  try {
    console.log(`\n📝 Creating Modular Home Page content type...`);

    // Check if already exists
    try {
      await stack.contentType('modular_home_page').fetch();
      console.log(`   ⚠️  Modular Home Page already exists (skipping)`);
      return { success: true, skipped: true };
    } catch (error) {
      // Doesn't exist, continue
    }

    // Create modular home page with Modular Blocks field
    await stack.contentType().create({
      content_type: {
        title: 'Modular Home Page',
        uid: 'modular_home_page',
        description: 'Homepage with visual block builder - no JSON required!',
        schema: [
          {
            display_name: 'Title',
            uid: 'title',
            data_type: 'text',
            mandatory: true,
            unique: false
          },
          {
            display_name: 'Page Sections',
            uid: 'page_sections',
            data_type: 'blocks',
            blocks: [
              {
                reference_to: 'hero_section_block',
                title: 'Hero Section'
              },
              {
                reference_to: 'featured_content_grid_block',
                title: 'Featured Content Grid'
              },
              {
                reference_to: 'values_grid_block',
                title: 'Values Grid'
              },
              {
                reference_to: 'campaign_cta_block',
                title: 'Campaign CTA'
              }
            ],
            multiple: true,
            mandatory: false,
            help_text: 'Click "Add Block" to visually build your page - no coding required!'
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
        ],
        options: {
          is_page: true,
          singleton: true,
          sub_title: [],
          title: 'title'
        }
      }
    });

    console.log(`   ✅ Successfully created "Modular Home Page"`);
    return { success: true, skipped: false };

  } catch (error) {
    console.error(`   ❌ Failed to create Modular Home Page:`, error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  try {
    console.log('🚀 Creating Modular Blocks for Visual Page Building\n');
    console.log('This creates a VISUAL UI for editors - NO JSON REQUIRED!\n');
    console.log('Configuration:');
    console.log(`   API Key: ${stackConfig.api_key ? stackConfig.api_key.substring(0, 10) + '...' : 'missing'}`);
    console.log(`   Management Token: ${stackConfig.management_token ? stackConfig.management_token.substring(0, 10) + '...' : 'missing'}`);

    // Validate configuration
    if (!stackConfig.api_key || !stackConfig.management_token) {
      console.error('\n❌ Missing required environment variables');
      process.exit(1);
    }

    // Initialize Management API
    const client = contentstack.client();
    const stack = client.stack({
      api_key: stackConfig.api_key,
      management_token: stackConfig.management_token
    });

    console.log('\n📦 Step 1: Creating Block Content Types...');
    console.log('   (These are the building blocks editors can choose from)\n');

    const blockResults = {
      created: [],
      skipped: [],
      failed: []
    };

    // Create each block type
    for (const [key, blockData] of Object.entries(blockSchemas)) {
      const result = await createBlockContentType(stack, blockData);

      if (result.success && !result.skipped) {
        blockResults.created.push(blockData.title);
      } else if (result.skipped) {
        blockResults.skipped.push(blockData.title);
      } else {
        blockResults.failed.push({ title: blockData.title, error: result.error });
      }
    }

    console.log('\n📦 Step 2: Creating Modular Home Page...');
    console.log('   (This uses the Modular Blocks field for visual editing)\n');

    const pageResult = await createModularHomePage(stack);

    // Print summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 SUMMARY');
    console.log('='.repeat(70));

    console.log(`\n✅ Block Types Created: ${blockResults.created.length}`);
    if (blockResults.created.length > 0) {
      blockResults.created.forEach(title => console.log(`   - ${title}`));
    }

    console.log(`\n⚠️  Block Types Skipped: ${blockResults.skipped.length} (already exist)`);
    if (blockResults.skipped.length > 0) {
      blockResults.skipped.forEach(title => console.log(`   - ${title}`));
    }

    if (blockResults.failed.length > 0) {
      console.log(`\n❌ Block Types Failed: ${blockResults.failed.length}`);
      blockResults.failed.forEach(item => console.log(`   - ${item.title}: ${item.error}`));
    }

    if (pageResult.success && !pageResult.skipped) {
      console.log(`\n✅ Modular Home Page: Created`);
    } else if (pageResult.skipped) {
      console.log(`\n⚠️  Modular Home Page: Already exists`);
    } else {
      console.log(`\n❌ Modular Home Page: Failed`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n🎉 Setup Complete!');
    console.log('\n📝 How to use:');
    console.log('   1. Go to Contentstack → Entries → Modular Home Page');
    console.log('   2. Click "Add Block" in the Page Sections field');
    console.log('   3. Choose a block type from the dropdown');
    console.log('   4. Fill in the fields visually - NO JSON!');
    console.log('   5. Drag blocks to reorder them');
    console.log('   6. Publish and visit /home-modular\n');
    console.log('✨ Your editors will love this!\n');

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
