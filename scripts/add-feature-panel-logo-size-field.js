#!/usr/bin/env node

/**
 * Add `logo_size` to each panel inside feature_banner_row_block.
 * Per-panel control over the inline logo overlay height. Idempotent.
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
};

const newField = {
  display_name: 'Logo Size',
  uid: 'logo_size',
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
    default_value: 'md',
    description:
      'Height of the inline logo overlay. Scales fluidly with panel width.',
  },
};

async function main() {
  console.log('='.repeat(60));
  console.log('Add logo_size to feature_banner_row_block panels');
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
  const panels = ct.schema.find((f) => f.uid === 'panels');
  if (!panels || !Array.isArray(panels.schema)) {
    console.error('  panels group field not found.');
    process.exit(1);
  }

  if (panels.schema.some((f) => f.uid === newField.uid)) {
    console.log(`  ~ ${newField.uid} already present.`);
    return;
  }

  // Insert after `logo_image` so the size control sits next to its target.
  const logoIdx = panels.schema.findIndex((f) => f.uid === 'logo_image');
  panels.schema.splice(logoIdx >= 0 ? logoIdx + 1 : panels.schema.length, 0, newField);
  await ct.update();
  console.log(`  + ${newField.uid} added.`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('\nScript failed:', err.message);
    if (err.errors) console.error('Details:', JSON.stringify(err.errors, null, 2));
    process.exit(1);
  });
}
