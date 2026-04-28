#!/usr/bin/env node

/**
 * Create Image CTA Banner Block schema in Contentstack.
 *
 * Content type: image_cta_banner_block
 *   A modular block where the editor uploads a finished creative image
 *   (banner with whatever copy is baked in) and overlays one or more
 *   styled CTAs on top. The banner adapts to the image's natural
 *   aspect ratio by default, with override presets and a custom value.
 *
 *   CTA placement uses an "anchor + offset" model:
 *     - position: 9-zone anchor (top_left, ..., bottom_right) — pins the
 *       CTA's own anchor point to that point on the image
 *     - offset_x / offset_y: percentage nudges (-50 to 100) for fine
 *       placement. Positive offset_x = right; positive offset_y = down.
 *
 *   That gives editors a fast rough placement plus pixel-precise nudging
 *   without forcing them to set absolute coordinates from scratch.
 *
 * Idempotent: skips if the content type already exists.
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
};

const ANCHOR_CHOICES = [
  { value: 'top_left' },
  { value: 'top_center' },
  { value: 'top_right' },
  { value: 'middle_left' },
  { value: 'center' },
  { value: 'middle_right' },
  { value: 'bottom_left' },
  { value: 'bottom_center' },
  { value: 'bottom_right' },
];

const VARIANT_CHOICES = [
  { value: 'solid_dark' },
  { value: 'solid_light' },
  { value: 'outline_dark' },
  { value: 'outline_light' },
  { value: 'pill_dark' },
  { value: 'pill_light' },
  { value: 'pill_outline_dark' },
  { value: 'pill_outline_light' },
  { value: 'text_link' },
];

const imageCTABannerBlockSchema = {
  title: 'Image CTA Banner Block',
  uid: 'image_cta_banner_block',
  description:
    'Full-image banner with one or more styled CTA overlays. Editors upload a finished creative and place CTAs on top using a 9-zone anchor plus precise offset nudges. Adapts to the image natural aspect ratio by default.',
  schema: [
    {
      display_name: 'Title',
      uid: 'title',
      data_type: 'text',
      mandatory: true,
      unique: false,
      field_metadata: { description: 'Internal entry title for CMS organization' },
    },

    // ----- Image -----
    {
      display_name: 'Image',
      uid: 'image',
      data_type: 'file',
      mandatory: true,
      field_metadata: { description: 'The full banner creative. Anything baked into the artwork stays baked in; CTAs go on top.' },
    },
    {
      display_name: 'Image Alt Text',
      uid: 'image_alt',
      data_type: 'text',
      mandatory: false,
      field_metadata: { description: 'Accessibility / SEO description of the banner imagery.' },
    },
    {
      display_name: 'Image Object Fit',
      uid: 'image_object_fit',
      data_type: 'text',
      display_type: 'dropdown',
      enum: { advanced: false, choices: [{ value: 'cover' }, { value: 'contain' }] },
      mandatory: false,
      field_metadata: {
        default_value: 'cover',
        description: 'cover crops to fill the banner; contain shows the entire image with letterboxing',
      },
    },

    // ----- Aspect ratio -----
    {
      display_name: 'Aspect Ratio',
      uid: 'aspect_ratio',
      data_type: 'text',
      display_type: 'dropdown',
      enum: {
        advanced: false,
        choices: [
          { value: 'image_natural' },
          { value: '21_9' },
          { value: '16_9' },
          { value: '5_2' },
          { value: '4_3' },
          { value: '3_1' },
          { value: '2_1' },
          { value: 'custom' },
        ],
      },
      mandatory: false,
      field_metadata: {
        default_value: 'image_natural',
        description:
          'image_natural uses the uploaded image\'s own width/height. Pick a preset to crop to a specific shape, or "custom" and supply your own ratio.',
      },
    },
    {
      display_name: 'Custom Aspect Ratio',
      uid: 'custom_aspect_ratio',
      data_type: 'text',
      mandatory: false,
      field_metadata: {
        description: 'Used only when Aspect Ratio = custom. CSS aspect-ratio value, e.g., "21/9", "5/2", "1920/640".',
      },
    },

    // ----- Background + outer link -----
    {
      display_name: 'Background Color',
      uid: 'background_color',
      data_type: 'text',
      display_type: 'dropdown',
      enum: {
        advanced: false,
        choices: [{ value: 'transparent' }, { value: 'white' }, { value: 'black' }, { value: 'soft_gray' }],
      },
      mandatory: false,
      field_metadata: {
        default_value: 'transparent',
        description: 'Color visible if the image uses object-fit: contain (letterbox) or has transparency.',
      },
    },
    {
      display_name: 'Banner Link URL',
      uid: 'link_url',
      data_type: 'text',
      mandatory: false,
      field_metadata: {
        description: 'Optional — wraps the entire banner in a link. If set, individual CTA URLs are ignored (CTAs render as styled labels instead of nested links).',
      },
    },

    // ----- CTAs (repeatable) -----
    {
      display_name: 'CTAs',
      uid: 'ctas',
      data_type: 'group',
      multiple: true,
      mandatory: false,
      max_instance: 5,
      field_metadata: {
        description:
          'Up to 5 CTA overlays. Each placed via 9-zone anchor + offset percentages, with style preset, size, and weight controls.',
      },
      schema: [
        {
          display_name: 'Label',
          uid: 'label',
          data_type: 'text',
          mandatory: true,
          field_metadata: { description: 'Button text (e.g., "Shop All", "Shop Now")' },
        },
        {
          display_name: 'URL',
          uid: 'url',
          data_type: 'text',
          mandatory: false,
          field_metadata: { description: 'Where the CTA links. Leave blank to render as a non-clickable label.' },
        },
        {
          display_name: 'Open in New Tab',
          uid: 'open_in_new_tab',
          data_type: 'boolean',
          mandatory: false,
          field_metadata: { default_value: false },
        },

        // Placement
        {
          display_name: 'Position',
          uid: 'position',
          data_type: 'text',
          display_type: 'dropdown',
          enum: { advanced: false, choices: ANCHOR_CHOICES },
          mandatory: false,
          field_metadata: {
            default_value: 'bottom_center',
            description:
              '9-zone anchor — pins the CTA\'s own anchor point to the matching point on the image (bottom_center pins its bottom-center to the image\'s bottom-center, etc.).',
          },
        },
        {
          display_name: 'Offset X (%)',
          uid: 'offset_x',
          data_type: 'number',
          mandatory: false,
          field_metadata: {
            default_value: 0,
            description:
              'Horizontal nudge as a percentage of the image width. Positive = right, negative = left. Range: -50 to 100.',
          },
        },
        {
          display_name: 'Offset Y (%)',
          uid: 'offset_y',
          data_type: 'number',
          mandatory: false,
          field_metadata: {
            default_value: 0,
            description:
              'Vertical nudge as a percentage of the image height. Positive = down, negative = up. Range: -50 to 100.',
          },
        },

        // Style
        {
          display_name: 'Variant',
          uid: 'variant',
          data_type: 'text',
          display_type: 'dropdown',
          enum: { advanced: false, choices: VARIANT_CHOICES },
          mandatory: false,
          field_metadata: {
            default_value: 'solid_dark',
            description:
              'Style preset. solid/outline × dark/light, plus pill versions (rounded-full) and a plain text_link.',
          },
        },
        {
          display_name: 'Size',
          uid: 'size',
          data_type: 'text',
          display_type: 'dropdown',
          enum: {
            advanced: false,
            choices: [{ value: 'sm' }, { value: 'md' }, { value: 'lg' }, { value: 'xl' }],
          },
          mandatory: false,
          field_metadata: { default_value: 'md', description: 'Overall button size (text + padding scale together)' },
        },
        {
          display_name: 'Font Weight',
          uid: 'font_weight',
          data_type: 'text',
          display_type: 'dropdown',
          enum: {
            advanced: false,
            choices: [{ value: 'regular' }, { value: 'medium' }, { value: 'semibold' }, { value: 'bold' }],
          },
          mandatory: false,
          field_metadata: { default_value: 'semibold' },
        },
        {
          display_name: 'Uppercase',
          uid: 'uppercase',
          data_type: 'boolean',
          mandatory: false,
          field_metadata: { default_value: false, description: 'Force the label to UPPERCASE with mild letter-spacing.' },
        },
      ],
    },
  ],
};

async function createContentType(stack, schema) {
  try {
    console.log(`\n  Creating content type: ${schema.title}...`);
    try {
      await stack.contentType(schema.uid).fetch();
      console.log('  -> Already exists (skipping)');
      return { success: true, skipped: true };
    } catch (_) {
      // Doesn't exist
    }

    await stack.contentType().create({
      content_type: {
        title: schema.title,
        uid: schema.uid,
        description: schema.description,
        schema: schema.schema,
      },
    });
    console.log('  -> Created successfully');
    return { success: true, skipped: false };
  } catch (error) {
    console.error(`  -> FAILED: ${error.message}`);
    if (error.errors) console.error('     Details:', JSON.stringify(error.errors, null, 2));
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Image CTA Banner Block Schema Setup');
  console.log('='.repeat(60));

  if (!stackConfig.api_key || !stackConfig.management_token) {
    console.error('\nMissing credentials. Set CONTENTSTACK_API_KEY and CONTENTSTACK_MANAGEMENT_TOKEN in scripts/.env');
    process.exit(1);
  }

  const client = contentstack.client();
  const stack = client.stack({
    api_key: stackConfig.api_key,
    management_token: stackConfig.management_token,
  });

  const result = await createContentType(stack, imageCTABannerBlockSchema);

  console.log('\n' + '='.repeat(60));
  if (result.success && result.skipped) {
    console.log('Result: already present (no changes)');
  } else if (result.success) {
    console.log('Result: created successfully');
  } else {
    console.log('Result: FAILED');
    process.exit(1);
  }
  console.log('='.repeat(60));
}

if (require.main === module) {
  main().catch((err) => {
    console.error('\nScript failed:', err.message);
    if (err.errors) console.error('Details:', JSON.stringify(err.errors, null, 2));
    process.exit(1);
  });
}

module.exports = { main };
