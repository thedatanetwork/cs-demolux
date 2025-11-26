#!/usr/bin/env node

/**
 * Create Modular Blog Page Content Type and Sample Content
 * Converts the hardcoded blog page into a modular, CMS-managed page
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'dev'
};

async function createBlogPageContentType(stack) {
  console.log('📄 Creating blog_page content type...');

  const blogPageSchema = {
    title: 'Blog Page',
    uid: 'blog_page',
    schema: [
      {
        display_name: 'Title',
        uid: 'title',
        data_type: 'text',
        mandatory: true,
        unique: false,
        field_metadata: {
          _default: true,
          version: 3
        }
      },
      {
        display_name: 'URL',
        uid: 'url',
        data_type: 'text',
        mandatory: false,
        unique: true
      },
      {
        display_name: 'Page Sections',
        uid: 'page_sections',
        data_type: 'reference',
        reference_to: [
          'hero_section_block',
          'featured_content_grid_block',
          'values_grid_block',
          'campaign_cta_block'
        ],
        field_metadata: {
          ref_multiple: true,
          ref_multiple_content_types: true
        },
        multiple: true,
        mandatory: false
      },
      {
        display_name: 'SEO',
        uid: 'seo',
        data_type: 'group',
        schema: [
          {
            display_name: 'Meta Title',
            uid: 'meta_title',
            data_type: 'text',
            mandatory: false
          },
          {
            display_name: 'Meta Description',
            uid: 'meta_description',
            data_type: 'text',
            mandatory: false
          }
        ],
        mandatory: false
      }
    ],
    options: {
      title: 'title',
      singleton: true,
      is_page: true,
      url_pattern: '/:title',
      url_path: '/blog'
    }
  };

  try {
    const contentType = await stack.contentType().create({ content_type: blogPageSchema });
    console.log('   ✅ blog_page content type created');
    return contentType;
  } catch (error) {
    if (error.message.includes('already exists') || error.message.includes('is not unique')) {
      console.log('   ℹ️  blog_page content type already exists');
      return await stack.contentType('blog_page').fetch();
    }
    throw error;
  }
}

async function createBlogHeroBlock(stack) {
  console.log('\n🎨 Creating blog hero block...');

  const heroEntry = {
    title: 'Insights & Innovation',
    variant: 'minimal_hero',
    subtitle: 'Demolux Blog',
    badge_text: 'Blog',
    description: 'Stay informed about the latest trends, innovations, and insights in wearable technology, technofurniture, and the future of luxury design.',
    height: 'medium',
    text_alignment: 'center',
    overlay_style: 'dark'
  };

  try {
    const entry = await stack.contentType('hero_section_block').entry().create({ entry: heroEntry });
    await entry.publish({
      publishDetails: {
        environments: [stackConfig.environment],
        locales: ['en-us']
      }
    });
    console.log('   ✅ Blog hero block created');
    return entry;
  } catch (error) {
    console.log('   ❌ Failed to create blog hero:', error.message);
    return null;
  }
}

async function createBlogPostsGridBlock(stack) {
  console.log('\n📰 Creating blog posts grid block...');

  // Fetch all blog posts
  const blogPosts = await stack.contentType('blog_post').entry().query().find();
  console.log(`   Found ${blogPosts.items.length} blog posts`);

  const gridEntry = {
    title: 'Blog Page - All Posts Grid',
    variant: 'blog_grid',
    content_source: 'manual',
    section_title: 'Latest Articles',
    section_description: 'Explore our latest insights and stories',
    badge_text: 'Featured Stories',
    layout_style: 'grid-3',
    background_style: 'white',
    show_cta: false,
    // Add all blog posts
    manual_blog_posts: blogPosts.items.map(post => ({
      uid: post.uid,
      _content_type_uid: 'blog_post'
    }))
  };

  try {
    const entry = await stack.contentType('featured_content_grid_block').entry().create({ entry: gridEntry });
    await entry.publish({
      publishDetails: {
        environments: [stackConfig.environment],
        locales: ['en-us']
      }
    });
    console.log(`   ✅ Blog posts grid created with ${blogPosts.items.length} posts`);
    return entry;
  } catch (error) {
    console.log('   ❌ Failed to create blog grid:', error.message);
    return null;
  }
}

async function createBlogPageEntry(stack, heroBlock, blogGridBlock) {
  console.log('\n📄 Creating blog page entry...');

  const blogPageEntry = {
    title: 'Blog',
    url: '/blog',
    page_sections: [
      {
        uid: heroBlock.uid,
        _content_type_uid: 'hero_section_block'
      },
      {
        uid: blogGridBlock.uid,
        _content_type_uid: 'featured_content_grid_block'
      }
    ],
    seo: {
      meta_title: 'Blog | Demolux',
      meta_description: 'Stay informed about the latest trends, innovations, and insights in wearable technologies and technofurniture.'
    }
  };

  try {
    const entry = await stack.contentType('blog_page').entry().create({ entry: blogPageEntry });
    await entry.publish({
      publishDetails: {
        environments: [stackConfig.environment],
        locales: ['en-us']
      }
    });
    console.log('   ✅ Blog page entry created');
    return entry;
  } catch (error) {
    console.log('   ❌ Failed to create blog page entry:', error.message);
    return null;
  }
}

async function main() {
  try {
    console.log('🎨 Creating Modular Blog Page\n');
    console.log('='.repeat(70));

    const client = contentstack.client();
    const stack = client.stack({
      api_key: stackConfig.api_key,
      management_token: stackConfig.management_token
    });

    // Step 1: Create blog_page content type
    await createBlogPageContentType(stack);

    // Step 2: Create blog hero block
    const heroBlock = await createBlogHeroBlock(stack);
    if (!heroBlock) {
      console.log('\n❌ Cannot proceed without hero block');
      process.exit(1);
    }

    // Step 3: Create blog posts grid block
    const blogGridBlock = await createBlogPostsGridBlock(stack);
    if (!blogGridBlock) {
      console.log('\n❌ Cannot proceed without blog grid block');
      process.exit(1);
    }

    // Step 4: Create blog page entry
    await createBlogPageEntry(stack, heroBlock, blogGridBlock);

    console.log('\n' + '='.repeat(70));
    console.log('🎉 MODULAR BLOG PAGE COMPLETE!');
    console.log('='.repeat(70));
    console.log('\n✅ Created:');
    console.log('   - blog_page content type');
    console.log('   - Blog hero block');
    console.log('   - Blog posts grid block');
    console.log('   - Complete blog page entry');
    console.log('\n📝 Next Steps:');
    console.log('   1. Update src/app/blog/page.tsx to fetch blog_page entry');
    console.log('   2. Render page_sections dynamically');
    console.log('   3. Test at http://localhost:3000/blog\n');

  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
