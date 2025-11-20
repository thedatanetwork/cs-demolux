#!/usr/bin/env node

/**
 * Restore Product URLs
 * Restores URL values for products that lost data during field type conversion
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

// Known product URLs (from create-new-products.js)
const knownProductURLs = {
  'LuminFrame™ Ambient Display Mirror': '/products/luminframe-ambient-display-mirror',
  'HaloVibe™ Resonance Table': '/products/halovibe-resonance-table',
  'FluxBand™ Kinetic Wearable Display': '/products/fluxband-kinetic-wearable-display',
  'EtherSphere™ Floating Light Orb': '/products/ethersphere-floating-light-orb',
  'AeroSlate™ Smart Wall Panel': '/products/aeroslate-smart-wall-panel',
  'VeloChair™ Motion-Adaptive Lounge Seat': '/products/velochair-motion-adaptive-lounge-seat',
  'PrismFold™ Pocket Hologram Projector': '/products/prismfold-pocket-hologram-projector',
  'PulseLine™ Interactive Floor Strip': '/products/pulseline-interactive-floor-strip'
};

// Helper function to generate URL slug from title
function generateSlugFromTitle(title) {
  return '/products/' + title
    .toLowerCase()
    .replace(/™/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function restoreProductURLs() {
  try {
    console.log('🚀 Restoring product URLs...\n');

    // Get all products
    const entries = await stack.contentType('product').entry().query().find();
    console.log(`📦 Found ${entries.items.length} products\n`);

    let restoredCount = 0;
    let skippedCount = 0;
    let generatedCount = 0;

    for (const entry of entries.items) {
      const title = entry.title;
      const currentURL = entry.url;

      // Check if URL exists (could be string or object with href)
      const urlExists = currentURL && (
        (typeof currentURL === 'string' && currentURL.length > 0) ||
        (typeof currentURL === 'object' && currentURL.href && currentURL.href.length > 0)
      );

      const displayURL = typeof currentURL === 'object' ? currentURL.href : currentURL;

      console.log(`\n📋 Processing: ${title}`);
      console.log(`   Current URL: ${displayURL || '(empty)'}`);

      // Skip if URL already exists
      if (urlExists) {
        console.log('   ✅ URL already exists, skipping');
        skippedCount++;
        continue;
      }

      // Try to find known URL
      let restoredURL = knownProductURLs[title];
      let isGenerated = false;

      // If not in known URLs, generate from title
      if (!restoredURL) {
        restoredURL = generateSlugFromTitle(title);
        isGenerated = true;
        console.log(`   ⚠️  URL not in known list, generating: ${restoredURL}`);
      } else {
        console.log(`   ✅ Found known URL: ${restoredURL}`);
      }

      // Update the entry
      try {
        const entryToUpdate = await stack.contentType('product').entry(entry.uid).fetch();
        // URL field type (link) expects an object with title and href
        entryToUpdate.url = {
          title: title,
          href: restoredURL
        };
        await entryToUpdate.update();

        console.log(`   ✅ URL restored successfully`);

        if (isGenerated) {
          generatedCount++;
        } else {
          restoredCount++;
        }

        // Republish the entry
        await entryToUpdate.publish({
          publishDetails: {
            environments: [stackConfig.environment],
            locales: ['en-us']
          }
        });
        console.log(`   ✅ Published to ${stackConfig.environment}`);

      } catch (error) {
        console.error(`   ❌ Failed to update: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log(`   ✅ Restored from known URLs: ${restoredCount}`);
    console.log(`   🔧 Generated from titles: ${generatedCount}`);
    console.log(`   ⏭️  Skipped (already had URLs): ${skippedCount}`);
    console.log('='.repeat(60));

    if (generatedCount > 0) {
      console.log('\n⚠️  IMPORTANT: Some URLs were auto-generated from titles.');
      console.log('   Please verify these in Contentstack and update if needed.');
    }

  } catch (error) {
    console.error('\n❌ Failed to restore URLs:');
    console.error(`   ${error.message}`);
    if (error.errors) {
      console.error(JSON.stringify(error.errors, null, 2));
    }
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  restoreProductURLs().catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
}

module.exports = { restoreProductURLs };
