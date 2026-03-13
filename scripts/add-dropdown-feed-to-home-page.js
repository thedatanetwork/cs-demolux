#!/usr/bin/env node

/**
 * Add Dynamic Product Feed (Dropdown) to Modular Home Page
 *
 * 1. Updates modular_home_page schema to accept dynamic_product_feed_dropdown in page_sections
 * 2. Creates a sample dropdown feed entry ("Homepage: Trending Now")
 * 3. Appends the feed entry to the homepage's page_sections
 * 4. Publishes everything
 *
 * This demonstrates that dynamic_product_feed_dropdown blocks can be composed
 * into any modular page alongside other block types (hero, values grid, etc.)
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'dev',
};

async function main() {
  console.log('='.repeat(60));
  console.log('Add Dropdown Feed Block to Modular Home Page');
  console.log('='.repeat(60));

  if (!stackConfig.api_key || !stackConfig.management_token) {
    console.error('Missing credentials in scripts/.env');
    process.exit(1);
  }

  const client = contentstack.client();
  const stack = client.stack({
    api_key: stackConfig.api_key,
    management_token: stackConfig.management_token,
  });

  // ── Step 1: Update modular_home_page schema ──────────────────────────
  console.log('\n--- Step 1: Add dynamic_product_feed_dropdown to page_sections ---');

  try {
    const contentType = await stack.contentType('modular_home_page').fetch();
    const schema = contentType.schema;
    const pageSectionsIndex = schema.findIndex(f => f.uid === 'page_sections');

    if (pageSectionsIndex === -1) {
      console.error('  Could not find page_sections field');
      process.exit(1);
    }

    const field = schema[pageSectionsIndex];
    const existing = field.reference_to || [];
    console.log(`  Current reference_to: [${existing.join(', ')}]`);

    if (existing.includes('dynamic_product_feed_dropdown')) {
      console.log('  -> Already includes dynamic_product_feed_dropdown (skipping)');
    } else {
      field.reference_to = [...existing, 'dynamic_product_feed_dropdown'];
      schema[pageSectionsIndex] = field;
      contentType.schema = schema;
      await contentType.update();
      console.log(`  -> Updated reference_to: [${field.reference_to.join(', ')}]`);
    }
  } catch (error) {
    console.error('  Schema update failed:', error.message);
    if (error.errors) console.error('  Details:', JSON.stringify(error.errors, null, 2));
  }

  // ── Step 2: Create a sample dropdown feed entry ──────────────────────
  console.log('\n--- Step 2: Create sample feed entry ---');

  const feedData = {
    title: 'Homepage: Trending Now',
    heading: 'Trending Now',
    subheading: 'The most popular products across all categories right now',
    anchor_id: 'trending-now',
    display_style: 'carousel',
    max_products: 10,
    cta_label: 'Shop All Products',
    cta_href: '/products',
    visibility: true,
    sort_order: 'most_popular',
    badge_label: 'Trending',
    rule_group: {
      include_tags: ['tag-bestseller'],
      in_stock_only: true,
      global_visibility_fallback: false,
    },
  };

  let feedUid = null;
  try {
    // Check if it already exists
    const existingEntries = await stack
      .contentType('dynamic_product_feed_dropdown')
      .entry()
      .query({ query: { title: feedData.title } })
      .find();

    if (existingEntries.items && existingEntries.items.length > 0) {
      feedUid = existingEntries.items[0].uid;
      console.log(`  ~ ${feedData.title} (exists: ${feedUid})`);
    } else {
      const created = await stack
        .contentType('dynamic_product_feed_dropdown')
        .entry()
        .create({ entry: feedData });
      feedUid = created.uid;
      console.log(`  + ${feedData.title} (created: ${feedUid})`);
    }

    // Publish the feed entry
    const feedEntry = await stack.contentType('dynamic_product_feed_dropdown').entry(feedUid).fetch();
    await feedEntry.publish({
      publishDetails: {
        environments: [stackConfig.environment, 'local'],
        locales: ['en-us'],
      },
    });
    console.log('  -> Published');
  } catch (error) {
    console.error('  Feed entry failed:', error.message);
    if (error.errors) console.error('  Details:', JSON.stringify(error.errors, null, 2));
  }

  if (!feedUid) {
    console.error('  No feed entry available — cannot add to homepage');
    process.exit(1);
  }

  // ── Step 3: Add feed entry to homepage page_sections ─────────────────
  console.log('\n--- Step 3: Add feed to homepage page_sections ---');

  try {
    // Find the modular_home_page entry
    const homeEntries = await stack
      .contentType('modular_home_page')
      .entry()
      .query()
      .find();

    if (!homeEntries.items || homeEntries.items.length === 0) {
      console.error('  No modular_home_page entry found');
      process.exit(1);
    }

    const homeEntry = homeEntries.items[0];
    console.log(`  Found homepage: ${homeEntry.title} (${homeEntry.uid})`);

    const sections = homeEntry.page_sections || [];
    console.log(`  Current sections: ${sections.length}`);

    // Check if already added
    const alreadyAdded = sections.some(
      s => s.uid === feedUid && s._content_type_uid === 'dynamic_product_feed_dropdown'
    );

    if (alreadyAdded) {
      console.log('  -> Feed already in page_sections (skipping)');
    } else {
      // Append the feed reference to page_sections
      sections.push({
        uid: feedUid,
        _content_type_uid: 'dynamic_product_feed_dropdown',
      });

      // Update and publish the homepage
      const entry = await stack.contentType('modular_home_page').entry(homeEntry.uid).fetch();
      entry.page_sections = sections;
      await entry.update();
      console.log(`  -> Added feed to page_sections (now ${sections.length} sections)`);

      await entry.publish({
        publishDetails: {
          environments: [stackConfig.environment, 'local'],
          locales: ['en-us'],
        },
      });
      console.log('  -> Homepage republished');
    }
  } catch (error) {
    console.error('  Homepage update failed:', error.message);
    if (error.errors) console.error('  Details:', JSON.stringify(error.errors, null, 2));
  }

  console.log('\n' + '='.repeat(60));
  console.log('DONE');
  console.log('='.repeat(60));
  console.log('\nThe homepage now includes a dynamic_product_feed_dropdown block.');
  console.log('Visit the homepage to see it rendered alongside other modular blocks.');
  console.log('In Contentstack, editors can reorder it within page_sections.\n');
}

if (require.main === module) {
  main().catch(e => { console.error(e.message); process.exit(1); });
}

module.exports = { main };
