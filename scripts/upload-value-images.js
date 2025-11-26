#!/usr/bin/env node

/**
 * Upload Value Background Images to Contentstack
 * Downloads images from Unsplash and uploads them as assets
 */

const contentstack = require('@contentstack/management');
const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'dev'
};

// Luxury background images for each value
const valueBackgrounds = {
  'Timeless Design': {
    url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop',
    filename: 'timeless-design-bg.jpg',
    title: 'Timeless Design Background'
  },
  'Exclusive Access': {
    url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=2000&auto=format&fit=crop',
    filename: 'exclusive-access-bg.jpg',
    title: 'Exclusive Access Background'
  },
  'Lifetime Support': {
    url: 'https://images.unsplash.com/photo-1553484771-371a605b060b?q=80&w=2000&auto=format&fit=crop',
    filename: 'lifetime-support-bg.jpg',
    title: 'Lifetime Support Background'
  },
  'Sustainable Luxury': {
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2000&auto=format&fit=crop',
    filename: 'sustainable-luxury-bg.jpg',
    title: 'Sustainable Luxury Background'
  },
  'Innovative Technology': {
    url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2000&auto=format&fit=crop',
    filename: 'innovative-tech-bg.jpg',
    title: 'Innovative Technology Background'
  },
  'Uncompromising Quality': {
    url: 'https://images.unsplash.com/photo-1608889335941-32ac5f2041b9?q=80&w=2000&auto=format&fit=crop',
    filename: 'quality-bg.jpg',
    title: 'Uncompromising Quality Background'
  }
};

// Download image from URL
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function main() {
  try {
    console.log('📸 Uploading Value Background Images to Contentstack\n');
    console.log('='.repeat(70));

    const client = contentstack.client();
    const stack = client.stack({
      api_key: stackConfig.api_key,
      management_token: stackConfig.management_token
    });

    // Create temp directory
    const tempDir = path.join(__dirname, 'temp-images');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    // Fetch the values grid block
    console.log('\n📄 Fetching values grid block...');
    const valuesGridUID = 'bltccca5f6dfd55e8c4';
    const valuesGridEntry = await stack.contentType('values_grid_block').entry(valuesGridUID).fetch();
    console.log(`   ✅ Found: "${valuesGridEntry.section_title}"`);

    console.log('\n📥 Downloading and uploading images...\n');

    // Process each value
    for (let i = 0; i < valuesGridEntry.values.length; i++) {
      const valueRef = valuesGridEntry.values[i];
      const valueUID = valueRef.uid;
      const valueContentType = valueRef._content_type_uid || 'value_proposition';

      try {
        // Fetch the value entry
        const valueEntry = await stack.contentType(valueContentType).entry(valueUID).fetch();
        const bgImage = valueBackgrounds[valueEntry.title];

        if (!bgImage) {
          console.log(`   ⚠ ${valueEntry.title} - No background image configured, skipping\n`);
          continue;
        }

        console.log(`   📦 ${valueEntry.title}`);

        // Download image
        const tempFilePath = path.join(tempDir, bgImage.filename);
        console.log(`      ↓ Downloading from Unsplash...`);
        await downloadImage(bgImage.url, tempFilePath);

        // Upload to Contentstack
        console.log(`      ↑ Uploading to Contentstack...`);
        const asset = await stack.asset().create({
          upload: tempFilePath,
          title: bgImage.title
        });

        console.log(`      ✅ Asset created: ${asset.uid}`);

        // Update value entry with asset reference (single image, not array)
        valueEntry.background_image = {
          uid: asset.uid,
          filename: asset.filename,
          url: asset.url,
          title: asset.title,
          content_type: asset.content_type,
          _content_type_uid: 'sys_assets'
        };

        await valueEntry.update();
        await valueEntry.publish({
          publishDetails: {
            environments: [stackConfig.environment],
            locales: ['en-us']
          }
        });

        console.log(`      ✅ Value entry updated and published\n`);

        // Clean up temp file
        fs.unlinkSync(tempFilePath);

      } catch (error) {
        console.log(`      ❌ Failed: ${error.message}\n`);
      }
    }

    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(tempDir, file));
      });
      fs.rmdirSync(tempDir);
    }

    console.log('='.repeat(70));
    console.log('🎉 COMPLETE!');
    console.log('='.repeat(70));
    console.log('\n✅ All background images uploaded and assigned!');
    console.log('\n📍 Visit http://localhost:3000 to see the updated values grid!\n');

  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
