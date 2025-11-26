#!/usr/bin/env node

/**
 * Update Modular Home Page to use Modular Blocks
 * Replaces JSON field with visual Modular Blocks field
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

// Configuration
const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
};

async function updateModularHomePage() {
  try {
    console.log('\n🔧 Updating Modular Home Page to use visual blocks...\n');

    // Initialize Management API
    const client = contentstack.client();
    const stack = client.stack({
      api_key: stackConfig.api_key,
      management_token: stackConfig.management_token
    });

    // Fetch the existing content type
    console.log('📝 Fetching Modular Home Page content type...');
    const contentType = await stack.contentType('modular_home_page').fetch();

    // Find the json_rte field (or page_sections if it exists)
    const schema = contentType.schema;
    let jsonFieldIndex = schema.findIndex(field => field.uid === 'json_rte');

    if (jsonFieldIndex === -1) {
      jsonFieldIndex = schema.findIndex(field => field.uid === 'page_sections');
    }

    if (jsonFieldIndex === -1) {
      console.log('❌ JSON field not found');
      return;
    }

    const oldFieldName = schema[jsonFieldIndex].display_name;
    console.log(`✅ Found "${oldFieldName}" field (currently ${schema[jsonFieldIndex].data_type})`);
    console.log('📝 Replacing with Modular Blocks field...');

    // Replace with Modular Blocks field
    schema[jsonFieldIndex] = {
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
    };

    // Update the content type
    contentType.schema = schema;
    await contentType.update();

    console.log('✅ Successfully updated Modular Home Page!');
    console.log('\n📝 Changes:');
    console.log('   ❌ Old: JSON field (required copy-pasting code)');
    console.log('   ✅ New: Modular Blocks field (visual UI)');
    console.log('\n🎉 Your editors can now build pages visually!');
    console.log('   No more JSON copy-pasting required.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  updateModularHomePage();
}

module.exports = { updateModularHomePage };
