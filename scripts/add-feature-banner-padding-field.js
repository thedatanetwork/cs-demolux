#!/usr/bin/env node

/**
 * Add panel_padding Field to feature_banner_row_block.
 * Controls the inner padding around overlay content on each panel.
 * Idempotent.
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
};

const newField = {
  display_name: 'Panel Padding',
  uid: 'panel_padding',
  data_type: 'text',
  display_type: 'dropdown',
  enum: {
    advanced: false,
    choices: [
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
    default_value: 'md',
    description: 'Inner padding around overlay content on each panel',
  },
};

async function main() {
  console.log('='.repeat(60));
  console.log('Add panel_padding to feature_banner_row_block');
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

  if (ct.schema.some((f) => f.uid === newField.uid)) {
    console.log(`\n  ~ ${newField.uid} (already exists)`);
    return;
  }

  // Insert next to corner_radius for editor convenience
  const cornerIndex = ct.schema.findIndex((f) => f.uid === 'corner_radius');
  const insertAt = cornerIndex >= 0 ? cornerIndex + 1 : ct.schema.findIndex((f) => f.uid === 'panels');
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
