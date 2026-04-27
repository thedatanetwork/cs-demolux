#!/usr/bin/env node

/**
 * Seed Feature Banner Row Data
 *
 * Creates a 3-panel demo entry mirroring the Brooks Brothers splitContainer
 * pattern, themed for Demolux:
 *   1. "INTRODUCING" panel with logo overlay (collab style)
 *   2. Italic-emphasis headline panel ("the Smart Wearable")
 *   3. Multi-CTA panel with multi-line description (new arrivals)
 *
 * Run AFTER: npm run create-feature-banner-row-schemas
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

// Backgrounds for the three panels
const backgroundSeeds = [
  {
    filename: 'feature-panel-collab.jpg',
    title: 'Demolux x ArcLight Collab',
    image_url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=1200&auto=format&fit=crop',
  },
  {
    filename: 'feature-panel-wearable.jpg',
    title: 'Smart Wearable Editorial',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop',
  },
  {
    filename: 'feature-panel-spring-edit.jpg',
    title: 'Spring Tech Edit',
    image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop',
  },
];

// Logo for panel 1 (the "Brain Dead-style" inline logo). We re-use a small
// icon-friendly asset already in the stack if one exists, otherwise upload.
const logoSeed = {
  filename: 'feature-panel-arclight-logo.png',
  title: 'ArcLight Collab Logo',
  image_url: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=400&auto=format&fit=crop',
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
    console.error(`    ! Publish failed: ${msg}`);
    return false;
  }
}

// ──────────────────────────────────────────────────────────────────────────
// JSON RTE document builders
// Contentstack JSON RTE document format (Slate-based). Every node needs a
// unique UID across all RTE fields in the same entry.
// ──────────────────────────────────────────────────────────────────────────
const rteUid = (prefix) => prefix + '_' + Math.random().toString(36).slice(2, 10);

const rteDoc = (...children) => ({
  type: 'doc',
  uid: rteUid('doc'),
  attrs: {},
  children,
});

const rteParagraph = (...children) => ({
  type: 'p',
  uid: rteUid('p'),
  attrs: {},
  children,
});

const rteText = (text, marks = {}) => ({ text, ...marks });

// ──────────────────────────────────────────────────────────────────────────
// Three panel definitions (Demolux-themed, BB-pattern)
// ──────────────────────────────────────────────────────────────────────────
function buildPanels(bgUids, logoUid) {
  return [
    // Panel 1: "INTRODUCING ... [logo] ... description" — collab style
    {
      background_image: bgUids[0],
      eyebrow: 'INTRODUCING',
      logo_image: logoUid,
      headline: rteDoc(rteParagraph(rteText('Demolux × ArcLight'))),
      description: rteDoc(
        rteParagraph(
          rteText('A limited collab on ambient connected lighting — '),
          rteText('handcrafted', { italic: true }),
          rteText(' for the home that thinks for itself.'),
        ),
      ),
      text_position: 'top_center',
      text_color: 'dark',
      show_scrim: true,
      ctas: [{ label: 'SHOP THE COLLAB', url: '/categories/technofurniture', style: 'primary' }],
    },
    // Panel 2: italic-on-one-word headline ("the Smart Wearable") — Cropped Button-Down style
    {
      background_image: bgUids[1],
      headline: rteDoc(
        rteParagraph(rteText('the ', { italic: true }), rteText('Smart Wearable')),
      ),
      description: rteDoc(rteParagraph(rteText('A new take on luxury connected accessories.'))),
      text_position: 'top_center',
      text_color: 'light',
      show_scrim: true,
      ctas: [{ label: 'SHOP WEARABLES', url: '/categories/wearable-tech', style: 'primary' }],
    },
    // Panel 3: multi-CTA + multi-line description — April New Arrivals style
    {
      background_image: bgUids[2],
      headline: rteDoc(rteParagraph(rteText('Spring Tech Edit'))),
      description: rteDoc(
        rteParagraph(
          rteText('Curated technology for the season ahead — wearables, lighting, '),
          rteText('and the connected pieces designed to live with you.'),
        ),
      ),
      text_position: 'top_center',
      text_color: 'dark',
      show_scrim: true,
      ctas: [
        { label: 'SHOP WOMEN', url: '/categories/wearable-tech', style: 'primary' },
        { label: 'SHOP MEN', url: '/categories/technofurniture', style: 'primary' },
      ],
    },
  ];
}

async function main() {
  console.log('='.repeat(60));
  console.log('Seed Feature Banner Row Data');
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

  const tempDir = path.join(__dirname, 'temp-feature-images');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  try {
    // Step 1: Backgrounds
    console.log('\n--- Step 1: Background Images ---');
    const bgAssets = [];
    for (const seed of backgroundSeeds) {
      const a = await uploadOrFindAsset(stack, tempDir, seed);
      bgAssets.push(a);
    }

    // Step 2: Logo
    console.log('\n--- Step 2: Logo Overlay ---');
    const logoAsset = await uploadOrFindAsset(stack, tempDir, logoSeed);

    // Step 3: Build block entry
    console.log('\n--- Step 3: Create feature_banner_row_block ---');
    const panels = buildPanels(
      bgAssets.map((a) => a.uid),
      logoAsset.uid,
    );

    const blockData = {
      title: 'Spring Feature Row Demo',
      eyebrow_label: 'Editorial',
      section_title: 'Three Panels, One Component',
      section_description:
        'Same content type, three different layouts. Eyebrow, logo overlay, italic emphasis, multi-CTA — all powered by structured fields plus a governed JSON RTE for inline emphasis.',
      background_style: 'white',
      panel_count: '3',
      panel_aspect_ratio: 'portrait_4_5',
      gap_size: 'normal',
      corner_radius: 'medium',
      panels,
    };

    const blockUid = await ensureEntry(stack, 'feature_banner_row_block', blockData);
    if (!blockUid) {
      console.error('\nFailed to create block entry. Aborting.');
      process.exit(1);
    }
    await publishEntry(stack, 'feature_banner_row_block', blockUid);
    console.log('    Block published');

    // Step 4: Page entry
    console.log('\n--- Step 4: Create feature_banner_row_page ---');
    const pageData = {
      title: 'Feature Banner Row Demo Page',
      url: '/feature-banner-row',
      heading: 'Feature Banner Row',
      subheading:
        'Three feature panels in a single row — same component, three different layouts. Demonstrates a governed JSON RTE pattern: editors get italic, bold, line breaks, inline images, and links inside the brand typography system.',
      banners: [{ uid: blockUid, _content_type_uid: 'feature_banner_row_block' }],
    };

    const pageUid = await ensureEntry(stack, 'feature_banner_row_page', pageData, 'url');
    if (pageUid) {
      await publishEntry(stack, 'feature_banner_row_page', pageUid);
      console.log('    Page published');
    }

    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    console.log(`Backgrounds:  ${bgAssets.length}`);
    console.log(`Logo:         ${logoAsset.uid}`);
    console.log(`Block entry:  ${blockUid}`);
    console.log(`Page entry:   ${pageUid}`);
    console.log('\nVisit /feature-banner-row to see the rendered banner.');
  } catch (error) {
    console.error('\nScript failed:', error.message);
    if (error.errors) console.error('Details:', JSON.stringify(error.errors, null, 2));
    process.exit(1);
  } finally {
    if (fs.existsSync(tempDir)) {
      try {
        for (const f of fs.readdirSync(tempDir)) fs.unlinkSync(path.join(tempDir, f));
        fs.rmdirSync(tempDir);
      } catch (_) {}
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
