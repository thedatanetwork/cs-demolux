#!/usr/bin/env node

/**
 * Update URL Fields to URL Field Type
 * Converts text fields to URL field type for proper URL handling
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

// Content types to update
const contentTypesToUpdate = [
  {
    uid: 'product',
    fieldUid: 'url',
    displayName: 'URL',
    helpText: 'URL path for the product page (e.g., /products/smart-watch)',
    placeholderText: '/products/product-name'
  },
  {
    uid: 'blog_post',
    fieldUid: 'url',
    displayName: 'URL',
    helpText: 'URL path for the blog post (e.g., /blog/future-of-wearables)',
    placeholderText: '/blog/post-title'
  },
  {
    uid: 'page',
    fieldUid: 'slug',
    displayName: 'URL Slug',
    helpText: 'URL path for the page (e.g., /about or /contact)',
    placeholderText: '/page-name'
  }
];

async function updateURLField(contentTypeUid, fieldUid, displayName, helpText, placeholderText) {
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

    // Check if it's already a URL field type
    if (field.data_type === 'link') {
      console.log(`✅ Field '${fieldUid}' is already a URL field type in ${contentTypeUid}. No changes needed.`);
      return false;
    }

    console.log(`🔄 Converting '${fieldUid}' from ${field.data_type} to URL field type...`);

    // Update the field to URL type
    contentType.schema[fieldIndex] = {
      uid: fieldUid,
      data_type: 'link',
      display_name: displayName,
      mandatory: field.mandatory || false,
      unique: field.unique || false,
      field_metadata: {
        _default: true,
        placeholder: placeholderText,
        instruction: helpText
      }
    };

    // Save the updated content type
    console.log(`💾 Saving updated ${contentTypeUid} content type...`);
    await contentType.update();

    console.log(`✅ Successfully updated '${fieldUid}' to URL field type in ${contentTypeUid}`);
    return true;

  } catch (error) {
    console.error(`\n❌ Failed to update ${contentTypeUid}.${fieldUid}:`);
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

async function updateAllURLFields() {
  console.log('🚀 Updating URL fields to URL field type...\n');

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const config of contentTypesToUpdate) {
    const result = await updateURLField(
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
  console.log(`   ✅ Updated: ${successCount}`);
  console.log(`   ⏭️  Skipped (already URL type): ${skipCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log('='.repeat(60));

  if (successCount > 0) {
    console.log('\n💡 Next steps:');
    console.log('   1. Verify the changes in Contentstack dashboard');
    console.log('   2. Edit existing content entries if needed');
    console.log('   3. The site code will automatically work with URL fields');
    console.log('   4. URL fields provide better validation and uniqueness enforcement');
  }
}

// Run the script
if (require.main === module) {
  updateAllURLFields().catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
}

module.exports = { updateAllURLFields };
