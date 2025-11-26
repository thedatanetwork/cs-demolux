#!/usr/bin/env node

/**
 * Fix Announcement Banner with Better Copy
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'dev'
};

async function main() {
  try {
    console.log('🎯 Fixing Announcement Banner\n');

    const client = contentstack.client();
    const stack = client.stack({
      api_key: stackConfig.api_key,
      management_token: stackConfig.management_token
    });

    // Find announcement banners
    const ctaBlocks = await stack.contentType('campaign_cta_block').entry().query().find();
    const announcements = ctaBlocks.items.filter(b => b.variant === 'announcement_banner');

    console.log(`Found ${announcements.length} announcement banners`);

    if (announcements.length > 0) {
      const banner = announcements[0];
      console.log(`\n📝 Updating: ${banner.title}`);

      const entry = await stack.contentType('campaign_cta_block').entry(banner.uid).fetch();

      // Update with better copy
      entry.badge_text = 'LIMITED TIME';
      entry.title = 'Holiday Collection Now Available - Save Up to 30% on Select Tech';
      entry.primary_cta = {
        text: 'Shop Now',
        url: '/categories/wearable-tech',
        style: 'gold'
      };

      await entry.update();
      await entry.publish({
        publishDetails: {
          environments: [stackConfig.environment],
          locales: ['en-us']
        }
      });

      console.log('   ✅ Updated announcement banner with compelling copy');
    }

    console.log('\n📍 Refresh http://localhost:3000/home-modular to see changes\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
