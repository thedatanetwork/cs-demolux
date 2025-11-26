#!/usr/bin/env node

/**
 * Update Modular Home Page to use Multiple References
 * This gives editors a clean UI to add blocks without JSON
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
};

async function updateToReferenceField() {
  try {
    console.log('\n🔧 Updating Modular Home Page for visual block building...\n');

    const client = contentstack.client();
    const stack = client.stack({
      api_key: stackConfig.api_key,
      management_token: stackConfig.management_token
    });

    console.log('📝 Fetching Modular Home Page content type...');
    const contentType = await stack.contentType('modular_home_page').fetch();

    // Find the existing JSON field
    const schema = contentType.schema;
    let jsonFieldIndex = schema.findIndex(field => field.uid === 'json_rte');

    if (jsonFieldIndex === -1) {
      jsonFieldIndex = schema.findIndex(field => field.uid === 'page_sections');
    }

    if (jsonFieldIndex === -1) {
      console.log('❌ Field not found');
      return;
    }

    console.log(`✅ Found existing field`);
    console.log('📝 Replacing with Multiple Reference field...\n');

    // Replace with Multiple Reference field
    // This allows editors to click "Add Entry" and select/create blocks
    schema[jsonFieldIndex] = {
      display_name: 'Page Sections',
      uid: 'page_sections',
      data_type: 'reference',
      reference_to: [
        'hero_section_block',
        'featured_content_grid_block',
        'values_grid_block',
        'campaign_cta_block'
      ],
      field_metadata: {
        ref_multiple: true,
        ref_multiple_content_types: true
      },
      multiple: true,
      mandatory: false,
      help_text: 'Click "Add Entry" to add blocks. Create new or select existing blocks. Drag to reorder.'
    };

    // Update the content type
    contentType.schema = schema;
    await contentType.update();

    console.log('✅ Successfully updated Modular Home Page!');
    console.log('\n📝 What changed:');
    console.log('   ❌ Old: JSON field (copy-paste code)');
    console.log('   ✅ New: Multiple Reference field (visual UI)');
    console.log('\n🎯 How editors use it:');
    console.log('   1. Click "Add Entry" button');
    console.log('   2. Choose to create new or select existing block');
    console.log('   3. Fill in fields visually');
    console.log('   4. Drag blocks to reorder');
    console.log('   5. Blocks can be reused across pages!\n');
    console.log('✨ Much better than JSON!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.errors) {
      console.error('Details:', error.errors);
    }
    process.exit(1);
  }
}

updateToReferenceField();
