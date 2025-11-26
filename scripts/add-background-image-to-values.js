#!/usr/bin/env node

/**
 * Add Background Image Field to Value Proposition Content Type
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
    console.log('\n📸 Adding Background Image Field to Value Proposition Content Type\n');
    console.log('='.repeat(70));

    const client = contentstack.client();
    const stack = client.stack({
      api_key: stackConfig.api_key,
      management_token: stackConfig.management_token
    });

    console.log('\n📦 Fetching value_proposition content type...');
    const contentType = await stack.contentType('value_proposition').fetch();
    console.log(`   ✅ Found content type`);

    // Check if field already exists
    const fieldExists = contentType.schema.some(field => field.uid === 'background_image');

    if (fieldExists) {
      console.log('\n   ℹ️  background_image field already exists');
      return;
    }

    // Add background_image field after description
    const backgroundImageField = {
      display_name: 'Background Image',
      uid: 'background_image',
      data_type: 'file',
      field_metadata: {
        description: 'Optional background image for card',
        default_value: '',
        rich_text_type: 'standard'
      },
      mandatory: false,
      multiple: false,
      unique: false
    };

    console.log('\n📝 Adding background_image field...');

    // Find the position after description
    const descIndex = contentType.schema.findIndex(f => f.uid === 'description');

    if (descIndex >= 0) {
      contentType.schema.splice(descIndex + 1, 0, backgroundImageField);
    } else {
      // If description doesn't exist, add after title
      const titleIndex = contentType.schema.findIndex(f => f.uid === 'title');
      contentType.schema.splice(titleIndex + 1, 0, backgroundImageField);
    }

    await contentType.update();
    console.log('   ✅ Field added successfully');

    console.log('\n' + '='.repeat(70));
    console.log('🎉 COMPLETE!');
    console.log('='.repeat(70));
    console.log('\n✅ The background_image field has been added!');
    console.log('\n📍 Now run: npm run upload-value-images');
    console.log('   This will upload the images and assign them to each value.\n');

  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
