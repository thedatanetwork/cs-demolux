#!/usr/bin/env node

/**
 * Add Additional Images Field to Product Content Type
 * Updates the Product schema to support multiple product images
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

// Validate configuration
if (!stackConfig.api_key || !stackConfig.management_token) {
  console.error('❌ Missing required environment variables:');
  console.error('   CONTENTSTACK_API_KEY');
  console.error('   CONTENTSTACK_MANAGEMENT_TOKEN');
  console.error('\nMake sure your scripts/.env file has the correct credentials.');
  process.exit(1);
}

// Initialize Management API
const client = contentstack.client();

const stack = client.stack({
  api_key: stackConfig.api_key,
  management_token: stackConfig.management_token
});

// Field definition for additional_images
const additionalImagesField = {
  display_name: 'Additional Images',
  uid: 'additional_images',
  data_type: 'file',
  multiple: true,
  mandatory: false,
  field_metadata: {
    description: 'Upload additional product images. These will be displayed in the product gallery and cycled through on hover in product listings.',
    instruction: 'Add multiple images showing different angles, details, or lifestyle contexts. Recommended: 3-5 images per product.',
  },
  dimension: {
    width: {
      min: null,
      max: null
    },
    height: {
      min: null,
      max: null
    }
  },
  rich_text_type: 'standard',
  extensions: []
};

async function addAdditionalImagesField() {
  try {
    console.log('🚀 Adding additional_images field to Product content type...\n');

    // Fetch the Product content type
    console.log('📋 Fetching Product content type...');
    const productContentType = await stack.contentType('product').fetch();

    console.log('✅ Found Product content type\n');

    // Check if additional_images field already exists
    const existingField = productContentType.schema.find(field => field.uid === 'additional_images');

    if (existingField) {
      console.log('⚠️  The additional_images field already exists in the Product content type!');
      console.log('   Field configuration:');
      console.log(`   - Display Name: ${existingField.display_name}`);
      console.log(`   - Data Type: ${existingField.data_type}`);
      console.log(`   - Multiple: ${existingField.multiple}`);
      console.log(`   - Mandatory: ${existingField.mandatory}`);
      console.log('\n✅ No changes needed. The Product content type is already configured correctly.');
      console.log('\n💡 Next steps:');
      console.log('   1. Edit products in Contentstack');
      console.log('   2. Upload additional images using the "Additional Images" field');
      console.log('   3. Save and publish products');
      console.log('   4. View the image gallery on product pages and hover effects on listings');
      return;
    }

    // Add the new field to the schema
    console.log('➕ Adding additional_images field to schema...');
    productContentType.schema.push(additionalImagesField);

    // Update the content type
    console.log('💾 Saving updated Product content type...');
    await productContentType.update();

    console.log('✅ Successfully added additional_images field to Product content type!');
    console.log('\n📝 Field Details:');
    console.log('   Display Name: Additional Images');
    console.log('   Field UID: additional_images');
    console.log('   Data Type: File (multiple)');
    console.log('   Mandatory: No (optional)');
    console.log('   Description: Upload additional product images for gallery display');

    console.log('\n🎉 Schema update complete!');
    console.log('\n💡 Next steps:');
    console.log('   1. Log into Contentstack dashboard');
    console.log('   2. Navigate to Content Models → Product to verify the new field');
    console.log('   3. Edit existing products and upload additional images');
    console.log('   4. Save and publish updated products');
    console.log('   5. View products on your site to see:');
    console.log('      - Image cycling on hover in product listings');
    console.log('      - Interactive gallery on product detail pages');

  } catch (error) {
    console.error('\n❌ Failed to add additional_images field:');
    console.error(`   ${error.message}`);

    if (error.errors) {
      console.error('\nDetailed errors:');
      console.error(JSON.stringify(error.errors, null, 2));
    }

    if (error.errorMessage) {
      console.error('\nError details:');
      console.error(error.errorMessage);
    }

    console.error('\n💡 Troubleshooting:');
    console.error('   - Verify your management token has write permissions');
    console.error('   - Ensure the Product content type exists');
    console.error('   - Check that you have permission to modify content types');
    console.error('   - Try running npm run test-connection first');

    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  addAdditionalImagesField();
}

module.exports = { addAdditionalImagesField };
