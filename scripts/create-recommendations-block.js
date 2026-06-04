#!/usr/bin/env node

/**
 * Recommendations Block — homepage placement (inline modular block).
 *
 * modular_home_page.page_sections is an inline modular-blocks field, so the recommendations
 * rail is added as a NEW inline block definition (uid: `recommendations`) and an instance is
 * inserted just below the hero. Because the block lives inline on the modular_home_page entry,
 * a Contentstack Personalize experience on that entry can override its heading / collection per
 * audience — that is how the homepage rail becomes a Personalize-driven experience while Lytics
 * ranks the actual products.
 *
 * SectionRenderer maps the `recommendations` block type to <RecommendationsBlock>.
 *
 * Idempotent: safe to re-run. Also cleans up the earlier (mistaken) reference-based attempt.
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'dev',
};

const PAGE_CT_UID = 'modular_home_page';
const BLOCK_UID = 'recommendations';
const STALE_CT_UID = 'recommendations_block'; // standalone CT from the first (wrong) approach

// Inline block definition added to page_sections.blocks
const blockDefinition = {
  title: 'Recommendations',
  uid: BLOCK_UID,
  schema: [
    {
      display_name: 'Heading',
      uid: 'heading',
      data_type: 'text',
      mandatory: false,
      field_metadata: { description: 'Display heading (e.g., "Recommended for you")', default_value: 'Recommended for you' },
    },
    {
      display_name: 'Subheading',
      uid: 'subheading',
      data_type: 'text',
      mandatory: false,
      field_metadata: { description: 'Optional supporting line under the heading', multiline: true },
    },
    {
      display_name: 'Lytics Collection',
      uid: 'lytics_collection',
      data_type: 'text',
      mandatory: false,
      field_metadata: {
        description: 'Lytics content collection to draw from (e.g., "PRODUCTS"). Vary per audience in Personalize.',
        default_value: 'PRODUCTS',
      },
    },
    {
      display_name: 'Limit',
      uid: 'limit',
      data_type: 'number',
      mandatory: false,
      field_metadata: { description: 'Max products to show', default_value: 8 },
    },
    {
      display_name: 'Exclude Already-Viewed',
      uid: 'visited',
      data_type: 'boolean',
      mandatory: false,
      field_metadata: { description: 'If on, excludes content this visitor already viewed' },
    },
    {
      display_name: 'Shuffle',
      uid: 'shuffle',
      data_type: 'boolean',
      mandatory: false,
      field_metadata: { description: 'Randomize order (variety / cold-start)' },
    },
    {
      display_name: 'Placement Key',
      uid: 'placement',
      data_type: 'text',
      mandatory: false,
      field_metadata: { description: 'Analytics placement key sent to Lytics', default_value: 'home_recommended' },
    },
    {
      display_name: 'Background',
      uid: 'background',
      data_type: 'text',
      display_type: 'dropdown',
      enum: { advanced: false, choices: [{ value: 'white' }, { value: 'gray' }] },
      mandatory: false,
      field_metadata: { default_value: 'gray', description: 'Section background' },
    },
  ],
};

const blockInstance = {
  recommendations: {
    heading: 'Recommended for you',
    subheading: 'Curated for you — ranked in real time by your interests',
    lytics_collection: 'PRODUCTS',
    limit: 8,
    visited: false,
    shuffle: false,
    placement: 'home_recommended',
    background: 'gray',
  },
};

async function cleanupStale(stack) {
  console.log('\n--- Step 0: Clean up earlier reference-based attempt ---');
  // Remove stray reference_to on the blocks field, if present.
  try {
    const ct = await stack.contentType(PAGE_CT_UID).fetch();
    const field = ct.schema.find((f) => f.uid === 'page_sections');
    if (field && field.reference_to) {
      delete field.reference_to;
      await ct.update();
      console.log('  + removed stray reference_to from page_sections');
    } else {
      console.log('  ~ no stray reference_to');
    }
  } catch (e) {
    console.warn(`  ! cleanup (reference_to) warning: ${e.message}`);
  }
  // Delete the standalone recommendations_block content type + entries (unused with inline approach).
  try {
    const entries = await stack.contentType(STALE_CT_UID).entry().query().find();
    for (const it of entries.items || []) {
      await stack.contentType(STALE_CT_UID).entry(it.uid).delete();
      console.log(`  + deleted stale entry ${it.uid}`);
    }
    await stack.contentType(STALE_CT_UID).delete();
    console.log('  + deleted stale content type recommendations_block');
  } catch (e) {
    console.log('  ~ no stale standalone content type to remove');
  }
}

async function addBlockDefinition(stack) {
  console.log('\n--- Step 1: Add inline `recommendations` block to page_sections ---');
  const ct = await stack.contentType(PAGE_CT_UID).fetch();
  const field = ct.schema.find((f) => f.uid === 'page_sections');
  if (!field || field.data_type !== 'blocks') {
    throw new Error('page_sections is not a modular-blocks field on modular_home_page');
  }
  field.blocks = field.blocks || [];
  if (field.blocks.some((b) => b.uid === BLOCK_UID)) {
    console.log('  ~ block definition already present');
    return;
  }
  field.blocks.push(blockDefinition);
  await ct.update();
  console.log('  + added `recommendations` block definition');
}

async function insertInstance(stack) {
  console.log('\n--- Step 2: Insert recommendations block below the hero ---');
  const homeEntries = await stack.contentType(PAGE_CT_UID).entry().query().find();
  if (!homeEntries.items || homeEntries.items.length === 0) {
    throw new Error('No modular_home_page entry found');
  }
  const home = homeEntries.items[0];
  const sections = home.page_sections || [];

  const already = sections.some((s) => s && Object.prototype.hasOwnProperty.call(s, BLOCK_UID));
  if (already) {
    console.log('  ~ a recommendations block is already in page_sections — nothing to do');
    return;
  }

  const insertAt = sections.length > 0 ? 1 : 0; // just below the hero
  const updated = [...sections];
  updated.splice(insertAt, 0, blockInstance);

  const entry = await stack.contentType(PAGE_CT_UID).entry(home.uid).fetch();
  entry.page_sections = updated;
  await entry.update();
  console.log(`  + inserted at index ${insertAt} (of ${updated.length})`);

  try {
    await entry.publish({
      publishDetails: { environments: [stackConfig.environment], locales: ['en-us'] },
    });
    console.log('  -> homepage published');
  } catch (e) {
    const msg = (e.message || '').toLowerCase();
    if (!msg.includes('already')) console.warn(`  ! publish warning: ${e.message}`);
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Recommendations Block setup (inline modular block)');
  console.log('='.repeat(60));

  if (!stackConfig.api_key || !stackConfig.management_token) {
    console.error('\nMissing credentials in scripts/.env');
    process.exit(1);
  }

  const client = contentstack.client();
  const stack = client.stack({
    api_key: stackConfig.api_key,
    management_token: stackConfig.management_token,
  });

  await cleanupStale(stack);
  await addBlockDefinition(stack);
  await insertInstance(stack);

  console.log('\n' + '='.repeat(60));
  console.log('Done. Homepage has a Lytics recommendations rail below the hero.');
  console.log('Next: add a Personalize experience on modular_home_page with variants that');
  console.log('change the recommendations block heading / lytics_collection per audience.');
  console.log('='.repeat(60));
}

if (require.main === module) {
  main().catch((err) => {
    console.error('\nScript failed:', err.message);
    if (err.errors) console.error('Details:', JSON.stringify(err.errors, null, 2));
    process.exit(1);
  });
}

module.exports = { main, BLOCK_UID };
