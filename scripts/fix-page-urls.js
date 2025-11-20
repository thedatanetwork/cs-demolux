#!/usr/bin/env node

/**
 * Fix Page URLs
 * Updates page slugs to match the correct site URLs
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
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

// Initialize Management API
const client = contentstack.client();
const stack = client.stack({
  api_key: stackConfig.api_key,
  management_token: stackConfig.management_token
});

// Correct page URL mappings
const pageURLMappings = {
  'About Us': '/about',
  'Contact Us': '/contact',
  'Privacy Policy': '/privacy',
  'Shipping & Returns': '/shipping',
  'Support': '/support',
  'Terms of Service': '/terms'
};

async function fixPageURLs() {
  try {
    console.log('🚀 Fixing page URLs...\n');

    // Get all pages
    const entries = await stack.contentType('page').entry().query().find();
    console.log(`📄 Found ${entries.items.length} pages\n`);

    let fixedCount = 0;

    for (const entry of entries.items) {
      const title = entry.title;
      const correctSlug = pageURLMappings[title];

      if (!correctSlug) {
        console.log(`⚠️  No mapping found for: ${title}`);
        continue;
      }

      console.log(`\n📋 Processing: ${title}`);
      console.log(`   Correct slug: ${correctSlug}`);

      try {
        const entryToUpdate = await stack.contentType('page').entry(entry.uid).fetch();

        // Update with correct slug
        entryToUpdate.slug = {
          title: title,
          href: correctSlug
        };

        await entryToUpdate.update();
        console.log(`   ✅ Slug updated successfully`);

        // Republish
        await entryToUpdate.publish({
          publishDetails: {
            environments: [stackConfig.environment],
            locales: ['en-us']
          }
        });
        console.log(`   ✅ Published to ${stackConfig.environment}`);

        fixedCount++;

      } catch (error) {
        console.error(`   ❌ Failed to update: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log(`   ✅ Fixed: ${fixedCount}`);
    console.log('='.repeat(60));

    console.log('\n✅ All page URLs have been fixed!');

  } catch (error) {
    console.error('\n❌ Failed to fix page URLs:');
    console.error(`   ${error.message}`);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  fixPageURLs().catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
}

module.exports = { fixPageURLs };
