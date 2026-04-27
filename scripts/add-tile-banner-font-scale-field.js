#!/usr/bin/env node

/**
 * Add badge_font_scale Field to product_tile_banner_block.
 *
 * Multiplier applied on top of badge_size so editors can dial badge text
 * up or down independently of the overall tag proportions.
 *
 * Idempotent.
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
};

const newField = {
  display_name: 'Badge Font Scale',
  uid: 'badge_font_scale',
  data_type: 'text',
  display_type: 'dropdown',
  enum: {
    advanced: false,
    choices: [
      { value: 'xs' },
      { value: 'sm' },
      { value: 'md' },
      { value: 'lg' },
      { value: 'xl' },
      { value: '2xl' },
    ],
  },
  mandatory: false,
  field_metadata: {
    default_value: 'md',
    description:
      'Multiplier applied to the entire price tag (text, padding, notch, hole). Use to fine-tune size on top of badge_size. md = 1.0x, xs = 0.7x, 2xl = 1.65x.',
  },
};

async function main() {
  console.log('='.repeat(60));
  console.log('Add badge_font_scale to product_tile_banner_block');
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
  const insertAt = tilesIndex >= 0 ? tilesIndex : ct.schema.length;
  ct.schema.splice(insertAt, 0, newField);

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
