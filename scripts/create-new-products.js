#!/usr/bin/env node

/**
 * Create 8 New Products Script for DemoLux
 * Creates new product entries in Contentstack via Management API
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

// Validate configuration
if (!stackConfig.api_key || !stackConfig.management_token) {
  console.error('❌ Missing required environment variables:');
  console.error('   CONTENTSTACK_API_KEY');
  console.error('   CONTENTSTACK_MANAGEMENT_TOKEN');
  console.error('\nMake sure your .env file has the correct credentials.');
  process.exit(1);
}

// Initialize Management API
const client = contentstack.client();

const stack = client.stack({
  api_key: stackConfig.api_key,
  management_token: stackConfig.management_token
});

// Product definitions
const newProducts = [
  {
    title: 'LuminFrame™ Ambient Display Mirror',
    url: '/products/luminframe-ambient-display-mirror',
    description: 'A frameless smart mirror that blends reflection, ambient lighting, and adaptive digital art into a seamless luxury surface.',
    detailed_description: `LuminFrame™ transforms any room into a hybrid space of functionality and immersive digital expression. When inactive, it appears as a flawless frameless mirror with a soft perimeter glow. When activated, it becomes a high-resolution ambient display capable of showing artwork, mood visuals, information overlays, or holographic-style reflections. With gesture controls and voice-adaptive visual sets, it creates a living environment that evolves with you.

Designed for minimalists, design lovers, and interiors that demand tech without visible tech, LuminFrame™ enhances bedrooms, foyers, living rooms, and luxury hospitality spaces.

**Product Details:**
- Dimensions: 46" H × 30" W × 1.1" D
- Materials: Zero-bezel tempered smart glass, brushed aluminum rear chassis
- Display: 4K ambient QLED panel
- Controls: Gesture controls, Bluetooth app, voice assistant integration
- Power: 100–240V; hidden rear power channel
- Color Options: Silver Glass, Soft Bronze, Graphite Smoke
- Warranty: 2-year premium warranty`,
    price: 4299,
    category: 'technofurniture',
    product_tags: ['smart-mirror', 'ambient-display', 'luxury', 'minimalist', 'gesture-control']
  },
  {
    title: 'HaloVibe™ Resonance Table',
    url: '/products/halovibe-resonance-table',
    description: 'A sculptural coffee table with an embedded invisible speaker system that turns the entire surface into a tactile audio experience.',
    detailed_description: `HaloVibe™ is a sound system disguised as a piece of luxury furniture. Using distributed resonance drivers beneath its seamless mineral-glass surface, the table produces rich omni-directional sound that radiates evenly throughout the room. Whether used for music, ambiance, or subtle haptic feedback during movies and games, HaloVibe™ redefines how furniture and audio can coexist.

Paired with its circular design and soft under-lighting, it functions as both a centerpiece and an immersive sonic experience.

**Product Details:**
- Dimensions: 39" diameter × 15" H
- Materials: Mineral-infused glass top, titanium base
- Audio: 360° resonance driver system, sub-layer vibration chamber
- Connectivity: Bluetooth 5.3, Wi-Fi, multi-room sync
- Lighting: RGBW ambient under-glow
- Power: 120V plugin (concealed)
- Warranty: 18 months`,
    price: 3599,
    category: 'technofurniture',
    product_tags: ['smart-furniture', 'audio', 'resonance', 'luxury', 'ambient-lighting']
  },
  {
    title: 'FluxBand™ Kinetic Wearable Display',
    url: '/products/fluxband-kinetic-wearable-display',
    description: 'A flexible, wraparound wrist display that changes form and function based on motion.',
    detailed_description: `FluxBand™ adapts its interface depending on how you move. Bend your wrist to expand notifications, rotate your hand to open kinetic menus, or tap twice to transform the display into a glowing bracelet. With a fluid, edge-less OLED panel and motion-responsive UI, it merges jewelry and wearable tech into a single expressive accessory.

Made for creators, trendsetters, and anyone who wants a wearable that's more art than device.

**Product Details:**
- Display: 2.1" flexible OLED wrap panel
- Materials: Soft graphene band with magnetic clasp
- Sensors: Accelerometer, gyro, temperature, gesture detection
- Battery: Up to 48 hours; rapid magnetic charge
- Connectivity: Bluetooth LE
- Colors: Obsidian, Ice Chrome, Neon Ember`,
    price: 899,
    category: 'wearable-tech',
    product_tags: ['wearable', 'flexible-display', 'gesture-control', 'kinetic', 'oled']
  },
  {
    title: 'EtherSphere™ Floating Light Orb',
    url: '/products/ethersphere-floating-light-orb',
    description: 'A levitating ambient-light orb that floats above a magnetic base, shifting colors and intensity based on environment.',
    detailed_description: `EtherSphere™ is a magical fusion of physics and mood lighting. The orb hovers silently above its base using ultra-stable magnetic levitation, creating the illusion of weightlessness and calm. Its LED core adjusts automatically to natural light, music, or touch, producing ambient colorscapes that gently animate your space.

Perfect for side tables, office desks, meditation rooms, or high-end hospitality displays.

**Product Details:**
- Orb Size: 6" diameter
- Materials: Frosted silica sphere + titanium base
- Lighting: 64-bit RGB core, ambient-adaptive mode
- Controls: Touch interface, Music-sync, App
- Power: USB-C; low-power standby
- Warranty: 1-year`,
    price: 599,
    category: 'technofurniture',
    product_tags: ['levitation', 'ambient-lighting', 'magnetic', 'smart-light', 'mood-lighting']
  },
  {
    title: 'AeroSlate™ Smart Wall Panel',
    url: '/products/aeroslate-smart-wall-panel',
    description: 'A modular ultra-thin smart wall tile that displays art, lighting, notifications, and subtle animations.',
    detailed_description: `AeroSlate™ panels turn any wall into a living digital canvas. At just 8mm thick, each tile magnetically snaps into place and connects wirelessly to neighboring tiles, creating an endlessly customizable display surface. Show digital art, soft gradients, dynamic lighting, dashboards, or interactive ambient visuals that respond to movement.

Ideal for statement home walls, modern offices, showrooms, and luxury retail.

**Product Details:**
- Panel Size: 12" × 12" × 8mm
- Display: Matte micro-LED lattice
- Connectivity: Mesh sync up to 24 panels
- Controls: App, gestures, proximity triggers
- Power: 1 hidden base tile + daisy-chain power
- Colors: Arctic White, Shadow Black`,
    price: 399,
    category: 'technofurniture',
    product_tags: ['modular', 'wall-panel', 'digital-art', 'smart-display', 'ambient']
  },
  {
    title: 'VeloChair™ Motion-Adaptive Lounge Seat',
    url: '/products/velochair-motion-adaptive-lounge-seat',
    description: 'A sculpted lounge chair with micro-motors that subtly shift your posture based on movement, relaxation patterns, or media content.',
    detailed_description: `VeloChair™ enhances comfort using motion adaptation technology originally pioneered in automotive seating. Its internal micro-actuators subtly adjust lumbar support, tilt, and balance in response to breathing, sitting position, or synced media. Soft ambient lighting and integrated spatial speakers turn any room into an immersive escape.

Both a luxury seating object and a wellness device, VeloChair™ is perfect for unwinding, gaming, reading, or deep-focus work.

**Product Details:**
- Dimensions: 45" H × 32" W × 34" D
- Materials: Soft-tech vegan leather, carbon-fiber frame
- Features: Motion-adaptive support, built-in ambient lights, near-field speakers
- Power: Standard wall plug
- Colors: Cloud White, Onyx Black, Sandstone
- Warranty: 2 years`,
    price: 5499,
    category: 'technofurniture',
    product_tags: ['smart-furniture', 'adaptive', 'wellness', 'luxury-seating', 'immersive']
  },
  {
    title: 'PrismFold™ Pocket Hologram Projector',
    url: '/products/prismfold-pocket-hologram-projector',
    description: 'A foldable pocket-sized projector that casts bright holographic-style 3D visuals into mid-air.',
    detailed_description: `PrismFold™ is a compact hologram projector engineered for travelers, creatives, and presenters who want big storytelling in a small form. The fold-out refractive wings generate a floating 3D visual field that displays product demos, abstract visuals, or interactive UI elements. It's portable, durable, and compatible with both mobile and desktop workflows.

Great for showrooms, pop-ups, creative studios, education, or futuristic home décor.

**Product Details:**
- Size (folded): 4.5" × 3" × 0.6"
- Projection Field: Up to 24" floating 3D display
- Materials: Titanium hinge system, optical polymer wings
- Connectivity: USB-C, Bluetooth
- Battery: 6 hours runtime
- Warranty: 1 year`,
    price: 1299,
    category: 'wearable-tech',
    product_tags: ['hologram', 'portable', 'projector', '3d-display', 'creative-tools']
  },
  {
    title: 'PulseLine™ Interactive Floor Strip',
    url: '/products/pulseline-interactive-floor-strip',
    description: 'A motion-sensitive LED floor strip that responds to footsteps with ripples, gradients, or animated light trails.',
    detailed_description: `PulseLine™ transforms walkways into living paths of light. This ultra-durable, pressure-sensitive LED strip responds instantly to movement, creating visual trails and ripples that follow each step. Perfect for hallways, event spaces, creative studios, or luxury retail, it blends function, safety lighting, and immersive design.

Fully waterproof and designed to be walked on, PulseLine™ elevates every step into a moment of interaction.

**Product Details:**
- Length: 4ft, 6ft, and 8ft options
- Materials: Industrial-grade flexible polymer
- Lighting: High-density RGBW LED matrix
- Features: Motion + pressure detection, pattern customization, app control
- Durability: Waterproof (IP67)
- Warranty: 18 months`,
    price: 799,
    category: 'technofurniture',
    product_tags: ['interactive', 'floor-lighting', 'motion-sensor', 'led', 'installation']
  }
];

async function createProducts() {
  try {
    console.log('🚀 Creating 8 new products in Contentstack...\n');

    // Check if 'product' content type exists
    console.log('📋 Checking for product content type...');
    const contentTypes = await stack.contentType().query().find();
    const productContentType = contentTypes.items.find(ct => ct.uid === 'product');

    if (!productContentType) {
      console.error('❌ Error: "product" content type not found in Contentstack');
      console.error('   Please create the "product" content type first.');
      process.exit(1);
    }

    console.log('✅ Found product content type\n');

    let createdCount = 0;
    let skippedCount = 0;

    for (const product of newProducts) {
      console.log(`\n📦 Processing: ${product.title}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Price: $${product.price}`);

      try {
        // Check if product already exists by URL
        const existingEntries = await stack.contentType('product').entry().query({
          query: { url: product.url }
        }).find();

        if (existingEntries.items && existingEntries.items.length > 0) {
          console.log(`   ⚠️  Product already exists (UID: ${existingEntries.items[0].uid})`);
          console.log(`   Skipping...`);
          skippedCount++;
          continue;
        }

        // Create new product entry
        const createdEntry = await stack.contentType('product').entry().create({
          entry: product
        });
        console.log(`   ✅ Created successfully (UID: ${createdEntry.uid})`);

        // Publish the entry
        await createdEntry.publish({ publishDetails: {
          environments: [stackConfig.environment],
          locales: ['en-us']
        }});
        console.log(`   ✅ Published to ${stackConfig.environment}`);

        createdCount++;

      } catch (error) {
        console.error(`   ❌ Failed to create: ${error.message}`);
        if (error.errors) {
          console.error('   Detailed errors:', JSON.stringify(error.errors, null, 2));
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log(`   ✅ Created: ${createdCount} products`);
    console.log(`   ⚠️  Skipped: ${skippedCount} products (already exist)`);
    console.log('='.repeat(60));

    if (createdCount > 0) {
      console.log('\n🎉 Products created successfully!');
      console.log('\n📸 Next steps:');
      console.log('   1. Log into Contentstack');
      console.log('   2. Navigate to Entries > Product');
      console.log('   3. Upload featured images for the new products');
      console.log('   4. Re-publish the entries after adding images');
      console.log('\n✨ Products will appear automatically on:');
      console.log('   - Homepage (featured products)');
      console.log('   - Category pages (/categories/wearable-tech or /categories/technofurniture)');
      console.log('   - Product detail pages (/products/[slug])');
      console.log('   - Search results');
    }

  } catch (error) {
    console.error('\n❌ Failed to create products:');
    console.error(`   ${error.message}`);

    if (error.errors) {
      console.error('\nDetailed errors:');
      console.error(JSON.stringify(error.errors, null, 2));
    }

    console.error('\n💡 Troubleshooting:');
    console.error('   - Verify your management token has write permissions');
    console.error('   - Ensure the "product" content type exists with the correct schema');
    console.error('   - Check that all required fields match the schema');

    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  createProducts();
}

module.exports = { createProducts };
