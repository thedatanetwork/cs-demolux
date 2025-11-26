#!/usr/bin/env node

/**
 * Create Complete Modular Home Page
 * Creates a fully assembled modular home page with all sample blocks
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'dev'
};

async function getBlocksByType(stack, contentTypeUid) {
  try {
    const query = stack.contentType(contentTypeUid).entry().query();
    const result = await query.find();
    return result.items || [];
  } catch (error) {
    console.error(`Failed to fetch ${contentTypeUid}:`, error.message);
    return [];
  }
}

async function linkValuesToValuesBlock(stack, valuesBlockUid, valuePropositionUids) {
  try {
    const entry = await stack.contentType('values_grid_block').entry(valuesBlockUid).fetch();
    entry.values = valuePropositionUids.map(uid => ({ uid, _content_type_uid: 'value_proposition' }));
    await entry.update();
    await entry.publish({ publishDetails: {
      environments: [stackConfig.environment],
      locales: ['en-us']
    }});
    return true;
  } catch (error) {
    console.error('Failed to link values:', error.message);
    return false;
  }
}

async function linkProductsToCollections(stack, collectionEntries, products) {
  const results = [];

  // Link first 4 products to each collection
  for (const collection of collectionEntries) {
    try {
      const entry = await stack.contentType('collection').entry(collection.uid).fetch();

      // Take different products for each collection
      const startIdx = results.length % products.length;
      const selectedProducts = products.slice(startIdx, startIdx + 4).map(p => ({
        uid: p.uid,
        _content_type_uid: 'product'
      }));

      entry.products = selectedProducts;
      await entry.update();
      await entry.publish({ publishDetails: {
        environments: [stackConfig.environment],
        locales: ['en-us']
      }});

      results.push({ uid: collection.uid, success: true });
      console.log(`   ✅ Linked ${selectedProducts.length} products to "${collection.title}"`);
    } catch (error) {
      results.push({ uid: collection.uid, success: false, error: error.message });
      console.log(`   ❌ Failed to link products to "${collection.title}": ${error.message}`);
    }
  }

  return results;
}

async function createModularHomePage(stack, blocks) {
  try {
    console.log('\n📝 Creating Modular Home Page entry...');

    // Check if entry already exists
    const existing = await stack.contentType('modular_home_page').entry().query().find();
    if (existing.items && existing.items.length > 0) {
      console.log('   ⚠️  Modular Home Page entry already exists');
      console.log('   📝 Updating existing entry instead...');

      const entry = await stack.contentType('modular_home_page').entry(existing.items[0].uid).fetch();
      entry.title = 'Demolux - Premium Luxury Technology';
      entry.page_sections = blocks.map(b => ({ uid: b.uid, _content_type_uid: b._content_type_uid }));
      entry.meta_title = 'Demolux | Where Innovation Meets Luxury';
      entry.meta_description = 'Discover the future of luxury technology with Demolux. Premium wearable tech and technofurniture crafted for discerning individuals.';

      await entry.update();
      await entry.publish({ publishDetails: {
        environments: [stackConfig.environment],
        locales: ['en-us']
      }});

      return { success: true, uid: entry.uid, updated: true };
    }

    // Create new entry
    const entry = await stack.contentType('modular_home_page').entry().create({
      entry: {
        title: 'Demolux - Premium Luxury Technology',
        page_sections: blocks.map(b => ({ uid: b.uid, _content_type_uid: b._content_type_uid })),
        meta_title: 'Demolux | Where Innovation Meets Luxury',
        meta_description: 'Discover the future of luxury technology with Demolux. Premium wearable tech and technofurniture crafted for discerning individuals.'
      }
    });

    await entry.publish({ publishDetails: {
      environments: [stackConfig.environment],
      locales: ['en-us']
    }});

    return { success: true, uid: entry.uid, updated: false };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function main() {
  try {
    console.log('🚀 Building Complete Modular Home Page\n');

    const client = contentstack.client();
    const stack = client.stack({
      api_key: stackConfig.api_key,
      management_token: stackConfig.management_token
    });

    // Step 1: Fetch all blocks
    console.log('📦 Fetching all block entries...');
    const heroBlocks = await getBlocksByType(stack, 'hero_section_block');
    const gridBlocks = await getBlocksByType(stack, 'featured_content_grid_block');
    const valuesBlocks = await getBlocksByType(stack, 'values_grid_block');
    const ctaBlocks = await getBlocksByType(stack, 'campaign_cta_block');
    const valuePropositions = await getBlocksByType(stack, 'value_proposition');
    const collections = await getBlocksByType(stack, 'collection');

    console.log(`   Found ${heroBlocks.length} hero blocks`);
    console.log(`   Found ${gridBlocks.length} content grid blocks`);
    console.log(`   Found ${valuesBlocks.length} values blocks`);
    console.log(`   Found ${ctaBlocks.length} CTA blocks`);
    console.log(`   Found ${valuePropositions.length} value propositions`);
    console.log(`   Found ${collections.length} collections`);

    // Step 2: Link Value Propositions to Values Block
    if (valuesBlocks.length > 0 && valuePropositions.length > 0) {
      console.log('\n🔗 Linking Value Propositions to Values Grid Block...');
      const vpUids = valuePropositions.slice(0, 6).map(vp => vp.uid);
      const linked = await linkValuesToValuesBlock(stack, valuesBlocks[0].uid, vpUids);
      if (linked) {
        console.log(`   ✅ Linked ${vpUids.length} value propositions`);
      }
    }

    // Step 3: Link Products to Collections
    console.log('\n🔗 Linking Products to Collections...');
    const products = await getBlocksByType(stack, 'product');
    console.log(`   Found ${products.length} products`);
    if (collections.length > 0 && products.length > 0) {
      await linkProductsToCollections(stack, collections, products);
    }

    // Step 4: Assemble page in proper order
    console.log('\n🏗️  Assembling page structure...');
    const pageBlocks = [];

    // 1. Start with minimal hero (more elegant)
    const minimalHero = heroBlocks.find(b => b.title.includes('Minimal'));
    if (minimalHero) {
      pageBlocks.push({ ...minimalHero, _content_type_uid: 'hero_section_block' });
      console.log('   ✅ Added: Minimal Welcome Hero');
    }

    // 2. Holiday sale banner (announcement)
    const saleBanner = ctaBlocks.find(b => b.title.includes('Holiday'));
    if (saleBanner) {
      pageBlocks.push({ ...saleBanner, _content_type_uid: 'campaign_cta_block' });
      console.log('   ✅ Added: Holiday Sale Banner');
    }

    // 3. Best sellers product grid
    const productGrid = gridBlocks.find(b => b.title.includes('Best Sellers'));
    if (productGrid) {
      pageBlocks.push({ ...productGrid, _content_type_uid: 'featured_content_grid_block' });
      console.log('   ✅ Added: Best Sellers Product Grid');
    }

    // 4. Values grid (why choose us)
    if (valuesBlocks.length > 0) {
      pageBlocks.push({ ...valuesBlocks[0], _content_type_uid: 'values_grid_block' });
      console.log('   ✅ Added: Why Choose Demolux Values Grid');
    }

    // 5. Blog posts grid
    const blogGrid = gridBlocks.find(b => b.title.includes('Blog'));
    if (blogGrid) {
      pageBlocks.push({ ...blogGrid, _content_type_uid: 'featured_content_grid_block' });
      console.log('   ✅ Added: Latest Blog Posts Grid');
    }

    // 6. Newsletter signup CTA
    const newsletterCTA = ctaBlocks.find(b => b.title.includes('Newsletter'));
    if (newsletterCTA) {
      pageBlocks.push({ ...newsletterCTA, _content_type_uid: 'campaign_cta_block' });
      console.log('   ✅ Added: Newsletter Signup CTA');
    }

    console.log(`\n   Total blocks: ${pageBlocks.length}`);

    // Step 5: Create/Update Modular Home Page
    const result = await createModularHomePage(stack, pageBlocks);

    if (result.success) {
      console.log(`\n✅ Modular Home Page ${result.updated ? 'updated' : 'created'} successfully!`);
      console.log(`   UID: ${result.uid}`);
    } else {
      console.log(`\n❌ Failed to create Modular Home Page: ${result.error}`);
    }

    // Print final summary
    console.log('\n' + '='.repeat(70));
    console.log('🎉 COMPLETE!');
    console.log('='.repeat(70));
    console.log('\n✅ Your modular home page is ready!');
    console.log('\n📍 View it at: http://localhost:3000/home-modular');
    console.log('\n📝 Page structure:');
    console.log('   1. Minimal Welcome Hero');
    console.log('   2. Holiday Sale Banner');
    console.log('   3. Best Sellers Product Grid');
    console.log('   4. Why Choose Demolux (Values Grid)');
    console.log('   5. Latest Blog Posts Grid');
    console.log('   6. Newsletter Signup CTA');
    console.log('\n🎨 All blocks are reusable - drag to reorder or add more!');
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
