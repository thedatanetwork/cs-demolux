#!/usr/bin/env node

/**
 * Fix Collection URLs
 * Removes /collections/ prefix from slug.href fields
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'dev'
};

async function main() {
  try {
    console.log('\n🔧 Fixing Collection URLs\n');
    console.log('='.repeat(70));

    const client = contentstack.client();
    const stack = client.stack({
      api_key: stackConfig.api_key,
      management_token: stackConfig.management_token
    });

    // Fetch all collections
    console.log('\n📦 Fetching all collections...');
    const result = await stack.contentType('collection').entry().query().find();
    console.log(`   ✅ Found ${result.items.length} collections\n`);

    let fixedCount = 0;
    let alreadyCorrectCount = 0;

    for (const collection of result.items) {
      const currentHref = collection.slug?.href;

      if (!currentHref) {
        console.log(`   ⚠️  "${collection.title}" - No slug.href found, skipping`);
        continue;
      }

      // Check if href starts with /collections/
      if (currentHref.startsWith('/collections/')) {
        console.log(`   🔄 "${collection.title}"`);
        console.log(`      Old: ${currentHref}`);

        // Remove /collections/ prefix
        const newHref = currentHref.replace('/collections/', '');
        console.log(`      New: ${newHref}`);

        // Update the entry
        const entry = await stack.contentType('collection').entry(collection.uid).fetch();
        entry.slug = {
          title: collection.slug.title,
          href: newHref
        };

        await entry.update();

        // Try to publish, but don't fail if validation errors occur
        try {
          await entry.publish({
            publishDetails: {
              environments: [stackConfig.environment],
              locales: ['en-us']
            }
          });
          console.log(`      ✅ Fixed and published\n`);
        } catch (publishError) {
          console.log(`      ✅ Fixed (not published - please publish manually in CMS)`);
          console.log(`      ⚠️  Publish error: ${publishError.errorMessage || publishError.message}\n`);
        }

        fixedCount++;
      } else {
        console.log(`   ✓ "${collection.title}" - Already correct (${currentHref})`);
        alreadyCorrectCount++;
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('🎉 COMPLETE!');
    console.log('='.repeat(70));
    console.log(`\n✅ ${fixedCount} collection(s) fixed`);
    console.log(`✓ ${alreadyCorrectCount} collection(s) already correct\n`);

    if (fixedCount > 0) {
      console.log('📍 Collections are now accessible at:');
      console.log('   http://localhost:3000/collections/[slug]\n');
    }

  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
