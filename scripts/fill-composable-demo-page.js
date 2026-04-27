#!/usr/bin/env node

/**
 * Fill /composable-demo page with one entry of each allowed block type
 * so the page is a fully-realized demo of the composable_page model.
 *
 * Walks composable_page's page_sections.reference_to allowlist, finds the
 * first existing entry of each type that isn't already on the page, and
 * appends them in a curated marketing-page order.
 *
 * Idempotent.
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'dev',
};

// Marketing-page flow: anchor with hero, build value, social proof, deals,
// answers, then drive action. Types that aren't already on the page are
// appended in the order they appear here.
const PREFERRED_ORDER = [
  'hero_section_block',
  'feature_banner_row_block',
  'statistics_block',
  'values_grid_block',
  'featured_content_grid_block',
  'hero_seven_block',
  'process_steps_block',
  'testimonials_block',
  'product_tile_banner_block',
  'dynamic_product_feed_dropdown',
  'faq_block',
  'campaign_cta_block',
];

async function findFirstEntry(stack, contentTypeUid) {
  try {
    const result = await stack.contentType(contentTypeUid).entry().query().find();
    return result.items?.[0] || null;
  } catch (_) {
    return null;
  }
}

async function publishEntry(stack, contentTypeUid, entryUid) {
  try {
    const entry = await stack.contentType(contentTypeUid).entry(entryUid).fetch();
    await entry.publish({
      publishDetails: { environments: [stackConfig.environment], locales: ['en-us'] },
    });
    return true;
  } catch (error) {
    const msg = error.message || '';
    if (msg.includes('already published') || msg.includes('already been published')) return true;
    console.error(`    ! Publish failed: ${msg}`);
    return false;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Fill /composable-demo Page');
  console.log('='.repeat(60));

  if (!stackConfig.api_key || !stackConfig.management_token) {
    console.error('\nMissing credentials in scripts/.env');
    process.exit(1);
  }

  const client = contentstack.client();
  const stack = client.stack({
    api_key: stackConfig.api_key,
    management_token: stackConfig.management_token,
  });

  // Locate composable_page entry
  console.log('\nLocating composable_page entry...');
  const pageQuery = await stack
    .contentType('composable_page')
    .entry()
    .query({ query: { url: '/composable-demo' } })
    .find();

  const pageEntry = pageQuery.items?.[0];
  if (!pageEntry) {
    console.error('  No composable_page entry at /composable-demo. Run create-composable-demo-page first.');
    process.exit(1);
  }
  console.log(`  Found: ${pageEntry.title} (${pageEntry.uid})`);

  // Read the content type's allowlist
  const ct = await stack.contentType('composable_page').fetch();
  const sectionsField = ct.schema.find((f) => f.uid === 'page_sections');
  const allowedTypes = new Set(sectionsField?.reference_to || []);
  console.log(`\nAllowed reference types (${allowedTypes.size}):`);
  for (const t of allowedTypes) console.log('  - ' + t);

  // What's on the page already
  const existingSections = pageEntry.page_sections || [];
  const onPageUids = new Set(
    existingSections
      .map((ref) => (typeof ref === 'object' && ref !== null ? ref.uid : null))
      .filter(Boolean),
  );
  const onPageTypes = new Set(
    existingSections
      .map((ref) => (typeof ref === 'object' && ref !== null ? ref._content_type_uid : null))
      .filter(Boolean),
  );
  console.log(`\nAlready on page: ${existingSections.length} sections (types: ${[...onPageTypes].join(', ')})`);

  // For each preferred type, if it's allowed AND not already on the page, find an entry
  console.log('\nLocating missing block entries...');
  const additions = [];
  for (const ctUid of PREFERRED_ORDER) {
    if (!allowedTypes.has(ctUid)) {
      console.log(`  ~ ${ctUid} (not in allowlist — skipping)`);
      continue;
    }
    if (onPageTypes.has(ctUid)) {
      console.log(`  ~ ${ctUid} (already on page)`);
      continue;
    }

    const entry = await findFirstEntry(stack, ctUid);
    if (!entry) {
      console.log(`  ! ${ctUid} (no entries exist)`);
      continue;
    }
    if (onPageUids.has(entry.uid)) {
      console.log(`  ~ ${ctUid} (entry already referenced)`);
      continue;
    }

    console.log(`  + ${ctUid}: ${entry.title} (${entry.uid})`);
    additions.push({ uid: entry.uid, _content_type_uid: ctUid });
  }

  if (additions.length === 0) {
    console.log('\nNothing to add. Page already includes one of every available type.');
    return;
  }

  console.log(`\nAppending ${additions.length} block(s) to page_sections...`);
  pageEntry.page_sections = [...existingSections, ...additions];
  await pageEntry.update();
  console.log('  Page updated.');

  await publishEntry(stack, 'composable_page', pageEntry.uid);
  console.log('  Page published.');

  console.log(`\nDone. Page now has ${pageEntry.page_sections.length} sections.`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('\nScript failed:', err.message);
    if (err.errors) console.error('Details:', JSON.stringify(err.errors, null, 2));
    process.exit(1);
  });
}
