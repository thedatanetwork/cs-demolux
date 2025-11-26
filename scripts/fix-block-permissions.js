#!/usr/bin/env node

/**
 * Fix Block Content Type Permissions
 * Ensures block content types are properly configured to be referenceable
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
};

const blockUids = [
  'hero_section_block',
  'featured_content_grid_block',
  'values_grid_block',
  'campaign_cta_block'
];

async function fixBlockPermissions() {
  try {
    console.log('\n🔧 Fixing block content type permissions...\n');

    const client = contentstack.client();
    const stack = client.stack({
      api_key: stackConfig.api_key,
      management_token: stackConfig.management_token
    });

    for (const uid of blockUids) {
      console.log(`📝 Processing ${uid}...`);

      try {
        const contentType = await stack.contentType(uid).fetch();

        // Update options to ensure it's properly configured
        contentType.options = {
          ...contentType.options,
          is_page: false,
          singleton: false,
          title: 'title',
          sub_title: []
        };

        await contentType.update();
        console.log(`   ✅ Updated ${uid}`);
      } catch (error) {
        console.log(`   ❌ Failed to update ${uid}: ${error.message}`);
      }
    }

    console.log('\n✅ Block permissions updated!');
    console.log('\n📝 Next steps:');
    console.log('   1. Refresh your Contentstack UI');
    console.log('   2. Try adding entries to Page Sections again\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixBlockPermissions();
