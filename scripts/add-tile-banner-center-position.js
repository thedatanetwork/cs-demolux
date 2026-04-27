#!/usr/bin/env node

/**
 * Append `center` to product_tile_banner_block.badge_position enum.
 * Idempotent.
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
};

async function main() {
  console.log('='.repeat(60));
  console.log('Add center to product_tile_banner_block.badge_position');
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
  const field = ct.schema.find((f) => f.uid === 'badge_position');
  if (!field) {
    console.error('  badge_position field not found.');
    process.exit(1);
  }

  const choices = field.enum?.choices || [];
  if (choices.some((c) => c.value === 'center')) {
    console.log('  ~ center already present.');
    return;
  }

  choices.push({ value: 'center' });
  field.enum = field.enum || { advanced: false, choices: [] };
  field.enum.choices = choices;
  await ct.update();
  console.log('  + center added.');
}

if (require.main === module) {
  main().catch((err) => {
    console.error('\nScript failed:', err.message);
    if (err.errors) console.error('Details:', JSON.stringify(err.errors, null, 2));
    process.exit(1);
  });
}
