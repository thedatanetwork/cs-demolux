#!/usr/bin/env node

/**
 * Add Background Images to Values Grid Block
 * Adds luxury background images to value proposition cards
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'dev'
};

// Luxury background images for each value
const valueBackgrounds = {
  'Timeless Design': {
    url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000',
    title: 'Timeless Design Background',
    filename: 'timeless-design-bg.jpg'
  },
  'Exclusive Access': {
    url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=2000',
    title: 'Exclusive Access Background',
    filename: 'exclusive-access-bg.jpg'
  },
  'Lifetime Support': {
    url: 'https://images.unsplash.com/photo-1553484771-371a605b060b?q=80&w=2000',
    title: 'Lifetime Support Background',
    filename: 'lifetime-support-bg.jpg'
  },
  'Sustainable Luxury': {
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2000',
    title: 'Sustainable Luxury Background',
    filename: 'sustainable-luxury-bg.jpg'
  },
  'Innovative Technology': {
    url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2000',
    title: 'Innovative Technology Background',
    filename: 'innovative-tech-bg.jpg'
  },
  'Uncompromising Quality': {
    url: 'https://images.unsplash.com/photo-1608889335941-32ac5f2041b9?q=80&w=2000',
    title: 'Uncompromising Quality Background',
    filename: 'quality-bg.jpg'
  }
};

async function main() {
  try {
    console.log('🎨 Adding Background Images to Values Grid\n');
    console.log('='.repeat(70));

    const client = contentstack.client();
    const stack = client.stack({
      api_key: stackConfig.api_key,
      management_token: stackConfig.management_token
    });

    // Fetch the values grid block directly
    console.log('\n📄 Fetching values grid block...');
    const valuesGridUID = 'bltccca5f6dfd55e8c4'; // UID from the modular home page
    const valuesGridEntry = await stack.contentType('values_grid_block').entry(valuesGridUID).fetch();

    console.log(`   ✅ Found: "${valuesGridEntry.section_title}"`);
    console.log(`\n🎯 Values grid has ${valuesGridEntry.values.length} values`);

    // These are references, so fetch and update each one
    console.log('\n📸 Adding background images to each value...\n');

    for (let i = 0; i < valuesGridEntry.values.length; i++) {
      const valueRef = valuesGridEntry.values[i];
      const valueUID = valueRef.uid;
      const valueContentType = valueRef._content_type_uid || 'value_proposition_content';

      try {
        // Fetch the actual value entry
        const valueEntry = await stack.contentType(valueContentType).entry(valueUID).fetch();
        const bgImage = valueBackgrounds[valueEntry.title];

        if (bgImage) {
          console.log(`   ✓ ${valueEntry.title}`);
          console.log(`     → ${bgImage.url.substring(0, 60)}...`);

          // Add background image to the value entry
          valueEntry.background_image = {
            url: bgImage.url,
            title: bgImage.title,
            filename: bgImage.filename,
            content_type: 'image/jpeg'
          };

          // Update and publish the value entry
          await valueEntry.update();
          await valueEntry.publish({
            publishDetails: {
              environments: [stackConfig.environment],
              locales: ['en-us']
            }
          });

          console.log(`     ✅ Updated and published`);
        } else {
          console.log(`   ⚠ ${valueEntry.title} - No background found, skipping`);
        }
      } catch (error) {
        console.log(`   ❌ Failed to update value ${i + 1}: ${error.message}`);
      }

      console.log('');
    }

    console.log('💾 All value entries updated!');


    console.log('\n' + '='.repeat(70));
    console.log('🎉 COMPLETE!');
    console.log('='.repeat(70));
    console.log('\n✅ Background images added to all values!');
    console.log('\n📍 Visit http://localhost:3000 to see the updated values grid!\n');

  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
