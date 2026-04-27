#!/usr/bin/env node

/**
 * Seed a sample Flash Sale Banner Block entry that mirrors the
 * "Jewelry Flash Sale" reference banner — orange eyebrow tag, three-part
 * composite headline (Jewelry / Flash / Sale), two discount callouts
 * (up to 60% OFF + extra 40% OFF*), small disclaimer with *Details link,
 * and a right-side product image. The lightning-bolt left icon is left
 * blank — drop your own transparent PNG/SVG via the CMS once seeded.
 *
 * Run AFTER: npm run create-flash-sale-banner-schema
 *
 * Idempotent: if an entry with the same title already exists, it is
 * updated and re-published; otherwise a fresh one is created.
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

const ENTRY_TITLE = 'Jewelry Flash Sale Banner';

// Right-side product image. Cover-style works fine since the component
// renders it object-contain in a small fixed-aspect slot.
const rightImageSeed = {
  filename: 'flash-sale-jewelry-earrings.jpg',
  title: 'Diamond Stud Earrings',
  image_url: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?q=80&w=600&auto=format&fit=crop',
};

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

async function ensureEntry(stack, contentTypeUid, data, matchField = 'title') {
  try {
    const existing = await stack
      .contentType(contentTypeUid)
      .entry()
      .query({ query: { [matchField]: data[matchField] } })
      .find();
    if (existing.items && existing.items.length > 0) {
      const entry = existing.items[0];
      console.log(`    ~ ${data[matchField]} (entry exists: ${entry.uid})`);
      Object.assign(entry, data);
      await entry.update();
      console.log('      → updated');
      return entry.uid;
    }
    const created = await stack.contentType(contentTypeUid).entry().create({ entry: data });
    console.log(`    + ${data[matchField]} (entry created: ${created.uid})`);
    return created.uid;
  } catch (error) {
    console.error(`    ! ${data[matchField]}: ${error.message}`);
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
  console.log('Seed Flash Sale Banner Data');
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

  const tempDir = path.join(__dirname, 'temp-flash-sale-images');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  try {
    console.log('\n--- Step 1: Right Product Image ---');
    const rightImageAsset = await uploadOrFindAsset(stack, tempDir, rightImageSeed);

    console.log('\n--- Step 2: Create flash_sale_banner_block entry ---');
    const entryData = {
      title: ENTRY_TITLE,

      eyebrow_tag: 'Online Only | Ends 4/29',
      eyebrow_tag_color: 'orange',

      title_lead: 'Jewelry',
      title_lead_weight: 'bold',
      title_lead_style: 'normal',

      title_middle: 'Flash',
      title_middle_weight: 'regular',
      title_middle_style: 'italic',

      title_tail: 'Sale',
      title_tail_weight: 'bold',
      title_tail_style: 'normal',

      discount_callouts: [
        { eyebrow: 'up to', value: '60', unit: '%', suffix: 'OFF' },
        { eyebrow: 'extra', value: '40', unit: '%', suffix: 'OFF*' },
      ],

      disclaimer: 'select styles with code',
      disclaimer_link_text: '*Details',
      disclaimer_link_url: '/sale-details',

      // left_icon left blank — drop your own lightning-bolt PNG/SVG in the CMS
      right_image: rightImageAsset.uid,

      background_color: 'black',
      text_color: 'light',

      cta_link_url: '/categories/wearable-tech',
      height: 'standard',
    };

    const entryUid = await ensureEntry(stack, 'flash_sale_banner_block', entryData);
    if (!entryUid) {
      console.error('\nFailed to create entry. Aborting.');
      process.exit(1);
    }

    const published = await publishEntry(stack, 'flash_sale_banner_block', entryUid);
    if (published) console.log('    Entry published');

    console.log('\n' + '='.repeat(60));
    console.log('Done.');
    console.log('Entry UID:', entryUid);
    console.log('Tip: add a lightning-bolt transparent icon to the Left Icon');
    console.log('     field in the CMS to fully match the reference banner.');
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
