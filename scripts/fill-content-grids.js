#!/usr/bin/env node

/**
 * Fill Content Grid Blocks with Actual Content
 * Links real products and blog posts to the grid blocks
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'dev'
};

async function getEntries(stack, contentTypeUid, limit = 10) {
  try {
    const query = stack.contentType(contentTypeUid).entry().query();
    const result = await query.find();
    return result.items || [];
  } catch (error) {
    console.error(`Failed to fetch ${contentTypeUid}:`, error.message);
    return [];
  }
}

async function updateBlock(stack, blockType, blockUid, updateData) {
  try {
    const entry = await stack.contentType(blockType).entry(blockUid).fetch();

    // Merge update data
    Object.assign(entry, updateData);

    await entry.update();
    await entry.publish({ publishDetails: {
      environments: [stackConfig.environment],
      locales: ['en-us']
    }});

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function main() {
  try {
    console.log('🎨 Filling Content Grids with Real Content\n');

    const client = contentstack.client();
    const stack = client.stack({
      api_key: stackConfig.api_key,
      management_token: stackConfig.management_token
    });

    // Fetch all available content
    console.log('📦 Fetching available content...');
    const [products, blogPosts, gridBlocks] = await Promise.all([
      getEntries(stack, 'product', 8),
      getEntries(stack, 'blog_post', 3),
      getEntries(stack, 'featured_content_grid_block')
    ]);

    console.log(`   Found ${products.length} products`);
    console.log(`   Found ${blogPosts.length} blog posts`);
    console.log(`   Found ${gridBlocks.length} content grid blocks`);

    // Find the specific blocks we created
    const productGridBlock = gridBlocks.find(b => b.title.includes('Best Sellers'));
    const blogGridBlock = gridBlocks.find(b => b.title.includes('Blog'));

    if (!productGridBlock) {
      console.log('\n❌ Could not find Best Sellers Product Grid block');
    } else {
      console.log('\n📝 Updating Best Sellers Product Grid...');

      // Select top 4 products
      const selectedProducts = products.slice(0, 4).map(p => ({
        uid: p.uid,
        _content_type_uid: 'product'
      }));

      const result = await updateBlock(stack, 'featured_content_grid_block', productGridBlock.uid, {
        manual_products: selectedProducts
      });

      if (result.success) {
        console.log(`   ✅ Added ${selectedProducts.length} products to Best Sellers grid`);
      } else {
        console.log(`   ❌ Failed: ${result.error}`);
      }
    }

    if (!blogGridBlock) {
      console.log('\n❌ Could not find Latest Blog Posts Grid block');
    } else {
      console.log('\n📝 Updating Latest Blog Posts Grid...');

      // Select 3 blog posts
      const selectedPosts = blogPosts.slice(0, 3).map(p => ({
        uid: p.uid,
        _content_type_uid: 'blog_post'
      }));

      const result = await updateBlock(stack, 'featured_content_grid_block', blogGridBlock.uid, {
        manual_blog_posts: selectedPosts
      });

      if (result.success) {
        console.log(`   ✅ Added ${selectedPosts.length} blog posts to Latest Posts grid`);
      } else {
        console.log(`   ❌ Failed: ${result.error}`);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('🎉 COMPLETE!');
    console.log('='.repeat(70));
    console.log('\n✅ Content grids filled with real products and blog posts!');
    console.log('\n📍 Refresh http://localhost:3000/home-modular to see the changes\n');

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
