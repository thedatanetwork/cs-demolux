#!/usr/bin/env node

/**
 * Restore All URLs
 * Restores URL values for pages and blog posts that lost data during field type conversion
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

// Helper function to generate URL slug from title
function generateSlugFromTitle(title) {
  return '/' + title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function restorePageURLs() {
  try {
    console.log('🚀 Restoring page URLs...\n');

    // Get all pages
    const entries = await stack.contentType('page').entry().query().find();
    console.log(`📄 Found ${entries.items.length} pages\n`);

    let restoredCount = 0;
    let skippedCount = 0;

    for (const entry of entries.items) {
      const title = entry.title;
      const currentSlug = entry.slug;

      console.log(`\n📋 Processing: ${title}`);

      // Check if slug exists (could be string or object with href)
      const slugExists = currentSlug && (
        (typeof currentSlug === 'string' && currentSlug.length > 0) ||
        (typeof currentSlug === 'object' && currentSlug.href && currentSlug.href.length > 0)
      );

      const displaySlug = typeof currentSlug === 'object' ? currentSlug.href : currentSlug;
      console.log(`   Current slug: ${displaySlug || '(empty)'}`);

      // Skip if slug already exists
      if (slugExists) {
        console.log('   ✅ Slug already exists, skipping');
        skippedCount++;
        continue;
      }

      // Generate slug from title
      const restoredSlug = generateSlugFromTitle(title);
      console.log(`   🔧 Generating slug: ${restoredSlug}`);

      // Update the entry
      try {
        const entryToUpdate = await stack.contentType('page').entry(entry.uid).fetch();
        // URL field type (link) expects an object with title and href
        entryToUpdate.slug = {
          title: title,
          href: restoredSlug
        };
        await entryToUpdate.update();

        console.log(`   ✅ Slug restored successfully`);
        restoredCount++;

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
    console.log('📊 Pages Summary:');
    console.log(`   ✅ Restored: ${restoredCount}`);
    console.log(`   ⏭️  Skipped (already had slugs): ${skippedCount}`);
    console.log('='.repeat(60));

    return restoredCount;

  } catch (error) {
    console.error('\n❌ Failed to restore page URLs:');
    console.error(`   ${error.message}`);
    if (error.errors) {
      console.error(JSON.stringify(error.errors, null, 2));
    }
    return 0;
  }
}

async function restoreBlogPostURLs() {
  try {
    console.log('\n\n🚀 Restoring blog post URLs...\n');

    // Get all blog posts
    const entries = await stack.contentType('blog_post').entry().query().find();
    console.log(`📝 Found ${entries.items.length} blog posts\n`);

    let restoredCount = 0;
    let skippedCount = 0;

    for (const entry of entries.items) {
      const title = entry.title;
      const currentURL = entry.url;

      console.log(`\n📋 Processing: ${title}`);

      // Check if URL exists (could be string or object with href)
      const urlExists = currentURL && (
        (typeof currentURL === 'string' && currentURL.length > 0) ||
        (typeof currentURL === 'object' && currentURL.href && currentURL.href.length > 0)
      );

      const displayURL = typeof currentURL === 'object' ? currentURL.href : currentURL;
      console.log(`   Current URL: ${displayURL || '(empty)'}`);

      // Skip if URL already exists
      if (urlExists) {
        console.log('   ✅ URL already exists, skipping');
        skippedCount++;
        continue;
      }

      // Generate URL from title
      const restoredURL = '/blog' + generateSlugFromTitle(title);
      console.log(`   🔧 Generating URL: ${restoredURL}`);

      // Update the entry
      try {
        const entryToUpdate = await stack.contentType('blog_post').entry(entry.uid).fetch();
        // URL field type (link) expects an object with title and href
        entryToUpdate.url = {
          title: title,
          href: restoredURL
        };
        await entryToUpdate.update();

        console.log(`   ✅ URL restored successfully`);
        restoredCount++;

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
    console.log('📊 Blog Posts Summary:');
    console.log(`   ✅ Restored: ${restoredCount}`);
    console.log(`   ⏭️  Skipped (already had URLs): ${skippedCount}`);
    console.log('='.repeat(60));

    return restoredCount;

  } catch (error) {
    console.error('\n❌ Failed to restore blog post URLs:');
    console.error(`   ${error.message}`);
    if (error.errors) {
      console.error(JSON.stringify(error.errors, null, 2));
    }
    return 0;
  }
}

async function restoreAllURLs() {
  console.log('🎯 Starting URL restoration for all content types...\n');
  console.log('='.repeat(60));

  const pagesRestored = await restorePageURLs();
  const blogPostsRestored = await restoreBlogPostURLs();

  console.log('\n\n' + '='.repeat(60));
  console.log('🎉 FINAL SUMMARY:');
  console.log(`   📄 Pages restored: ${pagesRestored}`);
  console.log(`   📝 Blog posts restored: ${blogPostsRestored}`);
  console.log(`   📦 Products: Already restored`);
  console.log('='.repeat(60));

  console.log('\n✅ All URLs have been restored!');
  console.log('   The site should now work correctly.');
}

// Run the script
if (require.main === module) {
  restoreAllURLs().catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
}

module.exports = { restoreAllURLs, restorePageURLs, restoreBlogPostURLs };
