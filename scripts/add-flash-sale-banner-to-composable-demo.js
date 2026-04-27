#!/usr/bin/env node

/**
 * Add the Jewelry Flash Sale Banner entry to the /composable-demo page.
 *
 * Two-step idempotent script:
 *   1. Extend composable_page.page_sections.reference_to to allow
 *      flash_sale_banner_block (no-op if already there).
 *   2. Append the seeded flash_sale_banner_block entry to the page's
 *      page_sections (no-op if already attached). Inserts at the top so
 *      the promo banner reads first on the demo page.
 *
 * Run AFTER:
 *   - npm run create-flash-sale-banner-schema
 *   - npm run seed-flash-sale-banner-data
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'dev',
};

const BLOCK_CT_UID = 'flash_sale_banner_block';
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
  console.log('\n--- Step 1: Whitelist flash_sale_banner_block on composable_page ---');
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

async function appendBlockToPage(stack) {
  console.log('\n--- Step 2: Locate /composable-demo page ---');
  const pageEntry = await findFirstEntry(stack, PAGE_CT_UID, { url: PAGE_URL });
  if (!pageEntry) {
    throw new Error(`  No composable_page entry found at ${PAGE_URL}. Run create-composable-demo-page first.`);
  }
  console.log(`  Found: ${pageEntry.title} (${pageEntry.uid})`);

  console.log('\n--- Step 3: Locate flash sale banner block entry ---');
  const blockEntry = await findFirstEntry(stack, BLOCK_CT_UID);
  if (!blockEntry) {
    throw new Error('  No flash_sale_banner_block entry found. Run seed-flash-sale-banner-data first.');
  }
  console.log(`  Found: ${blockEntry.title} (${blockEntry.uid})`);

  const existingSections = pageEntry.page_sections || [];
  const alreadyAttached = existingSections.some(
    (ref) => typeof ref === 'object' && ref !== null && ref.uid === blockEntry.uid,
  );

  if (alreadyAttached) {
    console.log('\n  ~ Flash sale banner already in page_sections — nothing to do.');
    return pageEntry;
  }

  const newRef = { uid: blockEntry.uid, _content_type_uid: BLOCK_CT_UID };
  // Promo banner reads best at the top of the page.
  pageEntry.page_sections = [newRef, ...existingSections];

  console.log('\n--- Step 4: Update + republish page ---');
  await pageEntry.update();
  console.log('  Page entry updated.');
  await publishEntry(stack, PAGE_CT_UID, pageEntry.uid);
  console.log('  Page entry published.');
  return pageEntry;
}

async function main() {
  console.log('='.repeat(60));
  console.log('Add Flash Sale Banner to /composable-demo');
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
  await appendBlockToPage(stack);

  console.log('\n' + '='.repeat(60));
  console.log('Done. Visit /composable-demo to see the flash sale banner');
  console.log('rendered at the top — editable in Visual Builder.');
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
