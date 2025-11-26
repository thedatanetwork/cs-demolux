#!/usr/bin/env node

/**
 * Fix Hero Block Content
 * Updates hero blocks with proper display text
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
    console.log('🎨 Fixing Hero Block Content\n');

    const client = contentstack.client();
    const stack = client.stack({
      api_key: stackConfig.api_key,
      management_token: stackConfig.management_token
    });

    // Fetch hero blocks
    const heroBlocks = await stack.contentType('hero_section_block').entry().query().find();

    console.log(`Found ${heroBlocks.items.length} hero blocks\n`);

    // Update Minimal Welcome Hero
    const minimalHero = heroBlocks.items.find(b => b.title.includes('Minimal'));

    if (minimalHero) {
      console.log('📝 Updating Minimal Welcome Hero...');

      const entry = await stack.contentType('hero_section_block').entry(minimalHero.uid).fetch();

      // Keep title for CMS identification but update display fields
      entry.subtitle = 'Where Technology';
      entry.title = 'Meets Luxury';  // This will be the large display title
      entry.description = 'Experience the perfect fusion of cutting-edge innovation and timeless luxury design.';

      await entry.update();
      await entry.publish({ publishDetails: {
        environments: [stackConfig.environment],
        locales: ['en-us']
      }});

      console.log('   ✅ Updated hero with proper display text');
    }

    // Update Holiday Hero too
    const holidayHero = heroBlocks.items.find(b => b.title.includes('Holiday'));

    if (holidayHero) {
      console.log('\n📝 Updating Holiday Hero...');

      const entry = await stack.contentType('hero_section_block').entry(holidayHero.uid).fetch();

      entry.title = 'Give the Gift of Innovation';
      entry.subtitle = 'Holiday Collection 2025';

      await entry.update();
      await entry.publish({ publishDetails: {
        environments: [stackConfig.environment],
        locales: ['en-us']
      }});

      console.log('   ✅ Updated holiday hero');
    }

    console.log('\n✅ Hero blocks updated!');
    console.log('\n📍 Refresh http://localhost:3000/home-modular to see changes\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
