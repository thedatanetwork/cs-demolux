#!/usr/bin/env node

/**
 * Alternative Contentstack Setup with Email/Password Login
 * 
 * This script uses email/password authentication instead of management token
 * 
 * Usage: node scripts/login-setup.js
 */

// Load environment variables from .env file
require('dotenv').config();

const axios = require('axios');
const readline = require('readline');

// Configuration
const config = {
  apiKey: process.env.CONTENTSTACK_API_KEY,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'development',
  region: process.env.CONTENTSTACK_REGION || 'US'
};

// Base URL
const getBaseUrl = (region) => {
  const urls = {
    'US': 'https://api.contentstack.io/v3',
    'EU': 'https://eu-api.contentstack.io/v3',
    'AZURE-NA': 'https://azure-na-api.contentstack.io/v3',
    'AZURE-EU': 'https://azure-eu-api.contentstack.io/v3'
  };
  return urls[region] || urls['US'];
};

const baseURL = getBaseUrl(config.region);

// Prompt for credentials
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

function promptPassword(question) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    let password = '';
    process.stdin.on('data', function(char) {
      char = char + '';
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write('\n');
          resolve(password);
          break;
        default:
          process.stdout.write('*');
          password += char;
          break;
      }
    });
  });
}

async function loginAndSetup() {
  try {
    console.log('🔐 Contentstack Login Setup\n');
    
    if (!config.apiKey) {
      console.error('❌ CONTENTSTACK_API_KEY is required');
      process.exit(1);
    }
    
    console.log('Please provide your Contentstack login credentials:');
    const email = await prompt('Email: ');
    const password = await promptPassword('Password: ');
    
    rl.close();
    
    console.log('\n🔍 Logging in...');
    
    // Login to get auth token
    const loginResponse = await axios.post(`${baseURL}/user-session`, {
      user: {
        email: email,
        password: password
      }
    });
    
    const authtoken = loginResponse.data.user.authtoken;
    console.log('✅ Login successful');
    
    // Create API instance with auth token
    const api = axios.create({
      baseURL,
      headers: {
        'api_key': config.apiKey,
        'authorization': authtoken,
        'Content-Type': 'application/json'
      }
    });
    
    // Test connection
    console.log('🔍 Testing connection...');
    const envResponse = await api.get('/environments');
    console.log(`✅ Connected successfully - ${envResponse.data.environments.length} environments`);
    
    // Now we can use the contentstack-setup logic with this API instance
    console.log('\n🏗️  Creating Content Types...\n');
    
    // Import the content type schemas
    const { contentTypeSchemas } = require('./contentstack-setup');
    
    // Create content types
    const contentTypes = Object.keys(contentTypeSchemas);
    for (const contentType of contentTypes) {
      try {
        console.log(`📝 Creating content type: ${contentType}`);
        const result = await api.post('/content_types', contentTypeSchemas[contentType]);
        console.log(`✅ Created: ${result.data.content_type.title}`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
      } catch (error) {
        if (error.response?.data?.error_message?.includes('already exists')) {
          console.log(`⚠️  Content type ${contentType} already exists, skipping...`);
        } else {
          console.error(`❌ Failed to create ${contentType}:`, error.response?.data || error.message);
        }
      }
    }
    
    console.log('\n✅ Setup completed with email/password authentication!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: node create-sample-content.js (you may need to login again)');
    console.log('2. Or use the Management Token approach after checking token permissions');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  loginAndSetup();
}

module.exports = { loginAndSetup };
