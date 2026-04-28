#!/usr/bin/env node

/**
 * Add the seeded Image CTA Banner entries to the /composable-demo page.
 *
 * Two-step idempotent script:
 *   1. Extend composable_page.page_sections.reference_to to allow
 *      image_cta_banner_block (no-op if already there).
 *   2. Append any seeded image_cta_banner_block entries that aren't yet
 *      attached to the page_sections of the /composable-demo entry.
 *
 * Run AFTER:
 *   - npm run create-image-cta-banner-schema
 *   - npm run seed-image-cta-banner-data
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'dev',
};

const BLOCK_CT_UID = 'image_cta_banner_block';
const PAGE_CT_UID = 'composable_page';
const PAGE_URL = '/composable-demo';

async function findFirstEntry(stack, contentTypeUid, query) {
  try {
    const result = await stack
      .contentType(contentTypeUid)
      .entry()
      .query(query ? { query } : undefined)
      .find();
    return result.items?.[0] || null;
  } catch (_) {
    return null;
  }
}

async function findEntries(stack, contentTypeUid) {
  try {
    const result = await stack.contentType(contentTypeUid).entry().query().find();
    return result.items || [];
  } catch (_) {
    return [];
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

async function ensureReferenceWhitelist(stack) {
  console.log('\n--- Step 1: Whitelist image_cta_banner_block on composable_page ---');
  const ct = await stack.contentType(PAGE_CT_UID).fetch();
  const sectionsField = ct.schema.find((f) => f.uid === 'page_sections');
  if (!sectionsField) {
    throw new Error('  page_sections field not found on composable_page');
  }
  const refs = Array.isArray(sectionsField.reference_to) ? sectionsField.reference_to : [];
  if (refs.includes(BLOCK_CT_UID)) {
    console.log('  ~ already in reference_to whitelist');
    return;
  }
  sectionsField.reference_to = [...refs, BLOCK_CT_UID];
  await ct.update();
  console.log('  + added to reference_to whitelist');
}

async function appendBlocksToPage(stack) {
  console.log('\n--- Step 2: Locate /composable-demo page ---');
  const pageEntry = await findFirstEntry(stack, PAGE_CT_UID, { url: PAGE_URL });
  if (!pageEntry) {
    throw new Error(`  No composable_page entry found at ${PAGE_URL}. Run create-composable-demo-page first.`);
  }
  console.log(`  Found: ${pageEntry.title} (${pageEntry.uid})`);

  console.log('\n--- Step 3: Locate image_cta_banner_block entries ---');
  const blockEntries = await findEntries(stack, BLOCK_CT_UID);
  if (blockEntries.length === 0) {
    throw new Error('  No image_cta_banner_block entries found. Run seed-image-cta-banner-data first.');
  }
  blockEntries.forEach((b) => console.log(`  • ${b.title} (${b.uid})`));

  const existingSections = pageEntry.page_sections || [];
  const existingUids = new Set(
    existingSections
      .map((ref) => (typeof ref === 'object' && ref !== null ? ref.uid : null))
      .filter(Boolean),
  );

  const additions = blockEntries
    .filter((b) => !existingUids.has(b.uid))
    .map((b) => ({ uid: b.uid, _content_type_uid: BLOCK_CT_UID }));

  if (additions.length === 0) {
    console.log('\n  ~ All image_cta_banner_block entries are already attached — nothing to do.');
    return;
  }

  // Append to the end of page_sections so the demo reads top-to-bottom in
  // the order other blocks were added.
  pageEntry.page_sections = [...existingSections, ...additions];

  console.log(`\n--- Step 4: Append ${additions.length} block(s) + republish page ---`);
  await pageEntry.update();
  console.log('  Page entry updated.');
  await publishEntry(stack, PAGE_CT_UID, pageEntry.uid);
  console.log('  Page entry published.');
}

async function main() {
  console.log('='.repeat(60));
  console.log('Add Image CTA Banner Block(s) to /composable-demo');
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

  await ensureReferenceWhitelist(stack);
  await appendBlocksToPage(stack);

  console.log('\n' + '='.repeat(60));
  console.log('Done. Visit /composable-demo to see the image CTA banners');
  console.log('rendered with their overlay placements — editable in Visual');
  console.log('Builder (drag offsets to reposition the CTAs live).');
  console.log('='.repeat(60));
}

if (require.main === module) {
  main().catch((err) => {
    console.error('\nScript failed:', err.message);
    if (err.errors) console.error('Details:', JSON.stringify(err.errors, null, 2));
    process.exit(1);
  });
}

module.exports = { main };
