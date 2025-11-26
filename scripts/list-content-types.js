#!/usr/bin/env node

/**
 * List all content types in the stack
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
};

async function listContentTypes() {
  try {
    console.log('\n📋 Listing all content types in stack...\n');

    const client = contentstack.client();
    const stack = client.stack({
      api_key: stackConfig.api_key,
      management_token: stackConfig.management_token
    });

    const contentTypes = await stack.contentType().query().find();

    console.log(`Found ${contentTypes.items.length} content types:\n`);

    // Group by category
    const blockTypes = [];
    const regularTypes = [];

    contentTypes.items.forEach(ct => {
      if (ct.uid.includes('_block')) {
        blockTypes.push(ct);
      } else {
        regularTypes.push(ct);
      }
    });

    if (blockTypes.length > 0) {
      console.log('🧱 Block Content Types:');
      blockTypes.forEach(ct => {
        console.log(`   ✓ ${ct.title} (${ct.uid})`);
      });
      console.log('');
    }

    console.log('📄 Regular Content Types:');
    regularTypes.forEach(ct => {
      console.log(`   ✓ ${ct.title} (${ct.uid})`);
    });

    // Check specifically for our modular blocks
    console.log('\n🔍 Checking for modular blocks...');
    const requiredBlocks = [
      'hero_section_block',
      'featured_content_grid_block',
      'values_grid_block',
      'campaign_cta_block'
    ];

    requiredBlocks.forEach(uid => {
      const exists = contentTypes.items.find(ct => ct.uid === uid);
      if (exists) {
        console.log(`   ✅ ${uid} - EXISTS`);
      } else {
        console.log(`   ❌ ${uid} - MISSING`);
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listContentTypes();
