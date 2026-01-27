#!/usr/bin/env node

/**
 * Convert Modular Home Page to True Modular Blocks
 *
 * This script converts the modular_home_page content type from using
 * reference fields to separate content types, to using true Contentstack
 * modular blocks (data_type: 'blocks') with embedded schemas.
 *
 * This gives editors:
 * - Visual block picker UI
 * - Drag-and-drop reordering
 * - Inline editing of block content
 * - No need to manage separate block entries
 */

require('dotenv').config();
const https = require('https');

const API_KEY = process.env.CONTENTSTACK_API_KEY;
const AUTH_TOKEN = process.env.CONTENTSTACK_MANAGEMENT_TOKEN;

// Complete modular blocks schema for the page
const updatedSchema = {
  content_type: {
    title: "Modular Home Page",
    uid: "modular_home_page",
    description: "Homepage with true modular blocks - visual page builder experience",
    schema: [
      // Title field - required for all content types
      {
        data_type: "text",
        display_name: "Title",
        uid: "title",
        field_metadata: {
          _default: true
        },
        mandatory: true,
        unique: true,
        multiple: false,
        non_localizable: false
      },
      // Page Sections - TRUE MODULAR BLOCKS
      {
        display_name: "Page Sections",
        uid: "page_sections",
        data_type: "blocks",
        blocks: [
          // ============================================
          // HERO SECTION BLOCK
          // ============================================
          {
            title: "Hero Section",
            uid: "hero_section",
            schema: [
              {
                display_name: "Variant",
                uid: "variant",
                data_type: "text",
                display_type: "dropdown",
                mandatory: true,
                enum: {
                  advanced: false,
                  choices: [
                    { value: "split_hero" },
                    { value: "minimal_hero" },
                    { value: "image_hero" },
                    { value: "campaign_hero" },
                    { value: "video_hero" }
                  ]
                }
              },
              { display_name: "Badge Text", uid: "badge_text", data_type: "text" },
              { display_name: "Title", uid: "title", data_type: "text", mandatory: true },
              { display_name: "Subtitle", uid: "subtitle", data_type: "text" },
              { display_name: "Description", uid: "description", data_type: "text", field_metadata: { multiline: true } },
              { display_name: "Background Image", uid: "background_media", data_type: "file" },
              {
                display_name: "Overlay Style",
                uid: "overlay_style",
                data_type: "text",
                display_type: "dropdown",
                enum: {
                  advanced: false,
                  choices: [
                    { value: "dark" },
                    { value: "light" },
                    { value: "gradient" },
                    { value: "none" }
                  ]
                }
              },
              {
                display_name: "Primary CTA",
                uid: "primary_cta",
                data_type: "group",
                schema: [
                  { display_name: "Text", uid: "text", data_type: "text", mandatory: true },
                  { display_name: "URL", uid: "url", data_type: "text", mandatory: true },
                  {
                    display_name: "Style",
                    uid: "style",
                    data_type: "text",
                    display_type: "dropdown",
                    enum: { advanced: false, choices: [{ value: "primary" }, { value: "gold" }, { value: "outline" }, { value: "ghost" }] }
                  }
                ]
              },
              {
                display_name: "Secondary CTA",
                uid: "secondary_cta",
                data_type: "group",
                schema: [
                  { display_name: "Text", uid: "text", data_type: "text" },
                  { display_name: "URL", uid: "url", data_type: "text" },
                  {
                    display_name: "Style",
                    uid: "style",
                    data_type: "text",
                    display_type: "dropdown",
                    enum: { advanced: false, choices: [{ value: "primary" }, { value: "gold" }, { value: "outline" }, { value: "ghost" }] }
                  }
                ]
              },
              {
                display_name: "Feature Items",
                uid: "feature_items",
                data_type: "group",
                multiple: true,
                schema: [
                  { display_name: "Icon", uid: "icon", data_type: "text", field_metadata: { instruction: "lucide-react icon name (e.g., Award, Zap, Star)" } },
                  { display_name: "Title", uid: "title", data_type: "text", mandatory: true },
                  { display_name: "Description", uid: "description", data_type: "text" }
                ]
              },
              {
                display_name: "Text Alignment",
                uid: "text_alignment",
                data_type: "text",
                display_type: "dropdown",
                enum: { advanced: false, choices: [{ value: "left" }, { value: "center" }, { value: "right" }] }
              },
              {
                display_name: "Height",
                uid: "height",
                data_type: "text",
                display_type: "dropdown",
                enum: { advanced: false, choices: [{ value: "full" }, { value: "large" }, { value: "medium" }, { value: "small" }] }
              }
            ]
          },
          // ============================================
          // FEATURED CONTENT GRID BLOCK
          // ============================================
          {
            title: "Featured Content Grid",
            uid: "featured_content_grid",
            schema: [
              {
                display_name: "Variant",
                uid: "variant",
                data_type: "text",
                display_type: "dropdown",
                mandatory: true,
                enum: {
                  advanced: false,
                  choices: [
                    { value: "product_grid" },
                    { value: "blog_grid" },
                    { value: "mixed_grid" },
                    { value: "collection_grid" }
                  ]
                }
              },
              { display_name: "Section Title", uid: "section_title", data_type: "text", mandatory: true },
              { display_name: "Section Description", uid: "section_description", data_type: "text", field_metadata: { multiline: true } },
              { display_name: "Badge Text", uid: "badge_text", data_type: "text" },
              {
                display_name: "Content Source",
                uid: "content_source",
                data_type: "text",
                display_type: "dropdown",
                mandatory: true,
                enum: {
                  advanced: false,
                  choices: [
                    { value: "manual" },
                    { value: "dynamic_recent" },
                    { value: "dynamic_featured" }
                  ]
                },
                field_metadata: { instruction: "Manual = select specific items, Dynamic = auto-populate" }
              },
              {
                display_name: "Layout Style",
                uid: "layout_style",
                data_type: "text",
                display_type: "dropdown",
                mandatory: true,
                enum: {
                  advanced: false,
                  choices: [
                    { value: "grid-2" },
                    { value: "grid-3" },
                    { value: "grid-4" },
                    { value: "masonry" },
                    { value: "carousel" }
                  ]
                }
              },
              { display_name: "Dynamic Limit", uid: "dynamic_limit", data_type: "number", field_metadata: { instruction: "Max items to show when using dynamic content" } },
              { display_name: "Show CTA", uid: "show_cta", data_type: "boolean" },
              { display_name: "CTA Text", uid: "cta_text", data_type: "text" },
              { display_name: "CTA URL", uid: "cta_url", data_type: "text" },
              {
                display_name: "Background Style",
                uid: "background_style",
                data_type: "text",
                display_type: "dropdown",
                enum: { advanced: false, choices: [{ value: "white" }, { value: "gray" }, { value: "gradient" }] }
              }
            ]
          },
          // ============================================
          // VALUES GRID BLOCK
          // ============================================
          {
            title: "Values Grid",
            uid: "values_grid",
            schema: [
              { display_name: "Section Title", uid: "section_title", data_type: "text", mandatory: true },
              { display_name: "Section Description", uid: "section_description", data_type: "text", field_metadata: { multiline: true } },
              { display_name: "Badge Text", uid: "badge_text", data_type: "text" },
              {
                display_name: "Values",
                uid: "values",
                data_type: "group",
                multiple: true,
                mandatory: true,
                schema: [
                  { display_name: "Icon", uid: "icon", data_type: "text", mandatory: true, field_metadata: { instruction: "lucide-react icon name (e.g., Sparkles, Users, Globe)" } },
                  { display_name: "Title", uid: "title", data_type: "text", mandatory: true },
                  { display_name: "Description", uid: "description", data_type: "text", mandatory: true, field_metadata: { multiline: true } },
                  { display_name: "Background Image", uid: "background_image", data_type: "file" },
                  { display_name: "Link URL", uid: "link_url", data_type: "text" },
                  { display_name: "Link Text", uid: "link_text", data_type: "text" }
                ]
              },
              {
                display_name: "Layout Style",
                uid: "layout_style",
                data_type: "text",
                display_type: "dropdown",
                mandatory: true,
                enum: {
                  advanced: false,
                  choices: [
                    { value: "grid-2" },
                    { value: "grid-3" },
                    { value: "grid-4" },
                    { value: "horizontal-scroll" }
                  ]
                }
              },
              {
                display_name: "Card Style",
                uid: "card_style",
                data_type: "text",
                display_type: "dropdown",
                mandatory: true,
                enum: {
                  advanced: false,
                  choices: [
                    { value: "elevated" },
                    { value: "flat" },
                    { value: "bordered" },
                    { value: "minimal" }
                  ]
                }
              },
              {
                display_name: "Background Style",
                uid: "background_style",
                data_type: "text",
                display_type: "dropdown",
                enum: { advanced: false, choices: [{ value: "white" }, { value: "gray" }, { value: "gradient" }] }
              }
            ]
          },
          // ============================================
          // CAMPAIGN CTA BLOCK
          // ============================================
          {
            title: "Campaign CTA",
            uid: "campaign_cta",
            schema: [
              {
                display_name: "Variant",
                uid: "variant",
                data_type: "text",
                display_type: "dropdown",
                mandatory: true,
                enum: {
                  advanced: false,
                  choices: [
                    { value: "full_width_cta" },
                    { value: "split_cta" },
                    { value: "centered_cta" },
                    { value: "announcement_banner" }
                  ]
                }
              },
              { display_name: "Title", uid: "title", data_type: "text", mandatory: true },
              { display_name: "Description", uid: "description", data_type: "text", field_metadata: { multiline: true } },
              { display_name: "Badge Text", uid: "badge_text", data_type: "text" },
              { display_name: "Background Image", uid: "background_media", data_type: "file" },
              {
                display_name: "Background Style",
                uid: "background_style",
                data_type: "text",
                display_type: "dropdown",
                mandatory: true,
                enum: {
                  advanced: false,
                  choices: [
                    { value: "gradient-dark" },
                    { value: "gradient-gold" },
                    { value: "image" },
                    { value: "solid" }
                  ]
                }
              },
              {
                display_name: "Primary CTA",
                uid: "primary_cta",
                data_type: "group",
                schema: [
                  { display_name: "Text", uid: "text", data_type: "text", mandatory: true },
                  { display_name: "URL", uid: "url", data_type: "text", mandatory: true },
                  {
                    display_name: "Style",
                    uid: "style",
                    data_type: "text",
                    display_type: "dropdown",
                    enum: { advanced: false, choices: [{ value: "primary" }, { value: "gold" }, { value: "outline" }, { value: "ghost" }] }
                  }
                ]
              },
              {
                display_name: "Secondary CTA",
                uid: "secondary_cta",
                data_type: "group",
                schema: [
                  { display_name: "Text", uid: "text", data_type: "text" },
                  { display_name: "URL", uid: "url", data_type: "text" },
                  {
                    display_name: "Style",
                    uid: "style",
                    data_type: "text",
                    display_type: "dropdown",
                    enum: { advanced: false, choices: [{ value: "primary" }, { value: "gold" }, { value: "outline" }, { value: "ghost" }] }
                  }
                ]
              },
              {
                display_name: "Text Color",
                uid: "text_color",
                data_type: "text",
                display_type: "dropdown",
                enum: { advanced: false, choices: [{ value: "light" }, { value: "dark" }] }
              },
              {
                display_name: "Height",
                uid: "height",
                data_type: "text",
                display_type: "dropdown",
                enum: { advanced: false, choices: [{ value: "full" }, { value: "large" }, { value: "medium" }, { value: "small" }] }
              }
            ]
          },
          // ============================================
          // PROCESS STEPS BLOCK (StitchFix-style)
          // ============================================
          {
            title: "Process Steps",
            uid: "process_steps",
            schema: [
              { display_name: "Section Title", uid: "section_title", data_type: "text", mandatory: true },
              { display_name: "Section Description", uid: "section_description", data_type: "text", field_metadata: { multiline: true } },
              { display_name: "Badge Text", uid: "badge_text", data_type: "text" },
              {
                display_name: "Steps",
                uid: "steps",
                data_type: "group",
                multiple: true,
                mandatory: true,
                schema: [
                  { display_name: "Step Number", uid: "step_number", data_type: "number" },
                  { display_name: "Title", uid: "title", data_type: "text", mandatory: true },
                  { display_name: "Description", uid: "description", data_type: "text", mandatory: true, field_metadata: { multiline: true } },
                  { display_name: "Icon", uid: "icon", data_type: "text", field_metadata: { instruction: "lucide-react icon name" } },
                  { display_name: "Image", uid: "image", data_type: "file" },
                  {
                    display_name: "CTA",
                    uid: "cta",
                    data_type: "group",
                    schema: [
                      { display_name: "Text", uid: "text", data_type: "text" },
                      { display_name: "URL", uid: "url", data_type: "text" }
                    ]
                  }
                ]
              },
              {
                display_name: "Layout Style",
                uid: "layout_style",
                data_type: "text",
                display_type: "dropdown",
                mandatory: true,
                enum: {
                  advanced: false,
                  choices: [
                    { value: "horizontal" },
                    { value: "vertical" },
                    { value: "alternating" }
                  ]
                }
              },
              { display_name: "Show Step Numbers", uid: "show_step_numbers", data_type: "boolean" },
              { display_name: "Show Connector Lines", uid: "show_connector_lines", data_type: "boolean" },
              {
                display_name: "Background Style",
                uid: "background_style",
                data_type: "text",
                display_type: "dropdown",
                enum: { advanced: false, choices: [{ value: "white" }, { value: "gray" }, { value: "gradient" }] }
              }
            ]
          },
          // ============================================
          // STATISTICS BLOCK (StitchFix-style)
          // ============================================
          {
            title: "Statistics",
            uid: "statistics",
            schema: [
              { display_name: "Section Title", uid: "section_title", data_type: "text" },
              { display_name: "Section Description", uid: "section_description", data_type: "text", field_metadata: { multiline: true } },
              { display_name: "Badge Text", uid: "badge_text", data_type: "text" },
              {
                display_name: "Metrics",
                uid: "metrics",
                data_type: "group",
                multiple: true,
                mandatory: true,
                schema: [
                  { display_name: "Value", uid: "value", data_type: "text", mandatory: true, field_metadata: { instruction: "e.g., 10M+, 98%, $500K" } },
                  { display_name: "Label", uid: "label", data_type: "text", mandatory: true },
                  { display_name: "Description", uid: "description", data_type: "text" },
                  { display_name: "Icon", uid: "icon", data_type: "text", field_metadata: { instruction: "lucide-react icon name" } }
                ]
              },
              {
                display_name: "Layout Style",
                uid: "layout_style",
                data_type: "text",
                display_type: "dropdown",
                mandatory: true,
                enum: {
                  advanced: false,
                  choices: [
                    { value: "horizontal" },
                    { value: "grid-3" },
                    { value: "grid-4" }
                  ]
                }
              },
              {
                display_name: "Background Style",
                uid: "background_style",
                data_type: "text",
                display_type: "dropdown",
                mandatory: true,
                enum: {
                  advanced: false,
                  choices: [
                    { value: "white" },
                    { value: "dark" },
                    { value: "gradient" },
                    { value: "gradient-gold" }
                  ]
                }
              },
              { display_name: "Animated", uid: "animated", data_type: "boolean", field_metadata: { instruction: "Animate numbers counting up on scroll" } }
            ]
          },
          // ============================================
          // TESTIMONIALS BLOCK (StitchFix-style)
          // ============================================
          {
            title: "Testimonials",
            uid: "testimonials",
            schema: [
              { display_name: "Section Title", uid: "section_title", data_type: "text" },
              { display_name: "Section Description", uid: "section_description", data_type: "text", field_metadata: { multiline: true } },
              { display_name: "Badge Text", uid: "badge_text", data_type: "text" },
              {
                display_name: "Testimonials",
                uid: "testimonials",
                data_type: "group",
                multiple: true,
                mandatory: true,
                schema: [
                  { display_name: "Quote", uid: "testimonial_text", data_type: "text", mandatory: true, field_metadata: { multiline: true } },
                  { display_name: "Customer Name", uid: "customer_name", data_type: "text", mandatory: true },
                  { display_name: "Customer Title", uid: "customer_title", data_type: "text" },
                  { display_name: "Customer Image", uid: "customer_image", data_type: "file" },
                  { display_name: "Rating", uid: "rating", data_type: "number", field_metadata: { instruction: "1-5 star rating" } }
                ]
              },
              {
                display_name: "Layout Style",
                uid: "layout_style",
                data_type: "text",
                display_type: "dropdown",
                mandatory: true,
                enum: {
                  advanced: false,
                  choices: [
                    { value: "carousel" },
                    { value: "grid" },
                    { value: "single-featured" }
                  ]
                }
              },
              { display_name: "Show Ratings", uid: "show_ratings", data_type: "boolean" },
              { display_name: "Show Images", uid: "show_images", data_type: "boolean" },
              {
                display_name: "Background Style",
                uid: "background_style",
                data_type: "text",
                display_type: "dropdown",
                enum: { advanced: false, choices: [{ value: "white" }, { value: "gray" }, { value: "gradient" }] }
              }
            ]
          },
          // ============================================
          // FAQ BLOCK (StitchFix-style)
          // ============================================
          {
            title: "FAQ",
            uid: "faq",
            schema: [
              { display_name: "Section Title", uid: "section_title", data_type: "text", mandatory: true },
              { display_name: "Section Description", uid: "section_description", data_type: "text", field_metadata: { multiline: true } },
              { display_name: "Badge Text", uid: "badge_text", data_type: "text" },
              {
                display_name: "FAQs",
                uid: "faqs",
                data_type: "group",
                multiple: true,
                mandatory: true,
                schema: [
                  { display_name: "Question", uid: "question", data_type: "text", mandatory: true },
                  { display_name: "Answer", uid: "answer", data_type: "text", mandatory: true, field_metadata: { multiline: true } },
                  { display_name: "Category", uid: "category", data_type: "text" }
                ]
              },
              {
                display_name: "Layout Style",
                uid: "layout_style",
                data_type: "text",
                display_type: "dropdown",
                mandatory: true,
                enum: {
                  advanced: false,
                  choices: [
                    { value: "accordion" },
                    { value: "two-column" },
                    { value: "cards" }
                  ]
                }
              },
              { display_name: "Show Categories", uid: "show_categories", data_type: "boolean" },
              { display_name: "Expand First", uid: "expand_first", data_type: "boolean", field_metadata: { instruction: "Auto-expand first FAQ item" } },
              {
                display_name: "Background Style",
                uid: "background_style",
                data_type: "text",
                display_type: "dropdown",
                enum: { advanced: false, choices: [{ value: "white" }, { value: "gray" }, { value: "gradient" }] }
              }
            ]
          },
          // ============================================
          // TEXT & MEDIA SECTION BLOCK
          // ============================================
          {
            title: "Text & Media Section",
            uid: "text_media_section",
            schema: [
              {
                display_name: "Variant",
                uid: "variant",
                data_type: "text",
                display_type: "dropdown",
                mandatory: true,
                enum: {
                  advanced: false,
                  choices: [
                    { value: "text_left_media_right" },
                    { value: "text_right_media_left" },
                    { value: "text_centered_media_below" },
                    { value: "text_overlay_media" }
                  ]
                }
              },
              { display_name: "Title", uid: "title", data_type: "text" },
              { display_name: "Badge Text", uid: "badge_text", data_type: "text" },
              { display_name: "Content", uid: "content", data_type: "text", mandatory: true, field_metadata: { multiline: true } },
              { display_name: "Media", uid: "media", data_type: "file" },
              {
                display_name: "Media Aspect Ratio",
                uid: "media_aspect_ratio",
                data_type: "text",
                display_type: "dropdown",
                enum: {
                  advanced: false,
                  choices: [
                    { value: "square" },
                    { value: "landscape" },
                    { value: "portrait" },
                    { value: "wide" }
                  ]
                }
              },
              {
                display_name: "CTA",
                uid: "cta",
                data_type: "group",
                schema: [
                  { display_name: "Text", uid: "text", data_type: "text" },
                  { display_name: "URL", uid: "url", data_type: "text" },
                  {
                    display_name: "Style",
                    uid: "style",
                    data_type: "text",
                    display_type: "dropdown",
                    enum: { advanced: false, choices: [{ value: "primary" }, { value: "gold" }, { value: "outline" }, { value: "ghost" }] }
                  }
                ]
              },
              {
                display_name: "Background Style",
                uid: "background_style",
                data_type: "text",
                display_type: "dropdown",
                enum: { advanced: false, choices: [{ value: "white" }, { value: "gray" }, { value: "transparent" }] }
              }
            ]
          }
        ],
        multiple: true,
        mandatory: false,
        field_metadata: {
          instruction: "Click 'Add Block' to build your page visually. Drag blocks to reorder."
        }
      },
      // SEO Fields
      {
        display_name: "SEO",
        uid: "seo",
        data_type: "group",
        schema: [
          { display_name: "Meta Title", uid: "meta_title", data_type: "text" },
          { display_name: "Meta Description", uid: "meta_description", data_type: "text", field_metadata: { multiline: true } },
          { display_name: "OG Image", uid: "og_image", data_type: "file" }
        ]
      }
    ],
    options: {
      singleton: true,
      title: "title",
      is_page: true
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

async function convertToModularBlocks() {
  console.log('\n' + '='.repeat(70));
  console.log('🔄 Converting Modular Home Page to True Modular Blocks');
  console.log('='.repeat(70));
  console.log('\nThis converts from reference-based blocks to embedded modular blocks.');
  console.log('Editors will get a visual block picker UI with drag-and-drop!\n');

  if (!API_KEY || !AUTH_TOKEN) {
    console.error('❌ Missing environment variables:');
    console.error('   CONTENTSTACK_API_KEY');
    console.error('   CONTENTSTACK_MANAGEMENT_TOKEN');
    console.error('\nMake sure these are set in scripts/.env');
    process.exit(1);
  }

  console.log('Configuration:');
  console.log(`   API Key: ${API_KEY.substring(0, 10)}...`);
  console.log(`   Management Token: ${AUTH_TOKEN.substring(0, 10)}...`);

  try {
    // Update the content type
    console.log('\n📝 Updating modular_home_page content type...');
    const result = await makeRequest('PUT', '/v3/content_types/modular_home_page', updatedSchema);

    if (result.status === 200 || result.status === 201) {
      console.log('\n✅ Content type updated successfully!');

      const blocks = updatedSchema.content_type.schema[1].blocks;
      console.log(`\n📦 ${blocks.length} Block types now available:`);
      blocks.forEach((block, i) => {
        console.log(`   ${i + 1}. ${block.title} (${block.uid})`);
      });

      console.log('\n' + '='.repeat(70));
      console.log('🎉 Conversion Complete!');
      console.log('='.repeat(70));

      console.log('\n⚠️  IMPORTANT: Existing entry content has been cleared.');
      console.log('   You will need to recreate the homepage content.\n');

      console.log('📝 Next steps:');
      console.log('   1. Go to Contentstack → Entries → Modular Home Page');
      console.log('   2. Click "Add Block" in Page Sections');
      console.log('   3. Select a block type from the visual picker');
      console.log('   4. Fill in the fields - all content is inline now!');
      console.log('   5. Drag blocks to reorder');
      console.log('   6. Publish and visit /home-modular\n');

      console.log('💡 Tip: Run seed-modular-homepage.js to populate with sample content.\n');
    } else {
      console.log('\n❌ Failed to update content type');
      console.log('Status:', result.status);
      console.log('Response:', JSON.stringify(result.data, null, 2));
    }
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  convertToModularBlocks();
}

module.exports = { convertToModularBlocks, updatedSchema };
