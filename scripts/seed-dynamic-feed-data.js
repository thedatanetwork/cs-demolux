#!/usr/bin/env node

/**
 * Seed Dynamic Feed Data
 *
 * Populates reference content types with entries and creates
 * sample dynamic_product_feed entries configured with various
 * rule_group combinations for the demo.
 *
 * Run AFTER: npm run create-dynamic-feed-schemas
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'dev',
};

// ============================================================================
// REFERENCE DATA TO SEED
// Values match the product inventory in src/data/product-inventory.ts
// ============================================================================

const referenceData = {
  product_categories: [
    { title: 'Wearable Tech', value: 'cat-wearable', description: 'Smart wearable devices and accessories' },
    { title: 'Technofurniture', value: 'cat-furniture', description: 'Smart furniture with integrated technology' },
    { title: 'Smart Home', value: 'cat-smarthome', description: 'Connected home devices and systems' },
    { title: 'Audio', value: 'cat-audio', description: 'Premium audio equipment and accessories' },
    { title: 'Wellness Tech', value: 'cat-wellness', description: 'Health and wellness technology products' },
  ],
  product_brands: [
    { title: 'AetherWear', value: 'brand-aetherwear', description: 'Premium wearable technology' },
    { title: 'LuxFrame', value: 'brand-luxframe', description: 'Smart eyewear and optical tech' },
    { title: 'TerraForm', value: 'brand-terraform', description: 'Intelligent furniture design' },
    { title: 'NovaSonic', value: 'brand-novasonic', description: 'Next-generation audio' },
    { title: 'CirrusHome', value: 'brand-cirrushome', description: 'Connected home ecosystems' },
    { title: 'VoltaLife', value: 'brand-voltalife', description: 'Wellness-focused technology' },
    { title: 'ArcLight', value: 'brand-arclight', description: 'Ambient lighting and atmosphere' },
    { title: 'Zenith Labs', value: 'brand-zenithlabs', description: 'Experimental tech accessories' },
  ],
  product_tags: [
    { title: 'Wireless', value: 'tag-wireless' },
    { title: 'Bluetooth', value: 'tag-bluetooth' },
    { title: 'Sustainable', value: 'tag-sustainable' },
    { title: 'Limited Edition', value: 'tag-limited' },
    { title: 'Bestseller', value: 'tag-bestseller' },
    { title: 'New Arrival', value: 'tag-new' },
    { title: 'Premium Materials', value: 'tag-premium' },
    { title: 'Handcrafted', value: 'tag-handcrafted' },
    { title: 'Water Resistant', value: 'tag-waterproof' },
    { title: 'Noise Cancelling', value: 'tag-noisecancelling' },
    { title: 'Gesture Control', value: 'tag-gesture' },
    { title: 'Ambient Sensing', value: 'tag-ambient' },
    { title: 'Modular', value: 'tag-modular' },
    { title: 'Carbon Fiber', value: 'tag-carbon' },
    { title: 'Titanium', value: 'tag-titanium' },
    { title: 'AI-Powered', value: 'tag-ai' },
    { title: 'Voice Control', value: 'tag-voice' },
    { title: 'Solar Powered', value: 'tag-solar' },
    { title: 'Biometric', value: 'tag-biometric' },
  ],
  technology_types: [
    { title: 'AI-Enhanced', value: 'tech-ai', description: 'Machine learning and artificial intelligence' },
    { title: 'IoT-Connected', value: 'tech-iot', description: 'Internet of Things integration' },
    { title: 'AR/VR-Enabled', value: 'tech-arvr', description: 'Augmented or virtual reality features' },
    { title: 'Haptic Feedback', value: 'tech-haptic', description: 'Tactile feedback technology' },
    { title: 'Biometric Sensing', value: 'tech-biometric', description: 'Health and biometric monitoring' },
    { title: 'Voice-Controlled', value: 'tech-voice', description: 'Voice assistant integration' },
    { title: 'Solar-Powered', value: 'tech-solar', description: 'Solar energy harvesting' },
    { title: 'Neural Interface', value: 'tech-neural', description: 'Brain-computer interface technology' },
  ],
  discount_types: [
    { title: 'Seasonal Sale', value: 'dt-seasonal', description: 'Limited-time seasonal promotion' },
    { title: 'Clearance', value: 'dt-clearance', description: 'End-of-line clearance pricing' },
    { title: 'Bundle Deal', value: 'dt-bundle', description: 'Multi-product bundle discount' },
    { title: 'Member Exclusive', value: 'dt-member', description: 'Members-only pricing' },
    { title: 'Launch Special', value: 'dt-launch', description: 'New product launch discount' },
    { title: 'Flash Sale', value: 'dt-flash', description: '24-hour flash sale' },
  ],
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Create or find an entry, returning its UID.
 */
async function ensureEntry(stack, contentTypeUid, data) {
  try {
    // Check if entry with same title already exists
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

    // Create new entry using the correct SDK pattern
    const created = await stack.contentType(contentTypeUid).entry().create({
      entry: data,
    });
    const uid = created.uid;
    console.log(`    + ${data.title} (created: ${uid})`);
    return uid;
  } catch (error) {
    console.error(`    ! ${data.title}: ${error.message}`);
    if (error.errors) console.error('      Details:', JSON.stringify(error.errors, null, 2));
    return null;
  }
}

/**
 * Publish an entry to the target environment.
 */
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
    // May already be published
    const msg = error.message || '';
    if (msg.includes('already published') || msg.includes('already been published')) return true;
    console.error(`    ! Publish failed for ${entryUid}: ${msg}`);
    return false;
  }
}

/**
 * Build a reference array from UIDs for a given content type.
 */
function makeRefs(contentTypeUid, uids) {
  if (!uids || uids.length === 0) return undefined;
  return uids.map((uid) => ({ uid, _content_type_uid: contentTypeUid }));
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  try {
    console.log('='.repeat(60));
    console.log('Seed Dynamic Feed Data');
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

    // ── Step 1: Seed reference entries ────────────────────────────────────
    // We collect UIDs keyed by value for use in feed entries later
    const uidMap = {}; // { 'product_categories': { 'cat-wearable': 'blt...', ... }, ... }

    console.log('\n--- Step 1: Seed Reference Entries ---');
    for (const [contentTypeUid, entries] of Object.entries(referenceData)) {
      console.log(`\n  ${contentTypeUid}:`);
      uidMap[contentTypeUid] = {};
      for (const entryData of entries) {
        const uid = await ensureEntry(stack, contentTypeUid, entryData);
        if (uid) {
          uidMap[contentTypeUid][entryData.value] = uid;
        }
      }
    }

    // ── Step 2: Publish all reference entries ─────────────────────────────
    console.log('\n--- Step 2: Publish Reference Entries ---');
    let publishCount = 0;
    for (const [contentTypeUid, entries] of Object.entries(uidMap)) {
      for (const [value, uid] of Object.entries(entries)) {
        const ok = await publishEntry(stack, contentTypeUid, uid);
        if (ok) publishCount++;
        // Small delay to avoid rate limits
        await new Promise((r) => setTimeout(r, 200));
      }
    }
    console.log(`  Published ${publishCount} reference entries`);

    // ── Step 3: Create sample dynamic_product_feed entries ───────────────
    console.log('\n--- Step 3: Create Dynamic Product Feed Entries ---');

    // Helper to look up reference UIDs by value
    const catRef = (val) => uidMap.product_categories[val];
    const brandRef = (val) => uidMap.product_brands[val];
    const tagRef = (val) => uidMap.product_tags[val];
    const techRef = (val) => uidMap.technology_types[val];
    const discRef = (val) => uidMap.discount_types[val];

    const feedEntries = [
      {
        title: 'New Arrivals',
        heading: 'New Arrivals',
        subheading: 'The latest additions to our luxury tech collection',
        anchor_id: 'new-arrivals',
        display_style: 'carousel',
        max_products: 12,
        cta_label: 'View All New',
        cta_href: '/products',
        visibility: true,
        sort_order: 'new_arrivals',
        badge_label: 'Just Dropped',
        rule_group: {
          include_tags: makeRefs('product_tags', [tagRef('tag-new')]),
          in_stock_only: true,
          global_visibility_fallback: false,
        },
      },
      {
        title: 'Premium Wearables Under $1,000',
        heading: 'Premium Wearables Under $1,000',
        subheading: 'High-end wearable technology at accessible price points',
        anchor_id: 'wearables-under-1000',
        display_style: 'grid',
        max_products: 8,
        cta_label: 'Shop All Wearables',
        cta_href: '/categories/wearable-tech',
        visibility: true,
        sort_order: 'most_popular',
        rule_group: {
          include_categories: makeRefs('product_categories', [catRef('cat-wearable')]),
          in_stock_only: true,
          global_visibility_fallback: false,
          price_max: 1000,
        },
      },
      {
        title: 'Staff Picks: AetherWear',
        heading: 'Staff Picks: AetherWear',
        subheading: "Our team's favorite picks from the AetherWear collection",
        anchor_id: 'staff-picks-aetherwear',
        display_style: 'carousel',
        max_products: 10,
        visibility: true,
        sort_order: 'staff_picks',
        badge_label: 'Staff Picks',
        rule_group: {
          brand_include: makeRefs('product_brands', [brandRef('brand-aetherwear')]),
          in_stock_only: true,
          global_visibility_fallback: false,
        },
      },
      {
        title: 'Smart Home Essentials',
        heading: 'Smart Home Essentials',
        subheading: 'Build your connected home with CirrusHome',
        anchor_id: 'smart-home-essentials',
        display_style: 'grid',
        max_products: 6,
        cta_label: 'Explore Smart Home',
        cta_href: '/products',
        visibility: true,
        sort_order: 'most_popular',
        rule_group: {
          include_categories: makeRefs('product_categories', [catRef('cat-smarthome')]),
          brand_include: makeRefs('product_brands', [brandRef('brand-cirrushome')]),
          in_stock_only: true,
          global_visibility_fallback: false,
        },
      },
      {
        title: 'AI-Enhanced Collection',
        heading: 'AI-Enhanced Collection',
        subheading: 'Products powered by artificial intelligence across all categories',
        anchor_id: 'ai-enhanced',
        display_style: 'carousel',
        max_products: 15,
        visibility: true,
        sort_order: 'most_popular',
        badge_label: 'AI Powered',
        rule_group: {
          strain_include: makeRefs('technology_types', [techRef('tech-ai')]),
          in_stock_only: true,
          global_visibility_fallback: false,
        },
      },
      {
        title: 'Luxury Technofurniture',
        heading: 'Luxury Technofurniture',
        subheading: 'Premium smart furniture over $2,000',
        anchor_id: 'luxury-furniture',
        display_style: 'grid',
        max_products: 8,
        cta_label: 'Shop Furniture',
        cta_href: '/categories/technofurniture',
        visibility: true,
        sort_order: 'price_desc',
        badge_label: 'Premium',
        rule_group: {
          include_categories: makeRefs('product_categories', [catRef('cat-furniture')]),
          in_stock_only: true,
          global_visibility_fallback: false,
          price_min: 2000,
        },
      },
      {
        title: 'Launch Specials',
        heading: 'Launch Specials',
        subheading: 'Special pricing on newly released products',
        anchor_id: 'launch-specials',
        display_style: 'carousel',
        max_products: 10,
        visibility: true,
        sort_order: 'new_arrivals',
        badge_label: 'Limited Time',
        rule_group: {
          discount_category_include: makeRefs('discount_types', [discRef('dt-launch')]),
          in_stock_only: true,
          global_visibility_fallback: false,
        },
      },
      {
        title: 'Wellness & Audio',
        heading: 'Wellness & Audio',
        subheading: 'Products that enhance your wellbeing through sound and technology',
        anchor_id: 'wellness-audio',
        display_style: 'grid',
        max_products: 8,
        visibility: true,
        sort_order: 'staff_picks',
        rule_group: {
          include_categories: makeRefs('product_categories', [
            catRef('cat-wellness'),
            catRef('cat-audio'),
          ]),
          in_stock_only: true,
          global_visibility_fallback: false,
          price_max: 1000,
        },
      },
      {
        title: 'Hidden Block (Visibility Test)',
        heading: 'This Should Not Appear',
        subheading: 'If you can see this, visibility suppression is broken',
        display_style: 'grid',
        max_products: 5,
        visibility: false,
        sort_order: 'most_popular',
        rule_group: {
          in_stock_only: true,
          global_visibility_fallback: false,
        },
      },
      {
        title: 'Curated For You (Fallback Demo)',
        heading: 'Curated For You',
        subheading: 'Personalized recommendations (fallback demo — primary returns empty, fallback fires)',
        anchor_id: 'curated-for-you',
        display_style: 'carousel',
        max_products: 8,
        visibility: true,
        sort_order: 'most_popular',
        badge_label: 'Recommended',
        rule_group: {
          // Impossible combo: wearables from TerraForm
          include_categories: makeRefs('product_categories', [catRef('cat-wearable')]),
          brand_include: makeRefs('product_brands', [brandRef('brand-terraform')]),
          in_stock_only: true,
          global_visibility_fallback: false,
        },
        fallback_rule_group: {
          include_tags: makeRefs('product_tags', [tagRef('tag-bestseller')]),
          in_stock_only: true,
          global_visibility_fallback: false,
        },
      },
    ];

    const feedResults = { created: 0, skipped: 0, failed: 0 };
    const feedUids = []; // Collect UIDs for the page's component_list
    for (const feedData of feedEntries) {
      const uid = await ensureEntry(stack, 'dynamic_product_feed', feedData);
      if (uid) {
        feedResults.created++;
        feedUids.push(uid);
        // Publish the feed entry
        await publishEntry(stack, 'dynamic_product_feed', uid);
        await new Promise((r) => setTimeout(r, 300));
      } else {
        feedResults.failed++;
      }
    }

    // ── Step 4: Create dynamic_feeds_page entry ──────────────────────────
    console.log('\n--- Step 4: Create Dynamic Feeds Page Entry ---');
    const pageData = {
      title: 'Merchandising Rule Engine Demo',
      url: '/dynamic-feeds',
      heading: 'Merchandising Rule Engine',
      subheading:
        'This page demonstrates how the merchandising_rule_group Global Field and dynamic_product_feed content type work together to drive structured, editor-controlled product merchandising. Each feed below is a separate CMS entry referenced via the component_list.',
      component_list: makeRefs('dynamic_product_feed', feedUids),
    };

    const pageUid = await ensureEntry(stack, 'dynamic_feeds_page', pageData);
    if (pageUid) {
      await publishEntry(stack, 'dynamic_feeds_page', pageUid);
      console.log('    Page published');
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));

    let totalRefs = 0;
    for (const entries of Object.values(uidMap)) {
      totalRefs += Object.keys(entries).length;
    }
    console.log(`Reference entries: ${totalRefs} seeded & published`);
    console.log(`Feed entries: ${feedResults.created} created, ${feedResults.failed} failed`);
    console.log(`Page entry: ${pageUid ? 'created' : 'FAILED'}`);
    console.log('\nDone! Check Contentstack to verify the entries.');
    console.log('Frontend at /dynamic-feeds will fetch the page and its component_list from CMS.');
  } catch (error) {
    console.error('\nScript failed:', error.message);
    if (error.errors) console.error('Details:', JSON.stringify(error.errors, null, 2));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
