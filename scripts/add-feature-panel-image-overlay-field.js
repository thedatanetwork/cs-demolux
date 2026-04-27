#!/usr/bin/env node

/**
 * Add per-panel `image_overlay` field inside the panels group of
 * feature_banner_row_block. Tints the entire panel image so clean
 * text reads better — independent of the text-card backdrop.
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
  display_name: 'Image Overlay',
  uid: 'image_overlay',
  data_type: 'text',
  display_type: 'dropdown',
  enum: {
    advanced: false,
    choices: [
      { value: 'none' },
      { value: 'darken_subtle' },
      { value: 'darken_medium' },
      { value: 'darken_strong' },
      { value: 'lighten_subtle' },
      { value: 'lighten_medium' },
      { value: 'lighten_strong' },
    ],
  },
  mandatory: false,
  field_metadata: {
    default_value: 'none',
    description:
      'Tints the entire panel image so clean text reads better. darken_* adds black at increasing opacity, lighten_* adds white. Independent of show_scrim (which sits behind the text only).',
  },
};

async function main() {
  console.log('='.repeat(60));
  console.log('Add per-panel `image_overlay` to feature_banner_row_block');
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
    console.error('  panels group field not found.');
    process.exit(1);
  }

  if (panelsField.schema.some((f) => f.uid === newField.uid)) {
    console.log(`\n  ~ panels.${newField.uid} (already exists)`);
    return;
  }

  // Insert next to show_scrim — both are legibility tools
  const scrimIndex = panelsField.schema.findIndex((f) => f.uid === 'show_scrim');
  const insertAt = scrimIndex >= 0 ? scrimIndex : panelsField.schema.length;
  panelsField.schema.splice(insertAt, 0, newField);

  await ct.update();
  console.log(`\n  + panels.${newField.uid} added`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('\nScript failed:', err.message);
    if (err.errors) console.error('Details:', JSON.stringify(err.errors, null, 2));
    process.exit(1);
  });
}
