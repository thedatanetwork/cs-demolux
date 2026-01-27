#!/usr/bin/env node

/**
 * Create StitchFix-Style Sample Content
 *
 * Creates sample entries for demonstrating the new block types:
 * 1. Sample testimonials
 * 2. Sample process steps block entry
 * 3. Sample statistics block entry
 * 4. Sample testimonials block entry
 * 5. Sample FAQ block entry
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

// Sample Testimonials
const sampleTestimonials = [
  {
    title: 'Sarah Tech Enthusiast Review',
    customer_name: 'Sarah Chen',
    customer_title: 'Tech Entrepreneur, San Francisco',
    testimonial_text: 'Demolux completely transformed how I think about wearable tech. The personalized recommendations were spot-on, and the quality exceeded my expectations. I\'ve recommended them to everyone in my network.',
    rating: 5,
    is_featured: true,
    date: '2024-12-15'
  },
  {
    title: 'Marcus Fitness Review',
    customer_name: 'Marcus Johnson',
    customer_title: 'Fitness Coach, Austin',
    testimonial_text: 'As someone who lives and breathes fitness, I\'m incredibly picky about my gear. Demolux understood my needs perfectly and introduced me to products I never knew existed. Game changer!',
    rating: 5,
    is_featured: true,
    date: '2024-11-28'
  },
  {
    title: 'Elena Home Design Review',
    customer_name: 'Elena Rodriguez',
    customer_title: 'Interior Designer, Miami',
    testimonial_text: 'The technofurniture collection is absolutely stunning. My clients are always impressed when I incorporate Demolux pieces into their smart homes. The blend of aesthetics and technology is unmatched.',
    rating: 5,
    is_featured: false,
    date: '2024-12-01'
  },
  {
    title: 'David Professional Review',
    customer_name: 'David Park',
    customer_title: 'Software Engineer, Seattle',
    testimonial_text: 'I was skeptical at first, but the personalization really works. The AI learned my preferences quickly, and now every recommendation feels tailor-made. Plus, the return policy gave me confidence to try new things.',
    rating: 4,
    is_featured: false,
    date: '2024-11-15'
  },
  {
    title: 'Amanda Family Review',
    customer_name: 'Amanda Foster',
    customer_title: 'Working Mom, Chicago',
    testimonial_text: 'With three kids and a busy schedule, I don\'t have time to research tech products. Demolux saves me hours every month by curating exactly what our family needs. The family account feature is brilliant!',
    rating: 5,
    is_featured: true,
    date: '2024-12-10'
  }
];

// Sample Process Steps Block
const sampleProcessSteps = {
  title: 'How Demolux Works - Main',
  section_title: 'How Demolux Works',
  section_description: 'Get personalized luxury tech recommendations in three simple steps',
  badge_text: 'HOW IT WORKS',
  steps: [
    {
      step_number: 1,
      title: 'Take the Style Quiz',
      description: 'Tell us about your lifestyle, preferences, and tech needs. Our AI learns what makes you unique and builds your personalized profile.',
      icon: 'Sparkles'
    },
    {
      step_number: 2,
      title: 'Get Curated Picks',
      description: 'Our experts select premium wearables and technofurniture tailored to your taste, needs, and budget. No more endless scrolling.',
      icon: 'Target'
    },
    {
      step_number: 3,
      title: 'Experience Luxury',
      description: 'Receive your personalized collection with free shipping. Love it or return it hassle-free within 30 days.',
      icon: 'Gift'
    }
  ],
  layout_style: 'horizontal',
  show_step_numbers: true,
  show_connector_lines: true,
  background_style: 'white'
};

// Sample Statistics Block
const sampleStatistics = {
  title: 'Demolux By The Numbers',
  section_title: 'Trusted by Tech Enthusiasts',
  section_description: 'Join thousands of customers who\'ve discovered their perfect tech lifestyle',
  badge_text: 'BY THE NUMBERS',
  metrics: [
    {
      value: '50+',
      label: 'Premium Brands',
      description: 'Curated partners',
      icon: 'Award'
    },
    {
      value: '10,000+',
      label: 'Happy Customers',
      description: 'And growing daily',
      icon: 'Users'
    },
    {
      value: '98%',
      label: 'Satisfaction Rate',
      description: 'Based on reviews',
      icon: 'Star'
    },
    {
      value: '$299',
      label: 'Average Savings',
      description: 'Per customer yearly',
      icon: 'TrendingUp'
    }
  ],
  layout_style: 'horizontal',
  background_style: 'dark',
  animated: true
};

// Sample FAQ Block
const sampleFAQ = {
  title: 'Demolux FAQ Section',
  section_title: 'Frequently Asked Questions',
  section_description: 'Everything you need to know about Demolux',
  badge_text: 'GOT QUESTIONS?',
  faqs: [
    {
      question: 'How does the personalization work?',
      answer: 'Our AI analyzes your style preferences, lifestyle, and tech needs to curate products specifically for you. The more you interact with our platform, the smarter our recommendations become. We consider factors like your daily routine, aesthetic preferences, budget, and previous purchases.',
      category: 'How It Works'
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer hassle-free returns within 30 days of delivery. Simply initiate a return in your account, and we\'ll send you a prepaid shipping label. Once we receive the item in its original condition, we\'ll process your refund within 5-7 business days.',
      category: 'Orders & Returns'
    },
    {
      question: 'Do you offer financing options?',
      answer: 'Yes! We partner with Affirm to offer flexible payment plans. Split your purchase into 3, 6, or 12 monthly payments with rates as low as 0% APR for qualified customers. You can check your eligibility at checkout without affecting your credit score.',
      category: 'Payment'
    },
    {
      question: 'How long does shipping take?',
      answer: 'Standard shipping is 5-7 business days and free on orders over $100. Express shipping (2-3 business days) is available for $15. Next-day delivery is available in select metro areas for $25. You\'ll receive tracking information as soon as your order ships.',
      category: 'Orders & Returns'
    },
    {
      question: 'Can I get help choosing products?',
      answer: 'Absolutely! Our Style Advisors are available via chat, email, or phone to help you find the perfect products. You can also book a free 15-minute video consultation for personalized recommendations based on your space and lifestyle.',
      category: 'Support'
    },
    {
      question: 'Do you have a loyalty program?',
      answer: 'Yes! Demolux Insiders earn 1 point per dollar spent, plus bonus points on your birthday and for referrals. Points can be redeemed for discounts, early access to new products, and exclusive experiences. Joining is free and automatic with your first purchase.',
      category: 'Account'
    }
  ],
  layout_style: 'accordion',
  show_categories: false,
  expand_first: true,
  background_style: 'gray'
};

async function createEntry(stack, contentTypeUid, entryData, entryTitle) {
  try {
    console.log(`\n📝 Creating entry: ${entryTitle}...`);

    const contentType = stack.contentType(contentTypeUid);
    const entry = await contentType.entry().create({ entry: entryData });

    console.log(`   ✅ Created: ${entryTitle} (uid: ${entry.uid})`);
    return { success: true, uid: entry.uid };

  } catch (error) {
    console.error(`   ❌ Failed to create "${entryTitle}":`, error.message);
    if (error.errors) {
      console.error('   Errors:', JSON.stringify(error.errors, null, 2));
    }
    return { success: false, error: error.message };
  }
}

async function publishEntry(stack, contentTypeUid, entryUid, environment) {
  try {
    const entry = await stack.contentType(contentTypeUid).entry(entryUid);
    await entry.publish({
      publishDetails: {
        environments: [environment],
        locales: ['en-us']
      }
    });
    console.log(`   📤 Published to ${environment}`);
    return { success: true };
  } catch (error) {
    console.log(`   ⚠️  Could not auto-publish: ${error.message}`);
    return { success: false };
  }
}

async function main() {
  try {
    console.log('🚀 Creating StitchFix-Style Sample Content\n');
    console.log('='.repeat(60));
    console.log('Configuration:');
    console.log(`   API Key: ${stackConfig.api_key ? stackConfig.api_key.substring(0, 10) + '...' : 'missing'}`);
    console.log(`   Management Token: ${stackConfig.management_token ? stackConfig.management_token.substring(0, 10) + '...' : 'missing'}`);
    console.log(`   Environment: ${stackConfig.environment}`);

    // Validate configuration
    if (!stackConfig.api_key || !stackConfig.management_token) {
      console.error('\n❌ Missing required environment variables.');
      process.exit(1);
    }

    // Initialize Management API
    const client = contentstack.client();
    const stack = client.stack({
      api_key: stackConfig.api_key,
      management_token: stackConfig.management_token
    });

    const results = {
      testimonials: [],
      blocks: []
    };

    // Step 1: Create Testimonials
    console.log('\n' + '='.repeat(60));
    console.log('📋 STEP 1: Creating Testimonial Entries');
    console.log('='.repeat(60));

    const testimonialUids = [];
    for (const testimonial of sampleTestimonials) {
      const result = await createEntry(stack, 'testimonial', testimonial, testimonial.title);
      if (result.success) {
        testimonialUids.push(result.uid);
        results.testimonials.push(testimonial.title);

        // Try to publish
        await publishEntry(stack, 'testimonial', result.uid, stackConfig.environment);
      }
    }

    // Step 2: Create Process Steps Block
    console.log('\n' + '='.repeat(60));
    console.log('📋 STEP 2: Creating Process Steps Block');
    console.log('='.repeat(60));

    const processResult = await createEntry(stack, 'process_steps_block', sampleProcessSteps, sampleProcessSteps.title);
    if (processResult.success) {
      results.blocks.push('Process Steps Block');
      await publishEntry(stack, 'process_steps_block', processResult.uid, stackConfig.environment);
    }

    // Step 3: Create Statistics Block
    console.log('\n' + '='.repeat(60));
    console.log('📋 STEP 3: Creating Statistics Block');
    console.log('='.repeat(60));

    const statsResult = await createEntry(stack, 'statistics_block', sampleStatistics, sampleStatistics.title);
    if (statsResult.success) {
      results.blocks.push('Statistics Block');
      await publishEntry(stack, 'statistics_block', statsResult.uid, stackConfig.environment);
    }

    // Step 4: Create Testimonials Block (references the testimonials)
    console.log('\n' + '='.repeat(60));
    console.log('📋 STEP 4: Creating Testimonials Block');
    console.log('='.repeat(60));

    if (testimonialUids.length > 0) {
      const testimonialsBlockData = {
        title: 'Customer Testimonials Section',
        section_title: 'What Our Customers Say',
        section_description: 'Real stories from real people who\'ve transformed their tech lifestyle',
        badge_text: 'TESTIMONIALS',
        testimonials: testimonialUids.slice(0, 3).map(uid => ({ uid, _content_type_uid: 'testimonial' })),
        layout_style: 'carousel',
        show_ratings: true,
        show_images: true,
        background_style: 'gray'
      };

      const testimonialsBlockResult = await createEntry(stack, 'testimonials_block', testimonialsBlockData, 'Customer Testimonials Section');
      if (testimonialsBlockResult.success) {
        results.blocks.push('Testimonials Block');
        await publishEntry(stack, 'testimonials_block', testimonialsBlockResult.uid, stackConfig.environment);
      }
    } else {
      console.log('   ⚠️  Skipping testimonials block - no testimonials were created');
    }

    // Step 5: Create FAQ Block
    console.log('\n' + '='.repeat(60));
    console.log('📋 STEP 5: Creating FAQ Block');
    console.log('='.repeat(60));

    const faqResult = await createEntry(stack, 'faq_block', sampleFAQ, sampleFAQ.title);
    if (faqResult.success) {
      results.blocks.push('FAQ Block');
      await publishEntry(stack, 'faq_block', faqResult.uid, stackConfig.environment);
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Created ${results.testimonials.length} testimonials:`);
    results.testimonials.forEach(t => console.log(`   - ${t}`));
    console.log(`\n✅ Created ${results.blocks.length} block entries:`);
    results.blocks.forEach(b => console.log(`   - ${b}`));

    console.log('\n' + '='.repeat(60));
    console.log('\n🎉 Sample content creation complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Log into Contentstack to verify the entries');
    console.log('   2. Add these blocks to your modular_home_page');
    console.log('   3. Create Personalize variants for different audiences');
    console.log('   4. Visit /home-modular to see your new sections');
    console.log('\n💡 Personalization Ideas:');
    console.log('   - Create a "Fitness Journey" variant of Process Steps for fitness segment');
    console.log('   - Create different Statistics showing fitness-focused metrics');
    console.log('   - Match testimonials to visitor demographics');

  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main };
