#!/usr/bin/env node

/**
 * Fix Collection Products Field
 * Updates the products reference field to allow multiple selections
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

// Configuration
const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
};

async function fixCollectionProductsField() {
  try {
    console.log('\n🔧 Fixing Collection Products Field...\n');

    // Initialize Management API
    const client = contentstack.client();
    const stack = client.stack({
      api_key: stackConfig.api_key,
      management_token: stackConfig.management_token
    });

    // Fetch the Collection content type
    console.log('📝 Fetching Collection content type...');
    const contentType = await stack.contentType('collection').fetch();

    // Find the products field
    const schema = contentType.schema;
    const productsFieldIndex = schema.findIndex(field => field.uid === 'products');

    if (productsFieldIndex === -1) {
      console.log('❌ Products field not found in Collection content type');
      return;
    }

    console.log('✅ Found products field');

    // Update the field to allow multiple selections
    schema[productsFieldIndex] = {
      display_name: 'Products',
      uid: 'products',
      data_type: 'reference',
      field_metadata: {
        ref_multiple: true,
        ref_multiple_content_types: true
      },
      reference_to: ['product'],
      multiple: true,
      mandatory: false
    };

    // Update the content type
    console.log('📝 Updating Collection content type...');
    contentType.schema = schema;
    await contentType.update();

    console.log('✅ Successfully updated Collection content type!');
    console.log('\n📝 The Products field now allows multiple selections.');
    console.log('   Please refresh your Contentstack UI and try again.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  fixCollectionProductsField();
}

module.exports = { fixCollectionProductsField };
