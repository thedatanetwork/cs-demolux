#!/usr/bin/env node

/**
 * Add per-panel `padding` field inside the panels group of
 * feature_banner_row_block. Lets editors override the block-level
 * panel_padding on individual panels.
 *
 * 'default' (or empty) = inherit block-level panel_padding.
 * Idempotent.
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
};

const panelPaddingField = {
  display_name: 'Padding (override)',
  uid: 'padding',
  data_type: 'text',
  display_type: 'dropdown',
  enum: {
    advanced: false,
    choices: [
      { value: 'default' },
      { value: 'none' },
      { value: 'xs' },
      { value: 'sm' },
      { value: 'md' },
      { value: 'lg' },
      { value: 'xl' },
    ],
  },
  mandatory: false,
  field_metadata: {
    default_value: 'default',
    description: 'Per-panel padding override. "default" inherits the block-level Panel Padding setting.',
  },
};

async function main() {
  console.log('='.repeat(60));
  console.log('Add per-panel `padding` to feature_banner_row_block panels group');
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

  const ct = await stack.contentType('feature_banner_row_block').fetch();
  const panelsField = ct.schema.find((f) => f.uid === 'panels');
  if (!panelsField || !Array.isArray(panelsField.schema)) {
    console.error('  panels group field not found on feature_banner_row_block.');
    process.exit(1);
  }

  if (panelsField.schema.some((f) => f.uid === panelPaddingField.uid)) {
    console.log(`\n  ~ panels.${panelPaddingField.uid} (already exists)`);
    return;
  }

  // Insert next to the show_scrim field for editor proximity to other styling
  const scrimIndex = panelsField.schema.findIndex((f) => f.uid === 'show_scrim');
  const insertAt = scrimIndex >= 0 ? scrimIndex + 1 : panelsField.schema.length;
  panelsField.schema.splice(insertAt, 0, panelPaddingField);

  await ct.update();
  console.log(`\n  + panels.${panelPaddingField.uid} added`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('\nScript failed:', err.message);
    if (err.errors) console.error('Details:', JSON.stringify(err.errors, null, 2));
    process.exit(1);
  });
}
