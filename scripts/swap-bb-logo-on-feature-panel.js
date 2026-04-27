#!/usr/bin/env node

/**
 * Download the Brooks Brothers x Brain Dead logo from brooksbrothers.com
 * and assign it to panel 1 of the feature_banner_row_block entry.
 * Idempotent: skips upload if asset already exists by filename.
 */

const contentstack = require('@contentstack/management');
const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'dev',
};

const SOURCE_URL =
  'https://www.brooksbrothers.com/on/demandware.static/-/Sites-brooksbrothers-Library/default/images/site/20260422/2026-0422_HP-MID-feat_brooksbrothers-braindead-logo_xs.png';
const FILENAME = 'bb-braindead-logo.png';
const TITLE = 'Brooks Brothers x Brain Dead Logo';

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https
      .get(
        url,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
            Accept: 'image/avif,image/webp,image/png,image/svg+xml,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            Referer: 'https://www.brooksbrothers.com/',
            'Sec-Fetch-Dest': 'image',
            'Sec-Fetch-Mode': 'no-cors',
            'Sec-Fetch-Site': 'same-origin',
          },
        },
        (response) => {
          if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
            file.close();
            fs.unlink(filepath, () => {});
            return downloadImage(response.headers.location, filepath).then(resolve, reject);
          }
          if (response.statusCode !== 200) {
            file.close();
            fs.unlink(filepath, () => {});
            return reject(new Error(`Download failed (${response.statusCode}) for ${url}`));
          }
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        },
      )
      .on('error', (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
  });
}

async function findAssetByFilename(stack, filename) {
  try {
    const result = await stack.asset().query({ query: { filename } }).find();
    if (result.items && result.items.length > 0) return result.items[0];
  } catch (_) {}
  return null;
}

async function publishAsset(stack, asset) {
  try {
    await asset.publish({
      publishDetails: { environments: [stackConfig.environment], locales: ['en-us'] },
    });
  } catch (_) {}
}

async function main() {
  console.log('='.repeat(60));
  console.log('Swap BB Brain Dead Logo onto Feature Panel');
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

  // Step 1: Upload asset if needed
  console.log('\n--- Step 1: Asset ---');
  let asset = await findAssetByFilename(stack, FILENAME);
  if (asset) {
    console.log(`  ~ ${FILENAME} (asset exists: ${asset.uid})`);
  } else {
    const tempDir = path.join(__dirname, 'temp-bb-logo');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    const tempFilePath = path.join(tempDir, FILENAME);
    try {
      console.log(`  ↓ downloading from brooksbrothers.com...`);
      await downloadImage(SOURCE_URL, tempFilePath);
      const stats = fs.statSync(tempFilePath);
      console.log(`    (${stats.size} bytes)`);
      asset = await stack.asset().create({ upload: tempFilePath, title: TITLE });
      console.log(`  + ${FILENAME} (created: ${asset.uid})`);
      await publishAsset(stack, asset);
      console.log(`    published to ${stackConfig.environment}`);
    } finally {
      try {
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        fs.rmdirSync(tempDir);
      } catch (_) {}
    }
  }

  // Step 2: Find feature_banner_row_block entry and update panel 1's logo
  console.log('\n--- Step 2: Update feature_banner_row_block panel 1 ---');
  const result = await stack
    .contentType('feature_banner_row_block')
    .entry()
    .query()
    .find();
  const entry = result.items?.[0];
  if (!entry) {
    console.error('  No feature_banner_row_block entry found.');
    process.exit(1);
  }
  console.log(`  Entry: ${entry.title} (${entry.uid})`);

  if (!entry.panels || !entry.panels[0]) {
    console.error('  Entry has no panels. Aborting.');
    process.exit(1);
  }

  entry.panels[0].logo_image = asset.uid;
  await entry.update();
  console.log('  Panel 1 logo_image set.');

  // Re-publish entry
  const fresh = await stack.contentType('feature_banner_row_block').entry(entry.uid).fetch();
  await fresh
    .publish({
      publishDetails: { environments: [stackConfig.environment], locales: ['en-us'] },
    })
    .catch(() => {});
  console.log('  Entry republished.');

  console.log('\nDone. Panel 1 now uses the BB Brain Dead logo.');
}

if (require.main === module) {
  main().catch((err) => {
    console.error('\nScript failed:', err.message);
    if (err.errors) console.error('Details:', JSON.stringify(err.errors, null, 2));
    process.exit(1);
  });
}
