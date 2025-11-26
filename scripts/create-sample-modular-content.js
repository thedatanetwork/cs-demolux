#!/usr/bin/env node

/**
 * Create Sample Modular Content
 * Creates entries for all modular content types with high-quality Demolux content
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'dev'
};

// Sample Value Propositions
const valuePropositions = [
  {
    title: 'Uncompromising Quality',
    icon: 'Award',
    description: 'Every piece is meticulously crafted using premium materials and cutting-edge technology to ensure lasting excellence.',
    detailed_content: '<p>Our commitment to quality means every product undergoes rigorous testing and quality control. We use only the finest materials and partner with master craftspeople who share our vision for perfection.</p>',
    link_url: '/about',
    link_text: 'Learn About Our Craft'
  },
  {
    title: 'Innovative Technology',
    icon: 'Zap',
    description: 'We push the boundaries of what\'s possible, integrating the latest innovations seamlessly into timeless design.',
    detailed_content: '<p>Our R&D team collaborates with leading tech innovators to bring you features that enhance your daily life without compromising on style or sustainability.</p>',
    link_url: '/technology',
    link_text: 'Explore Our Technology'
  },
  {
    title: 'Sustainable Luxury',
    icon: 'Leaf',
    description: 'Luxury and responsibility go hand in hand. Our products are designed with longevity and environmental impact in mind.',
    detailed_content: '<p>From ethically sourced materials to carbon-neutral manufacturing, we believe true luxury means caring for our planet\'s future.</p>',
    link_url: '/sustainability',
    link_text: 'Our Sustainability Pledge'
  },
  {
    title: 'Lifetime Support',
    icon: 'Shield',
    description: 'Your investment is protected with comprehensive lifetime support and our industry-leading warranty program.',
    detailed_content: '<p>We stand behind every product with 24/7 customer support, free repairs, and a lifetime warranty that covers manufacturing defects.</p>',
    link_url: '/support',
    link_text: 'View Warranty Details'
  },
  {
    title: 'Exclusive Access',
    icon: 'Star',
    description: 'Join an elite community of Demolux owners with early access to new releases and exclusive events.',
    detailed_content: '<p>As a Demolux owner, you\'re part of a select group with access to private showings, limited editions, and personalized concierge service.</p>',
    link_url: '/community',
    link_text: 'Join the Community'
  },
  {
    title: 'Timeless Design',
    icon: 'Sparkles',
    description: 'Our products transcend trends, combining classic elegance with modern functionality for enduring appeal.',
    detailed_content: '<p>Designed by award-winning creators, each piece is a work of art that remains relevant and beautiful for decades.</p>'
  }
];

// Sample Feature Items
const featureItems = [
  {
    title: 'Premium Materials',
    icon: 'Gem',
    description: 'Aerospace-grade titanium, sapphire crystal, and ethically-sourced leather',
    highlight_color: '#D4AF37'
  },
  {
    title: 'AI-Powered',
    icon: 'Cpu',
    description: 'Advanced machine learning adapts to your preferences and lifestyle',
    highlight_color: '#4169E1'
  },
  {
    title: 'Extended Battery',
    icon: 'Battery',
    description: 'Up to 7 days of continuous use on a single charge',
    highlight_color: '#32CD32'
  },
  {
    title: 'Water Resistant',
    icon: 'Droplet',
    description: 'IPX8 rated for submersion up to 100 meters',
    highlight_color: '#00CED1'
  }
];

// Sample Campaigns
const campaigns = [
  {
    title: 'Holiday Collection 2025',
    description: 'Discover our curated selection of gift-worthy pieces, beautifully packaged and ready to delight.',
    start_date: '2025-11-01',
    end_date: '2025-12-31',
    campaign_type: 'seasonal',
    primary_cta: {
      text: 'Shop Holiday Gifts',
      url: '/collections/holiday-2025'
    },
    secondary_cta: {
      text: 'Gift Guide',
      url: '/gift-guide'
    },
    is_active: true
  },
  {
    title: 'Spring Awakening Collection',
    description: 'Fresh designs inspired by renewal and growth. Limited edition pieces launching this spring.',
    start_date: '2025-03-01',
    end_date: '2025-05-31',
    campaign_type: 'seasonal',
    primary_cta: {
      text: 'View Collection',
      url: '/collections/spring-2025'
    },
    is_active: false
  },
  {
    title: 'Founder\'s Day Sale',
    description: 'Celebrate with us. Exclusive savings on select items for 48 hours only.',
    start_date: '2025-06-15',
    end_date: '2025-06-17',
    campaign_type: 'sale',
    primary_cta: {
      text: 'Shop Now',
      url: '/sale'
    },
    secondary_cta: {
      text: 'View All Offers',
      url: '/offers'
    },
    is_active: false
  },
  {
    title: 'New: HyperSync Series Launch',
    description: 'Introducing our most advanced wearable technology yet. Pre-order now.',
    campaign_type: 'product_launch',
    primary_cta: {
      text: 'Pre-Order Now',
      url: '/products/hypersync-watch'
    },
    secondary_cta: {
      text: 'Learn More',
      url: '/hypersync'
    },
    is_active: true
  }
];

// Sample Collections (we'll link to existing products)
const collections = [
  {
    title: 'Winter Essentials 2025',
    slug: { title: 'Winter Essentials 2025', href: '/collections/winter-essentials-2025' },
    description: 'Stay connected and comfortable through the coldest months with our winter collection, featuring climate-adaptive technology and luxurious materials.',
    collection_type: 'seasonal',
    is_featured: true,
    meta_title: 'Winter Essentials Collection | Demolux',
    meta_description: 'Discover premium wearable tech designed for winter. Climate-adaptive materials, extended battery life, and elegant cold-weather design.'
  },
  {
    title: 'Best Sellers',
    slug: { title: 'Best Sellers', href: '/collections/best-sellers' },
    description: 'Our most loved pieces, chosen by discerning customers worldwide. These are the products that define the Demolux experience.',
    collection_type: 'best_sellers',
    is_featured: true,
    meta_title: 'Best Selling Products | Demolux',
    meta_description: 'Shop our most popular luxury tech products. Customer favorites featuring premium materials and innovative design.'
  },
  {
    title: 'New Arrivals',
    slug: { title: 'New Arrivals', href: '/collections/new-arrivals' },
    description: 'Be the first to experience our latest innovations. Fresh designs that push the boundaries of luxury technology.',
    collection_type: 'new_arrivals',
    is_featured: true,
    meta_title: 'New Arrivals | Demolux',
    meta_description: 'Discover the latest in luxury wearable tech and technofurniture. New releases featuring cutting-edge innovation.'
  },
  {
    title: 'The Curator\'s Choice',
    slug: { title: 'The Curator\'s Choice', href: '/collections/curators-choice' },
    description: 'A carefully selected collection of exceptional pieces that exemplify our design philosophy and technical excellence.',
    collection_type: 'curated',
    is_featured: false,
    meta_title: 'Curator\'s Choice Collection | Demolux',
    meta_description: 'Hand-selected pieces showcasing the best of Demolux design and innovation.'
  }
];

// Sample Block Entries
const heroBlocks = [
  {
    title: 'Holiday Hero - Split Layout',
    variant: 'split_hero',
    badge_text: 'Limited Time',
    subtitle: 'Holiday Collection 2025',
    description: 'Give the gift of innovation. Discover our curated selection of luxury tech, beautifully packaged and ready to delight.',
    primary_cta: {
      text: 'Shop Holiday Gifts',
      url: '/collections/holiday-2025'
    },
    secondary_cta: {
      text: 'View Gift Guide',
      url: '/gift-guide'
    }
  },
  {
    title: 'Minimal Welcome Hero',
    variant: 'minimal_hero',
    badge_text: 'Demolux',
    subtitle: 'Where Technology',
    description: 'Experience the perfect fusion of cutting-edge innovation and timeless luxury design.',
    primary_cta: {
      text: 'Explore Collection',
      url: '/categories/wearable-tech'
    },
    secondary_cta: {
      text: 'Our Story',
      url: '/about'
    }
  }
];

const contentGridBlocks = [
  {
    title: 'Best Sellers Product Grid',
    section_title: 'Customer Favorites',
    section_description: 'Discover why these pieces have captured hearts worldwide',
    variant: 'product_grid',
    badge_text: 'Most Loved',
    content_source: 'manual',
    layout_style: 'grid-4',
    show_cta: true,
    cta_text: 'View All Products',
    cta_url: '/products'
  },
  {
    title: 'Latest Blog Posts Grid',
    section_title: 'Insights & Innovation',
    section_description: 'Explore the stories behind our designs',
    variant: 'blog_grid',
    badge_text: 'Latest',
    content_source: 'dynamic_recent',
    layout_style: 'grid-3',
    show_cta: true,
    cta_text: 'Read More',
    cta_url: '/blog'
  }
];

const valuesBlocks = [
  {
    title: 'Why Choose Demolux',
    section_title: 'The Demolux Difference',
    section_description: 'What sets us apart in the world of luxury technology',
    badge_text: 'Our Values',
    layout_style: 'grid-3',
    card_style: 'elevated'
  }
];

const ctaBlocks = [
  {
    title: 'Newsletter Signup CTA',
    variant: 'centered_cta',
    description: 'Join our community of innovators. Get early access to new releases, exclusive events, and design insights.',
    badge_text: 'Stay Connected',
    primary_cta: {
      text: 'Subscribe Now',
      url: '/newsletter'
    }
  },
  {
    title: 'Holiday Sale Banner',
    variant: 'announcement_banner',
    description: 'Limited time: Save up to 25% on select items. Shop our Holiday Collection.',
    badge_text: 'Sale',
    primary_cta: {
      text: 'Shop Sale',
      url: '/collections/holiday-2025'
    }
  }
];

async function createEntry(stack, contentTypeUid, data) {
  try {
    const entry = await stack.contentType(contentTypeUid).entry().create({ entry: data });

    // Publish the entry
    try {
      await entry.publish({ publishDetails: {
        environments: [stackConfig.environment],
        locales: ['en-us']
      }});
      return { success: true, published: true, uid: entry.uid };
    } catch (publishError) {
      // Entry created but not published
      return { success: true, published: false, uid: entry.uid, error: publishError.message };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function main() {
  try {
    console.log('🚀 Creating Sample Modular Content for Demolux\n');
    console.log('This will create realistic, high-quality entries for:');
    console.log('   • Value Propositions');
    console.log('   • Feature Items');
    console.log('   • Campaigns');
    console.log('   • Collections');
    console.log('   • Block Entries (Hero, Grid, Values, CTA)\n');

    const client = contentstack.client();
    const stack = client.stack({
      api_key: stackConfig.api_key,
      management_token: stackConfig.management_token
    });

    const results = {
      value_propositions: [],
      feature_items: [],
      campaigns: [],
      collections: [],
      hero_blocks: [],
      content_grid_blocks: [],
      values_blocks: [],
      cta_blocks: []
    };

    // 1. Create Value Propositions
    console.log('📝 Creating Value Propositions...');
    for (const vp of valuePropositions) {
      const result = await createEntry(stack, 'value_proposition', vp);
      results.value_propositions.push({ title: vp.title, ...result });
      if (result.success) {
        console.log(`   ✅ ${vp.title} ${result.published ? '(published)' : '(created)'}`);
      } else {
        console.log(`   ❌ ${vp.title}: ${result.error}`);
      }
    }

    // 2. Create Feature Items
    console.log('\n📝 Creating Feature Items...');
    for (const fi of featureItems) {
      const result = await createEntry(stack, 'feature_item', fi);
      results.feature_items.push({ title: fi.title, ...result });
      if (result.success) {
        console.log(`   ✅ ${fi.title} ${result.published ? '(published)' : '(created)'}`);
      } else {
        console.log(`   ❌ ${fi.title}: ${result.error}`);
      }
    }

    // 3. Create Campaigns
    console.log('\n📝 Creating Campaigns...');
    for (const campaign of campaigns) {
      const result = await createEntry(stack, 'campaign', campaign);
      results.campaigns.push({ title: campaign.title, ...result });
      if (result.success) {
        console.log(`   ✅ ${campaign.title} ${result.published ? '(published)' : '(created)'}`);
      } else {
        console.log(`   ❌ ${campaign.title}: ${result.error}`);
      }
    }

    // 4. Create Collections (without products for now - we'll add those separately)
    console.log('\n📝 Creating Collections...');
    for (const collection of collections) {
      const result = await createEntry(stack, 'collection', collection);
      results.collections.push({ title: collection.title, ...result });
      if (result.success) {
        console.log(`   ✅ ${collection.title} ${result.published ? '(published)' : '(created)'}`);
      } else {
        console.log(`   ❌ ${collection.title}: ${result.error}`);
      }
    }

    // 5. Create Hero Blocks
    console.log('\n📝 Creating Hero Section Blocks...');
    for (const block of heroBlocks) {
      const result = await createEntry(stack, 'hero_section_block', block);
      results.hero_blocks.push({ title: block.title, ...result });
      if (result.success) {
        console.log(`   ✅ ${block.title} ${result.published ? '(published)' : '(created)'}`);
      } else {
        console.log(`   ❌ ${block.title}: ${result.error}`);
      }
    }

    // 6. Create Content Grid Blocks
    console.log('\n📝 Creating Featured Content Grid Blocks...');
    for (const block of contentGridBlocks) {
      const result = await createEntry(stack, 'featured_content_grid_block', block);
      results.content_grid_blocks.push({ title: block.title, ...result });
      if (result.success) {
        console.log(`   ✅ ${block.title} ${result.published ? '(published)' : '(created)'}`);
      } else {
        console.log(`   ❌ ${block.title}: ${result.error}`);
      }
    }

    // 7. Create Values Blocks (will need to link to value propositions)
    console.log('\n📝 Creating Values Grid Blocks...');
    for (const block of valuesBlocks) {
      // We'll create the block without references for now
      const result = await createEntry(stack, 'values_grid_block', block);
      results.values_blocks.push({ title: block.title, ...result });
      if (result.success) {
        console.log(`   ✅ ${block.title} ${result.published ? '(published)' : '(created)'}`);
      } else {
        console.log(`   ❌ ${block.title}: ${result.error}`);
      }
    }

    // 8. Create CTA Blocks
    console.log('\n📝 Creating Campaign CTA Blocks...');
    for (const block of ctaBlocks) {
      const result = await createEntry(stack, 'campaign_cta_block', block);
      results.cta_blocks.push({ title: block.title, ...result });
      if (result.success) {
        console.log(`   ✅ ${block.title} ${result.published ? '(published)' : '(created)'}`);
      } else {
        console.log(`   ❌ ${block.title}: ${result.error}`);
      }
    }

    // Print Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 SUMMARY');
    console.log('='.repeat(70));

    const countSuccess = (arr) => arr.filter(r => r.success).length;
    const countPublished = (arr) => arr.filter(r => r.published).length;

    console.log(`\n✅ Value Propositions: ${countSuccess(results.value_propositions)}/${valuePropositions.length} created, ${countPublished(results.value_propositions)} published`);
    console.log(`✅ Feature Items: ${countSuccess(results.feature_items)}/${featureItems.length} created, ${countPublished(results.feature_items)} published`);
    console.log(`✅ Campaigns: ${countSuccess(results.campaigns)}/${campaigns.length} created, ${countPublished(results.campaigns)} published`);
    console.log(`✅ Collections: ${countSuccess(results.collections)}/${collections.length} created, ${countPublished(results.collections)} published`);
    console.log(`✅ Hero Blocks: ${countSuccess(results.hero_blocks)}/${heroBlocks.length} created, ${countPublished(results.hero_blocks)} published`);
    console.log(`✅ Content Grid Blocks: ${countSuccess(results.content_grid_blocks)}/${contentGridBlocks.length} created, ${countPublished(results.content_grid_blocks)} published`);
    console.log(`✅ Values Blocks: ${countSuccess(results.values_blocks)}/${valuesBlocks.length} created, ${countPublished(results.values_blocks)} published`);
    console.log(`✅ CTA Blocks: ${countSuccess(results.cta_blocks)}/${ctaBlocks.length} created, ${countPublished(results.cta_blocks)} published`);

    console.log('\n' + '='.repeat(70));
    console.log('\n🎉 Sample content created!');
    console.log('\n📝 Next steps:');
    console.log('   1. Log into Contentstack to see all the new entries');
    console.log('   2. Link products to Collections (edit entries and add products)');
    console.log('   3. Link Value Propositions to the Values Grid Block');
    console.log('   4. Create a Modular Home Page entry and add blocks');
    console.log('   5. Visit /home-modular to see your page!\n');

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
