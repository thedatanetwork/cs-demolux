#!/usr/bin/env node

/**
 * Migrate URL Fields Script
 * Converts text-based URL fields to proper Contentstack URL (link) type fields
 * for blog_post and product content types
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'dev',
};

const client = contentstack.client();
const stack = client.stack({
  api_key: stackConfig.api_key,
  management_token: stackConfig.management_token
});

/**
 * Update a content type's URL field from text to link type
 */
async function migrateContentTypeUrlField(contentTypeUid, urlPrefix) {
  console.log(`\n📋 Migrating ${contentTypeUid} URL field...`);

  try {
    // Fetch the content type
    const contentType = await stack.contentType(contentTypeUid).fetch();

    // Find the current URL field
    const urlFieldIndex = contentType.schema.findIndex(f => f.uid === 'url');

    if (urlFieldIndex === -1) {
      console.log(`   ⚠️  No 'url' field found in ${contentTypeUid}`);
      return;
    }

    const currentField = contentType.schema[urlFieldIndex];
    console.log(`   Current field type: ${currentField.data_type}`);

    if (currentField.data_type === 'link') {
      console.log(`   ✅ Already a link type field!`);
      return;
    }

    // Replace with proper link (URL) field
    contentType.schema[urlFieldIndex] = {
      display_name: 'URL',
      uid: 'url',
      data_type: 'link',
      mandatory: true,
      unique: true,
      field_metadata: {
        description: `URL path for the ${contentTypeUid.replace('_', ' ')} page`,
        default_value: null,
        version: 3
      }
    };

    // Update the content type
    await contentType.update();
    console.log(`   ✅ Updated ${contentTypeUid} schema to use link type`);

  } catch (error) {
    console.error(`   ❌ Error updating ${contentTypeUid}:`, error.message);
    throw error;
  }
}

/**
 * Convert existing entry URL values from string to link object format
 */
async function migrateEntryUrls(contentTypeUid, urlPrefix) {
  console.log(`\n📝 Migrating ${contentTypeUid} entry URLs...`);

  try {
    const entries = await stack.contentType(contentTypeUid).entry().query().find();
    console.log(`   Found ${entries.items.length} entries to migrate`);

    let migrated = 0;
    let skipped = 0;

    for (const entryData of entries.items) {
      try {
        const entry = await stack.contentType(contentTypeUid).entry(entryData.uid).fetch();

        // Check if URL is already an object (link format)
        if (typeof entry.url === 'object' && entry.url !== null) {
          console.log(`   ⏭️  ${entry.title} - already migrated`);
          skipped++;
          continue;
        }

        // Convert string URL to link object format
        const currentUrl = entry.url || '';
        let href = currentUrl;

        // Ensure proper URL format
        if (!href.startsWith('/')) {
          // Generate slug from title
          const slug = entry.title.toLowerCase()
            .replace(/[™®©]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
          href = `${urlPrefix}/${slug}`;
        }

        entry.url = {
          title: entry.title,
          href: href
        };

        await entry.update();
        console.log(`   ✅ ${entry.title} -> ${href}`);
        migrated++;

        // Publish the updated entry
        try {
          await entry.publish({
            publishDetails: {
              environments: [stackConfig.environment],
              locales: ['en-us']
            }
          });
        } catch (pubError) {
          console.log(`      ⚠️  Could not auto-publish: ${pubError.message}`);
        }

      } catch (entryError) {
        console.error(`   ❌ Error migrating ${entryData.title}:`, entryError.message);
      }
    }

    console.log(`\n   Summary: ${migrated} migrated, ${skipped} skipped`);

  } catch (error) {
    console.error(`   ❌ Error fetching ${contentTypeUid} entries:`, error.message);
  }
}

async function main() {
  console.log('🔄 URL Field Migration Script');
  console.log('='.repeat(70));
  console.log('\nThis script will:');
  console.log('1. Update content type schemas to use proper URL (link) field type');
  console.log('2. Convert existing entry URL values to link object format');
  console.log('');

  try {
    // Step 1: Migrate blog_post
    console.log('\n' + '='.repeat(70));
    console.log('BLOG_POST MIGRATION');
    console.log('='.repeat(70));

    await migrateContentTypeUrlField('blog_post', '/blog');
    await migrateEntryUrls('blog_post', '/blog');

    // Step 2: Migrate product
    console.log('\n' + '='.repeat(70));
    console.log('PRODUCT MIGRATION');
    console.log('='.repeat(70));

    await migrateContentTypeUrlField('product', '/products');
    await migrateEntryUrls('product', '/products');

    console.log('\n' + '='.repeat(70));
    console.log('🎉 Migration Complete!');
    console.log('='.repeat(70));
    console.log('\n⚠️  IMPORTANT: You may need to update your code to handle the new URL format.');
    console.log('   The URL field is now an object: { title: string, href: string }');
    console.log('   Access the path using: entry.url.href or entry.url (if using URL field getter)\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

main();
