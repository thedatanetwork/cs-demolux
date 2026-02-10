#!/usr/bin/env node

/**
 * Fix Visual Builder Page Settings
 * Updates content types to be recognized as pages in Visual Builder
 * and converts URL fields to proper text format
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

async function updateContentType(uid, updates) {
  console.log(`\n📋 Updating ${uid} content type...`);

  try {
    const contentType = await stack.contentType(uid).fetch();

    // Update options
    if (updates.options) {
      contentType.options = { ...contentType.options, ...updates.options };
      console.log('   New options:', JSON.stringify(contentType.options, null, 2));
    }

    // Update URL field if needed
    if (updates.urlFieldToText) {
      const urlFieldIndex = contentType.schema.findIndex(f => f.uid === 'url');
      if (urlFieldIndex !== -1) {
        const currentField = contentType.schema[urlFieldIndex];
        if (currentField.data_type === 'link') {
          console.log('   Converting URL field from link to text...');
          contentType.schema[urlFieldIndex] = {
            display_name: 'URL',
            uid: 'url',
            data_type: 'text',
            mandatory: true,
            unique: true,
            field_metadata: {
              _default: true,
              instruction: `URL path for Visual Builder (e.g., ${updates.urlExample || '/page-slug'})`,
              version: 3
            }
          };
        }
      }
    }

    await contentType.update();
    console.log(`   ✅ ${uid} content type updated`);

  } catch (error) {
    console.error(`   ❌ Error updating ${uid}:`, error.message);
  }
}

async function convertEntryUrls(contentTypeUid, urlPrefix) {
  console.log(`\n📝 Converting ${contentTypeUid} entry URLs to text format...`);

  try {
    const entries = await stack.contentType(contentTypeUid).entry().query().find();
    console.log(`   Found ${entries.items.length} entries`);

    let converted = 0;

    for (const entryData of entries.items) {
      try {
        const entry = await stack.contentType(contentTypeUid).entry(entryData.uid).fetch();

        // Check if URL is an object (link format) - convert to string
        if (typeof entry.url === 'object' && entry.url !== null) {
          const href = entry.url.href || '';
          entry.url = href;

          await entry.update();
          console.log(`   ✅ ${entry.title} -> ${href}`);
          converted++;

          // Publish
          try {
            await entry.publish({
              publishDetails: {
                environments: [stackConfig.environment],
                locales: ['en-us']
              }
            });
          } catch (pubError) {
            // Ignore publish errors
          }
        } else {
          console.log(`   ⏭️  ${entry.title} - already text format`);
        }

      } catch (entryError) {
        console.error(`   ❌ Error converting ${entryData.title}:`, entryError.message);
      }
    }

    console.log(`   Converted: ${converted}`);

  } catch (error) {
    console.error(`   ❌ Error:`, error.message);
  }
}

async function main() {
  console.log('🔧 Fix Visual Builder Page Settings');
  console.log('='.repeat(70));

  try {
    // Fix Product content type
    console.log('\n' + '='.repeat(70));
    console.log('PRODUCT');
    console.log('='.repeat(70));

    await updateContentType('product', {
      options: {
        is_page: true,
        url_pattern: '/:url',
        url_prefix: '/products/'
      },
      urlFieldToText: true,
      urlExample: '/products/product-name'
    });

    await convertEntryUrls('product', '/products');

    // Fix Blog Post content type
    console.log('\n' + '='.repeat(70));
    console.log('BLOG POST');
    console.log('='.repeat(70));

    await updateContentType('blog_post', {
      options: {
        is_page: true,
        url_pattern: '/:url',
        url_prefix: '/blog/'
      },
      urlFieldToText: true,
      urlExample: '/blog/post-title'
    });

    await convertEntryUrls('blog_post', '/blog');

    console.log('\n' + '='.repeat(70));
    console.log('🎉 Done!');
    console.log('='.repeat(70));
    console.log('\nProducts and Blog Posts should now appear in Visual Builder page list.');
    console.log('You may need to refresh the Visual Builder.');

  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    process.exit(1);
  }
}

main();
