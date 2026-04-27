#!/usr/bin/env node

/**
 * Create Flash Sale Banner Block schema in Contentstack.
 *
 * Content type: flash_sale_banner_block
 *   A horizontal promo banner with editor-controlled background, optional left
 *   icon and right product image (transparent PNG/SVG works best), an eyebrow
 *   tag (e.g., "Online Only | Ends 4/29"), a three-part composite headline
 *   where each part has its own weight and italic flag, repeatable discount
 *   callouts (eyebrow + value + unit + suffix), and a small disclaimer with
 *   optional inline link.
 *
 * Idempotent: skips if the content type already exists.
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
};

const flashSaleBannerBlockSchema = {
  title: 'Flash Sale Banner Block',
  uid: 'flash_sale_banner_block',
  description:
    'Horizontal promo banner. Editable: background color/image, left icon, right product image, eyebrow tag, three-part composite headline (each part has its own weight + italic), repeatable discount callouts, and a small disclaimer with optional inline link.',
  schema: [
    {
      display_name: 'Title',
      uid: 'title',
      data_type: 'text',
      mandatory: true,
      unique: false,
      field_metadata: { description: 'Internal entry title for CMS organization' },
    },

    // ----- Eyebrow tag (the orange flag in the corner) -----
    {
      display_name: 'Eyebrow Tag',
      uid: 'eyebrow_tag',
      data_type: 'text',
      mandatory: false,
      field_metadata: {
        description: 'Small flag in the top-left corner (e.g., "Online Only | Ends 4/29"). Leave blank to hide.',
      },
    },
    {
      display_name: 'Eyebrow Tag Color',
      uid: 'eyebrow_tag_color',
      data_type: 'text',
      display_type: 'dropdown',
      enum: {
        advanced: false,
        choices: [
          { value: 'orange' },
          { value: 'red' },
          { value: 'gold' },
          { value: 'navy' },
          { value: 'teal' },
        ],
      },
      mandatory: false,
      field_metadata: { default_value: 'orange', description: 'Color of the eyebrow tag flag' },
    },

    // ----- Composite headline: three parts, each with its own weight/style -----
    {
      display_name: 'Title Lead',
      uid: 'title_lead',
      data_type: 'text',
      mandatory: false,
      field_metadata: { description: 'First part of the composite headline (e.g., "Jewelry")' },
    },
    {
      display_name: 'Title Lead Weight',
      uid: 'title_lead_weight',
      data_type: 'text',
      display_type: 'dropdown',
      enum: { advanced: false, choices: [{ value: 'regular' }, { value: 'medium' }, { value: 'bold' }] },
      mandatory: false,
      field_metadata: { default_value: 'bold' },
    },
    {
      display_name: 'Title Lead Style',
      uid: 'title_lead_style',
      data_type: 'text',
      display_type: 'dropdown',
      enum: { advanced: false, choices: [{ value: 'normal' }, { value: 'italic' }] },
      mandatory: false,
      field_metadata: { default_value: 'normal' },
    },
    {
      display_name: 'Title Middle',
      uid: 'title_middle',
      data_type: 'text',
      mandatory: false,
      field_metadata: { description: 'Middle part of the composite headline (e.g., "Flash")' },
    },
    {
      display_name: 'Title Middle Weight',
      uid: 'title_middle_weight',
      data_type: 'text',
      display_type: 'dropdown',
      enum: { advanced: false, choices: [{ value: 'regular' }, { value: 'medium' }, { value: 'bold' }] },
      mandatory: false,
      field_metadata: { default_value: 'regular' },
    },
    {
      display_name: 'Title Middle Style',
      uid: 'title_middle_style',
      data_type: 'text',
      display_type: 'dropdown',
      enum: { advanced: false, choices: [{ value: 'normal' }, { value: 'italic' }] },
      mandatory: false,
      field_metadata: { default_value: 'italic' },
    },
    {
      display_name: 'Title Tail',
      uid: 'title_tail',
      data_type: 'text',
      mandatory: false,
      field_metadata: { description: 'Last part of the composite headline (e.g., "Sale")' },
    },
    {
      display_name: 'Title Tail Weight',
      uid: 'title_tail_weight',
      data_type: 'text',
      display_type: 'dropdown',
      enum: { advanced: false, choices: [{ value: 'regular' }, { value: 'medium' }, { value: 'bold' }] },
      mandatory: false,
      field_metadata: { default_value: 'bold' },
    },
    {
      display_name: 'Title Tail Style',
      uid: 'title_tail_style',
      data_type: 'text',
      display_type: 'dropdown',
      enum: { advanced: false, choices: [{ value: 'normal' }, { value: 'italic' }] },
      mandatory: false,
      field_metadata: { default_value: 'normal' },
    },

    // ----- Discount callouts: e.g. "up to 60% off" + "extra 40% off*" -----
    {
      display_name: 'Discount Callouts',
      uid: 'discount_callouts',
      data_type: 'group',
      multiple: true,
      mandatory: false,
      max_instance: 3,
      field_metadata: {
        description:
          'Up to 3 discount callouts shown side-by-side with a "+" between them (e.g., up to 60% OFF + extra 40% OFF*).',
      },
      schema: [
        {
          display_name: 'Eyebrow',
          uid: 'eyebrow',
          data_type: 'text',
          mandatory: false,
          field_metadata: { description: 'Small lead-in (e.g., "up to", "extra")' },
        },
        {
          display_name: 'Value',
          uid: 'value',
          data_type: 'text',
          mandatory: false,
          field_metadata: { description: 'Big discount number (e.g., "60", "40")' },
        },
        {
          display_name: 'Unit',
          uid: 'unit',
          data_type: 'text',
          mandatory: false,
          field_metadata: { description: 'Unit on the value (e.g., "%")' },
        },
        {
          display_name: 'Suffix',
          uid: 'suffix',
          data_type: 'text',
          mandatory: false,
          field_metadata: { description: 'Trailing text (e.g., "OFF", "OFF*")' },
        },
      ],
    },

    // ----- Disclaimer / details copy -----
    {
      display_name: 'Disclaimer',
      uid: 'disclaimer',
      data_type: 'text',
      mandatory: false,
      field_metadata: { description: 'Small text next to the title (e.g., "select styles with code")', multiline: true },
    },
    {
      display_name: 'Disclaimer Link Text',
      uid: 'disclaimer_link_text',
      data_type: 'text',
      mandatory: false,
      field_metadata: { description: 'Link label after the disclaimer (e.g., "*Details")' },
    },
    {
      display_name: 'Disclaimer Link URL',
      uid: 'disclaimer_link_url',
      data_type: 'text',
      mandatory: false,
      field_metadata: { description: 'Destination URL for the disclaimer link' },
    },

    // ----- Imagery -----
    {
      display_name: 'Left Icon',
      uid: 'left_icon',
      data_type: 'file',
      mandatory: false,
      field_metadata: { description: 'Optional icon to the left of the title (transparent PNG/SVG works best)' },
    },
    {
      display_name: 'Right Image',
      uid: 'right_image',
      data_type: 'file',
      mandatory: false,
      field_metadata: { description: 'Optional product image at the right end (transparent PNG works best)' },
    },

    // ----- Background -----
    {
      display_name: 'Background Color',
      uid: 'background_color',
      data_type: 'text',
      display_type: 'dropdown',
      enum: {
        advanced: false,
        choices: [
          { value: 'black' },
          { value: 'navy' },
          { value: 'red' },
          { value: 'orange' },
          { value: 'white' },
          { value: 'transparent' },
        ],
      },
      mandatory: false,
      field_metadata: { default_value: 'black', description: 'Solid color behind the banner' },
    },
    {
      display_name: 'Background Image',
      uid: 'background_image',
      data_type: 'file',
      mandatory: false,
      field_metadata: {
        description: 'Optional background image (sits above the color, behind text). Use a transparent PNG to layer over the color.',
      },
    },
    {
      display_name: 'Text Color',
      uid: 'text_color',
      data_type: 'text',
      display_type: 'dropdown',
      enum: { advanced: false, choices: [{ value: 'light' }, { value: 'dark' }] },
      mandatory: false,
      field_metadata: { default_value: 'light', description: 'Light = white text (dark bg); dark = near-black text (light bg)' },
    },

    // ----- Whole-banner CTA + height -----
    {
      display_name: 'CTA Link URL',
      uid: 'cta_link_url',
      data_type: 'text',
      mandatory: false,
      field_metadata: { description: 'Optional URL — if set, the entire banner becomes clickable' },
    },
    {
      display_name: 'Height',
      uid: 'height',
      data_type: 'text',
      display_type: 'dropdown',
      enum: { advanced: false, choices: [{ value: 'compact' }, { value: 'standard' }, { value: 'tall' }] },
      mandatory: false,
      field_metadata: { default_value: 'standard', description: 'Vertical padding inside the banner' },
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
  console.log('Flash Sale Banner Block Schema Setup');
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

  const result = await createContentType(stack, flashSaleBannerBlockSchema);

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
