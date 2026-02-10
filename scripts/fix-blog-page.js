#!/usr/bin/env node

/**
 * Fix Blog Page Script
 * Updates the blog_page entry to have proper sections including a hero
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'dev',
};

const client = contentstack.client();
const stack = client.stack({
  api_key: stackConfig.api_key,
  management_token: stackConfig.management_token
});

async function main() {
  console.log('🔧 Fixing Blog Page\n');
  console.log('='.repeat(60) + '\n');

  try {
    // Get existing blog_page
    const blogPages = await stack.contentType('blog_page').entry().query().find();
    if (blogPages.items.length === 0) {
      console.error('❌ No blog_page entry found!');
      return;
    }

    const blogPage = blogPages.items[0];
    console.log(`📄 Found blog_page: ${blogPage.uid}`);
    console.log(`   Current sections: ${blogPage.page_sections?.length || 0}`);

    // Find a hero block to use (the "Insights & Innovation" one for blog)
    const heroBlocks = await stack.contentType('hero_section_block').entry().query().find();
    const blogHero = heroBlocks.items.find(h =>
      h.title === 'Insights & Innovation' || h.title?.includes('Blog')
    );

    if (!blogHero) {
      console.log('⚠️  No suitable hero block found, creating one...');

      // Create a new hero block for the blog
      const heroEntry = await stack.contentType('hero_section_block').entry().create({
        entry: {
          title: 'Blog - Insights & Innovation',
          variant: 'minimal_hero',
          badge_text: 'The DemoLux Journal',
          description: 'Explore the intersection of technology, design, and luxury. Discover stories about the future of wearable tech, sustainable craftsmanship, and the philosophy that drives DemoLux.',
          height: 'medium',
          text_alignment: 'center',
          overlay_style: 'light'
        }
      });

      // Publish it
      await heroEntry.publish({
        publishDetails: {
          environments: [stackConfig.environment],
          locales: ['en-us']
        }
      });

      console.log(`   ✅ Created new hero block: ${heroEntry.uid}`);
      var heroUid = heroEntry.uid;
    } else {
      console.log(`   Found hero: "${blogHero.title}" (${blogHero.uid})`);
      var heroUid = blogHero.uid;
    }

    // Find the best blog grid block to use
    const gridBlocks = await stack.contentType('featured_content_grid_block').entry().query().find();
    const blogGrid = gridBlocks.items.find(g =>
      g.variant === 'blog_grid' && g.manual_blog_posts && g.manual_blog_posts.length > 0
    );

    if (!blogGrid) {
      console.error('❌ No blog_grid block with posts found!');
      return;
    }

    console.log(`   Found blog grid: "${blogGrid.title}" (${blogGrid.uid}) with ${blogGrid.manual_blog_posts.length} posts`);

    // Update blog_page with proper sections
    const entry = await stack.contentType('blog_page').entry(blogPage.uid).fetch();

    // Set new page_sections: hero first, then blog grid
    entry.page_sections = [
      {
        uid: heroUid,
        _content_type_uid: 'hero_section_block'
      },
      {
        uid: blogGrid.uid,
        _content_type_uid: 'featured_content_grid_block'
      }
    ];

    await entry.update();
    console.log('\n✅ Updated blog_page with new sections!');

    // Publish the update
    await entry.publish({
      publishDetails: {
        environments: [stackConfig.environment],
        locales: ['en-us']
      }
    });
    console.log('📤 Published to', stackConfig.environment);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Done! Visit http://localhost:3002/blog to see your blog page.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.errors) {
      console.error('Details:', JSON.stringify(error.errors, null, 2));
    }
  }
}

main();
