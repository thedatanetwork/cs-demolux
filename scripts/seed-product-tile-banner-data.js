#!/usr/bin/env node

/**
 * Seed Product Tile Banner Data
 *
 * Uploads tile images to Contentstack as assets, creates a sample
 * product_tile_banner_block entry with 18 tiles, and creates a
 * product_tile_banner_page that references it.
 *
 * Run AFTER: npm run create-product-tile-banner-schemas
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

// 18 tiles themed around Demolux luxury wearable tech & technofurniture.
// Mix of "from $X" (price) and "up to N% off" (discount) badge styles to
// show the format flexibility editors get.
const tileSeeds = [
  {
    label: 'Smart Glasses',
    image_url: 'https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=800&auto=format&fit=crop',
    filename: 'tile-smart-glasses.jpg',
    eyebrow: 'from', prefix: '$', value: '899', suffix: '00', sublabel: '',
    link_url: '/categories/wearable-tech',
  },
  {
    label: "Designer Earbuds",
    image_url: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?q=80&w=800&auto=format&fit=crop',
    filename: 'tile-earbuds.jpg',
    eyebrow: 'up to', prefix: '', value: '40', suffix: '%', sublabel: 'off',
    link_url: '/categories/wearable-tech',
  },
  {
    label: 'Smart Lounge Chair',
    image_url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=800&auto=format&fit=crop',
    filename: 'tile-lounge.jpg',
    eyebrow: 'from', prefix: '$', value: '2,499', suffix: '', sublabel: '',
    link_url: '/categories/technofurniture',
  },
  {
    label: 'AR Headsets',
    image_url: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=800&auto=format&fit=crop',
    filename: 'tile-ar-headset.jpg',
    eyebrow: 'up to', prefix: '', value: '25', suffix: '%', sublabel: 'off',
    link_url: '/categories/wearable-tech',
  },
  {
    label: 'Smart Rings',
    image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop',
    filename: 'tile-rings.jpg',
    eyebrow: 'from', prefix: '$', value: '349', suffix: '99', sublabel: '',
    link_url: '/categories/wearable-tech',
  },
  {
    label: 'Connected Decor',
    image_url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=800&auto=format&fit=crop',
    filename: 'tile-decor.jpg',
    eyebrow: 'up to', prefix: '', value: '50', suffix: '%', sublabel: 'off',
    link_url: '/categories/technofurniture',
  },
  {
    label: 'Wellness Tech',
    image_url: 'https://images.unsplash.com/photo-1559563458-527698bf5295?q=80&w=800&auto=format&fit=crop',
    filename: 'tile-wellness.jpg',
    eyebrow: 'from', prefix: '$', value: '189', suffix: '', sublabel: '',
    link_url: '/categories/wearable-tech',
  },
  {
    label: 'Audio Pods',
    image_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop',
    filename: 'tile-audio-pods.jpg',
    eyebrow: 'from', prefix: '$', value: '1,099', suffix: '', sublabel: '',
    link_url: '/categories/wearable-tech',
  },
  {
    label: 'Holographic Mirrors',
    image_url: 'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=800&auto=format&fit=crop',
    filename: 'tile-mirrors.jpg',
    eyebrow: 'up to', prefix: '', value: '30', suffix: '%', sublabel: 'off',
    link_url: '/categories/technofurniture',
  },
  {
    label: 'Smart Lighting',
    image_url: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?q=80&w=800&auto=format&fit=crop',
    filename: 'tile-lighting.jpg',
    eyebrow: 'from', prefix: '$', value: '79', suffix: '99', sublabel: '',
    link_url: '/categories/technofurniture',
  },
  {
    label: 'Sensor Bands',
    image_url: 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?q=80&w=800&auto=format&fit=crop',
    filename: 'tile-bands.jpg',
    eyebrow: 'from', prefix: '$', value: '299', suffix: '', sublabel: '',
    link_url: '/categories/wearable-tech',
  },
  {
    label: 'Designer Hubs',
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop',
    filename: 'tile-hubs.jpg',
    eyebrow: 'up to', prefix: '', value: '20', suffix: '%', sublabel: 'off',
    link_url: '/categories/technofurniture',
  },
  {
    label: 'Wireless Chargers',
    image_url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800&auto=format&fit=crop',
    filename: 'tile-chargers.jpg',
    eyebrow: 'from', prefix: '$', value: '49', suffix: '99', sublabel: '',
    link_url: '/categories/technofurniture',
  },
  {
    label: 'Smart Watches',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
    filename: 'tile-watches.jpg',
    eyebrow: 'from', prefix: '$', value: '699', suffix: '', sublabel: '',
    link_url: '/categories/wearable-tech',
  },
  {
    label: 'Modular Desks',
    image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop',
    filename: 'tile-desks.jpg',
    eyebrow: 'up to', prefix: '', value: '35', suffix: '%', sublabel: 'off',
    link_url: '/categories/technofurniture',
  },
  {
    label: 'VR Headsets',
    image_url: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?q=80&w=800&auto=format&fit=crop',
    filename: 'tile-vr.jpg',
    eyebrow: 'from', prefix: '$', value: '1,499', suffix: '', sublabel: '',
    link_url: '/categories/wearable-tech',
  },
  {
    label: 'Ambient Speakers',
    image_url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800&auto=format&fit=crop',
    filename: 'tile-speakers.jpg',
    eyebrow: 'up to', prefix: '', value: '45', suffix: '%', sublabel: 'off',
    link_url: '/categories/technofurniture',
  },
  {
    label: 'Biometric Bands',
    image_url: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?q=80&w=800&auto=format&fit=crop',
    filename: 'tile-biometric.jpg',
    eyebrow: 'from', prefix: '$', value: '249', suffix: '99', sublabel: '',
    link_url: '/categories/wearable-tech',
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

async function findExistingAsset(stack, filename) {
  try {
    const result = await stack.asset().query({ query: { filename } }).find();
    if (result.items && result.items.length > 0) return result.items[0];
  } catch (_) {
    /* ignore */
  }
  return null;
}

async function uploadOrFindAsset(stack, tempDir, tile) {
  const existing = await findExistingAsset(stack, tile.filename);
  if (existing) {
    console.log(`    ~ ${tile.filename} (asset exists: ${existing.uid})`);
    return existing;
  }

  const tempFilePath = path.join(tempDir, tile.filename);
  console.log(`    ↓ ${tile.filename} (downloading)`);
  await downloadImage(tile.image_url, tempFilePath);

  const asset = await stack.asset().create({
    upload: tempFilePath,
    title: tile.label,
  });
  console.log(`    + ${tile.filename} (created: ${asset.uid})`);

  await asset.publish({
    publishDetails: {
      environments: [stackConfig.environment],
      locales: ['en-us'],
    },
  }).catch(() => { /* may already be published */ });

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
      // Update with new data
      Object.assign(entry, data);
      await entry.update();
      console.log(`      → updated`);
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
      publishDetails: {
        environments: [stackConfig.environment],
        locales: ['en-us'],
      },
    });
    return true;
  } catch (error) {
    const msg = error.message || '';
    if (msg.includes('already published') || msg.includes('already been published')) return true;
    console.error(`    ! Publish failed for ${entryUid}: ${msg}`);
    return false;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Seed Product Tile Banner Data');
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

  const tempDir = path.join(__dirname, 'temp-tile-images');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  try {
    // ── Step 1: Upload tile images as assets ────────────────────────────
    console.log('\n--- Step 1: Upload Tile Images ---');
    const tilesWithAssets = [];
    for (const tile of tileSeeds) {
      try {
        const asset = await uploadOrFindAsset(stack, tempDir, tile);
        tilesWithAssets.push({
          ...tile,
          // For file fields on entry create, Contentstack expects just the asset UID as a string
          image: asset.uid,
        });
      } catch (err) {
        console.error(`    ! ${tile.filename} skipped: ${err.message}`);
      }
      await new Promise((r) => setTimeout(r, 200));
    }

    // ── Step 2: Create product_tile_banner_block entry ──────────────────
    console.log('\n--- Step 2: Create Product Tile Banner Block ---');
    const blockData = {
      title: 'Spring Tile Banner Demo',
      eyebrow_label: 'Editorial Picks',
      section_title: 'Curated for the Season',
      section_description:
        'Each tile is fully customizable: pull in any product image, then dial in eyebrow, prefix, value, suffix, and sublabel for a totally custom price or discount badge — all retaining a consistent visual format.',
      columns: '6',
      background_style: 'white',
      badge_color: 'teal',
      tiles: tilesWithAssets.map((t) => ({
        image: t.image,
        label: t.label,
        link_url: t.link_url,
        eyebrow: t.eyebrow,
        prefix: t.prefix,
        value: t.value,
        suffix: t.suffix,
        sublabel: t.sublabel,
      })),
    };

    const blockUid = await ensureEntry(stack, 'product_tile_banner_block', blockData);
    if (!blockUid) {
      console.error('\nFailed to create block entry. Aborting.');
      process.exit(1);
    }
    await publishEntry(stack, 'product_tile_banner_block', blockUid);
    console.log('    Block published');

    // ── Step 3: Create product_tile_banner_page ─────────────────────────
    console.log('\n--- Step 3: Create Product Tile Banner Page ---');
    const pageData = {
      title: 'Product Tile Banner Demo',
      url: '/product-tile-banner',
      heading: 'Customizable Product Tile Banner',
      subheading:
        'Editor-controlled grid of product tiles with fully customizable text overlays. Eyebrow, prefix, value, suffix, and sublabel each render in a fixed position so editors get total flexibility while the format stays consistent.',
      tile_banners: [{ uid: blockUid, _content_type_uid: 'product_tile_banner_block' }],
    };

    const pageUid = await ensureEntry(stack, 'product_tile_banner_page', pageData, 'url');
    if (pageUid) {
      await publishEntry(stack, 'product_tile_banner_page', pageUid);
      console.log('    Page published');
    }

    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    console.log(`Tile assets:  ${tilesWithAssets.length}`);
    console.log(`Block entry:  ${blockUid ? 'created/updated' : 'FAILED'}`);
    console.log(`Page entry:   ${pageUid ? 'created/updated' : 'FAILED'}`);
    console.log('\nVisit /product-tile-banner to see the rendered banner.');
  } catch (error) {
    console.error('\nScript failed:', error.message);
    if (error.errors) console.error('Details:', JSON.stringify(error.errors, null, 2));
    process.exit(1);
  } finally {
    if (fs.existsSync(tempDir)) {
      try {
        for (const f of fs.readdirSync(tempDir)) fs.unlinkSync(path.join(tempDir, f));
        fs.rmdirSync(tempDir);
      } catch (_) { /* ignore */ }
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
