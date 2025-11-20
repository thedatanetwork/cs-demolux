#!/usr/bin/env node

/**
 * Revert URL Fields Back to Text Type
 * Emergency script to revert the link field type back to text
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

// Content types to revert
const contentTypesToRevert = [
  {
    uid: 'product',
    fieldUid: 'url',
    displayName: 'URL',
    helpText: 'Product URL path',
    placeholderText: '/products/product-name'
  },
  {
    uid: 'blog_post',
    fieldUid: 'url',
    displayName: 'URL',
    helpText: 'Blog post URL path',
    placeholderText: '/blog/post-title'
  },
  {
    uid: 'page',
    fieldUid: 'slug',
    displayName: 'URL Slug',
    helpText: 'Page URL slug',
    placeholderText: '/page-name'
  }
];

async function revertURLField(contentTypeUid, fieldUid, displayName, helpText, placeholderText) {
  try {
    console.log(`\n📋 Fetching ${contentTypeUid} content type...`);
    const contentType = await stack.contentType(contentTypeUid).fetch();

    // Find the field
    const fieldIndex = contentType.schema.findIndex(field => field.uid === fieldUid);

    if (fieldIndex === -1) {
      console.log(`⚠️  Field '${fieldUid}' not found in ${contentTypeUid} content type. Skipping...`);
      return false;
    }

    const field = contentType.schema[fieldIndex];

    // Check if it's a link field type
    if (field.data_type !== 'link') {
      console.log(`✅ Field '${fieldUid}' is already type '${field.data_type}' in ${contentTypeUid}. No changes needed.`);
      return false;
    }

    console.log(`🔄 Converting '${fieldUid}' from link back to text field type...`);

    // Revert the field to text type, preserving existing properties
    contentType.schema[fieldIndex] = {
      ...field,
      data_type: 'text',
      display_name: displayName,
      field_metadata: {
        _default: true,
        description: helpText,
        default_value: '',
        version: 3
      }
    };

    // Save the updated content type
    console.log(`💾 Saving updated ${contentTypeUid} content type...`);
    await contentType.update();

    console.log(`✅ Successfully reverted '${fieldUid}' to text field type in ${contentTypeUid}`);
    return true;

  } catch (error) {
    console.error(`\n❌ Failed to revert ${contentTypeUid}.${fieldUid}:`);
    console.error(`   ${error.message}`);

    if (error.errors) {
      console.error('\nDetailed errors:');
      console.error(JSON.stringify(error.errors, null, 2));
    }

    if (error.errorMessage) {
      console.error('\nError details:');
      console.error(error.errorMessage);
    }

    return false;
  }
}

async function revertAllURLFields() {
  console.log('🚀 Reverting URL fields back to text type...\n');

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const config of contentTypesToRevert) {
    const result = await revertURLField(
      config.uid,
      config.fieldUid,
      config.displayName,
      config.helpText,
      config.placeholderText
    );

    if (result === true) {
      successCount++;
    } else if (result === false) {
      skipCount++;
    } else {
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log(`   ✅ Reverted: ${successCount}`);
  console.log(`   ⏭️  Skipped: ${skipCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log('='.repeat(60));

  if (successCount > 0) {
    console.log('\n⚠️  IMPORTANT: URL data was likely lost during conversion.');
    console.log('   You will need to manually restore URL values for all entries.');
    console.log('   Check your product entries in Contentstack and re-enter the URLs.');
  }
}

// Run the script
if (require.main === module) {
  revertAllURLFields().catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
}

module.exports = { revertAllURLFields };
