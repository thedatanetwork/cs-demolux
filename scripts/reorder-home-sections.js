#!/usr/bin/env node

/**
 * Reorder Home Page Sections - Move Announcement Banner to Top
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
    console.log('📐 Reordering Home Page Sections\n');

    const client = contentstack.client();
    const stack = client.stack({
      api_key: stackConfig.api_key,
      management_token: stackConfig.management_token
    });

    // Fetch the modular home page
    const pages = await stack.contentType('modular_home_page').entry().query().find();
    const homePage = pages.items[0];

    if (!homePage) {
      console.log('❌ Modular home page not found');
      process.exit(1);
    }

    console.log('📄 Current section order:');
    homePage.page_sections.forEach((section, i) => {
      console.log(`   ${i + 1}. ${section._content_type_uid}`);
    });

    const entry = await stack.contentType('modular_home_page').entry(homePage.uid).fetch();

    // Find the announcement banner
    const announcementIndex = entry.page_sections.findIndex(
      s => s._content_type_uid === 'campaign_cta_block' && s.uid
    );

    if (announcementIndex === -1) {
      console.log('\n❌ No announcement banner found in sections');
      process.exit(1);
    }

    // Move announcement to the top
    const announcement = entry.page_sections.splice(announcementIndex, 1)[0];
    entry.page_sections.unshift(announcement);

    console.log('\n📐 New section order:');
    entry.page_sections.forEach((section, i) => {
      console.log(`   ${i + 1}. ${section._content_type_uid}`);
    });

    await entry.update();
    await entry.publish({
      publishDetails: {
        environments: [stackConfig.environment],
        locales: ['en-us']
      }
    });

    console.log('\n✅ Announcement banner moved to top!');
    console.log('\n📍 Refresh http://localhost:3000/home-modular to see changes\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
