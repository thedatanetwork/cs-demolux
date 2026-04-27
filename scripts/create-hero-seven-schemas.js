#!/usr/bin/env node

/**
 * Create Hero 7 Schemas
 *
 * Content type: hero_seven_block
 *   A "Hero 7" layout: 1 large hero tile on the leading side, 2-3 columns
 *   of smaller tiles filling the rest of the grid. The first tile in the
 *   `tiles` group is rendered as the hero — its overlay headline /
 *   subheadline / CTA fields are only shown for that first tile.
 *
 * Content type: hero_seven_page
 *   A demo page that references one or more hero_seven_block entries.
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
};

const heroSevenBlockSchema = {
  title: 'Hero 7 Block',
  uid: 'hero_seven_block',
  description:
    'Banner with one large hero tile plus a grid of smaller tiles. First tile in the list renders as the hero with overlay headline + subheadline + CTA. Remaining tiles fill the secondary grid.',
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
      field_metadata: { description: 'Small lead-in label above the section title' },
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
      display_name: 'Right Columns',
      uid: 'right_columns',
      data_type: 'text',
      display_type: 'dropdown',
      enum: { advanced: false, choices: [{ value: '2' }, { value: '3' }] },
      mandatory: true,
      field_metadata: {
        default_value: '3',
        description: 'Number of columns of smaller tiles next to the hero (3 = "Hero 7" layout)',
      },
    },
    {
      display_name: 'Right Rows',
      uid: 'right_rows',
      data_type: 'text',
      display_type: 'dropdown',
      enum: { advanced: false, choices: [{ value: '1' }, { value: '2' }] },
      mandatory: true,
      field_metadata: {
        default_value: '2',
        description: 'Number of rows of smaller tiles. Hero spans all rows.',
      },
    },
    {
      display_name: 'Hero Position',
      uid: 'hero_position',
      data_type: 'text',
      display_type: 'dropdown',
      enum: { advanced: false, choices: [{ value: 'left' }, { value: 'right' }] },
      mandatory: true,
      field_metadata: { default_value: 'left', description: 'Side of the grid where the hero tile sits' },
    },
    {
      display_name: 'Hero Overlay Position',
      uid: 'hero_overlay_position',
      data_type: 'text',
      display_type: 'dropdown',
      enum: {
        advanced: false,
        choices: [
          { value: 'top_left' },
          { value: 'top_right' },
          { value: 'bottom_left' },
          { value: 'bottom_right' },
          { value: 'center' },
        ],
      },
      mandatory: true,
      field_metadata: { default_value: 'top_left', description: 'Where the overlay text + CTA sit on the hero image' },
    },
    {
      display_name: 'Hero Overlay Text Color',
      uid: 'hero_overlay_text_color',
      data_type: 'text',
      display_type: 'dropdown',
      enum: { advanced: false, choices: [{ value: 'light' }, { value: 'dark' }] },
      mandatory: true,
      field_metadata: { default_value: 'light', description: 'Use light text for dark hero images, dark for light images' },
    },
    {
      display_name: 'Show Hero Scrim',
      uid: 'show_hero_scrim',
      data_type: 'boolean',
      mandatory: false,
      field_metadata: {
        default_value: true,
        description: 'When true, adds a subtle gradient backdrop behind the overlay text for legibility',
      },
    },
    {
      display_name: 'Show Tile Labels',
      uid: 'show_tile_labels',
      data_type: 'boolean',
      mandatory: false,
      field_metadata: {
        default_value: true,
        description: 'Toggle the captions under the smaller secondary tiles',
      },
    },
    {
      display_name: 'Tile Corner Radius',
      uid: 'tile_corner_radius',
      data_type: 'text',
      display_type: 'dropdown',
      enum: {
        advanced: false,
        choices: [{ value: 'none' }, { value: 'small' }, { value: 'medium' }, { value: 'large' }],
      },
      mandatory: false,
      field_metadata: { default_value: 'medium', description: 'Roundness of all tile corners' },
    },
    {
      display_name: 'Gap Size',
      uid: 'gap_size',
      data_type: 'text',
      display_type: 'dropdown',
      enum: { advanced: false, choices: [{ value: 'tight' }, { value: 'normal' }, { value: 'loose' }] },
      mandatory: false,
      field_metadata: { default_value: 'normal', description: 'Spacing between tiles' },
    },
    {
      display_name: 'Tiles',
      uid: 'tiles',
      data_type: 'group',
      multiple: true,
      mandatory: true,
      max_instance: 10,
      field_metadata: {
        description: 'First tile is the hero (overlay fields apply); remaining tiles fill the secondary grid.',
      },
      schema: [
        {
          display_name: 'Image',
          uid: 'image',
          data_type: 'file',
          mandatory: true,
        },
        {
          display_name: 'Label',
          uid: 'label',
          data_type: 'text',
          mandatory: false,
          field_metadata: { description: 'Caption under the tile (used on secondary tiles, not the hero)' },
        },
        {
          display_name: 'Link URL',
          uid: 'link_url',
          data_type: 'text',
          mandatory: false,
        },
        {
          display_name: 'Overlay Headline',
          uid: 'overlay_headline',
          data_type: 'text',
          mandatory: false,
          field_metadata: { description: 'Big headline overlaid on the hero image (only used for the first tile)' },
        },
        {
          display_name: 'Overlay Subheadline',
          uid: 'overlay_subheadline',
          data_type: 'text',
          mandatory: false,
          field_metadata: { description: 'Supporting text below the headline (only used for the first tile)' },
        },
        {
          display_name: 'Overlay CTA Label',
          uid: 'overlay_cta_label',
          data_type: 'text',
          mandatory: false,
          field_metadata: { description: 'CTA button label on the hero (only used for the first tile)' },
        },
      ],
    },
  ],
};

const heroSevenPageSchema = {
  title: 'Hero 7 Page',
  uid: 'hero_seven_page',
  description: 'Demo page that references one or more hero_seven_block entries.',
  schema: [
    { display_name: 'Title', uid: 'title', data_type: 'text', mandatory: true, unique: true },
    {
      display_name: 'URL',
      uid: 'url',
      data_type: 'text',
      mandatory: true,
      unique: true,
      field_metadata: { description: 'Page URL path (e.g., /hero-seven)' },
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
      display_name: 'Hero Banners',
      uid: 'hero_banners',
      data_type: 'reference',
      reference_to: ['hero_seven_block'],
      multiple: true,
      mandatory: false,
      field_metadata: {
        ref_multiple: true,
        ref_multiple_content_types: true,
        description: 'Ordered list of hero_seven_block entries to render on the page',
      },
    },
    { display_name: 'SEO Meta Title', uid: 'seo_meta_title', data_type: 'text', mandatory: false },
    {
      display_name: 'SEO Meta Description',
      uid: 'seo_meta_description',
      data_type: 'text',
      mandatory: false,
      field_metadata: { multiline: true },
    },
  ],
};

async function createContentType(stack, schema) {
  console.log(`\n  Creating content type: ${schema.title}...`);
  try {
    await stack.contentType(schema.uid).fetch();
    console.log(`  -> Already exists (skipping)`);
    return { success: true, skipped: true };
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
    console.log(`  -> Created successfully`);
    return { success: true, skipped: false };
  } catch (error) {
    console.error(`  -> FAILED: ${error.message}`);
    if (error.errors) console.error('     Details:', JSON.stringify(error.errors, null, 2));
    return { success: false };
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Hero 7 Schema Setup');
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
  await createContentType(stack, heroSevenBlockSchema);

  console.log('\n--- Step 2: Page Content Type ---');
  await createContentType(stack, heroSevenPageSchema);

  console.log('\nDone. Next: npm run seed-hero-seven-data');
}

if (require.main === module) {
  main().catch((err) => {
    console.error('\nScript failed:', err.message);
    if (err.errors) console.error('Details:', JSON.stringify(err.errors, null, 2));
    process.exit(1);
  });
}
