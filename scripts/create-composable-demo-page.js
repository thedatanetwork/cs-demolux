#!/usr/bin/env node

/**
 * Create a Composable Demo Page
 *
 * Demonstrates dynamic_product_feed_dropdown blocks composed alongside
 * other block types (hero, CTA) on a single modular page — all via
 * reference-based component_list.
 *
 * Steps:
 *   1. Create composable_page content type (reference-based page_sections)
 *   2. Create a campaign_cta_block entry for the page
 *   3. Pick existing dropdown feed entries
 *   4. Create the composable page entry with mixed blocks
 *   5. Publish everything
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'dev',
};

// ============================================================================
// CONTENT TYPE: composable_page
// A generic page that shows how mixed block types compose together
// ============================================================================

const composablePageSchema = {
  title: 'Composable Page',
  uid: 'composable_page',
  description:
    'A modular page that demonstrates how dynamic_product_feed_dropdown blocks compose alongside other block types (hero, CTA, values grid, etc.) via a reference-based page_sections field.',
  options: {
    singleton: false,
    title: 'title',
    is_page: true,
  },
  schema: [
    {
      display_name: 'Title',
      uid: 'title',
      data_type: 'text',
      mandatory: true,
      unique: true,
    },
    {
      display_name: 'URL',
      uid: 'url',
      data_type: 'text',
      mandatory: true,
      unique: true,
      field_metadata: {
        instruction: 'Page URL path (e.g., /composable-demo)',
      },
    },
    {
      display_name: 'Page Sections',
      uid: 'page_sections',
      data_type: 'reference',
      reference_to: [
        'hero_section_block',
        'featured_content_grid_block',
        'values_grid_block',
        'campaign_cta_block',
        'process_steps_block',
        'statistics_block',
        'testimonials_block',
        'faq_block',
        'dynamic_product_feed_dropdown',
      ],
      field_metadata: {
        ref_multiple: true,
        ref_multiple_content_types: true,
        instruction:
          'Add any combination of blocks and dynamic feeds. Drag to reorder.',
      },
      multiple: true,
      mandatory: false,
    },
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function createContentType(stack, schema) {
  try {
    console.log(`\n  Creating content type: ${schema.title}...`);
    try {
      await stack.contentType(schema.uid).fetch();
      console.log(`  -> Already exists (skipping)`);
      return true;
    } catch (_) {}

    await stack.contentType().create({
      content_type: {
        title: schema.title,
        uid: schema.uid,
        description: schema.description,
        options: schema.options,
        schema: schema.schema,
      },
    });
    console.log(`  -> Created successfully`);
    return true;
  } catch (error) {
    console.error(`  -> FAILED: ${error.message}`);
    if (error.errors) console.error('     Details:', JSON.stringify(error.errors, null, 2));
    return false;
  }
}

async function ensureEntry(stack, contentTypeUid, data) {
  try {
    const existing = await stack
      .contentType(contentTypeUid)
      .entry()
      .query({ query: { title: data.title } })
      .find();

    if (existing.items && existing.items.length > 0) {
      const uid = existing.items[0].uid;
      console.log(`    ~ ${data.title} (exists: ${uid})`);
      return uid;
    }

    const created = await stack.contentType(contentTypeUid).entry().create({ entry: data });
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

async function findEntries(stack, contentTypeUid) {
  try {
    const result = await stack
      .contentType(contentTypeUid)
      .entry()
      .query()
      .find();
    return result.items || [];
  } catch (error) {
    console.error(`    Could not query ${contentTypeUid}: ${error.message}`);
    return [];
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('='.repeat(60));
  console.log('Create Composable Demo Page');
  console.log('Shows dynamic feeds mixed with other blocks on one page');
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

  // ── Step 1: Create composable_page content type ──────────────────────
  console.log('\n--- Step 1: Create composable_page content type ---');
  const ctCreated = await createContentType(stack, composablePageSchema);
  if (!ctCreated) {
    console.error('Cannot continue without content type');
    process.exit(1);
  }

  // ── Step 2: Create a CTA block entry ─────────────────────────────────
  console.log('\n--- Step 2: Create a campaign CTA block entry ---');

  const ctaData = {
    title: 'Composable Demo: Explore Dynamic Feeds',
    variant: 'full_width_cta',
    title_text: 'See the Full Dynamic Feeds Experience',
    description:
      'This page demonstrates how dynamic product feed blocks compose alongside traditional CMS blocks. Every section is an independent Contentstack entry that editors can add, remove, or reorder.',
    badge_text: 'Modular Composition',
    background_style: 'gradient-dark',
    primary_cta: {
      text: 'View Dropdown Feeds Demo',
      url: '/dynamic-feeds-dropdown',
      style: 'gold',
    },
    secondary_cta: {
      text: 'View Reference Feeds Demo',
      url: '/dynamic-feeds',
      style: 'outline',
    },
    text_color: 'light',
    height: 'medium',
  };

  const ctaUid = await ensureEntry(stack, 'campaign_cta_block', ctaData);
  if (ctaUid) {
    await publishEntry(stack, 'campaign_cta_block', ctaUid);
    await new Promise(r => setTimeout(r, 300));
  }

  // ── Step 3: Find existing dropdown feed entries ─────────────────────
  console.log('\n--- Step 3: Find existing dropdown feed entries ---');

  const feedEntries = await findEntries(stack, 'dynamic_product_feed_dropdown');
  console.log(`  Found ${feedEntries.length} dropdown feed entries`);

  // Pick 2-3 feeds to include on the composable page
  const feedsForPage = feedEntries.slice(0, 3);
  feedsForPage.forEach(f => console.log(`    - ${f.title} (${f.uid})`));

  // Also find an existing hero block if available
  console.log('\n  Looking for existing hero_section_block entries...');
  const heroEntries = await findEntries(stack, 'hero_section_block');
  if (heroEntries.length > 0) {
    console.log(`    Found: ${heroEntries[0].title} (${heroEntries[0].uid})`);
  } else {
    console.log('    None found (will skip hero)');
  }

  // ── Step 4: Create the composable page entry ────────────────────────
  console.log('\n--- Step 4: Create composable page entry ---');

  // Build the page_sections array: hero (if exists) + feeds interspersed with CTA
  const pageSections = [];

  // Add hero if we found one
  if (heroEntries.length > 0) {
    pageSections.push({
      uid: heroEntries[0].uid,
      _content_type_uid: 'hero_section_block',
    });
  }

  // Add first feed
  if (feedsForPage.length > 0) {
    pageSections.push({
      uid: feedsForPage[0].uid,
      _content_type_uid: 'dynamic_product_feed_dropdown',
    });
  }

  // Add CTA in the middle
  if (ctaUid) {
    pageSections.push({
      uid: ctaUid,
      _content_type_uid: 'campaign_cta_block',
    });
  }

  // Add remaining feeds
  for (let i = 1; i < feedsForPage.length; i++) {
    pageSections.push({
      uid: feedsForPage[i].uid,
      _content_type_uid: 'dynamic_product_feed_dropdown',
    });
  }

  console.log(`  Page will have ${pageSections.length} sections:`);
  pageSections.forEach((s, i) =>
    console.log(`    ${i + 1}. ${s._content_type_uid} (${s.uid})`)
  );

  const pageData = {
    title: 'Composable Page Demo',
    url: '/composable-demo',
    page_sections: pageSections,
  };

  const pageUid = await ensureEntry(stack, 'composable_page', pageData);
  if (pageUid) {
    await publishEntry(stack, 'composable_page', pageUid);
    console.log('  -> Page published');
  }

  // ── Summary ──────────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(60));
  console.log('DONE');
  console.log('='.repeat(60));
  console.log(`\ncomposable_page content type accepts these block types:`);
  composablePageSchema.schema[2].reference_to.forEach(t =>
    console.log(`  - ${t}`)
  );
  console.log(`\nDemo page has ${pageSections.length} sections mixing blocks + feeds.`);
  console.log('Visit /composable-demo to see it on the frontend.');
  console.log('In Contentstack, editors can reorder/add/remove any block type.\n');
}

if (require.main === module) {
  main().catch(e => {
    console.error(e.message);
    process.exit(1);
  });
}

module.exports = { main };
