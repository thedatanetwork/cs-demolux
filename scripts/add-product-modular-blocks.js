#!/usr/bin/env node

/**
 * Add Modular Blocks to Product Content Type
 * Adds inline, page-specific modular blocks for rich product pages
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
    console.log('🎨 Adding Modular Blocks to Product Content Type\n');
    console.log('='.repeat(70));

    const client = contentstack.client();
    const stack = client.stack({
      api_key: stackConfig.api_key,
      management_token: stackConfig.management_token
    });

    // Fetch the Product content type
    console.log('\n📦 Fetching Product content type...');
    const contentType = await stack.contentType('product').fetch();

    // Define the modular blocks field
    const modularBlocksField = {
      display_name: 'Product Content Blocks',
      uid: 'content_blocks',
      data_type: 'blocks',
      multiple: true,
      blocks: [
        // 1. Product Highlights Block
        {
          title: 'Product Highlights',
          uid: 'product_highlights',
          schema: [
            {
              display_name: 'Highlights',
              uid: 'highlights',
              data_type: 'group',
              multiple: true,
              schema: [
                {
                  display_name: 'Icon',
                  uid: 'icon',
                  data_type: 'text',
                  instruction: 'Lucide icon name (e.g., Zap, Award, Shield)',
                  mandatory: true
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
                  field_metadata: { multiline: true },
                  mandatory: false
                }
              ]
            }
          ]
        },

        // 2. Technical Specifications Block
        {
          title: 'Technical Specifications',
          uid: 'tech_specs',
          schema: [
            {
              display_name: 'Section Title',
              uid: 'section_title',
              data_type: 'text',
              mandatory: false
            },
            {
              display_name: 'Specifications',
              uid: 'specs',
              data_type: 'group',
              multiple: true,
              schema: [
                {
                  display_name: 'Label',
                  uid: 'label',
                  data_type: 'text',
                  mandatory: true
                },
                {
                  display_name: 'Value',
                  uid: 'value',
                  data_type: 'text',
                  mandatory: true
                }
              ]
            }
          ]
        },

        // 3. Materials & Craftsmanship Block
        {
          title: 'Materials & Craftsmanship',
          uid: 'materials_craftsmanship',
          schema: [
            {
              display_name: 'Title',
              uid: 'title',
              data_type: 'text',
              mandatory: false
            },
            {
              display_name: 'Description',
              uid: 'description',
              data_type: 'text',
              field_metadata: {
                multiline: true,
                rich_text_type: 'advanced'
              },
              mandatory: true
            },
            {
              display_name: 'Image',
              uid: 'image',
              data_type: 'file',
              mandatory: false
            },
            {
              display_name: 'Materials List',
              uid: 'materials',
              data_type: 'group',
              multiple: true,
              schema: [
                {
                  display_name: 'Material Name',
                  uid: 'name',
                  data_type: 'text',
                  mandatory: true
                },
                {
                  display_name: 'Description',
                  uid: 'description',
                  data_type: 'text',
                  field_metadata: { multiline: true },
                  mandatory: false
                }
              ]
            }
          ]
        },

        // 4. What's In The Box Block
        {
          title: "What's In The Box",
          uid: 'whats_included',
          schema: [
            {
              display_name: 'Title',
              uid: 'title',
              data_type: 'text',
              mandatory: false
            },
            {
              display_name: 'Items',
              uid: 'items',
              data_type: 'text',
              field_metadata: {
                multiline: true,
                markdown: true
              },
              instruction: 'List items included (supports Markdown)',
              mandatory: true
            },
            {
              display_name: 'Unboxing Image',
              uid: 'image',
              data_type: 'file',
              mandatory: false
            }
          ]
        },

        // 5. Video Showcase Block
        {
          title: 'Video Showcase',
          uid: 'video_showcase',
          schema: [
            {
              display_name: 'Title',
              uid: 'title',
              data_type: 'text',
              mandatory: false
            },
            {
              display_name: 'Video URL',
              uid: 'video_url',
              data_type: 'text',
              instruction: 'YouTube, Vimeo, or direct video URL',
              mandatory: true
            },
            {
              display_name: 'Thumbnail',
              uid: 'thumbnail',
              data_type: 'file',
              mandatory: false
            },
            {
              display_name: 'Caption',
              uid: 'caption',
              data_type: 'text',
              field_metadata: { multiline: true },
              mandatory: false
            }
          ]
        },

        // 6. Image Gallery Block
        {
          title: 'Image Gallery',
          uid: 'image_gallery',
          schema: [
            {
              display_name: 'Title',
              uid: 'title',
              data_type: 'text',
              mandatory: false
            },
            {
              display_name: 'Gallery Images',
              uid: 'images',
              data_type: 'file',
              multiple: true,
              mandatory: true
            },
            {
              display_name: 'Layout',
              uid: 'layout',
              data_type: 'text',
              display_type: 'dropdown',
              enum: {
                advanced: false,
                choices: [
                  { value: 'grid' },
                  { value: 'masonry' },
                  { value: 'carousel' }
                ]
              },
              mandatory: false
            }
          ]
        },

        // 7. Size & Fit Guide Block
        {
          title: 'Size & Fit Guide',
          uid: 'size_fit_guide',
          schema: [
            {
              display_name: 'Title',
              uid: 'title',
              data_type: 'text',
              mandatory: false
            },
            {
              display_name: 'Dimensions',
              uid: 'dimensions',
              data_type: 'group',
              multiple: true,
              schema: [
                {
                  display_name: 'Dimension',
                  uid: 'dimension',
                  data_type: 'text',
                  instruction: 'e.g., Length, Width, Height',
                  mandatory: true
                },
                {
                  display_name: 'Measurement',
                  uid: 'measurement',
                  data_type: 'text',
                  instruction: 'e.g., 42mm, 10.5", 250g',
                  mandatory: true
                }
              ]
            },
            {
              display_name: 'Size Chart Image',
              uid: 'size_chart',
              data_type: 'file',
              mandatory: false
            }
          ]
        },

        // 8. Care & Maintenance Block
        {
          title: 'Care & Maintenance',
          uid: 'care_maintenance',
          schema: [
            {
              display_name: 'Title',
              uid: 'title',
              data_type: 'text',
              mandatory: false
            },
            {
              display_name: 'Care Instructions',
              uid: 'instructions',
              data_type: 'text',
              field_metadata: {
                multiline: true,
                rich_text_type: 'advanced'
              },
              mandatory: true
            },
            {
              display_name: 'Care Tips',
              uid: 'tips',
              data_type: 'group',
              multiple: true,
              schema: [
                {
                  display_name: 'Tip',
                  uid: 'tip',
                  data_type: 'text',
                  mandatory: true
                }
              ]
            }
          ]
        },

        // 9. Sustainability Story Block
        {
          title: 'Sustainability Story',
          uid: 'sustainability',
          schema: [
            {
              display_name: 'Title',
              uid: 'title',
              data_type: 'text',
              mandatory: false
            },
            {
              display_name: 'Story',
              uid: 'story',
              data_type: 'text',
              field_metadata: {
                multiline: true,
                rich_text_type: 'advanced'
              },
              mandatory: true
            },
            {
              display_name: 'Certifications',
              uid: 'certifications',
              data_type: 'group',
              multiple: true,
              schema: [
                {
                  display_name: 'Certification Name',
                  uid: 'name',
                  data_type: 'text',
                  mandatory: true
                },
                {
                  display_name: 'Badge/Logo',
                  uid: 'badge',
                  data_type: 'file',
                  mandatory: false
                }
              ]
            }
          ]
        },

        // 10. Awards & Recognition Block
        {
          title: 'Awards & Recognition',
          uid: 'awards_recognition',
          schema: [
            {
              display_name: 'Title',
              uid: 'title',
              data_type: 'text',
              mandatory: false
            },
            {
              display_name: 'Awards',
              uid: 'awards',
              data_type: 'group',
              multiple: true,
              schema: [
                {
                  display_name: 'Award/Publication',
                  uid: 'title',
                  data_type: 'text',
                  mandatory: true
                },
                {
                  display_name: 'Description/Quote',
                  uid: 'description',
                  data_type: 'text',
                  field_metadata: { multiline: true },
                  mandatory: false
                },
                {
                  display_name: 'Logo/Badge',
                  uid: 'logo',
                  data_type: 'file',
                  mandatory: false
                },
                {
                  display_name: 'Year',
                  uid: 'year',
                  data_type: 'number',
                  mandatory: false
                }
              ]
            }
          ]
        }
      ],
      mandatory: false
    };

    // Add the field to the schema
    console.log('\n📝 Adding Product Content Blocks field...');
    contentType.schema.push(modularBlocksField);

    // Update the content type
    await contentType.update();
    console.log('   ✅ Product Content Blocks field added successfully!');

    console.log('\n' + '='.repeat(70));
    console.log('🎉 COMPLETE!');
    console.log('='.repeat(70));
    console.log('\n✅ Added 10 modular blocks to Product content type:');
    console.log('   1. Product Highlights - Key features with icons');
    console.log('   2. Technical Specifications - Elegant specs table');
    console.log('   3. Materials & Craftsmanship - Material storytelling');
    console.log('   4. What\'s In The Box - Unboxing details');
    console.log('   5. Video Showcase - Product demonstration videos');
    console.log('   6. Image Gallery - Additional product images');
    console.log('   7. Size & Fit Guide - Dimensions and sizing');
    console.log('   8. Care & Maintenance - Premium care instructions');
    console.log('   9. Sustainability Story - Eco-credentials');
    console.log('  10. Awards & Recognition - Press mentions, awards');
    console.log('\n📝 Next: Edit any product in Contentstack to add these blocks!\n');

  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
