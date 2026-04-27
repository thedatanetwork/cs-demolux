#!/usr/bin/env node

/**
 * Append Tile Banner + Hero 7 blocks to the existing /composable-demo
 * entry's page_sections so the visitor sees both blocks composed on a
 * single Visual-Builder-enabled page.
 *
 * Idempotent: skips append if the same block UIDs are already present.
 *
 * Run AFTER:
 *   - npm run setup-product-tile-banner
 *   - npm run setup-hero-seven
 *   - npm run add-tile-blocks-to-modular-pages
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'dev',
};

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
  console.log('Add Tile + Hero 7 Blocks to /composable-demo Page');
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

  // Find the composable_page entry (the one rendered at /composable-demo)
  console.log('\nLocating composable_page entry...');
  const pageQuery = await stack
    .contentType('composable_page')
    .entry()
    .query({ query: { url: '/composable-demo' } })
    .find();

  const pageEntry = pageQuery.items?.[0];
  if (!pageEntry) {
    console.error('  No composable_page entry found at /composable-demo. Run create-composable-demo-page first.');
    process.exit(1);
  }
  console.log(`  Found: ${pageEntry.title} (${pageEntry.uid})`);

  // Find the first tile banner block + first hero 7 block
  console.log('\nLocating block entries to append...');
  const tileBlock = await findFirstEntry(stack, 'product_tile_banner_block');
  const heroBlock = await findFirstEntry(stack, 'hero_seven_block');

  if (!tileBlock) {
    console.error('  No product_tile_banner_block entry found. Run setup-product-tile-banner.');
    process.exit(1);
  }
  if (!heroBlock) {
    console.error('  No hero_seven_block entry found. Run setup-hero-seven.');
    process.exit(1);
  }
  console.log(`  Tile banner: ${tileBlock.title} (${tileBlock.uid})`);
  console.log(`  Hero 7:      ${heroBlock.title} (${heroBlock.uid})`);

  // Append to page_sections (skip if already present)
  const existingSections = pageEntry.page_sections || [];
  const existingUids = new Set(
    existingSections
      .map((ref) => (typeof ref === 'object' && ref !== null ? ref.uid : null))
      .filter(Boolean),
  );

  const additions = [];
  if (!existingUids.has(heroBlock.uid)) {
    additions.push({ uid: heroBlock.uid, _content_type_uid: 'hero_seven_block' });
  }
  if (!existingUids.has(tileBlock.uid)) {
    additions.push({ uid: tileBlock.uid, _content_type_uid: 'product_tile_banner_block' });
  }

  if (additions.length === 0) {
    console.log('\nBoth blocks already present in page_sections — nothing to do.');
    return;
  }

  console.log(`\nAppending ${additions.length} block reference(s)...`);
  pageEntry.page_sections = [...existingSections, ...additions];
  await pageEntry.update();
  console.log('  Page entry updated.');

  await publishEntry(stack, 'composable_page', pageEntry.uid);
  console.log('  Page entry published.');

  console.log('\nDone. Visit /composable-demo to see both blocks rendered together (and editable in Visual Builder).');
}

if (require.main === module) {
  main().catch((err) => {
    console.error('\nScript failed:', err.message);
    if (err.errors) console.error('Details:', JSON.stringify(err.errors, null, 2));
    process.exit(1);
  });
}
