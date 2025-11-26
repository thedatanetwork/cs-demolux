#!/usr/bin/env node

/**
 * Inspect Modular Home Page Structure
 * View all sections and their structure
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
    console.log('🔍 Inspecting Modular Home Page\n');
    console.log('='.repeat(70));

    const client = contentstack.client();
    const stack = client.stack({
      api_key: stackConfig.api_key,
      management_token: stackConfig.management_token
    });

    // Fetch modular home page
    console.log('\n📄 Fetching modular home page...');
    const pages = await stack.contentType('modular_home_page').entry().query().find();

    if (!pages.items || pages.items.length === 0) {
      console.log('   ❌ No modular home page found');
      return;
    }

    const homePage = pages.items[0];
    console.log(`   ✅ Found: "${homePage.title}"\n`);

    const sections = homePage.page_sections || [];
    console.log(`📦 Total Sections: ${sections.length}\n`);

    // These are references, so let's fetch each one
    console.log('📚 Fetching referenced sections...\n');

    for (let i = 0; i < sections.length; i++) {
      const ref = sections[i];
      const contentType = ref._content_type_uid;
      const uid = ref.uid;

      console.log(`Section ${i + 1}:`);
      console.log(`  Content Type: ${contentType}`);
      console.log(`  UID: ${uid}`);

      try {
        const entry = await stack.contentType(contentType).entry(uid).fetch();
        console.log(`  Title: ${entry.title || entry.section_title || 'N/A'}`);

        if (entry.values) {
          console.log(`  Values: ${entry.values.length} items`);
          entry.values.forEach((value, j) => {
            console.log(`    ${j + 1}. ${value.title || value.name || 'Unnamed'}`);
          });
        }
      } catch (error) {
        console.log(`  ⚠️  Could not fetch: ${error.message}`);
      }

      console.log('');
    }

    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
