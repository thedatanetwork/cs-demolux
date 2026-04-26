#!/usr/bin/env node

/**
 * Create Product Tile Banner Schemas
 *
 * Content type: product_tile_banner_block
 *   A modular block that renders a grid of customizable product tiles.
 *   Each tile has an image, caption label, link, and a price/discount overlay
 *   composed of (eyebrow + prefix + value + suffix + sublabel).
 *
 * Content type: product_tile_banner_page
 *   A demo page that references one or more product_tile_banner_block entries
 *   via a tile_banners multi-reference field. Mirrors the dynamic_feeds_page
 *   pattern.
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'dev',
  region: process.env.CONTENTSTACK_REGION || 'US',
};

// ============================================================================
// CONTENT TYPE: product_tile_banner_block
// ============================================================================

const productTileBannerBlockSchema = {
  title: 'Product Tile Banner Block',
  uid: 'product_tile_banner_block',
  description:
    'Banner with a grid of customizable product tiles. Each tile pairs an image with a price/discount badge (eyebrow + prefix + value + suffix + sublabel) and a caption label below.',
  schema: [
    {
      display_name: 'Title',
      uid: 'title',
      data_type: 'text',
      mandatory: true,
      unique: false,
      field_metadata: { description: 'Internal entry title for CMS organization' },
    },
    {
      display_name: 'Eyebrow Label',
      uid: 'eyebrow_label',
      data_type: 'text',
      mandatory: false,
      field_metadata: { description: 'Small lead-in label above the section title (e.g., "Weekly Deals")' },
    },
    {
      display_name: 'Section Title',
      uid: 'section_title',
      data_type: 'text',
      mandatory: false,
      field_metadata: { description: 'Heading displayed above the tile grid' },
    },
    {
      display_name: 'Section Description',
      uid: 'section_description',
      data_type: 'text',
      mandatory: false,
      field_metadata: { description: 'Supporting copy below the heading', multiline: true },
    },
    {
      display_name: 'Columns',
      uid: 'columns',
      data_type: 'text',
      display_type: 'dropdown',
      enum: {
        advanced: false,
        choices: [{ value: '4' }, { value: '5' }, { value: '6' }],
      },
      mandatory: true,
      field_metadata: { default_value: '6', description: 'Tile grid density on desktop' },
    },
    {
      display_name: 'Background Style',
      uid: 'background_style',
      data_type: 'text',
      display_type: 'dropdown',
      enum: {
        advanced: false,
        choices: [{ value: 'white' }, { value: 'gray' }, { value: 'dark' }],
      },
      mandatory: true,
      field_metadata: { default_value: 'white' },
    },
    {
      display_name: 'Badge Color',
      uid: 'badge_color',
      data_type: 'text',
      display_type: 'dropdown',
      enum: {
        advanced: false,
        choices: [
          { value: 'teal' },
          { value: 'gold' },
          { value: 'red' },
          { value: 'navy' },
          { value: 'black' },
        ],
      },
      mandatory: true,
      field_metadata: { default_value: 'teal', description: 'Color of the price/discount badge overlay' },
    },
    {
      display_name: 'Tiles',
      uid: 'tiles',
      data_type: 'group',
      multiple: true,
      mandatory: true,
      max_instance: 30,
      field_metadata: { description: 'Add up to 30 product tiles. Each tile is fully customizable text-wise.' },
      schema: [
        {
          display_name: 'Image',
          uid: 'image',
          data_type: 'file',
          mandatory: true,
          field_metadata: { description: 'Tile image (square works best)' },
        },
        {
          display_name: 'Label',
          uid: 'label',
          data_type: 'text',
          mandatory: false,
          field_metadata: { description: 'Caption under the tile (e.g., "Women\'s Tees")' },
        },
        {
          display_name: 'Link URL',
          uid: 'link_url',
          data_type: 'text',
          mandatory: false,
          field_metadata: { description: 'Destination URL when the tile is clicked' },
        },
        {
          display_name: 'Eyebrow',
          uid: 'eyebrow',
          data_type: 'text',
          mandatory: false,
          field_metadata: { description: 'Small lead-in text on the badge (e.g., "from", "up to")' },
        },
        {
          display_name: 'Prefix',
          uid: 'prefix',
          data_type: 'text',
          mandatory: false,
          field_metadata: { description: 'Currency symbol or prefix (e.g., "$")' },
        },
        {
          display_name: 'Value',
          uid: 'value',
          data_type: 'text',
          mandatory: false,
          field_metadata: { description: 'Main price or discount number (e.g., "12", "60")' },
        },
        {
          display_name: 'Suffix',
          uid: 'suffix',
          data_type: 'text',
          mandatory: false,
          field_metadata: { description: 'Suffix text (e.g., "99" for cents, "%" for percent)' },
        },
        {
          display_name: 'Sublabel',
          uid: 'sublabel',
          data_type: 'text',
          mandatory: false,
          field_metadata: { description: 'Text below the suffix (e.g., "off")' },
        },
      ],
    },
  ],
};

// ============================================================================
// CONTENT TYPE: product_tile_banner_page
// ============================================================================

const productTileBannerPageSchema = {
  title: 'Product Tile Banner Page',
  uid: 'product_tile_banner_page',
  description:
    'Demo page composed of one or more product_tile_banner_block entries via a multi-reference field. Mirrors the dynamic_feeds_page composition pattern.',
  schema: [
    {
      display_name: 'Title',
      uid: 'title',
      data_type: 'text',
      mandatory: true,
      unique: true,
      field_metadata: { description: 'Internal entry title' },
    },
    {
      display_name: 'URL',
      uid: 'url',
      data_type: 'text',
      mandatory: true,
      unique: true,
      field_metadata: { description: 'Page URL path (e.g., /product-tile-banner)' },
    },
    {
      display_name: 'Heading',
      uid: 'heading',
      data_type: 'text',
      mandatory: true,
      field_metadata: { description: 'Page heading displayed in the hero area' },
    },
    {
      display_name: 'Subheading',
      uid: 'subheading',
      data_type: 'text',
      mandatory: false,
      field_metadata: { description: 'Supporting copy below the page heading', multiline: true },
    },
    {
      display_name: 'Tile Banners',
      uid: 'tile_banners',
      data_type: 'reference',
      reference_to: ['product_tile_banner_block'],
      multiple: true,
      mandatory: false,
      field_metadata: {
        ref_multiple: true,
        ref_multiple_content_types: true,
        description: 'Ordered list of product_tile_banner_block entries to render on the page',
      },
    },
    {
      display_name: 'SEO Meta Title',
      uid: 'seo_meta_title',
      data_type: 'text',
      mandatory: false,
    },
    {
      display_name: 'SEO Meta Description',
      uid: 'seo_meta_description',
      data_type: 'text',
      mandatory: false,
      field_metadata: { multiline: true },
    },
  ],
};

// ============================================================================
// SCRIPT EXECUTION
// ============================================================================

async function createContentType(stack, schema) {
  try {
    console.log(`\n  Creating content type: ${schema.title}...`);
    try {
      await stack.contentType(schema.uid).fetch();
      console.log(`  -> Already exists (skipping)`);
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
    console.log(`  -> Created successfully`);
    return { success: true, skipped: false };
  } catch (error) {
    console.error(`  -> FAILED: ${error.message}`);
    if (error.errors) console.error('     Details:', JSON.stringify(error.errors, null, 2));
    return { success: false, error: error.message };
  }
}

async function main() {
  try {
    console.log('='.repeat(60));
    console.log('Product Tile Banner Schema Setup');
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

    const results = { created: [], skipped: [], failed: [] };

    console.log('\n--- Step 1: Block Content Type (product_tile_banner_block) ---');
    const blockResult = await createContentType(stack, productTileBannerBlockSchema);
    if (blockResult.success && !blockResult.skipped) results.created.push(productTileBannerBlockSchema.title);
    else if (blockResult.skipped) results.skipped.push(productTileBannerBlockSchema.title);
    else results.failed.push(productTileBannerBlockSchema.title);

    console.log('\n--- Step 2: Page Content Type (product_tile_banner_page) ---');
    const pageResult = await createContentType(stack, productTileBannerPageSchema);
    if (pageResult.success && !pageResult.skipped) results.created.push(productTileBannerPageSchema.title);
    else if (pageResult.skipped) results.skipped.push(productTileBannerPageSchema.title);
    else results.failed.push(productTileBannerPageSchema.title);

    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    console.log(`Created: ${results.created.length}`);
    results.created.forEach((t) => console.log(`  + ${t}`));
    console.log(`Skipped: ${results.skipped.length}`);
    results.skipped.forEach((t) => console.log(`  ~ ${t}`));
    if (results.failed.length > 0) {
      console.log(`Failed: ${results.failed.length}`);
      results.failed.forEach((t) => console.log(`  ! ${t}`));
    }

    console.log('\nNext: run `npm run seed-product-tile-banner-data` to populate a sample entry and demo page.');
  } catch (error) {
    console.error('\nScript failed:', error.message);
    if (error.errors) console.error('Details:', JSON.stringify(error.errors, null, 2));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
