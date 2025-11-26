#!/usr/bin/env node

/**
 * Update Newsletter CTA with Conversion-Focused Copy
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
    console.log('✍️  Updating Newsletter CTA Copy\n');

    const client = contentstack.client();
    const stack = client.stack({
      api_key: stackConfig.api_key,
      management_token: stackConfig.management_token
    });

    // Find the newsletter CTA block
    const ctaBlocks = await stack.contentType('campaign_cta_block').entry().query().find();
    const newsletterCTA = ctaBlocks.items.find(b => b.title.includes('Newsletter'));

    if (!newsletterCTA) {
      console.log('❌ Newsletter CTA block not found');
      process.exit(1);
    }

    console.log('📝 Updating Newsletter CTA with conversion-focused copy...');

    const entry = await stack.contentType('campaign_cta_block').entry(newsletterCTA.uid).fetch();

    // Update with compelling copy
    entry.title = 'Get First Access to New Tech';
    entry.description = 'Join 10,000+ innovators. Exclusive previews, launch invites, and insider-only offers delivered weekly.';
    entry.badge_text = 'VIP Access';

    await entry.update();
    await entry.publish({
      publishDetails: {
        environments: [stackConfig.environment],
        locales: ['en-us']
      }
    });

    console.log('   ✅ Updated newsletter CTA with high-converting copy');
    console.log('\n📍 Refresh http://localhost:3000/home-modular to see changes\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
