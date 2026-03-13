#!/usr/bin/env node

/**
 * Create Dropdown-Based Dynamic Feed Schemas
 *
 * Alternative approach to Ticket #1 and #2 using dropdown/select fields
 * instead of reference fields in the global field. This eliminates the
 * need for separate reference content types (product_categories, etc.)
 * by embedding the choices directly in the field schema.
 *
 * Tradeoffs vs reference approach:
 *   + Simpler — no separate content types to manage
 *   + Faster to set up — no entries to create/publish
 *   - Choices are hardcoded in schema (requires schema update to change)
 *   - No per-option metadata (descriptions, images, etc.)
 *   - Doesn't scale as well for large option sets
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'dev',
};

// ============================================================================
// DROPDOWN CHOICES — values match the product inventory identifiers
// ============================================================================

const categoryChoices = [
  { value: 'cat-wearable' },
  { value: 'cat-furniture' },
  { value: 'cat-smarthome' },
  { value: 'cat-audio' },
  { value: 'cat-wellness' },
];

const brandChoices = [
  { value: 'brand-aetherwear' },
  { value: 'brand-luxframe' },
  { value: 'brand-terraform' },
  { value: 'brand-novasonic' },
  { value: 'brand-cirrushome' },
  { value: 'brand-voltalife' },
  { value: 'brand-arclight' },
  { value: 'brand-zenithlabs' },
];

const tagChoices = [
  { value: 'tag-wireless' },
  { value: 'tag-bluetooth' },
  { value: 'tag-sustainable' },
  { value: 'tag-limited' },
  { value: 'tag-bestseller' },
  { value: 'tag-new' },
  { value: 'tag-premium' },
  { value: 'tag-handcrafted' },
  { value: 'tag-waterproof' },
  { value: 'tag-noisecancelling' },
  { value: 'tag-gesture' },
  { value: 'tag-ambient' },
  { value: 'tag-modular' },
  { value: 'tag-carbon' },
  { value: 'tag-titanium' },
  { value: 'tag-ai' },
  { value: 'tag-voice' },
  { value: 'tag-solar' },
  { value: 'tag-biometric' },
];

const techChoices = [
  { value: 'tech-ai' },
  { value: 'tech-iot' },
  { value: 'tech-arvr' },
  { value: 'tech-haptic' },
  { value: 'tech-biometric' },
  { value: 'tech-voice' },
  { value: 'tech-solar' },
  { value: 'tech-neural' },
];

const discountChoices = [
  { value: 'dt-seasonal' },
  { value: 'dt-clearance' },
  { value: 'dt-bundle' },
  { value: 'dt-member' },
  { value: 'dt-launch' },
  { value: 'dt-flash' },
];

// ============================================================================
// GLOBAL FIELD: merchandising_rule_group_dropdown
// Same logic as the reference-based version, but uses multi-select dropdowns
// ============================================================================

const ruleGroupDropdownSchema = {
  title: 'Merchandising Rule Group (Dropdown)',
  uid: 'merchandising_rule_group_dropdown',
  description:
    'Dropdown-based product filtering logic. Same AND/OR behavior as the reference version, but filter choices are embedded directly in the schema as select options.',
  schema: [
    {
      display_name: 'Discount Category Include',
      uid: 'discount_category_include',
      data_type: 'text',
      display_type: 'dropdown',
      enum: { advanced: false, choices: discountChoices },
      multiple: true,
      mandatory: false,
      field_metadata: { description: 'Include products with these discount types (OR logic)' },
    },
    {
      display_name: 'Discount Category Exclude',
      uid: 'discount_category_exclude',
      data_type: 'text',
      display_type: 'dropdown',
      enum: { advanced: false, choices: discountChoices },
      multiple: true,
      mandatory: false,
      field_metadata: { description: 'Exclude products with these discount types' },
    },
    {
      display_name: 'Include Categories',
      uid: 'include_categories',
      data_type: 'text',
      display_type: 'dropdown',
      enum: { advanced: false, choices: categoryChoices },
      multiple: true,
      mandatory: false,
      field_metadata: { description: 'Include products in these categories (OR within field, AND with other fields)' },
    },
    {
      display_name: 'Exclude Categories',
      uid: 'exclude_categories',
      data_type: 'text',
      display_type: 'dropdown',
      enum: { advanced: false, choices: categoryChoices },
      multiple: true,
      mandatory: false,
      field_metadata: { description: 'Exclude products in these categories' },
    },
    {
      display_name: 'Brand Include',
      uid: 'brand_include',
      data_type: 'text',
      display_type: 'dropdown',
      enum: { advanced: false, choices: brandChoices },
      multiple: true,
      mandatory: false,
      field_metadata: { description: 'Include products from these brands (OR within field, AND with other fields)' },
    },
    {
      display_name: 'Brand Exclude',
      uid: 'brand_exclude',
      data_type: 'text',
      display_type: 'dropdown',
      enum: { advanced: false, choices: brandChoices },
      multiple: true,
      mandatory: false,
      field_metadata: { description: 'Exclude products from these brands' },
    },
    {
      display_name: 'Include Tags',
      uid: 'include_tags',
      data_type: 'text',
      display_type: 'dropdown',
      enum: { advanced: false, choices: tagChoices },
      multiple: true,
      mandatory: false,
      field_metadata: { description: 'Include products with any of these tags (OR within field, AND with other fields)' },
    },
    {
      display_name: 'Exclude Tags',
      uid: 'exclude_tags',
      data_type: 'text',
      display_type: 'dropdown',
      enum: { advanced: false, choices: tagChoices },
      multiple: true,
      mandatory: false,
      field_metadata: { description: 'Exclude products with any of these tags' },
    },
    {
      display_name: 'Strain Include',
      uid: 'strain_include',
      data_type: 'text',
      display_type: 'dropdown',
      enum: { advanced: false, choices: techChoices },
      multiple: true,
      mandatory: false,
      field_metadata: { description: 'Include products of these technology types (OR within field)' },
    },
    {
      display_name: 'In Stock Only',
      uid: 'in_stock_only',
      data_type: 'boolean',
      mandatory: false,
      field_metadata: { default_value: true, description: 'Only show products currently in stock' },
    },
    {
      display_name: 'Global Visibility Fallback',
      uid: 'global_visibility_fallback',
      data_type: 'boolean',
      mandatory: false,
      field_metadata: { default_value: false, description: 'When true, block can render for users without a selected store' },
    },
    {
      display_name: 'Price Min',
      uid: 'price_min',
      data_type: 'number',
      mandatory: false,
      field_metadata: { description: 'Minimum price filter (inclusive)' },
    },
    {
      display_name: 'Price Max',
      uid: 'price_max',
      data_type: 'number',
      mandatory: false,
      field_metadata: { description: 'Maximum price filter (inclusive)' },
    },
  ],
};

// ============================================================================
// CONTENT TYPE: dynamic_product_feed_dropdown
// Same fields as dynamic_product_feed but embeds the dropdown global field
// ============================================================================

const feedDropdownSchema = {
  title: 'Dynamic Product Feed (Dropdown)',
  uid: 'dynamic_product_feed_dropdown',
  description:
    'Dynamic product shelf using dropdown-based merchandising rules. Same behavior as the reference version — simpler schema, less flexible options management.',
  schema: [
    { display_name: 'Title', uid: 'title', data_type: 'text', mandatory: true, unique: false },
    { display_name: 'Heading', uid: 'heading', data_type: 'text', mandatory: true },
    { display_name: 'Subheading', uid: 'subheading', data_type: 'text', mandatory: false },
    { display_name: 'Anchor ID', uid: 'anchor_id', data_type: 'text', mandatory: false },
    {
      display_name: 'Display Style', uid: 'display_style', data_type: 'text',
      display_type: 'dropdown',
      enum: { advanced: false, choices: [{ value: 'carousel' }, { value: 'grid' }] },
      mandatory: true,
      field_metadata: { default_value: 'carousel' },
    },
    { display_name: 'Max Products', uid: 'max_products', data_type: 'number', mandatory: true, field_metadata: { default_value: 15 } },
    { display_name: 'CTA Label', uid: 'cta_label', data_type: 'text', mandatory: false },
    { display_name: 'CTA Href', uid: 'cta_href', data_type: 'text', mandatory: false },
    { display_name: 'Visibility', uid: 'visibility', data_type: 'boolean', mandatory: true, field_metadata: { default_value: true } },
    {
      display_name: 'Sort Order', uid: 'sort_order', data_type: 'text',
      display_type: 'dropdown',
      enum: { advanced: false, choices: [{ value: 'most_popular' }, { value: 'new_arrivals' }, { value: 'price_asc' }, { value: 'price_desc' }, { value: 'staff_picks' }] },
      mandatory: false,
      field_metadata: { default_value: 'most_popular' },
    },
    { display_name: 'Badge Label', uid: 'badge_label', data_type: 'text', mandatory: false },
    { display_name: 'Publish At', uid: 'publish_at', data_type: 'isodate', mandatory: false },
    { display_name: 'Unpublish At', uid: 'unpublish_at', data_type: 'isodate', mandatory: false },
    {
      display_name: 'Rule Group', uid: 'rule_group',
      data_type: 'global_field', reference_to: 'merchandising_rule_group_dropdown',
      mandatory: true,
    },
    {
      display_name: 'Fallback Rule Group', uid: 'fallback_rule_group',
      data_type: 'global_field', reference_to: 'merchandising_rule_group_dropdown',
      mandatory: false,
    },
  ],
};

// ============================================================================
// CONTENT TYPE: dynamic_feeds_dropdown_page
// Page with component_list referencing the dropdown feed entries
// ============================================================================

const pageDropdownSchema = {
  title: 'Dynamic Feeds Page (Dropdown)',
  uid: 'dynamic_feeds_dropdown_page',
  description: 'Page using dropdown-based dynamic product feeds. Demonstrates the alternative approach with select fields instead of reference fields.',
  schema: [
    { display_name: 'Title', uid: 'title', data_type: 'text', mandatory: true, unique: true },
    { display_name: 'URL', uid: 'url', data_type: 'text', mandatory: true, unique: true },
    { display_name: 'Heading', uid: 'heading', data_type: 'text', mandatory: true },
    { display_name: 'Subheading', uid: 'subheading', data_type: 'text', mandatory: false },
    {
      display_name: 'Component List', uid: 'component_list',
      data_type: 'reference', reference_to: ['dynamic_product_feed_dropdown'],
      multiple: true, mandatory: false,
      field_metadata: { ref_multiple: true, ref_multiple_content_types: true, description: 'Ordered list of dropdown-based feed entries' },
    },
  ],
};

// ============================================================================
// SCRIPT EXECUTION
// ============================================================================

async function createGlobalField(stack, schema) {
  try {
    console.log(`\n  Creating global field: ${schema.title}...`);
    try {
      await stack.globalField(schema.uid).fetch();
      console.log(`  -> Already exists (skipping)`);
      return { success: true, skipped: true };
    } catch (_) {}

    await stack.globalField().create({
      global_field: {
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

async function createContentType(stack, schema) {
  try {
    console.log(`\n  Creating content type: ${schema.title}...`);
    try {
      await stack.contentType(schema.uid).fetch();
      console.log(`  -> Already exists (skipping)`);
      return { success: true, skipped: true };
    } catch (_) {}

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
  console.log('='.repeat(60));
  console.log('Dropdown-Based Dynamic Feed Schema Setup');
  console.log('Alternative to reference-based approach');
  console.log('='.repeat(60));

  if (!stackConfig.api_key || !stackConfig.management_token) {
    console.error('Missing credentials in scripts/.env');
    process.exit(1);
  }

  const client = contentstack.client();
  const stack = client.stack({
    api_key: stackConfig.api_key,
    management_token: stackConfig.management_token,
  });

  const results = { created: [], skipped: [], failed: [] };

  const track = (result, name) => {
    if (result.success && !result.skipped) results.created.push(name);
    else if (result.skipped) results.skipped.push(name);
    else results.failed.push(name);
  };

  console.log('\n--- Step 1: Global Field (merchandising_rule_group_dropdown) ---');
  track(await createGlobalField(stack, ruleGroupDropdownSchema), ruleGroupDropdownSchema.title);

  console.log('\n--- Step 2: Content Type (dynamic_product_feed_dropdown) ---');
  track(await createContentType(stack, feedDropdownSchema), feedDropdownSchema.title);

  console.log('\n--- Step 3: Content Type (dynamic_feeds_dropdown_page) ---');
  track(await createContentType(stack, pageDropdownSchema), pageDropdownSchema.title);

  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Created: ${results.created.length}`);
  results.created.forEach(t => console.log(`  + ${t}`));
  console.log(`Skipped: ${results.skipped.length}`);
  results.skipped.forEach(t => console.log(`  ~ ${t}`));
  if (results.failed.length) {
    console.log(`Failed: ${results.failed.length}`);
    results.failed.forEach(t => console.log(`  ! ${t}`));
  }
  console.log('\nNext: run `npm run seed-dropdown-feed-data` to populate sample feeds.');
}

if (require.main === module) {
  main().catch(e => { console.error(e.message); process.exit(1); });
}

module.exports = { main };
