#!/usr/bin/env node

/**
 * Populate Products with Sample Modular Blocks
 * Adds varied, realistic modular blocks to existing products
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
    console.log('🎨 Populating Products with Modular Blocks\n');
    console.log('='.repeat(70));

    const client = contentstack.client();
    const stack = client.stack({
      api_key: stackConfig.api_key,
      management_token: stackConfig.management_token
    });

    // Fetch all products
    console.log('\n📦 Fetching products...');
    const products = await stack.contentType('product').entry().query().find();
    console.log(`   Found ${products.items.length} products\n`);

    // Sample block configurations for different products
    const blockVariations = [
      // Variation 1: Full luxury experience
      [
        {
          product_highlights: {
            highlights: [
              { icon: 'Zap', title: 'Instant Performance', description: 'Lightning-fast processing with AI acceleration' },
              { icon: 'Battery', title: '7-Day Battery', description: 'Extended battery life for uninterrupted use' },
              { icon: 'Shield', title: 'Military-Grade Durability', description: 'Built to withstand the elements' },
              { icon: 'Award', title: 'Award-Winning Design', description: 'Recognized by international design councils' }
            ]
          }
        },
        {
          tech_specs: {
            section_title: 'Technical Specifications',
            specs: [
              { label: 'Display', value: 'AMOLED 1.4" (454x454)' },
              { label: 'Processor', value: 'Custom Silicon Dual-Core' },
              { label: 'Water Resistance', value: '5ATM (50m)' },
              { label: 'Connectivity', value: 'Bluetooth 5.3, Wi-Fi, NFC' },
              { label: 'Sensors', value: 'Heart Rate, GPS, Accelerometer, Gyroscope' },
              { label: 'Weight', value: '42g (without strap)' }
            ]
          }
        },
        {
          materials_craftsmanship: {
            title: 'Exceptional Materials & Craftsmanship',
            description: '<p>Each piece is meticulously crafted using premium materials sourced from around the world. Our commitment to quality means every detail is perfected by skilled artisans.</p><p>The titanium case is machined from a single block of aerospace-grade metal, ensuring both strength and lightness. The sapphire crystal display resists scratches and maintains clarity for years.</p>',
            materials: [
              { name: 'Titanium Case', description: 'Aerospace-grade Grade 5 titanium for exceptional strength-to-weight ratio' },
              { name: 'Sapphire Crystal', description: 'Scratch-resistant display protection with anti-reflective coating' },
              { name: 'Italian Leather', description: 'Full-grain Nappa leather from renowned Italian tanneries' }
            ]
          }
        },
        {
          sustainability: {
            title: 'Our Commitment to Sustainability',
            story: '<p>We believe luxury and responsibility go hand in hand. Every product is manufactured in our carbon-neutral facilities using renewable energy.</p><p>Our packaging is 100% recyclable, and we offset all shipping emissions. We partner with ocean cleanup initiatives, donating 1% of all sales to environmental causes.</p>',
            certifications: [
              { name: 'Carbon Neutral Certified' },
              { name: 'Conflict-Free Materials' },
              { name: 'B Corp Certified' }
            ]
          }
        }
      ],

      // Variation 2: Tech-focused
      [
        {
          product_highlights: {
            highlights: [
              { icon: 'Cpu', title: 'AI-Powered', description: 'Advanced machine learning for personalized experiences' },
              { icon: 'Wifi', title: 'Always Connected', description: 'Seamless connectivity across all devices' },
              { icon: 'Lock', title: 'Bank-Level Security', description: 'End-to-end encryption for your data' }
            ]
          }
        },
        {
          tech_specs: {
            section_title: 'Technical Details',
            specs: [
              { label: 'Dimensions', value: '45mm x 38mm x 10.7mm' },
              { label: 'Storage', value: '16GB Internal Memory' },
              { label: 'Battery Life', value: 'Up to 7 days typical use' },
              { label: 'Charging', value: 'Wireless Qi charging (2 hours full charge)' },
              { label: 'Compatibility', value: 'iOS 14+, Android 8+' }
            ]
          }
        },
        {
          video_showcase: {
            title: 'See It In Action',
            video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            caption: 'Discover how our technology enhances your daily life'
          }
        }
      ],

      // Variation 3: Care & unboxing focused
      [
        {
          whats_included: {
            title: "What's In The Box",
            items: '- Premium Device\n- Wireless Charging Stand\n- USB-C Cable (2m)\n- Quick Start Guide\n- Warranty Card\n- Two Additional Straps (Sport & Formal)\n- Cleaning Cloth\n- Travel Case'
          }
        },
        {
          care_maintenance: {
            title: 'Care & Maintenance',
            instructions: '<p>Your luxury device is built to last, but proper care ensures it remains in pristine condition.</p><p><strong>Daily Care:</strong> Wipe with the included microfiber cloth after each use. Avoid exposure to harsh chemicals or perfumes.</p>',
            tips: [
              { tip: 'Clean with warm water and mild soap when needed' },
              { tip: 'Avoid extreme temperatures (below 0°C or above 45°C)' },
              { tip: 'Remove device before swimming in chlorinated water' },
              { tip: 'Store in provided case when not in use' }
            ]
          }
        },
        {
          size_fit_guide: {
            title: 'Size & Fit Guide',
            dimensions: [
              { dimension: 'Case Size', measurement: '42mm / 46mm' },
              { dimension: 'Strap Width', measurement: '22mm' },
              { dimension: 'Wrist Size', measurement: '140-220mm adjustable' }
            ]
          }
        }
      ],

      // Variation 4: Awards & prestige
      [
        {
          product_highlights: {
            highlights: [
              { icon: 'Trophy', title: 'Award Winner', description: 'Red Dot Design Award 2024' },
              { icon: 'Star', title: 'Editor\'s Choice', description: 'Featured in Wired, GQ, and Vogue' }
            ]
          }
        },
        {
          awards_recognition: {
            title: 'Awards & Recognition',
            awards: [
              { title: 'Red Dot Design Award', description: 'Best Product Design 2024', year: 2024 },
              { title: 'Wired Magazine', description: 'The most elegant wearable we\'ve tested this year', year: 2024 },
              { title: 'GQ Tech Awards', description: 'Luxury Wearable of the Year', year: 2024 },
              { title: 'TIME Best Inventions', description: 'One of the 200 best inventions of 2024', year: 2024 }
            ]
          }
        },
        {
          materials_craftsmanship: {
            title: 'Artisan Craftsmanship',
            description: '<p>Every piece undergoes 15 hours of meticulous handcrafting by master artisans in our Swiss atelier.</p>',
            materials: [
              { name: 'Swiss Movement', description: 'Precision-engineered in Switzerland' },
              { name: 'Hand-Finished', description: 'Each component individually inspected and polished' }
            ]
          }
        }
      ]
    ];

    // Update each product with varied blocks
    for (let i = 0; i < products.items.length; i++) {
      const product = products.items[i];
      const variation = blockVariations[i % blockVariations.length];

      console.log(`📝 Updating "${product.title}"...`);

      try {
        const entry = await stack.contentType('product').entry(product.uid).fetch();
        entry.content_blocks = variation;

        await entry.update();
        await entry.publish({
          publishDetails: {
            environments: [stackConfig.environment],
            locales: ['en-us']
          }
        });

        console.log(`   ✅ Added ${variation.length} modular blocks`);
      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('🎉 COMPLETE!');
    console.log('='.repeat(70));
    console.log(`\n✅ Updated ${products.items.length} products with modular blocks!`);
    console.log('\n📍 Visit any product page to see the new content blocks!\n');

  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
