#!/usr/bin/env node

/**
 * Seed Hero 7 Data
 *
 * Uploads 1 hero image, finds 6 existing tile assets to reuse as secondary
 * tiles, creates a hero_seven_block entry, and creates a hero_seven_page
 * that references it.
 *
 * Run AFTER: npm run create-hero-seven-schemas
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

// Hero image to upload (themed for Demolux)
const heroSeed = {
  filename: 'hero-seven-spring-tech.jpg',
  title: 'Spring Tech Sale Hero',
  // Calm interior with gadgets — works as a "shoppable lifestyle scene"
  image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1600&auto=format&fit=crop',
};

// Secondary tiles: pull 6 existing tile assets from previous demo by filename,
// pair each with a category-style label and link.
const secondarySeeds = [
  { filename: 'tile-smart-glasses.jpg', label: 'Smart Glasses', link_url: '/categories/wearable-tech' },
  { filename: 'tile-earbuds.jpg', label: 'Audio', link_url: '/categories/wearable-tech' },
  { filename: 'tile-rings.jpg', label: 'Smart Rings', link_url: '/categories/wearable-tech' },
  { filename: 'tile-lounge.jpg', label: 'Lounge', link_url: '/categories/technofurniture' },
  { filename: 'tile-lighting.jpg', label: 'Lighting', link_url: '/categories/technofurniture' },
  { filename: 'tile-decor.jpg', label: 'Decor', link_url: '/categories/technofurniture' },
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
    .catch(() => {
      /* may already be published */
    });

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
      publishDetails: { environments: [stackConfig.environment], locales: ['en-us'] },
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
  console.log('Seed Hero 7 Data');
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

  const tempDir = path.join(__dirname, 'temp-hero-images');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  try {
    // ── Step 1: Hero image ───────────────────────────────────────────────
    console.log('\n--- Step 1: Hero Image ---');
    const heroAsset = await uploadOrFindAsset(stack, tempDir, heroSeed);

    // ── Step 2: Find existing secondary tile assets (re-use from prior demo) ─
    console.log('\n--- Step 2: Locate Secondary Tile Assets ---');
    const secondaryAssets = [];
    for (const seed of secondarySeeds) {
      const asset = await findAssetByFilename(stack, seed.filename);
      if (asset) {
        console.log(`    ~ ${seed.filename} (${asset.uid})`);
        secondaryAssets.push({ asset, ...seed });
      } else {
        console.log(`    ! ${seed.filename} not found — run seed-product-tile-banner-data first`);
      }
    }

    if (secondaryAssets.length === 0) {
      console.error('\nNo secondary tile assets found. Run seed-product-tile-banner-data first.');
      process.exit(1);
    }

    // ── Step 3: Create hero_seven_block entry ────────────────────────────
    console.log('\n--- Step 3: Create Hero 7 Block ---');
    const tiles = [
      // First tile = HERO with overlay text
      {
        image: heroAsset.uid,
        link_url: '/categories/wearable-tech',
        overlay_headline: 'Our Spring Tech Sale of the Season',
        overlay_subheadline: 'Up to 50% off selected wearables and connected home pieces.',
        overlay_cta_label: 'Shop All',
      },
      // Remaining tiles = secondary grid
      ...secondaryAssets.map((s) => ({
        image: s.asset.uid,
        label: s.label,
        link_url: s.link_url,
      })),
    ];

    const blockData = {
      title: 'Spring Hero 7 Demo',
      eyebrow_label: 'Editorial',
      section_title: 'Hero 7 Layout',
      section_description:
        'One large hero tile on the left with overlay copy and a CTA, plus a tight grid of secondary tiles filling the rest of the canvas. Editors compose by adding tiles to a single ordered list — the first tile is the hero.',
      background_style: 'white',
      right_columns: '3',
      right_rows: '2',
      hero_position: 'left',
      hero_overlay_position: 'top_left',
      hero_overlay_text_color: 'light',
      show_hero_scrim: true,
      show_tile_labels: true,
      tile_corner_radius: 'medium',
      gap_size: 'normal',
      tiles,
    };

    const blockUid = await ensureEntry(stack, 'hero_seven_block', blockData);
    if (!blockUid) {
      console.error('\nFailed to create block. Aborting.');
      process.exit(1);
    }
    await publishEntry(stack, 'hero_seven_block', blockUid);
    console.log('    Block published');

    // ── Step 4: Create hero_seven_page ───────────────────────────────────
    console.log('\n--- Step 4: Create Hero 7 Page ---');
    const pageData = {
      title: 'Hero 7 Demo Page',
      url: '/hero-seven',
      heading: 'Hero 7 Layout',
      subheading:
        'A "Hero 7" composition: one big featured tile with overlay copy, plus six smaller tiles filling the secondary grid. First entry in the tiles list becomes the hero.',
      hero_banners: [{ uid: blockUid, _content_type_uid: 'hero_seven_block' }],
    };

    const pageUid = await ensureEntry(stack, 'hero_seven_page', pageData, 'url');
    if (pageUid) {
      await publishEntry(stack, 'hero_seven_page', pageUid);
      console.log('    Page published');
    }

    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    console.log(`Hero asset:       ${heroAsset.uid}`);
    console.log(`Secondary tiles:  ${secondaryAssets.length}`);
    console.log(`Block entry:      ${blockUid}`);
    console.log(`Page entry:       ${pageUid}`);
    console.log('\nVisit /hero-seven to see the rendered banner.');
  } catch (error) {
    console.error('\nScript failed:', error.message);
    if (error.errors) console.error('Details:', JSON.stringify(error.errors, null, 2));
    process.exit(1);
  } finally {
    if (fs.existsSync(tempDir)) {
      try {
        for (const f of fs.readdirSync(tempDir)) fs.unlinkSync(path.join(tempDir, f));
        fs.rmdirSync(tempDir);
      } catch (_) {
        /* ignore */
      }
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
