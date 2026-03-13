#!/usr/bin/env node

/**
 * Seed Dropdown-Based Dynamic Feed Data
 *
 * Creates sample dynamic_product_feed_dropdown entries and a page entry.
 * Since the dropdown global field uses select fields (not references),
 * the values are simple strings — no reference UIDs to look up.
 *
 * Run AFTER: npm run create-dropdown-feed-schemas
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'dev',
};

async function ensureEntry(stack, contentTypeUid, data) {
  try {
    const existingEntries = await stack
      .contentType(contentTypeUid)
      .entry()
      .query({ query: { title: data.title } })
      .find();

    if (existingEntries.items && existingEntries.items.length > 0) {
      const uid = existingEntries.items[0].uid;
      console.log(`    ~ ${data.title} (exists: ${uid})`);
      return uid;
    }

    const created = await stack.contentType(contentTypeUid).entry().create({
      entry: data,
    });
    console.log(`    + ${data.title} (created: ${created.uid})`);
    return created.uid;
  } catch (error) {
    console.error(`    ! ${data.title}: ${error.message}`);
    if (error.errors) console.error('      Details:', JSON.stringify(error.errors, null, 2));
    return null;
  }
}

async function publishEntry(stack, contentTypeUid, entryUid) {
  try {
    const entry = await stack.contentType(contentTypeUid).entry(entryUid).fetch();
    await entry.publish({
      publishDetails: {
        environments: [stackConfig.environment, 'local'],
        locales: ['en-us'],
      },
    });
    return true;
  } catch (error) {
    const msg = error.message || '';
    if (msg.includes('already') || msg.includes('published')) return true;
    console.error(`    ! Publish failed for ${entryUid}: ${msg}`);
    return false;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Seed Dropdown-Based Dynamic Feed Data');
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

  // ── Feed entries ─────────────────────────────────────────────────────
  // Values are plain strings — dropdown fields return them directly
  console.log('\n--- Step 1: Create Feed Entries ---');

  const feedEntries = [
    {
      title: 'DD: New Arrivals',
      heading: 'New Arrivals',
      subheading: 'The latest additions to our luxury tech collection',
      anchor_id: 'dd-new-arrivals',
      display_style: 'carousel',
      max_products: 12,
      cta_label: 'View All New',
      cta_href: '/products',
      visibility: true,
      sort_order: 'new_arrivals',
      badge_label: 'Just Dropped',
      rule_group: {
        include_tags: ['tag-new'],
        in_stock_only: true,
        global_visibility_fallback: false,
      },
    },
    {
      title: 'DD: Premium Wearables Under $1,000',
      heading: 'Premium Wearables Under $1,000',
      subheading: 'High-end wearable technology at accessible price points',
      anchor_id: 'dd-wearables-under-1000',
      display_style: 'grid',
      max_products: 8,
      cta_label: 'Shop All Wearables',
      cta_href: '/categories/wearable-tech',
      visibility: true,
      sort_order: 'most_popular',
      rule_group: {
        include_categories: ['cat-wearable'],
        in_stock_only: true,
        global_visibility_fallback: false,
        price_max: 1000,
      },
    },
    {
      title: 'DD: Staff Picks: AetherWear',
      heading: 'Staff Picks: AetherWear',
      subheading: "Our team's favorite picks from the AetherWear collection",
      anchor_id: 'dd-staff-picks-aetherwear',
      display_style: 'carousel',
      max_products: 10,
      visibility: true,
      sort_order: 'staff_picks',
      badge_label: 'Staff Picks',
      rule_group: {
        brand_include: ['brand-aetherwear'],
        in_stock_only: true,
        global_visibility_fallback: false,
      },
    },
    {
      title: 'DD: Smart Home Essentials',
      heading: 'Smart Home Essentials',
      subheading: 'Build your connected home with CirrusHome',
      anchor_id: 'dd-smart-home',
      display_style: 'grid',
      max_products: 6,
      cta_label: 'Explore Smart Home',
      visibility: true,
      sort_order: 'most_popular',
      rule_group: {
        include_categories: ['cat-smarthome'],
        brand_include: ['brand-cirrushome'],
        in_stock_only: true,
        global_visibility_fallback: false,
      },
    },
    {
      title: 'DD: AI-Enhanced Collection',
      heading: 'AI-Enhanced Collection',
      subheading: 'Products powered by artificial intelligence across all categories',
      anchor_id: 'dd-ai-enhanced',
      display_style: 'carousel',
      max_products: 15,
      visibility: true,
      sort_order: 'most_popular',
      badge_label: 'AI Powered',
      rule_group: {
        strain_include: ['tech-ai'],
        in_stock_only: true,
        global_visibility_fallback: false,
      },
    },
    {
      title: 'DD: Luxury Technofurniture',
      heading: 'Luxury Technofurniture',
      subheading: 'Premium smart furniture over $2,000',
      anchor_id: 'dd-luxury-furniture',
      display_style: 'grid',
      max_products: 8,
      cta_label: 'Shop Furniture',
      visibility: true,
      sort_order: 'price_desc',
      badge_label: 'Premium',
      rule_group: {
        include_categories: ['cat-furniture'],
        in_stock_only: true,
        global_visibility_fallback: false,
        price_min: 2000,
      },
    },
    {
      title: 'DD: Wellness & Audio',
      heading: 'Wellness & Audio',
      subheading: 'Products that enhance your wellbeing through sound and technology',
      anchor_id: 'dd-wellness-audio',
      display_style: 'grid',
      max_products: 8,
      visibility: true,
      sort_order: 'staff_picks',
      rule_group: {
        include_categories: ['cat-wellness', 'cat-audio'],
        in_stock_only: true,
        global_visibility_fallback: false,
        price_max: 1000,
      },
    },
    {
      title: 'DD: Curated For You (Fallback Demo)',
      heading: 'Curated For You',
      subheading: 'Personalized recommendations (fallback demo — primary returns empty, fallback fires)',
      anchor_id: 'dd-curated',
      display_style: 'carousel',
      max_products: 8,
      visibility: true,
      sort_order: 'most_popular',
      badge_label: 'Recommended',
      rule_group: {
        include_categories: ['cat-wearable'],
        brand_include: ['brand-terraform'],
        in_stock_only: true,
        global_visibility_fallback: false,
      },
      fallback_rule_group: {
        include_tags: ['tag-bestseller'],
        in_stock_only: true,
        global_visibility_fallback: false,
      },
    },
  ];

  const feedUids = [];
  for (const feedData of feedEntries) {
    const uid = await ensureEntry(stack, 'dynamic_product_feed_dropdown', feedData);
    if (uid) {
      feedUids.push(uid);
      await publishEntry(stack, 'dynamic_product_feed_dropdown', uid);
      await new Promise(r => setTimeout(r, 300));
    }
  }

  // ── Page entry ───────────────────────────────────────────────────────
  console.log('\n--- Step 2: Create Page Entry ---');

  const pageData = {
    title: 'Merchandising Rule Engine Demo (Dropdown)',
    url: '/dynamic-feeds-dropdown',
    heading: 'Merchandising Rule Engine',
    subheading:
      'This page uses the same rule engine as the reference-based demo, but the global field uses dropdown/select fields instead of entry references. Filter choices are embedded directly in the schema — simpler to set up, but less flexible for large option sets.',
    component_list: feedUids.map(uid => ({ uid, _content_type_uid: 'dynamic_product_feed_dropdown' })),
  };

  const pageUid = await ensureEntry(stack, 'dynamic_feeds_dropdown_page', pageData);
  if (pageUid) {
    await publishEntry(stack, 'dynamic_feeds_dropdown_page', pageUid);
    console.log('    Page published');
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Feed entries: ${feedUids.length} created`);
  console.log(`Page entry: ${pageUid ? 'created' : 'FAILED'}`);
  console.log('\nFrontend at /dynamic-feeds-dropdown will render this data.');
}

if (require.main === module) {
  main().catch(e => { console.error(e.message); process.exit(1); });
}

module.exports = { main };
