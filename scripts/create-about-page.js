#!/usr/bin/env node

/**
 * Create About Page Script for DemoLux
 * Creates the About page entry in Contentstack with comprehensive content
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
  console.error('\nMake sure your scripts/.env file has the correct credentials.');
  process.exit(1);
}

// Initialize Management API
const client = contentstack.client();

const stack = client.stack({
  api_key: stackConfig.api_key,
  management_token: stackConfig.management_token
});

// About Page Content
const aboutPageContent = {
  title: 'About Us',
  slug: 'about',
  meta_description: 'Learn about DemoLux - pioneers in luxury wearable technology and technofurniture. Discover our story, vision, and commitment to redefining the future of premium lifestyle technology.',
  hero_section: {
    title: 'Redefining the Future of Luxury',
    subtitle: 'Where visionary design meets breakthrough technology. This is the story of how DemoLux became the world\'s most coveted name in premium wearable tech and technofurniture.'
  },
  content_sections: [
    {
      section_title: 'The Birth of a Vision',
      content: '<p>DemoLux was born in 2018 in a converted Copenhagen warehouse, where three unlikely collaborators—a former aerospace engineer, a luxury fashion designer, and a neuroscience researcher—gathered around a single question: <em>Why does technology make us choose between beauty and brilliance?</em></p><p>The world was full of wearables that tracked steps but clashed with tailored suits. Smart furniture that computed but compromised on comfort. Everywhere they looked, the founders saw a false binary: function or form, innovation or elegance, technology or taste.</p><p>They rejected this compromise. In that warehouse, surrounded by discarded prototypes and late-night sketches, DemoLux was conceived—not as a company, but as a manifesto. Technology should be invisible when you want it to be, and impossible to ignore when it matters. It should be crafted, not merely manufactured. It should enhance life, not distract from it.</p><p>By 2019, the first DemoLux product emerged: a watch so elegant that collectors mistook it for haute horology, yet so intelligent it could monitor neural patterns and predict stress before the wearer felt it. The line between jewelry and technology had disappeared entirely.</p>',
      layout: 'centered'
    },
    {
      section_title: 'The DemoLux Difference',
      content: '<p>At DemoLux, luxury is not about excess—it\'s about precision. Every product undergoes over 200 hours of design refinement. Every material is selected not just for aesthetics, but for its molecular composition, its tactile memory, its response to light and temperature. We employ materials scientists alongside master craftspeople. Our QA process includes sensory panels that evaluate not just functionality, but <em>feeling</em>.</p><p>Our wearable technology doesn\'t announce itself with bright screens and buzzing alerts. Instead, it whispers. A gentle haptic pulse. A micro-display visible only when you glance. Interfaces that learn your rhythms and adapt to your life, not the other way around.</p><p>Our technofurniture occupies the rare space between art installation and daily companion. Each piece is engineered to exist for decades, not product cycles. Modular components can be upgraded. Surfaces are designed to patinate beautifully. We\'ve built furniture that becomes more valuable, more personal, more <em>yours</em> over time.</p><p>This is luxury redefined: not status symbols, but life partners. Not gadgets, but heirlooms.</p>',
      layout: 'two-column'
    },
    {
      section_title: 'Building Tomorrow, Responsibly',
      content: '<p>Innovation without conscience is just noise. At DemoLux, every breakthrough comes with a responsibility.</p><p>Our neural interface technology emerged from partnerships with leading neuroscience labs, but we established strict ethical guidelines before the first prototype shipped. User data stays on-device. AI assistance requires explicit consent. Privacy is not a feature—it\'s architecture.</p><p>Our commitment to sustainability goes beyond recycled packaging. We\'ve pioneered biocomposite materials that match the performance of aerospace aluminum while being 90% plant-based. Our holographic displays use 40% less energy than comparable screens. We\'ve developed modular designs that allow components to be upgraded without replacing entire products.</p><p>Every DemoLux product comes with a lifetime service guarantee. If a component fails in 10 years, we repair or replace it. When a product reaches true end-of-life, we take it back and recover 95% of its materials. We measure success not in units sold, but in decades of use.</p><p>Luxury means lasting. Technology means adapting. At DemoLux, we\'ve made them inseparable.</p>',
      layout: 'centered'
    },
    {
      section_title: 'Where Art Meets Intelligence',
      content: '<p>DemoLux creates in two realms, each defined by uncompromising standards:</p><h3 style="font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; color: #111827;">Wearable Technology</h3><p>Our wearables don\'t just track life—they enhance it. From the <strong>AR Bracer</strong> that overlays the world with contextual intelligence, to the <strong>Smart Winter Hat</strong> that adapts its warmth to your body and environment, each piece represents years of research condensed into seconds of effortless interaction. Wearable tech that you\'ll forget you\'re wearing, until the moment you need it most.</p><h3 style="font-size: 1.5rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; color: #111827;">Technofurniture</h3><p>Furniture should never demand attention—it should command presence. Our technofurniture pieces like the <strong>Holographic Display Chair</strong> and <strong>Minimalist Smart Side Table</strong> exist as sculptural statements that happen to be brilliantly functional. Gesture-controlled lighting. Adaptive comfort that learns your preferences. Surfaces that transform into displays and back into minimalist elegance. This is furniture for people who refuse to choose between form and function.</p><p style="margin-top: 2rem; font-style: italic; color: #6b7280;">Each DemoLux piece is produced in extremely limited quantities. We do not mass-produce. We curate.</p>',
      layout: 'full-width'
    },
    {
      section_title: 'A Global Standard',
      content: '<p>Since our founding, DemoLux has earned recognition from institutions that matter:</p><ul style="list-style: none; padding: 0; margin: 2rem 0;"><li style="margin-bottom: 1rem;">🏆 <strong>Red Dot Design Award</strong> – Best of Best, 2020, 2022, 2024</li><li style="margin-bottom: 1rem;">🏆 <strong>Fast Company Innovation by Design</strong> – Wearables Category Winner, 2021</li><li style="margin-bottom: 1rem;">🏆 <strong>Wallpaper* Design Award</strong> – Best Smart Furniture, 2023</li><li style="margin-bottom: 1rem;">🏆 <strong>LVMH Innovation Award</strong> – Luxury Tech Category, 2024</li></ul><p>Our products are found in flagship stores in Copenhagen, Tokyo, New York, London, and Singapore. Private showrooms are available by appointment in Los Angeles, Dubai, and Milan. But DemoLux is more than a retail presence—it\'s a philosophy embraced by architects, technologists, and design enthusiasts who understand that the future should be beautiful.</p>',
      layout: 'centered'
    },
    {
      section_title: 'The Minds Behind the Vision',
      content: '<p>DemoLux is led by an interdisciplinary team of over 120 designers, engineers, researchers, and craftspeople spread across three continents. Our design studio in Copenhagen serves as creative headquarters. Our advanced materials lab in Tokyo pioneers new composites and interfaces. Our manufacturing partners—selected for ethical practices and generational expertise—are located in Northern Europe and Japan.</p><p>We believe in slow growth. Every hire is deliberate. Every partnership is long-term. We\'ve turned down acquisition offers from three major tech companies because independence matters. Our investors are individuals who share our vision, not quarterly earnings targets.</p><p>This is a company built for decades, not exits.</p>',
      layout: 'two-column'
    },
    {
      section_title: 'Be Part of Something Rare',
      content: '<p>DemoLux is not for everyone. Our products are created in limited quantities. Our prices reflect true cost—of materials, of craftsmanship, of innovation that takes years, not quarters.</p><p>But for those who value design that endures, technology that respects, and luxury that means something beyond status—DemoLux is inevitable.</p><p style="margin-top: 2rem; font-size: 1.25rem; font-weight: 500;">Welcome to the future of luxury.<br/>Welcome to DemoLux.</p>',
      layout: 'centered'
    }
  ]
};

async function createAboutPage() {
  try {
    console.log('🚀 Creating About Page in Contentstack...\n');

    // Check if 'page' content type exists
    console.log('📋 Checking for page content type...');
    const contentTypes = await stack.contentType().query().find();
    const pageContentType = contentTypes.items.find(ct => ct.uid === 'page');

    if (!pageContentType) {
      console.error('❌ Error: "page" content type not found in Contentstack');
      console.error('   Please create the "page" content type first.');
      process.exit(1);
    }

    console.log('✅ Found page content type\n');

    // Check if about page already exists
    console.log('🔍 Checking for existing about page...');
    try {
      const existingEntries = await stack.contentType('page').entry().query({
        query: { slug: 'about' }
      }).find();

      if (existingEntries.items && existingEntries.items.length > 0) {
        const existingEntry = existingEntries.items[0];
        console.log(`⚠️  About page already exists (UID: ${existingEntry.uid})`);
        console.log('   Updating existing entry...\n');

        // Update existing entry
        const entry = stack.contentType('page').entry(existingEntry.uid);
        await entry.fetch();
        Object.assign(entry, aboutPageContent);
        await entry.update();

        console.log('✅ About page updated successfully!');
        console.log(`   UID: ${existingEntry.uid}`);
        console.log(`   URL: /about\n`);

        // Publish the entry
        console.log('📤 Publishing to', stackConfig.environment, 'environment...');
        await entry.publish({ publishDetails: {
          environments: [stackConfig.environment],
          locales: ['en-us']
        }});

        console.log('✅ About page published successfully!');
        console.log('\n🎉 Done! Visit http://localhost:3000/about to see your About page.');
        return;
      }
    } catch (error) {
      // Entry doesn't exist, continue with creation
      console.log('   No existing about page found, creating new entry...\n');
    }

    // Create new entry
    console.log('📝 Creating new about page entry...');
    const entry = stack.contentType('page').entry();
    Object.assign(entry, aboutPageContent);

    const createdEntry = await entry.create();
    console.log('✅ About page created successfully!');
    console.log(`   UID: ${createdEntry.uid}`);
    console.log(`   URL: /about\n`);

    // Publish the entry
    console.log('📤 Publishing to', stackConfig.environment, 'environment...');
    await createdEntry.publish({ publishDetails: {
      environments: [stackConfig.environment],
      locales: ['en-us']
    }});

    console.log('✅ About page published successfully!');
    console.log('\n🎉 Done! Visit http://localhost:3000/about to see your About page.');

  } catch (error) {
    console.error('\n❌ Failed to create about page:');
    console.error(`   ${error.message}`);

    if (error.errors) {
      console.error('\nDetailed errors:');
      console.error(JSON.stringify(error.errors, null, 2));
    }

    console.error('\n💡 Troubleshooting:');
    console.error('   - Verify your management token has write permissions');
    console.error('   - Ensure the "page" content type exists with the correct schema');
    console.error('   - Check that all required fields are included');

    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  createAboutPage();
}

module.exports = { createAboutPage };
