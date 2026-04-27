#!/usr/bin/env node

/**
 * Create Feature Banner Row Schemas
 *
 * Content type: feature_banner_row_block
 *   N-panel feature row (Brooks-Brothers-style splitContainer). Each panel
 *   has a background image with overlay content. Editors get a hybrid model:
 *     - Structured fields for things that should stay uniform (eyebrow, logo
 *       overlay, CTAs, position, color)
 *     - JSON RTE for headline + description so they can express italic,
 *       bold, line breaks, inline images, and links — but inside the
 *       brand's typography system (the React renderer maps marks to brand
 *       styles, not arbitrary fonts).
 *     - custom_html_override as an opt-in escape hatch for power users.
 *
 * Content type: feature_banner_row_page
 *   Demo page that references one or more feature_banner_row_block entries.
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
};

const RTE_FIELD = (uid, displayName, description) => ({
  display_name: displayName,
  uid,
  data_type: 'json',
  field_metadata: {
    allow_json_rte: true,
    rich_text_type: 'advanced',
    multiline: false,
    description,
  },
  format: '',
  error_messages: { format: '' },
  mandatory: false,
  multiple: false,
  non_localizable: false,
  unique: false,
});

const featureBannerRowBlockSchema = {
  title: 'Feature Banner Row Block',
  uid: 'feature_banner_row_block',
  description:
    'Row of N feature panels. Each panel renders a background image with overlay content (eyebrow, optional logo, headline + description as JSON RTE, CTAs). Inspired by Brooks Brothers splitContainer pattern.',
  schema: [
    {
      display_name: 'Title',
      uid: 'title',
      data_type: 'text',
      mandatory: true,
      field_metadata: { description: 'Internal entry title' },
    },
    {
      display_name: 'Eyebrow Label',
      uid: 'eyebrow_label',
      data_type: 'text',
      mandatory: false,
    },
    {
      display_name: 'Section Title',
      uid: 'section_title',
      data_type: 'text',
      mandatory: false,
    },
    {
      display_name: 'Section Description',
      uid: 'section_description',
      data_type: 'text',
      mandatory: false,
      field_metadata: { multiline: true },
    },
    {
      display_name: 'Background Style',
      uid: 'background_style',
      data_type: 'text',
      display_type: 'dropdown',
      enum: { advanced: false, choices: [{ value: 'white' }, { value: 'gray' }, { value: 'dark' }] },
      mandatory: true,
      field_metadata: { default_value: 'white' },
    },
    {
      display_name: 'Panel Count',
      uid: 'panel_count',
      data_type: 'text',
      display_type: 'dropdown',
      enum: { advanced: false, choices: [{ value: '2' }, { value: '3' }, { value: '4' }] },
      mandatory: true,
      field_metadata: { default_value: '3', description: 'Number of panels per row on desktop' },
    },
    {
      display_name: 'Panel Aspect Ratio',
      uid: 'panel_aspect_ratio',
      data_type: 'text',
      display_type: 'dropdown',
      enum: {
        advanced: false,
        choices: [
          { value: 'square' },
          { value: 'portrait_4_5' },
          { value: 'portrait_3_4' },
          { value: 'landscape_4_3' },
        ],
      },
      mandatory: true,
      field_metadata: { default_value: 'portrait_4_5' },
    },
    {
      display_name: 'Gap Size',
      uid: 'gap_size',
      data_type: 'text',
      display_type: 'dropdown',
      enum: { advanced: false, choices: [{ value: 'tight' }, { value: 'normal' }, { value: 'loose' }] },
      mandatory: false,
      field_metadata: { default_value: 'normal' },
    },
    {
      display_name: 'Corner Radius',
      uid: 'corner_radius',
      data_type: 'text',
      display_type: 'dropdown',
      enum: {
        advanced: false,
        choices: [{ value: 'none' }, { value: 'small' }, { value: 'medium' }, { value: 'large' }],
      },
      mandatory: false,
      field_metadata: { default_value: 'medium' },
    },
    {
      display_name: 'Panel Padding',
      uid: 'panel_padding',
      data_type: 'text',
      display_type: 'dropdown',
      enum: {
        advanced: false,
        choices: [
          { value: 'none' },
          { value: 'xs' },
          { value: 'sm' },
          { value: 'md' },
          { value: 'lg' },
          { value: 'xl' },
        ],
      },
      mandatory: false,
      field_metadata: { default_value: 'md', description: 'Inner padding around overlay content' },
    },
    {
      display_name: 'Panels',
      uid: 'panels',
      data_type: 'group',
      multiple: true,
      mandatory: true,
      max_instance: 4,
      field_metadata: {
        description: 'Add 2-4 feature panels. Each panel uses the same component, customized via per-panel fields.',
      },
      schema: [
        {
          display_name: 'Background Image',
          uid: 'background_image',
          data_type: 'file',
          mandatory: true,
        },
        {
          display_name: 'Eyebrow',
          uid: 'eyebrow',
          data_type: 'text',
          mandatory: false,
          field_metadata: { description: 'Small lead-in text above the headline (e.g., "INTRODUCING")' },
        },
        {
          display_name: 'Logo Image',
          uid: 'logo_image',
          data_type: 'file',
          mandatory: false,
          field_metadata: { description: 'Optional inline logo overlay (e.g., a brand collab logo)' },
        },
        RTE_FIELD(
          'headline',
          'Headline',
          'Main panel headline. Supports italic, bold, line breaks, inline images, and links. Renders in brand typography.',
        ),
        RTE_FIELD(
          'description',
          'Description',
          'Supporting copy. Same RTE governance as headline.',
        ),
        {
          display_name: 'Text Position',
          uid: 'text_position',
          data_type: 'text',
          display_type: 'dropdown',
          enum: {
            advanced: false,
            choices: [
              { value: 'top_left' },
              { value: 'top_center' },
              { value: 'top_right' },
              { value: 'middle_left' },
              { value: 'center' },
              { value: 'middle_right' },
              { value: 'bottom_left' },
              { value: 'bottom_center' },
              { value: 'bottom_right' },
            ],
          },
          mandatory: false,
          field_metadata: { default_value: 'top_center' },
        },
        {
          display_name: 'Text Color',
          uid: 'text_color',
          data_type: 'text',
          display_type: 'dropdown',
          enum: { advanced: false, choices: [{ value: 'light' }, { value: 'dark' }] },
          mandatory: false,
          field_metadata: { default_value: 'dark' },
        },
        {
          display_name: 'Image Overlay',
          uid: 'image_overlay',
          data_type: 'text',
          display_type: 'dropdown',
          enum: {
            advanced: false,
            choices: [
              { value: 'none' },
              { value: 'darken_subtle' },
              { value: 'darken_medium' },
              { value: 'darken_strong' },
              { value: 'lighten_subtle' },
              { value: 'lighten_medium' },
              { value: 'lighten_strong' },
            ],
          },
          mandatory: false,
          field_metadata: {
            default_value: 'none',
            description: 'Tints the entire panel image. darken_* / lighten_* shift the image so clean text reads better.',
          },
        },
        {
          display_name: 'Show Scrim',
          uid: 'show_scrim',
          data_type: 'boolean',
          mandatory: false,
          field_metadata: {
            default_value: false,
            description: 'Optional gradient scrim behind the text for legibility on busy images',
          },
        },
        {
          display_name: 'Padding (override)',
          uid: 'padding',
          data_type: 'text',
          display_type: 'dropdown',
          enum: {
            advanced: false,
            choices: [
              { value: 'default' },
              { value: 'none' },
              { value: 'xs' },
              { value: 'sm' },
              { value: 'md' },
              { value: 'lg' },
              { value: 'xl' },
            ],
          },
          mandatory: false,
          field_metadata: {
            default_value: 'default',
            description: 'Per-panel padding override. "default" inherits the block-level Panel Padding.',
          },
        },
        {
          display_name: 'Panel Link URL',
          uid: 'link_url',
          data_type: 'text',
          mandatory: false,
          field_metadata: { description: 'If set, the entire panel image becomes clickable to this URL' },
        },
        {
          display_name: 'CTAs',
          uid: 'ctas',
          data_type: 'group',
          multiple: true,
          mandatory: false,
          max_instance: 2,
          field_metadata: { description: 'Up to 2 CTAs rendered as buttons at the bottom of the panel' },
          schema: [
            { display_name: 'Label', uid: 'label', data_type: 'text', mandatory: true },
            { display_name: 'URL', uid: 'url', data_type: 'text', mandatory: true },
            {
              display_name: 'Style',
              uid: 'style',
              data_type: 'text',
              display_type: 'dropdown',
              enum: {
                advanced: false,
                choices: [{ value: 'primary' }, { value: 'outline' }, { value: 'underline' }],
              },
              mandatory: false,
              field_metadata: { default_value: 'primary' },
            },
          ],
        },
        {
          display_name: 'Custom HTML Override',
          uid: 'custom_html_override',
          data_type: 'text',
          mandatory: false,
          field_metadata: {
            multiline: true,
            description:
              'POWER-USER ESCAPE: When non-empty, this HTML replaces the rendered overlay. Use only for layouts the structured fields cannot express. HTML is sanitized and rendered inside the panel overlay container.',
          },
        },
      ],
    },
  ],
};

const featureBannerRowPageSchema = {
  title: 'Feature Banner Row Page',
  uid: 'feature_banner_row_page',
  description: 'Demo page that references one or more feature_banner_row_block entries.',
  schema: [
    { display_name: 'Title', uid: 'title', data_type: 'text', mandatory: true, unique: true },
    {
      display_name: 'URL',
      uid: 'url',
      data_type: 'text',
      mandatory: true,
      unique: true,
    },
    { display_name: 'Heading', uid: 'heading', data_type: 'text', mandatory: true },
    {
      display_name: 'Subheading',
      uid: 'subheading',
      data_type: 'text',
      mandatory: false,
      field_metadata: { multiline: true },
    },
    {
      display_name: 'Banners',
      uid: 'banners',
      data_type: 'reference',
      reference_to: ['feature_banner_row_block'],
      multiple: true,
      mandatory: false,
      field_metadata: { ref_multiple: true, ref_multiple_content_types: true },
    },
  ],
};

async function createContentType(stack, schema) {
  console.log(`\n  Creating: ${schema.title}...`);
  try {
    await stack.contentType(schema.uid).fetch();
    console.log(`  -> Already exists (skipping)`);
    return { skipped: true };
  } catch (_) {
    /* doesn't exist */
  }
  try {
    await stack.contentType().create({
      content_type: {
        title: schema.title,
        uid: schema.uid,
        description: schema.description,
        schema: schema.schema,
      },
    });
    console.log(`  -> Created`);
    return { created: true };
  } catch (error) {
    console.error(`  -> FAILED: ${error.message}`);
    if (error.errors) console.error('     Details:', JSON.stringify(error.errors, null, 2));
    return { failed: true };
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Feature Banner Row Schema Setup');
  console.log('='.repeat(60));

  if (!stackConfig.api_key || !stackConfig.management_token) {
    console.error('\nMissing credentials in scripts/.env');
    process.exit(1);
  }

  const client = contentstack.client();
  const stack = client.stack({
    api_key: stackConfig.api_key,
    management_token: stackConfig.management_token,
  });

  console.log('\n--- Step 1: Block Content Type ---');
  await createContentType(stack, featureBannerRowBlockSchema);

  console.log('\n--- Step 2: Page Content Type ---');
  await createContentType(stack, featureBannerRowPageSchema);

  console.log('\nDone. Next: npm run seed-feature-banner-row-data');
}

if (require.main === module) {
  main().catch((err) => {
    console.error('\nScript failed:', err.message);
    if (err.errors) console.error('Details:', JSON.stringify(err.errors, null, 2));
    process.exit(1);
  });
}
