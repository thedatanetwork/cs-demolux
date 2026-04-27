#!/usr/bin/env node

/**
 * Extend product_tile_banner_block.badge_shape enum with two new options:
 *   - circle_tag: round tag with a hole near the top edge
 *   - burst_tag:  JCP-style starburst silhouette
 * Idempotent.
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
};

const NEW_VALUES = ['circle_tag', 'burst_tag'];

async function main() {
  console.log('='.repeat(60));
  console.log('Extend badge_shape enum on product_tile_banner_block');
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
    console.error('  badge_shape field not found on content type.');
    process.exit(1);
  }

  const choices = field.enum?.choices || [];
  const existing = new Set(choices.map((c) => c.value));
  let added = 0;
  for (const v of NEW_VALUES) {
    if (!existing.has(v)) {
      choices.push({ value: v });
      console.log(`  + added: ${v}`);
      added++;
    } else {
      console.log(`  ~ already present: ${v}`);
    }
  }

  if (!added) {
    console.log('\nNothing to update.');
    return;
  }

  field.enum = field.enum || { advanced: false, choices: [] };
  field.enum.choices = choices;
  await ct.update();
  console.log(`\nDone. Added ${added} new choice(s).`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('\nScript failed:', err.message);
    if (err.errors) console.error('Details:', JSON.stringify(err.errors, null, 2));
    process.exit(1);
  });
}
