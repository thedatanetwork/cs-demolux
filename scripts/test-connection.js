#!/usr/bin/env node

/**
 * Test Contentstack Connection Script
 * Verifies your credentials and connection to Contentstack
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

// Configuration
const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'dev',
  region: process.env.CONTENTSTACK_REGION || 'US'
};

async function testConnection() {
  try {
    console.log('🔍 Testing Contentstack connection...\n');

    console.log('Configuration:');
    console.log(`   API Key: ${stackConfig.api_key ? stackConfig.api_key.substring(0, 10) + '...' : 'missing'}`);
    console.log(`   Management Token: ${stackConfig.management_token ? stackConfig.management_token.substring(0, 10) + '...' : 'missing'}`);
    console.log(`   Environment: ${stackConfig.environment}`);
    console.log(`   Region: ${stackConfig.region}\n`);

    // Validate configuration
    if (!stackConfig.api_key || !stackConfig.management_token) {
      console.error('❌ Missing required environment variables:');
      console.error('   CONTENTSTACK_API_KEY');
      console.error('   CONTENTSTACK_MANAGEMENT_TOKEN');
      console.error('\nCreate a .env file with your credentials.');
      process.exit(1);
    }

    // Initialize Management API
    const client = contentstack.client();

    const stack = client.stack({
      api_key: stackConfig.api_key,
      management_token: stackConfig.management_token
    });

    // Test connection by fetching content types
    console.log('📡 Testing Management API connection...');
    const contentTypes = await stack.contentType().query().find();

    console.log('✅ Successfully connected to Contentstack!');
    console.log(`   Found ${contentTypes.items.length} content types:\n`);

    contentTypes.items.forEach(ct => {
      console.log(`   📋 ${ct.title} (${ct.uid})`);
    });

    // Check if required content types exist
    console.log('\n🔍 Checking for required content types...');
    const requiredTypes = ['page', 'product', 'blog_post', 'navigation_menu', 'site_settings'];
    const existingTypes = contentTypes.items.map(ct => ct.uid);

    requiredTypes.forEach(type => {
      if (existingTypes.includes(type)) {
        console.log(`   ✅ ${type} content type exists`);
      } else {
        console.log(`   ⚠️  ${type} content type missing`);
      }
    });

    console.log('\n🎉 Connection test completed successfully!');

  } catch (error) {
    console.error('\n❌ Connection test failed:');
    console.error(`   ${error.message}`);

    if (error.message.includes('Invalid token')) {
      console.error('\n💡 Troubleshooting:');
      console.error('   - Check your CONTENTSTACK_MANAGEMENT_TOKEN');
      console.error('   - Ensure the token has proper permissions');
      console.error('   - Verify the token is for the correct stack');
    } else if (error.message.includes('API key')) {
      console.error('\n💡 Troubleshooting:');
      console.error('   - Check your CONTENTSTACK_API_KEY');
      console.error('   - Ensure you\'re using the correct stack API key');
    }

    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testConnection();
}

module.exports = { testConnection };
