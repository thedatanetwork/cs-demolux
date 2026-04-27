#!/usr/bin/env node

/**
 * Add tile_label_size Field to product_tile_banner_block.
 * Controls the caption-under-tile font size independently of the badge.
 * Idempotent.
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
};

const newField = {
  display_name: 'Tile Label Size',
  uid: 'tile_label_size',
  data_type: 'text',
  display_type: 'dropdown',
  enum: {
    advanced: false,
    choices: [
      { value: 'sm' },
      { value: 'md' },
      { value: 'lg' },
      { value: 'xl' },
      { value: '2xl' },
    ],
  },
  mandatory: false,
  field_metadata: {
    default_value: 'lg',
    description:
      'Caption-under-tile font size. sm = small, md = medium, lg = large (default), xl/2xl = display.',
  },
};

async function main() {
  console.log('='.repeat(60));
  console.log('Add tile_label_size to product_tile_banner_block');
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

  const ct = await stack.contentType('product_tile_banner_block').fetch();

  if (ct.schema.some((f) => f.uid === newField.uid)) {
    console.log(`\n  ~ ${newField.uid} (already exists)`);
    return;
  }

  const tilesIndex = ct.schema.findIndex((f) => f.uid === 'tiles');
  ct.schema.splice(tilesIndex >= 0 ? tilesIndex : ct.schema.length, 0, newField);
  await ct.update();
  console.log(`\n  + ${newField.uid} added`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('\nScript failed:', err.message);
    if (err.errors) console.error('Details:', JSON.stringify(err.errors, null, 2));
    process.exit(1);
  });
}
