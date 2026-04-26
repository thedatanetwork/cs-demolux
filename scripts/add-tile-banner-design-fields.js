#!/usr/bin/env node

/**
 * Add Design Option Fields to product_tile_banner_block
 *
 * Patches the existing content type with editor-controllable design fields:
 *   - badge_shape, badge_position
 *   - tile_aspect_ratio, tile_image_fit, tile_background
 *   - corner_radius, label_alignment, show_labels, gap_size
 *
 * Idempotent: skips fields that already exist.
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
};

const newFields = [
  {
    display_name: 'Badge Shape',
    uid: 'badge_shape',
    data_type: 'text',
    display_type: 'dropdown',
    enum: { advanced: false, choices: [{ value: 'price_tag' }, { value: 'rectangle' }, { value: 'pill' }] },
    mandatory: false,
    field_metadata: { default_value: 'price_tag', description: 'Visual shape of the price/discount badge overlay' },
  },
  {
    display_name: 'Badge Position',
    uid: 'badge_position',
    data_type: 'text',
    display_type: 'dropdown',
    enum: { advanced: false, choices: [{ value: 'top_left' }, { value: 'top_right' }] },
    mandatory: false,
    field_metadata: { default_value: 'top_left', description: 'Corner of the tile where the badge appears' },
  },
  {
    display_name: 'Tile Aspect Ratio',
    uid: 'tile_aspect_ratio',
    data_type: 'text',
    display_type: 'dropdown',
    enum: {
      advanced: false,
      choices: [
        { value: 'square' },
        { value: 'portrait_4_5' },
        { value: 'portrait_3_4' },
        { value: 'landscape_4_3' },
      ],
    },
    mandatory: false,
    field_metadata: { default_value: 'square', description: 'Aspect ratio of each tile image area' },
  },
  {
    display_name: 'Tile Image Fit',
    uid: 'tile_image_fit',
    data_type: 'text',
    display_type: 'dropdown',
    enum: { advanced: false, choices: [{ value: 'cover' }, { value: 'contain' }] },
    mandatory: false,
    field_metadata: {
      default_value: 'cover',
      description: 'cover crops to fill the tile; contain shows the full image with padding',
    },
  },
  {
    display_name: 'Tile Background',
    uid: 'tile_background',
    data_type: 'text',
    display_type: 'dropdown',
    enum: {
      advanced: false,
      choices: [{ value: 'transparent' }, { value: 'white' }, { value: 'soft_gray' }, { value: 'soft_warm' }],
    },
    mandatory: false,
    field_metadata: {
      default_value: 'transparent',
      description: 'Background behind tile image (most visible when image fit is contain)',
    },
  },
  {
    display_name: 'Corner Radius',
    uid: 'corner_radius',
    data_type: 'text',
    display_type: 'dropdown',
    enum: {
      advanced: false,
      choices: [{ value: 'none' }, { value: 'small' }, { value: 'medium' }, { value: 'large' }],
    },
    mandatory: false,
    field_metadata: { default_value: 'medium', description: 'Roundness of tile corners' },
  },
  {
    display_name: 'Label Alignment',
    uid: 'label_alignment',
    data_type: 'text',
    display_type: 'dropdown',
    enum: { advanced: false, choices: [{ value: 'center' }, { value: 'left' }] },
    mandatory: false,
    field_metadata: { default_value: 'center', description: 'Horizontal alignment of tile caption' },
  },
  {
    display_name: 'Show Labels',
    uid: 'show_labels',
    data_type: 'boolean',
    mandatory: false,
    field_metadata: { default_value: true, description: 'Toggle the caption label under each tile' },
  },
  {
    display_name: 'Gap Size',
    uid: 'gap_size',
    data_type: 'text',
    display_type: 'dropdown',
    enum: { advanced: false, choices: [{ value: 'tight' }, { value: 'normal' }, { value: 'loose' }] },
    mandatory: false,
    field_metadata: { default_value: 'normal', description: 'Spacing between tiles' },
  },
];

async function main() {
  console.log('='.repeat(60));
  console.log('Add Design Fields to product_tile_banner_block');
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

  console.log('\nFetching content type...');
  const contentType = await stack.contentType('product_tile_banner_block').fetch();
  console.log(`  Found: ${contentType.title}`);

  const existingUids = new Set(contentType.schema.map((f) => f.uid));
  const tilesIndex = contentType.schema.findIndex((f) => f.uid === 'tiles');
  const insertAt = tilesIndex >= 0 ? tilesIndex : contentType.schema.length;

  let added = 0;
  let skipped = 0;
  // Insert new fields BEFORE the tiles group so they sit with the other config fields in the editor
  for (const field of newFields) {
    if (existingUids.has(field.uid)) {
      console.log(`  ~ ${field.uid} (already exists)`);
      skipped++;
      continue;
    }
    contentType.schema.splice(insertAt + added, 0, field);
    console.log(`  + ${field.uid}`);
    added++;
  }

  if (added === 0) {
    console.log('\nNo new fields to add. All design fields already present.');
    return;
  }

  console.log(`\nUpdating content type with ${added} new field(s)...`);
  await contentType.update();
  console.log('  Updated successfully.');

  console.log('\n' + '='.repeat(60));
  console.log(`Added: ${added}    Skipped: ${skipped}`);
  console.log('='.repeat(60));
}

if (require.main === module) {
  main().catch((err) => {
    console.error('\nScript failed:', err.message);
    if (err.errors) console.error('Details:', JSON.stringify(err.errors, null, 2));
    process.exit(1);
  });
}
