#!/usr/bin/env node

/**
 * Seed Modular Homepage Content
 *
 * Populates the modular_home_page entry with sample blocks
 * after converting to true Contentstack modular blocks.
 */

require('dotenv').config();
const https = require('https');

const API_KEY = process.env.CONTENTSTACK_API_KEY;
const AUTH_TOKEN = process.env.CONTENTSTACK_MANAGEMENT_TOKEN;

// Sample homepage content using true modular blocks
const homepageContent = {
  entry: {
    title: "Demolux Home",
    url: "/home",
    page_sections: [
      // Hero Section
      {
        hero_section: {
          variant: "split_hero",
          badge_text: "The Future of Living",
          title: "Premium Wearable Tech & Technofurniture",
          subtitle: "Where Innovation Meets Elegance",
          description: "Discover our curated collection of cutting-edge wearable technology and innovative technofurniture. Experience the perfect fusion of advanced functionality and timeless design.",
          overlay_style: "gradient",
          primary_cta: {
            text: "Shop Collection",
            url: "/categories/wearable-tech",
            style: "gold"
          },
          secondary_cta: {
            text: "Learn More",
            url: "/about",
            style: "outline"
          },
          feature_items: [
            {
              icon: "Award",
              title: "Premium Quality",
              description: "Crafted with precision"
            },
            {
              icon: "Zap",
              title: "Smart Technology",
              description: "Seamlessly connected"
            },
            {
              icon: "Star",
              title: "Award Winning",
              description: "Design excellence"
            }
          ],
          text_alignment: "left",
          height: "large"
        }
      },
      // Featured Products Grid
      {
        featured_content_grid: {
          variant: "product_grid",
          section_title: "Featured Products",
          section_description: "Explore our handpicked selection of premium wearable tech and innovative technofurniture pieces.",
          badge_text: "Curated Selection",
          content_source: "dynamic_featured",
          layout_style: "grid-3",
          dynamic_limit: 6,
          show_cta: true,
          cta_text: "View All Products",
          cta_url: "/categories/wearable-tech",
          background_style: "white"
        }
      },
      // Process Steps (How It Works)
      {
        process_steps: {
          section_title: "How Demolux Works",
          section_description: "Your journey to enhanced living starts here.",
          badge_text: "Simple Process",
          steps: [
            {
              step_number: 1,
              title: "Browse Our Collection",
              description: "Explore our carefully curated selection of premium wearable tech and technofurniture. Each piece is selected for quality, innovation, and design excellence.",
              icon: "Search"
            },
            {
              step_number: 2,
              title: "Personalized Recommendations",
              description: "Our AI-powered system learns your preferences and suggests products that match your lifestyle and aesthetic preferences.",
              icon: "Sparkles"
            },
            {
              step_number: 3,
              title: "Seamless Delivery",
              description: "Experience white-glove delivery service with professional installation and setup for technofurniture items.",
              icon: "Package"
            },
            {
              step_number: 4,
              title: "Ongoing Support",
              description: "Enjoy lifetime support, software updates, and our satisfaction guarantee on all purchases.",
              icon: "HeartHandshake"
            }
          ],
          layout_style: "horizontal",
          show_step_numbers: true,
          show_connector_lines: true,
          background_style: "gray"
        }
      },
      // Values Grid
      {
        values_grid: {
          section_title: "Why Choose Demolux",
          section_description: "We're committed to delivering exceptional products and experiences.",
          badge_text: "Our Promise",
          values: [
            {
              icon: "Sparkles",
              title: "Innovation First",
              description: "We source the latest advancements in wearable technology and smart furniture, bringing tomorrow's innovations to your life today."
            },
            {
              icon: "Shield",
              title: "Quality Assured",
              description: "Every product undergoes rigorous testing to meet our exacting standards for durability, performance, and design excellence."
            },
            {
              icon: "Leaf",
              title: "Sustainable Design",
              description: "We prioritize eco-friendly materials and sustainable manufacturing processes without compromising on quality or aesthetics."
            },
            {
              icon: "Users",
              title: "Expert Support",
              description: "Our dedicated team of product specialists is here to help you find the perfect pieces and provide ongoing assistance."
            }
          ],
          layout_style: "grid-4",
          card_style: "elevated",
          background_style: "white"
        }
      },
      // Statistics
      {
        statistics: {
          section_title: "Trusted by Thousands",
          badge_text: "By the Numbers",
          metrics: [
            {
              value: "50K+",
              label: "Happy Customers",
              description: "Worldwide",
              icon: "Users"
            },
            {
              value: "98%",
              label: "Satisfaction Rate",
              description: "Based on reviews",
              icon: "Star"
            },
            {
              value: "200+",
              label: "Premium Products",
              description: "Carefully curated",
              icon: "Package"
            },
            {
              value: "24/7",
              label: "Customer Support",
              description: "Always available",
              icon: "HeadphonesIcon"
            }
          ],
          layout_style: "grid-4",
          background_style: "dark",
          animated: true
        }
      },
      // Testimonials
      {
        testimonials: {
          section_title: "What Our Customers Say",
          section_description: "Real experiences from our valued customers.",
          badge_text: "Reviews",
          testimonials: [
            {
              testimonial_text: "The smart desk completely transformed my home office. The build quality is exceptional and the integrated technology is seamless.",
              customer_name: "Sarah Chen",
              customer_title: "Product Designer",
              rating: 5
            },
            {
              testimonial_text: "I was skeptical about smart furniture, but Demolux changed my mind. The customer service was outstanding from start to finish.",
              customer_name: "Marcus Thompson",
              customer_title: "Tech Entrepreneur",
              rating: 5
            },
            {
              testimonial_text: "The attention to detail in every product is remarkable. These aren't just gadgets - they're beautifully crafted pieces that enhance daily life.",
              customer_name: "Emily Rodriguez",
              customer_title: "Interior Architect",
              rating: 5
            }
          ],
          layout_style: "carousel",
          show_ratings: true,
          show_images: true,
          background_style: "gray"
        }
      },
      // FAQ Section
      {
        faq: {
          section_title: "Frequently Asked Questions",
          section_description: "Find answers to common questions about our products and services.",
          badge_text: "FAQ",
          faqs: [
            {
              question: "What is the warranty on Demolux products?",
              answer: "All Demolux products come with a minimum 2-year warranty. Premium items include extended 5-year coverage and lifetime software updates.",
              category: "Warranty"
            },
            {
              question: "Do you offer international shipping?",
              answer: "Yes, we ship to over 50 countries worldwide. Shipping costs and delivery times vary by location. Free shipping is available for orders over $500 in the US.",
              category: "Shipping"
            },
            {
              question: "Can I return a product if I'm not satisfied?",
              answer: "Absolutely. We offer a 30-day satisfaction guarantee on all products. If you're not completely happy, return the item in its original condition for a full refund.",
              category: "Returns"
            },
            {
              question: "How do smart furniture items connect to my home?",
              answer: "Our technofurniture connects via WiFi and Bluetooth. The Demolux app (iOS/Android) provides easy setup, control, and integration with popular smart home systems like Apple HomeKit, Google Home, and Amazon Alexa.",
              category: "Technology"
            },
            {
              question: "Do you offer installation services?",
              answer: "Yes, we provide professional white-glove delivery and installation for all technofurniture items. Our technicians will set up, configure, and demonstrate all features.",
              category: "Services"
            }
          ],
          layout_style: "accordion",
          show_categories: true,
          expand_first: true,
          background_style: "white"
        }
      },
      // Final CTA
      {
        campaign_cta: {
          variant: "full_width_cta",
          title: "Ready to Transform Your Space?",
          description: "Join thousands of customers who have elevated their lifestyle with Demolux premium wearable tech and technofurniture.",
          badge_text: "Get Started",
          background_style: "gradient-gold",
          primary_cta: {
            text: "Shop Now",
            url: "/categories/wearable-tech",
            style: "primary"
          },
          secondary_cta: {
            text: "Contact Us",
            url: "/contact",
            style: "outline"
          },
          text_color: "dark",
          height: "medium"
        }
      }
    ],
    seo: {
      meta_title: "Demolux - Premium Wearable Tech & Technofurniture",
      meta_description: "Discover the future of luxury with Demolux premium wearable technology and innovative technofurniture. Where cutting-edge design meets exceptional craftsmanship."
    }
  }
};

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.contentstack.io',
      path: path,
      method: method,
      headers: {
        'api_key': API_KEY,
        'authorization': AUTH_TOKEN,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function seedHomepage() {
  console.log('\n' + '='.repeat(70));
  console.log('🌱 Seeding Modular Homepage with Sample Content');
  console.log('='.repeat(70));

  if (!API_KEY || !AUTH_TOKEN) {
    console.error('\n❌ Missing environment variables:');
    console.error('   CONTENTSTACK_API_KEY');
    console.error('   CONTENTSTACK_MANAGEMENT_TOKEN');
    process.exit(1);
  }

  try {
    // First, check if an entry already exists
    console.log('\n📝 Checking for existing homepage entry...');
    const checkResult = await makeRequest('GET', '/v3/content_types/modular_home_page/entries');

    if (checkResult.status === 200 && checkResult.data.entries && checkResult.data.entries.length > 0) {
      // Update existing entry
      const existingEntry = checkResult.data.entries[0];
      console.log(`   Found existing entry: ${existingEntry.uid}`);
      console.log('\n📝 Updating existing entry with new content...');

      const updateResult = await makeRequest(
        'PUT',
        `/v3/content_types/modular_home_page/entries/${existingEntry.uid}`,
        homepageContent
      );

      if (updateResult.status === 200 || updateResult.status === 201) {
        console.log('\n✅ Homepage entry updated successfully!');
        console.log(`   Entry UID: ${existingEntry.uid}`);
      } else {
        console.log('\n❌ Failed to update entry');
        console.log('Status:', updateResult.status);
        console.log('Response:', JSON.stringify(updateResult.data, null, 2));
        return;
      }
    } else {
      // Create new entry
      console.log('   No existing entry found');
      console.log('\n📝 Creating new homepage entry...');

      const createResult = await makeRequest(
        'POST',
        '/v3/content_types/modular_home_page/entries',
        homepageContent
      );

      if (createResult.status === 200 || createResult.status === 201) {
        console.log('\n✅ Homepage entry created successfully!');
        console.log(`   Entry UID: ${createResult.data.entry?.uid}`);
      } else {
        console.log('\n❌ Failed to create entry');
        console.log('Status:', createResult.status);
        console.log('Response:', JSON.stringify(createResult.data, null, 2));
        return;
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('🎉 Seeding Complete!');
    console.log('='.repeat(70));

    console.log('\n📦 Blocks added:');
    homepageContent.entry.page_sections.forEach((block, i) => {
      const blockType = Object.keys(block)[0];
      console.log(`   ${i + 1}. ${blockType}`);
    });

    console.log('\n📝 Next steps:');
    console.log('   1. Go to Contentstack → Entries → Modular Home Page');
    console.log('   2. Review the content and make any adjustments');
    console.log('   3. Publish the entry');
    console.log('   4. Visit /home-modular to see the page\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  seedHomepage();
}

module.exports = { seedHomepage, homepageContent };
