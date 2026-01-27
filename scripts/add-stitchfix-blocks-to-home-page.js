#!/usr/bin/env node

/**
 * Add StitchFix-Style Blocks to Modular Home Page
 *
 * Updates the modular_home_page content type to support the new block types:
 * - process_steps_block
 * - statistics_block
 * - testimonials_block
 * - faq_block
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
};

// New block types to add
const NEW_BLOCK_TYPES = [
  'process_steps_block',
  'statistics_block',
  'testimonials_block',
  'faq_block'
];

async function addBlocksToHomePage() {
  try {
    console.log('\n🔧 Adding StitchFix-Style Blocks to Modular Home Page\n');
    console.log('='.repeat(60));

    if (!stackConfig.api_key || !stackConfig.management_token) {
      console.error('❌ Missing CONTENTSTACK_API_KEY or CONTENTSTACK_MANAGEMENT_TOKEN');
      process.exit(1);
    }

    const client = contentstack.client();
    const stack = client.stack({
      api_key: stackConfig.api_key,
      management_token: stackConfig.management_token
    });

    console.log('📝 Fetching modular_home_page content type...');
    const contentType = await stack.contentType('modular_home_page').fetch();

    const schema = contentType.schema;

    // Find the page_sections field
    const pageSectionsIndex = schema.findIndex(field => field.uid === 'page_sections');

    if (pageSectionsIndex === -1) {
      console.error('❌ Could not find page_sections field in modular_home_page');
      process.exit(1);
    }

    const pageSectionsField = schema[pageSectionsIndex];
    console.log(`✅ Found page_sections field`);
    console.log(`   Current reference_to: [${pageSectionsField.reference_to.join(', ')}]`);

    // Check which blocks are already included
    const existingBlocks = pageSectionsField.reference_to || [];
    const blocksToAdd = NEW_BLOCK_TYPES.filter(block => !existingBlocks.includes(block));

    if (blocksToAdd.length === 0) {
      console.log('\n✅ All StitchFix-style blocks are already included!');
      console.log('   No changes needed.');
      return;
    }

    console.log(`\n📦 Blocks to add: [${blocksToAdd.join(', ')}]`);

    // Update the reference_to array
    pageSectionsField.reference_to = [...existingBlocks, ...blocksToAdd];
    schema[pageSectionsIndex] = pageSectionsField;

    console.log(`\n📝 Updating content type...`);
    console.log(`   New reference_to: [${pageSectionsField.reference_to.join(', ')}]`);

    // Update the content type
    contentType.schema = schema;
    await contentType.update();

    console.log('\n' + '='.repeat(60));
    console.log('✅ Successfully updated modular_home_page!');
    console.log('='.repeat(60));

    console.log('\n📦 Block types now available:');
    pageSectionsField.reference_to.forEach((block, i) => {
      const isNew = blocksToAdd.includes(block);
      console.log(`   ${i + 1}. ${block}${isNew ? ' ✨ NEW' : ''}`);
    });

    console.log('\n📝 Next steps:');
    console.log('   1. Go to Contentstack → modular_home_page entry');
    console.log('   2. Click "Add Entry" in Page Sections');
    console.log('   3. Select one of the new block types');
    console.log('   4. Choose existing entries or create new ones');
    console.log('   5. Publish and visit /home-modular to see changes\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.errors) {
      console.error('Details:', JSON.stringify(error.errors, null, 2));
    }
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  addBlocksToHomePage();
}

module.exports = { addBlocksToHomePage };
