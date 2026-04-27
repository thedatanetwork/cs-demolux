#!/usr/bin/env node

/**
 * Add product_tile_banner_block + hero_seven_block as Allowed References
 * on existing modular page content types.
 *
 * Walks a list of likely page content types, finds the `page_sections`
 * reference field on each, and appends the two new block UIDs to its
 * `reference_to` allowlist if missing. Idempotent.
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
};

// Content types known to compose blocks via a `page_sections` reference field.
// We patch each one only if it exists and has the field.
const PAGE_CONTENT_TYPES = [
  'composable_page',
  'home_page',
  'modular_home_page',
  'modular_category_page',
  'modular_blog_page',
];

const NEW_BLOCK_UIDS = ['product_tile_banner_block', 'hero_seven_block'];

async function patchContentType(stack, contentTypeUid) {
  let ct;
  try {
    ct = await stack.contentType(contentTypeUid).fetch();
  } catch (_) {
    console.log(`  ~ ${contentTypeUid} (does not exist — skipping)`);
    return { skipped: true };
  }

  const sectionsField = ct.schema.find((f) => f.uid === 'page_sections');
  if (!sectionsField) {
    console.log(`  ~ ${contentTypeUid} (no page_sections field — skipping)`);
    return { skipped: true };
  }

  if (sectionsField.data_type !== 'reference') {
    console.log(`  ~ ${contentTypeUid} (page_sections is not a reference field — skipping)`);
    return { skipped: true };
  }

  const existingRefs = new Set(sectionsField.reference_to || []);
  const toAdd = NEW_BLOCK_UIDS.filter((uid) => !existingRefs.has(uid));

  if (toAdd.length === 0) {
    console.log(`  ~ ${contentTypeUid} (already includes both blocks)`);
    return { skipped: true };
  }

  sectionsField.reference_to = [...(sectionsField.reference_to || []), ...toAdd];
  console.log(`  + ${contentTypeUid}: adding ${toAdd.join(', ')}`);

  try {
    await ct.update();
    console.log(`    -> updated`);
    return { added: toAdd };
  } catch (error) {
    console.error(`    -> FAILED: ${error.message}`);
    if (error.errors) console.error('       Details:', JSON.stringify(error.errors, null, 2));
    return { failed: true };
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Add Tile + Hero7 Blocks to Modular Page Allowlists');
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

  const summary = { added: [], skipped: [], failed: [] };
  for (const ctUid of PAGE_CONTENT_TYPES) {
    const result = await patchContentType(stack, ctUid);
    if (result.added) summary.added.push(`${ctUid} (+${result.added.length})`);
    else if (result.skipped) summary.skipped.push(ctUid);
    else if (result.failed) summary.failed.push(ctUid);
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Patched: ${summary.added.length}  Skipped: ${summary.skipped.length}  Failed: ${summary.failed.length}`);
  if (summary.added.length) console.log('  + ' + summary.added.join('\n  + '));
  if (summary.failed.length) console.log('  ! ' + summary.failed.join('\n  ! '));
}

if (require.main === module) {
  main().catch((err) => {
    console.error('\nScript failed:', err.message);
    if (err.errors) console.error('Details:', JSON.stringify(err.errors, null, 2));
    process.exit(1);
  });
}
