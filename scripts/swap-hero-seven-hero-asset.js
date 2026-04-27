#!/usr/bin/env node

/**
 * Swap the Hero 7 entry's first tile (the hero) to point at an existing
 * Demolux-branded asset by filename, instead of the Curology stock photo
 * that the original seed pulled from Unsplash.
 *
 * Default target: halovibe_lifestyle.png (warm interior with a smart
 * coffee table — fits the "Spring Tech Sale" pitch and has mid-tones
 * that work with either light or dark overlay text).
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'dev',
};

const TARGET_FILENAME = process.env.HERO_FILENAME || 'halovibe_lifestyle.png';

async function findAsset(stack, filename) {
  const result = await stack.asset().query({ query: { filename } }).find();
  return result.items?.[0] || null;
}

async function publishEntry(stack, ct, uid) {
  try {
    const e = await stack.contentType(ct).entry(uid).fetch();
    await e.publish({
      publishDetails: { environments: [stackConfig.environment], locales: ['en-us'] },
    });
  } catch (err) {
    const m = err.message || '';
    if (!m.includes('already published') && !m.includes('already been published')) {
      console.error('  ! Publish failed:', m);
    }
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Swap Hero 7 Hero Asset → ' + TARGET_FILENAME);
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

  const asset = await findAsset(stack, TARGET_FILENAME);
  if (!asset) {
    console.error(`  Asset ${TARGET_FILENAME} not found.`);
    process.exit(1);
  }
  console.log(`  Asset: ${asset.uid}`);

  const result = await stack.contentType('hero_seven_block').entry().query().find();
  const entry = result.items?.[0];
  if (!entry) {
    console.error('  No hero_seven_block entry found.');
    process.exit(1);
  }
  console.log(`  Entry: ${entry.title} (${entry.uid})`);

  if (!entry.tiles || !entry.tiles[0]) {
    console.error('  Entry has no tiles.');
    process.exit(1);
  }

  entry.tiles[0].image = asset.uid;
  await entry.update();
  console.log('  Tile 0 (hero) image updated.');
  await publishEntry(stack, 'hero_seven_block', entry.uid);
  console.log('  Entry republished.');

  console.log('\nDone. Visit /hero-seven to confirm.');
}

if (require.main === module) {
  main().catch((err) => {
    console.error('\nScript failed:', err.message);
    if (err.errors) console.error('Details:', JSON.stringify(err.errors, null, 2));
    process.exit(1);
  });
}
