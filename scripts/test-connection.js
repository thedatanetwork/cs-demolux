#!/usr/bin/env node

/**
 * Test Contentstack Connection
 * 
 * Quick script to test your Contentstack API credentials and connection
 * 
 * Usage: node scripts/test-connection.js
 */

// Load environment variables from .env file
require('dotenv').config();

const axios = require('axios');

// Configuration
const config = {
  apiKey: process.env.CONTENTSTACK_API_KEY,
  managementToken: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
  deliveryToken: process.env.CONTENTSTACK_DELIVERY_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'development',
  region: process.env.CONTENTSTACK_REGION || 'US'
};

// Base URLs for different regions
const getBaseUrl = (region, isManagement = false) => {
  const managementUrls = {
    'US': 'https://api.contentstack.io/v3',
    'EU': 'https://eu-api.contentstack.io/v3',
    'AZURE-NA': 'https://azure-na-api.contentstack.io/v3',
    'AZURE-EU': 'https://azure-eu-api.contentstack.io/v3'
  };
  
  const deliveryUrls = {
    'US': 'https://cdn.contentstack.io/v3',
    'EU': 'https://eu-cdn.contentstack.io/v3',
    'AZURE-NA': 'https://azure-na-cdn.contentstack.io/v3',
    'AZURE-EU': 'https://azure-eu-cdn.contentstack.io/v3'
  };
  
  return isManagement 
    ? (managementUrls[region] || managementUrls['US'])
    : (deliveryUrls[region] || deliveryUrls['US']);
};

const managementBaseURL = getBaseUrl(config.region, true);
const deliveryBaseURL = getBaseUrl(config.region, false);

// Create axios instances
const managementAPI = axios.create({
  baseURL: managementBaseURL,
  headers: {
    'api_key': config.apiKey,
    'authorization': config.managementToken,
    'Content-Type': 'application/json'
  }
});

const deliveryAPI = axios.create({
  baseURL: deliveryBaseURL,
  headers: {
    'api_key': config.apiKey,
    'access_token': config.deliveryToken
  }
});

async function testConnection() {
  console.log('🔍 Testing Contentstack Connection\n');
  
  // Display configuration
  console.log('📋 Configuration:');
  console.log(`   Region: ${config.region}`);
  console.log(`   Environment: ${config.environment}`);
  console.log(`   API Key: ${config.apiKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Management Token: ${config.managementToken ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Delivery Token: ${config.deliveryToken ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Management URL: ${managementBaseURL}`);
  console.log(`   Delivery URL: ${deliveryBaseURL}\n`);
  
  // Validation
  if (!config.apiKey) {
    console.error('❌ CONTENTSTACK_API_KEY is required');
    return false;
  }
  
  let allPassed = true;
  
  // Test Management API
  if (config.managementToken) {
    console.log('🔧 Testing Management API...');
    try {
      // Test with environments endpoint (like Perfectweather does)
      const envResponse = await managementAPI.get('/environments');
      console.log('✅ Management API connection successful');
      console.log(`   Environments: ${envResponse.data.environments.length}`);
      
      // Test with content types endpoint
      const ctResponse = await managementAPI.get('/content_types');
      console.log(`   Content Types: ${ctResponse.data.content_types.length}\n`);
    } catch (error) {
      console.error('❌ Management API connection failed:', error.response?.data || error.message);
      allPassed = false;
    }
  } else {
    console.log('⚠️  Management Token not provided - skipping Management API test\n');
  }
  
  // Test Delivery API
  if (config.deliveryToken) {
    console.log('📦 Testing Delivery API...');
    try {
      const response = await deliveryAPI.get('/content_types');
      console.log('✅ Delivery API connection successful');
      console.log(`   Content Types found: ${response.data.content_types.length}\n`);
      
      // List content types
      if (response.data.content_types.length > 0) {
        console.log('📋 Available Content Types:');
        response.data.content_types.forEach(ct => {
          console.log(`   - ${ct.title} (${ct.uid})`);
        });
        console.log('');
      }
    } catch (error) {
      console.error('❌ Delivery API connection failed:', error.response?.data || error.message);
      allPassed = false;
    }
  } else {
    console.log('⚠️  Delivery Token not provided - skipping Delivery API test\n');
  }
  
  // Test fetching sample content if available
  if (config.deliveryToken && allPassed) {
    console.log('🧪 Testing content retrieval...');
    
    const testContentTypes = ['product', 'blog_post', 'navigation_menu', 'site_settings'];
    
    for (const contentType of testContentTypes) {
      try {
        const response = await deliveryAPI.get(`/content_types/${contentType}/entries`);
        const count = response.data.entries.length;
        console.log(`   ${contentType}: ${count} entries`);
        
        if (count > 0) {
          const entry = response.data.entries[0];
          console.log(`     Sample: "${entry.title || entry.menu_name || entry.site_name}"`);
        }
      } catch (error) {
        console.log(`   ${contentType}: Not found (${error.response?.status})`);
      }
    }
    console.log('');
  }
  
  // Final status
  if (allPassed) {
    console.log('🎉 All tests passed! Your Contentstack connection is working properly.');
    console.log('\n📋 Next steps:');
    console.log('1. If you haven\'t created content types yet: npm run setup');
    console.log('2. If you haven\'t created sample content yet: npm run create-content');
    console.log('3. Test your Next.js app: npm run dev');
  } else {
    console.log('❌ Some tests failed. Please check your configuration and try again.');
  }
  
  return allPassed;
}

// Run the test
if (require.main === module) {
  testConnection().catch(error => {
    console.error('💥 Test failed with error:', error.message);
    process.exit(1);
  });
}

module.exports = { testConnection };
