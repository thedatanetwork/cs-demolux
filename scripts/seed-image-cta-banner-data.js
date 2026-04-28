#!/usr/bin/env node

/**
 * Seed sample Image CTA Banner Block entries.
 *
 * Two entries, each demonstrating a different CTA placement pattern:
 *   1. "Daily Deals Sample"   — single Shop All CTA pinned bottom-center,
 *                                nudged ~5% above the bottom edge.
 *   2. "Laura Ashley Sample" — Shop Now CTA pinned middle-left with a
 *                                large offset_x so it lands further into
 *                                the image (under where a baked-in
 *                                wordmark would sit).
 *
 * Run AFTER: npm run create-image-cta-banner-schema
 *
 * Idempotent: existing entries with the same title are updated and
 * re-published; otherwise fresh entries are created.
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

const CT_UID = 'image_cta_banner_block';

// Wide-banner lifestyle imagery — replace via the CMS once the editor has
// finalized creatives. Both images are wider than they are tall so the
// natural aspect ratio reads as a banner.
const imageSeeds = [
  {
    filename: 'image-cta-daily-deals.jpg',
    title: 'Daily Deals — Bedroom Sets',
    image_url:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop',
  },
  {
    filename: 'image-cta-laura-ashley.jpg',
    title: 'Laura Ashley Home — Soft Florals',
    image_url:
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1600&auto=format&fit=crop',
  },
];

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https
      .get(url, (response) => {
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
      })
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
  } catch (_) {
    /* ignore */
  }
  return null;
}

async function uploadOrFindAsset(stack, tempDir, seed) {
  const existing = await findAssetByFilename(stack, seed.filename);
  if (existing) {
    console.log(`    ~ ${seed.filename} (asset exists: ${existing.uid})`);
    return existing;
  }
  const tempFilePath = path.join(tempDir, seed.filename);
  console.log(`    ↓ ${seed.filename} (downloading)`);
  await downloadImage(seed.image_url, tempFilePath);
  const asset = await stack.asset().create({ upload: tempFilePath, title: seed.title });
  console.log(`    + ${seed.filename} (created: ${asset.uid})`);
  await asset
    .publish({
      publishDetails: { environments: [stackConfig.environment], locales: ['en-us'] },
    })
    .catch(() => {});
  fs.unlinkSync(tempFilePath);
  return asset;
}

async function ensureEntry(stack, contentTypeUid, data) {
  try {
    const existing = await stack
      .contentType(contentTypeUid)
      .entry()
      .query({ query: { title: data.title } })
      .find();
    if (existing.items && existing.items.length > 0) {
      const entry = existing.items[0];
      console.log(`    ~ ${data.title} (entry exists: ${entry.uid})`);
      Object.assign(entry, data);
      await entry.update();
      console.log('      → updated');
      return entry.uid;
    }
    const created = await stack.contentType(contentTypeUid).entry().create({ entry: data });
    console.log(`    + ${data.title} (entry created: ${created.uid})`);
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
  console.log('Seed Image CTA Banner Data');
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

  const tempDir = path.join(__dirname, 'temp-image-cta-images');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  try {
    console.log('\n--- Step 1: Source Images ---');
    const [dailyDealsAsset, lauraAshleyAsset] = await Promise.all([
      uploadOrFindAsset(stack, tempDir, imageSeeds[0]),
      uploadOrFindAsset(stack, tempDir, imageSeeds[1]),
    ]);

    console.log('\n--- Step 2: "Daily Deals Sample" entry ---');
    const dailyDealsData = {
      title: 'Daily Deals Sample',
      image: dailyDealsAsset.uid,
      image_alt: 'Comforter sets bedroom scene — daily deals creative',
      image_object_fit: 'cover',
      aspect_ratio: '21_9',
      background_color: 'transparent',
      ctas: [
        {
          label: 'Shop All',
          url: '/categories/technofurniture',
          open_in_new_tab: false,
          // Pin to bottom-center, lifted ~5% off the bottom edge so it sits
          // just inside the frame instead of on the very edge.
          position: 'bottom_center',
          offset_x: 0,
          offset_y: -6,
          variant: 'pill_dark',
          size: 'md',
          font_weight: 'semibold',
          uppercase: false,
        },
      ],
    };
    const dailyDealsUid = await ensureEntry(stack, CT_UID, dailyDealsData);
    if (dailyDealsUid) await publishEntry(stack, CT_UID, dailyDealsUid);

    console.log('\n--- Step 3: "Laura Ashley Sample" entry ---');
    const lauraAshleyData = {
      title: 'Laura Ashley Sample',
      image: lauraAshleyAsset.uid,
      image_alt: 'Laura Ashley Home soft florals lifestyle banner',
      image_object_fit: 'cover',
      aspect_ratio: '5_2',
      background_color: 'soft_gray',
      ctas: [
        {
          label: 'Shop Now',
          url: '/categories/wearable-tech',
          open_in_new_tab: false,
          // Anchor middle-left and shift right ~22% so the CTA lands further
          // into the creative — roughly under where an image-baked wordmark
          // would sit on a Laura Ashley-style banner.
          position: 'middle_left',
          offset_x: 22,
          offset_y: 8,
          variant: 'pill_outline_light',
          size: 'lg',
          font_weight: 'bold',
          uppercase: false,
        },
      ],
    };
    const lauraAshleyUid = await ensureEntry(stack, CT_UID, lauraAshleyData);
    if (lauraAshleyUid) await publishEntry(stack, CT_UID, lauraAshleyUid);

    console.log('\n' + '='.repeat(60));
    console.log('Done.');
    console.log('Daily Deals UID:  ', dailyDealsUid || '(failed)');
    console.log('Laura Ashley UID: ', lauraAshleyUid || '(failed)');
    console.log('='.repeat(60));
  } finally {
    if (fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (_) {
        /* ignore */
      }
    }
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('\nScript failed:', err.message);
    if (err.errors) console.error('Details:', JSON.stringify(err.errors, null, 2));
    process.exit(1);
  });
}

module.exports = { main };
