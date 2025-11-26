#!/usr/bin/env node

/**
 * Check Modular Home Page structure
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
};

async function checkModularHomePage() {
  try {
    console.log('\n🔍 Checking Modular Home Page structure...\n');

    const client = contentstack.client();
    const stack = client.stack({
      api_key: stackConfig.api_key,
      management_token: stackConfig.management_token
    });

    const contentType = await stack.contentType('modular_home_page').fetch();

    console.log('📋 Current schema:');
    contentType.schema.forEach((field, index) => {
      console.log(`   ${index + 1}. ${field.display_name} (${field.uid}) - Type: ${field.data_type}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkModularHomePage();
