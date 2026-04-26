#!/usr/bin/env node

/**
 * Add badge_size + badge_angle Fields to product_tile_banner_block
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
    display_name: 'Badge Size',
    uid: 'badge_size',
    data_type: 'text',
    display_type: 'dropdown',
    enum: { advanced: false, choices: [{ value: 'small' }, { value: 'medium' }, { value: 'large' }] },
    mandatory: false,
    field_metadata: { default_value: 'medium', description: 'Overall size of the price tag' },
  },
  {
    display_name: 'Badge Angle',
    uid: 'badge_angle',
    data_type: 'text',
    display_type: 'dropdown',
    enum: {
      advanced: false,
      choices: [{ value: 'straight' }, { value: 'tilt_left' }, { value: 'tilt_right' }],
    },
    mandatory: false,
    field_metadata: {
      default_value: 'tilt_left',
      description: 'Rotation of the tag — tilt mimics a real paper tag dangling from a string',
    },
  },
];

async function main() {
  console.log('='.repeat(60));
  console.log('Add badge_size + badge_angle to product_tile_banner_block');
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

  const existingUids = new Set(contentType.schema.map((f) => f.uid));
  const tilesIndex = contentType.schema.findIndex((f) => f.uid === 'tiles');
  const insertAt = tilesIndex >= 0 ? tilesIndex : contentType.schema.length;

  let added = 0;
  for (const field of newFields) {
    if (existingUids.has(field.uid)) {
      console.log(`  ~ ${field.uid} (already exists)`);
      continue;
    }
    contentType.schema.splice(insertAt + added, 0, field);
    console.log(`  + ${field.uid}`);
    added++;
  }

  if (added === 0) {
    console.log('\nNo new fields to add.');
    return;
  }

  await contentType.update();
  console.log(`\nUpdated content type with ${added} new field(s).`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('\nScript failed:', err.message);
    if (err.errors) console.error('Details:', JSON.stringify(err.errors, null, 2));
    process.exit(1);
  });
}
