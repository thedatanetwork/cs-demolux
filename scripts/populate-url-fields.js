#!/usr/bin/env node

/**
 * Populate URL Fields
 *
 * Sets URL values for products and blog posts based on their titles.
 * Run this after migrating to URL field type if URLs were cleared.
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'dev',
};

if (!stackConfig.api_key || !stackConfig.management_token) {
  console.error('❌ Missing CONTENTSTACK_API_KEY or CONTENTSTACK_MANAGEMENT_TOKEN');
  process.exit(1);
}

const client = contentstack.client();
const stack = client.stack({
  api_key: stackConfig.api_key,
  management_token: stackConfig.management_token
});

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[™®©]/g, '')  // Remove trademark symbols
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/-+/g, '-')      // Replace multiple - with single -
    .trim()
    .replace(/^-+|-+$/g, ''); // Trim - from start/end
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function populateProductUrls() {
  console.log('\n📦 Populating product URLs...');

  const query = stack.contentType('product').entry().query();
  const entries = await query.find();

  if (!entries.items?.length) {
    console.log('   No products found.');
    return 0;
  }

  let updated = 0;

  for (const entry of entries.items) {
    const slug = slugify(entry.title);
    const url = `/products/${slug}`;

    console.log(`   ${entry.title} → ${url}`);

    try {
      const entryToUpdate = await stack.contentType('product').entry(entry.uid).fetch();
      entryToUpdate.url = url;
      await entryToUpdate.update();
      updated++;
      await delay(300);
    } catch (err) {
      console.error(`   ❌ Failed: ${err.message}`);
    }
  }

  return updated;
}

async function populateBlogUrls() {
  console.log('\n📝 Populating blog post URLs...');

  const query = stack.contentType('blog_post').entry().query();
  const entries = await query.find();

  if (!entries.items?.length) {
    console.log('   No blog posts found.');
    return 0;
  }

  let updated = 0;

  for (const entry of entries.items) {
    const slug = slugify(entry.title);
    const url = `/blog/${slug}`;

    console.log(`   ${entry.title} → ${url}`);

    try {
      const entryToUpdate = await stack.contentType('blog_post').entry(entry.uid).fetch();
      entryToUpdate.url = url;
      await entryToUpdate.update();
      updated++;
      await delay(300);
    } catch (err) {
      console.error(`   ❌ Failed: ${err.message}`);
    }
  }

  return updated;
}

async function publishAll(contentTypeUid) {
  console.log(`\n🚀 Publishing ${contentTypeUid} entries...`);

  const query = stack.contentType(contentTypeUid).entry().query();
  const entries = await query.find();

  let published = 0;

  for (const entry of entries.items || []) {
    try {
      const e = await stack.contentType(contentTypeUid).entry(entry.uid).fetch();
      await e.publish({
        publishDetails: {
          environments: [stackConfig.environment],
          locales: ['en-us']
        }
      });
      console.log(`   ✅ ${entry.title}`);
      published++;
      await delay(500);
    } catch (err) {
      console.log(`   ⚠️  ${entry.title}: ${err.message?.substring(0, 50) || 'Failed'}`);
    }
  }

  return published;
}

async function run() {
  console.log('🚀 Populating URL Fields\n');
  console.log('='.repeat(50));

  const products = await populateProductUrls();
  const blogs = await populateBlogUrls();

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Updated ${products} products and ${blogs} blog posts`);

  console.log('\nPublishing changes...');
  await publishAll('product');
  await publishAll('blog_post');

  console.log('\n✅ Done! Check Contentstack to verify.');
}

run().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
