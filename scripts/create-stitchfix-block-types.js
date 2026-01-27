#!/usr/bin/env node

/**
 * Create StitchFix-Style Block Content Types
 *
 * Creates the following content types in Contentstack:
 * 1. testimonial - Customer testimonials/reviews
 * 2. process_steps_block - "How It Works" numbered steps
 * 3. statistics_block - Key metrics display
 * 4. testimonials_block - Testimonials section block
 * 5. faq_block - FAQ accordion block
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

// Content Type Schemas
const contentTypeSchemas = {
  // Testimonial Content Type (reusable entries)
  testimonial: {
    title: 'Testimonial',
    uid: 'testimonial',
    description: 'Customer testimonials and reviews',
    schema: [
      {
        display_name: 'Title',
        uid: 'title',
        data_type: 'text',
        mandatory: true,
        unique: true,
        field_metadata: {
          instruction: 'Internal title for this testimonial entry'
        }
      },
      {
        display_name: 'Customer Name',
        uid: 'customer_name',
        data_type: 'text',
        mandatory: true
      },
      {
        display_name: 'Customer Title',
        uid: 'customer_title',
        data_type: 'text',
        mandatory: false,
        field_metadata: {
          instruction: 'Job title, location, or descriptor (e.g., "Marketing Manager" or "San Francisco, CA")'
        }
      },
      {
        display_name: 'Customer Image',
        uid: 'customer_image',
        data_type: 'file',
        mandatory: false,
        field_metadata: {
          instruction: 'Profile photo (square aspect ratio recommended)'
        }
      },
      {
        display_name: 'Testimonial Text',
        uid: 'testimonial_text',
        data_type: 'text',
        mandatory: true,
        field_metadata: {
          multiline: true,
          instruction: 'The customer quote/review'
        }
      },
      {
        display_name: 'Rating',
        uid: 'rating',
        data_type: 'number',
        mandatory: false,
        field_metadata: {
          instruction: 'Rating out of 5 (1-5)'
        }
      },
      {
        display_name: 'Related Product',
        uid: 'product',
        data_type: 'reference',
        reference_to: ['product'],
        mandatory: false,
        field_metadata: {
          instruction: 'Optional: link to the product being reviewed'
        }
      },
      {
        display_name: 'Date',
        uid: 'date',
        data_type: 'isodate',
        mandatory: false
      },
      {
        display_name: 'Featured',
        uid: 'is_featured',
        data_type: 'boolean',
        mandatory: false,
        field_metadata: {
          default_value: false
        }
      }
    ]
  },

  // Process Steps Block
  process_steps_block: {
    title: 'Process Steps Block',
    uid: 'process_steps_block',
    description: 'Display a step-by-step process (e.g., "How It Works")',
    schema: [
      {
        display_name: 'Section Title',
        uid: 'section_title',
        data_type: 'text',
        mandatory: true,
        field_metadata: {
          instruction: 'Main heading (e.g., "How Demolux Works")'
        }
      },
      {
        display_name: 'Section Description',
        uid: 'section_description',
        data_type: 'text',
        mandatory: false,
        field_metadata: {
          multiline: true,
          instruction: 'Optional subheading/description'
        }
      },
      {
        display_name: 'Badge Text',
        uid: 'badge_text',
        data_type: 'text',
        mandatory: false,
        field_metadata: {
          instruction: 'Small label above the title (e.g., "HOW IT WORKS")'
        }
      },
      {
        display_name: 'Steps',
        uid: 'steps',
        data_type: 'group',
        mandatory: true,
        multiple: true,
        field_metadata: {
          instruction: 'Add 3-5 steps for the process'
        },
        schema: [
          {
            display_name: 'Step Number',
            uid: 'step_number',
            data_type: 'number',
            mandatory: false,
            field_metadata: {
              instruction: 'Optional custom step number (auto-increments if not set)'
            }
          },
          {
            display_name: 'Title',
            uid: 'title',
            data_type: 'text',
            mandatory: true
          },
          {
            display_name: 'Description',
            uid: 'description',
            data_type: 'text',
            mandatory: true,
            field_metadata: {
              multiline: true
            }
          },
          {
            display_name: 'Icon',
            uid: 'icon',
            data_type: 'text',
            mandatory: false,
            field_metadata: {
              instruction: 'Icon name: CheckCircle, Sparkles, Users, Gift, Truck, Star, Zap, Heart, ShoppingBag, Palette, Target'
            }
          },
          {
            display_name: 'Image',
            uid: 'image',
            data_type: 'file',
            mandatory: false,
            field_metadata: {
              instruction: 'Optional image for the step (overrides icon)'
            }
          },
          {
            display_name: 'CTA Text',
            uid: 'cta_text',
            data_type: 'text',
            mandatory: false
          },
          {
            display_name: 'CTA URL',
            uid: 'cta_url',
            data_type: 'text',
            mandatory: false
          }
        ]
      },
      {
        display_name: 'Layout Style',
        uid: 'layout_style',
        data_type: 'text',
        mandatory: true,
        display_type: 'dropdown',
        enum: {
          advanced: false,
          choices: [
            { value: 'horizontal' },
            { value: 'vertical' },
            { value: 'alternating' }
          ]
        },
        field_metadata: {
          default_value: 'horizontal'
        }
      },
      {
        display_name: 'Show Step Numbers',
        uid: 'show_step_numbers',
        data_type: 'boolean',
        mandatory: false,
        field_metadata: {
          default_value: true
        }
      },
      {
        display_name: 'Show Connector Lines',
        uid: 'show_connector_lines',
        data_type: 'boolean',
        mandatory: false,
        field_metadata: {
          default_value: true
        }
      },
      {
        display_name: 'Background Style',
        uid: 'background_style',
        data_type: 'text',
        mandatory: true,
        display_type: 'dropdown',
        enum: {
          advanced: false,
          choices: [
            { value: 'white' },
            { value: 'gray' },
            { value: 'gradient' }
          ]
        },
        field_metadata: {
          default_value: 'white'
        }
      }
    ]
  },

  // Statistics Block
  statistics_block: {
    title: 'Statistics Block',
    uid: 'statistics_block',
    description: 'Display key metrics and statistics (e.g., "2000+ brands", "40+ hours saved")',
    schema: [
      {
        display_name: 'Section Title',
        uid: 'section_title',
        data_type: 'text',
        mandatory: false,
        field_metadata: {
          instruction: 'Optional heading above the stats'
        }
      },
      {
        display_name: 'Section Description',
        uid: 'section_description',
        data_type: 'text',
        mandatory: false,
        field_metadata: {
          multiline: true
        }
      },
      {
        display_name: 'Badge Text',
        uid: 'badge_text',
        data_type: 'text',
        mandatory: false,
        field_metadata: {
          instruction: 'Small label (e.g., "BY THE NUMBERS")'
        }
      },
      {
        display_name: 'Metrics',
        uid: 'metrics',
        data_type: 'group',
        mandatory: true,
        multiple: true,
        field_metadata: {
          instruction: 'Add 3-4 key statistics'
        },
        schema: [
          {
            display_name: 'Value',
            uid: 'value',
            data_type: 'text',
            mandatory: true,
            field_metadata: {
              instruction: 'The stat value (e.g., "2,000+", "40+", "$29", "98%")'
            }
          },
          {
            display_name: 'Label',
            uid: 'label',
            data_type: 'text',
            mandatory: true,
            field_metadata: {
              instruction: 'Short label (e.g., "Brands", "Hours Saved")'
            }
          },
          {
            display_name: 'Description',
            uid: 'description',
            data_type: 'text',
            mandatory: false,
            field_metadata: {
              instruction: 'Optional longer description'
            }
          },
          {
            display_name: 'Icon',
            uid: 'icon',
            data_type: 'text',
            mandatory: false,
            field_metadata: {
              instruction: 'Icon name: TrendingUp, Users, Award, Clock, Star, ShoppingBag, Heart, Zap, Globe, CheckCircle'
            }
          }
        ]
      },
      {
        display_name: 'Layout Style',
        uid: 'layout_style',
        data_type: 'text',
        mandatory: true,
        display_type: 'dropdown',
        enum: {
          advanced: false,
          choices: [
            { value: 'horizontal' },
            { value: 'grid-3' },
            { value: 'grid-4' }
          ]
        },
        field_metadata: {
          default_value: 'horizontal'
        }
      },
      {
        display_name: 'Background Style',
        uid: 'background_style',
        data_type: 'text',
        mandatory: true,
        display_type: 'dropdown',
        enum: {
          advanced: false,
          choices: [
            { value: 'white' },
            { value: 'dark' },
            { value: 'gradient' },
            { value: 'gradient-gold' }
          ]
        },
        field_metadata: {
          default_value: 'dark'
        }
      },
      {
        display_name: 'Animated Numbers',
        uid: 'animated',
        data_type: 'boolean',
        mandatory: false,
        field_metadata: {
          default_value: true,
          instruction: 'Animate numbers counting up when scrolled into view'
        }
      }
    ]
  },

  // Testimonials Block
  testimonials_block: {
    title: 'Testimonials Block',
    uid: 'testimonials_block',
    description: 'Display customer testimonials section',
    schema: [
      {
        display_name: 'Section Title',
        uid: 'section_title',
        data_type: 'text',
        mandatory: false,
        field_metadata: {
          instruction: 'Heading (e.g., "What Our Customers Say")'
        }
      },
      {
        display_name: 'Section Description',
        uid: 'section_description',
        data_type: 'text',
        mandatory: false,
        field_metadata: {
          multiline: true
        }
      },
      {
        display_name: 'Badge Text',
        uid: 'badge_text',
        data_type: 'text',
        mandatory: false,
        field_metadata: {
          instruction: 'Small label (e.g., "TESTIMONIALS")'
        }
      },
      {
        display_name: 'Testimonials',
        uid: 'testimonials',
        data_type: 'reference',
        reference_to: ['testimonial'],
        mandatory: true,
        multiple: true,
        field_metadata: {
          instruction: 'Select testimonials to display'
        }
      },
      {
        display_name: 'Layout Style',
        uid: 'layout_style',
        data_type: 'text',
        mandatory: true,
        display_type: 'dropdown',
        enum: {
          advanced: false,
          choices: [
            { value: 'carousel' },
            { value: 'grid' },
            { value: 'single-featured' }
          ]
        },
        field_metadata: {
          default_value: 'carousel'
        }
      },
      {
        display_name: 'Show Ratings',
        uid: 'show_ratings',
        data_type: 'boolean',
        mandatory: false,
        field_metadata: {
          default_value: true
        }
      },
      {
        display_name: 'Show Customer Images',
        uid: 'show_images',
        data_type: 'boolean',
        mandatory: false,
        field_metadata: {
          default_value: true
        }
      },
      {
        display_name: 'Background Style',
        uid: 'background_style',
        data_type: 'text',
        mandatory: true,
        display_type: 'dropdown',
        enum: {
          advanced: false,
          choices: [
            { value: 'white' },
            { value: 'gray' },
            { value: 'gradient' }
          ]
        },
        field_metadata: {
          default_value: 'gray'
        }
      }
    ]
  },

  // FAQ Block
  faq_block: {
    title: 'FAQ Block',
    uid: 'faq_block',
    description: 'Frequently asked questions with expandable answers',
    schema: [
      {
        display_name: 'Section Title',
        uid: 'section_title',
        data_type: 'text',
        mandatory: true,
        field_metadata: {
          default_value: 'Frequently Asked Questions'
        }
      },
      {
        display_name: 'Section Description',
        uid: 'section_description',
        data_type: 'text',
        mandatory: false,
        field_metadata: {
          multiline: true
        }
      },
      {
        display_name: 'Badge Text',
        uid: 'badge_text',
        data_type: 'text',
        mandatory: false,
        field_metadata: {
          instruction: 'Small label (e.g., "GOT QUESTIONS?")'
        }
      },
      {
        display_name: 'FAQs',
        uid: 'faqs',
        data_type: 'group',
        mandatory: true,
        multiple: true,
        field_metadata: {
          instruction: 'Add frequently asked questions'
        },
        schema: [
          {
            display_name: 'Question',
            uid: 'question',
            data_type: 'text',
            mandatory: true
          },
          {
            display_name: 'Answer',
            uid: 'answer',
            data_type: 'text',
            mandatory: true,
            field_metadata: {
              multiline: true
            }
          },
          {
            display_name: 'Category',
            uid: 'category',
            data_type: 'text',
            mandatory: false,
            field_metadata: {
              instruction: 'Optional category for grouping (e.g., "Shipping", "Returns")'
            }
          }
        ]
      },
      {
        display_name: 'Layout Style',
        uid: 'layout_style',
        data_type: 'text',
        mandatory: true,
        display_type: 'dropdown',
        enum: {
          advanced: false,
          choices: [
            { value: 'accordion' },
            { value: 'two-column' },
            { value: 'cards' }
          ]
        },
        field_metadata: {
          default_value: 'accordion'
        }
      },
      {
        display_name: 'Show Categories',
        uid: 'show_categories',
        data_type: 'boolean',
        mandatory: false,
        field_metadata: {
          default_value: false,
          instruction: 'Group FAQs by category'
        }
      },
      {
        display_name: 'Expand First FAQ',
        uid: 'expand_first',
        data_type: 'boolean',
        mandatory: false,
        field_metadata: {
          default_value: true,
          instruction: 'Auto-expand the first FAQ on load'
        }
      },
      {
        display_name: 'Background Style',
        uid: 'background_style',
        data_type: 'text',
        mandatory: true,
        display_type: 'dropdown',
        enum: {
          advanced: false,
          choices: [
            { value: 'white' },
            { value: 'gray' },
            { value: 'gradient' }
          ]
        },
        field_metadata: {
          default_value: 'white'
        }
      }
    ]
  }
};

async function createContentType(stack, contentTypeData) {
  try {
    console.log(`\n📝 Creating content type: ${contentTypeData.title}...`);

    // Check if content type already exists
    try {
      const existingCT = await stack.contentType(contentTypeData.uid).fetch();
      console.log(`   ⚠️  Content type "${contentTypeData.title}" already exists (skipping)`);
      return { success: true, skipped: true };
    } catch (error) {
      // Content type doesn't exist, continue with creation
    }

    // Create the content type
    const contentType = await stack.contentType().create({
      content_type: {
        title: contentTypeData.title,
        uid: contentTypeData.uid,
        description: contentTypeData.description,
        schema: contentTypeData.schema
      }
    });

    console.log(`   ✅ Successfully created "${contentTypeData.title}"`);
    return { success: true, skipped: false };

  } catch (error) {
    console.error(`   ❌ Failed to create "${contentTypeData.title}":`, error.message);
    if (error.errors) {
      console.error('   Errors:', JSON.stringify(error.errors, null, 2));
    }
    return { success: false, error: error.message };
  }
}

async function main() {
  try {
    console.log('🚀 Creating StitchFix-Style Block Content Types\n');
    console.log('=' .repeat(60));
    console.log('Configuration:');
    console.log(`   API Key: ${stackConfig.api_key ? stackConfig.api_key.substring(0, 10) + '...' : 'missing'}`);
    console.log(`   Management Token: ${stackConfig.management_token ? stackConfig.management_token.substring(0, 10) + '...' : 'missing'}`);
    console.log(`   Environment: ${stackConfig.environment}`);
    console.log(`   Region: ${stackConfig.region}`);

    // Validate configuration
    if (!stackConfig.api_key || !stackConfig.management_token) {
      console.error('\n❌ Missing required environment variables:');
      console.error('   CONTENTSTACK_API_KEY');
      console.error('   CONTENTSTACK_MANAGEMENT_TOKEN');
      console.error('\nCreate a .env file in the scripts directory with your credentials.');
      process.exit(1);
    }

    // Initialize Management API
    const client = contentstack.client();
    const stack = client.stack({
      api_key: stackConfig.api_key,
      management_token: stackConfig.management_token
    });

    console.log('\n📦 Content types to create:');
    console.log('   1. Testimonial (reusable customer reviews)');
    console.log('   2. Process Steps Block (How It Works)');
    console.log('   3. Statistics Block (Key Metrics)');
    console.log('   4. Testimonials Block (Testimonial Section)');
    console.log('   5. FAQ Block (FAQ Accordion)');

    // Create content types in order (testimonial first since it's referenced)
    const results = {
      created: [],
      skipped: [],
      failed: []
    };

    // Order matters: testimonial must be created before testimonials_block
    const orderedKeys = ['testimonial', 'process_steps_block', 'statistics_block', 'testimonials_block', 'faq_block'];

    for (const key of orderedKeys) {
      const ctData = contentTypeSchemas[key];
      const result = await createContentType(stack, ctData);

      if (result.success && !result.skipped) {
        results.created.push(ctData.title);
      } else if (result.skipped) {
        results.skipped.push(ctData.title);
      } else {
        results.failed.push({ title: ctData.title, error: result.error });
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Created: ${results.created.length} content types`);
    if (results.created.length > 0) {
      results.created.forEach(title => console.log(`   - ${title}`));
    }

    console.log(`\n⚠️  Skipped: ${results.skipped.length} content types (already exist)`);
    if (results.skipped.length > 0) {
      results.skipped.forEach(title => console.log(`   - ${title}`));
    }

    if (results.failed.length > 0) {
      console.log(`\n❌ Failed: ${results.failed.length} content types`);
      results.failed.forEach(item => console.log(`   - ${item.title}: ${item.error}`));
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n🎉 StitchFix-style block types setup complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run: npm run create-stitchfix-sample-content');
    console.log('   2. Add these blocks to your modular_home_page content type');
    console.log('   3. Visit /home-modular to see the new sections');

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

module.exports = { main, contentTypeSchemas };
