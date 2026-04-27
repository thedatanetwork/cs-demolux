#!/usr/bin/env node

/**
 * Append `banner_notch` to product_tile_banner_block.badge_shape enum.
 * JCP-style banner with a downward V-notch cut into the bottom edge.
 * Idempotent.
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
};

const NEW_VALUE = 'banner_notch';

async function main() {
  console.log('='.repeat(60));
  console.log(`Add ${NEW_VALUE} to product_tile_banner_block.badge_shape`);
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
  const field = ct.schema.find((f) => f.uid === 'badge_shape');
  if (!field) {
    console.error('  badge_shape field not found.');
    process.exit(1);
  }

  const choices = field.enum?.choices || [];
  if (choices.some((c) => c.value === NEW_VALUE)) {
    console.log(`  ~ ${NEW_VALUE} already present.`);
    return;
  }

  choices.push({ value: NEW_VALUE });
  field.enum = field.enum || { advanced: false, choices: [] };
  field.enum.choices = choices;
  await ct.update();
  console.log(`  + ${NEW_VALUE} added.`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('\nScript failed:', err.message);
    if (err.errors) console.error('Details:', JSON.stringify(err.errors, null, 2));
    process.exit(1);
  });
}
