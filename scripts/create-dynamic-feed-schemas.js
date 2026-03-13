#!/usr/bin/env node

/**
 * Create Dynamic Feed Schemas
 *
 * Ticket #1: Creates the merchandising_rule_group Global Field
 * Ticket #2: Creates the dynamic_product_feed Content Type
 *
 * Also creates the supporting reference content types that the
 * rule group references:
 *   - product_categories
 *   - product_brands
 *   - product_tags
 *   - technology_types (customer's product_strains equivalent)
 *   - discount_types
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
// REFERENCE CONTENT TYPES
// Simple lookup types that the rule group references
// ============================================================================

const referenceContentTypes = {
  product_categories: {
    title: 'Product Categories',
    uid: 'product_categories',
    description: 'Product categories for merchandising rule filters',
    schema: [
      { display_name: 'Title', uid: 'title', data_type: 'text', mandatory: true, unique: true },
      {
        display_name: 'Value',
        uid: 'value',
        data_type: 'text',
        mandatory: true,
        unique: true,
        field_metadata: { description: 'Internal identifier for product matching (e.g., cat-wearable)' },
      },
      { display_name: 'Description', uid: 'description', data_type: 'text', mandatory: false },
    ],
  },
  product_brands: {
    title: 'Product Brands',
    uid: 'product_brands',
    description: 'Product brands for merchandising rule filters',
    schema: [
      { display_name: 'Title', uid: 'title', data_type: 'text', mandatory: true, unique: true },
      {
        display_name: 'Value',
        uid: 'value',
        data_type: 'text',
        mandatory: true,
        unique: true,
        field_metadata: { description: 'Internal identifier for product matching (e.g., brand-aetherwear)' },
      },
      { display_name: 'Description', uid: 'description', data_type: 'text', mandatory: false },
    ],
  },
  product_tags: {
    title: 'Product Tags',
    uid: 'product_tags',
    description: 'Product tags for merchandising rule filters',
    schema: [
      { display_name: 'Title', uid: 'title', data_type: 'text', mandatory: true, unique: true },
      {
        display_name: 'Value',
        uid: 'value',
        data_type: 'text',
        mandatory: true,
        unique: true,
        field_metadata: { description: 'Internal identifier for product matching (e.g., tag-wireless)' },
      },
    ],
  },
  technology_types: {
    title: 'Technology Types',
    uid: 'technology_types',
    description: 'Technology paradigm types for merchandising rule filters (maps to product_strains in customer domain)',
    schema: [
      { display_name: 'Title', uid: 'title', data_type: 'text', mandatory: true, unique: true },
      {
        display_name: 'Value',
        uid: 'value',
        data_type: 'text',
        mandatory: true,
        unique: true,
        field_metadata: { description: 'Internal identifier for product matching (e.g., tech-ai)' },
      },
      { display_name: 'Description', uid: 'description', data_type: 'text', mandatory: false },
    ],
  },
  discount_types: {
    title: 'Discount Types',
    uid: 'discount_types',
    description: 'Discount/deal categories for merchandising rule filters',
    schema: [
      { display_name: 'Title', uid: 'title', data_type: 'text', mandatory: true, unique: true },
      {
        display_name: 'Value',
        uid: 'value',
        data_type: 'text',
        mandatory: true,
        unique: true,
        field_metadata: { description: 'Internal identifier for product matching (e.g., dt-seasonal)' },
      },
      { display_name: 'Description', uid: 'description', data_type: 'text', mandatory: false },
    ],
  },
};

// ============================================================================
// GLOBAL FIELD: merchandising_rule_group (Ticket #1)
// ============================================================================

const merchandisingRuleGroupSchema = {
  title: 'Merchandising Rule Group',
  uid: 'merchandising_rule_group',
  description:
    'Standardized product filtering logic. Separate fields use AND logic; multiple selections within one field use OR logic.',
  schema: [
    // Discount filters
    {
      display_name: 'Discount Category Include',
      uid: 'discount_category_include',
      data_type: 'reference',
      reference_to: ['discount_types'],
      multiple: true,
      mandatory: false,
      field_metadata: {
        ref_multiple: true,
        ref_multiple_content_types: true,
        description: 'Include products with these discount types (OR logic within field)',
      },
    },
    {
      display_name: 'Discount Category Exclude',
      uid: 'discount_category_exclude',
      data_type: 'reference',
      reference_to: ['discount_types'],
      multiple: true,
      mandatory: false,
      field_metadata: {
        ref_multiple: true,
        ref_multiple_content_types: true,
        description: 'Exclude products with these discount types',
      },
    },
    // Category filters
    {
      display_name: 'Include Categories',
      uid: 'include_categories',
      data_type: 'reference',
      reference_to: ['product_categories'],
      multiple: true,
      mandatory: false,
      field_metadata: {
        ref_multiple: true,
        ref_multiple_content_types: true,
        description: 'Include products in these categories (OR logic within field). AND with other filter fields.',
      },
    },
    {
      display_name: 'Exclude Categories',
      uid: 'exclude_categories',
      data_type: 'reference',
      reference_to: ['product_categories'],
      multiple: true,
      mandatory: false,
      field_metadata: {
        ref_multiple: true,
        ref_multiple_content_types: true,
        description: 'Exclude products in these categories',
      },
    },
    // Brand filters
    {
      display_name: 'Brand Include',
      uid: 'brand_include',
      data_type: 'reference',
      reference_to: ['product_brands'],
      multiple: true,
      mandatory: false,
      field_metadata: {
        ref_multiple: true,
        ref_multiple_content_types: true,
        description: 'Include products from these brands (OR logic within field). AND with other filter fields.',
      },
    },
    {
      display_name: 'Brand Exclude',
      uid: 'brand_exclude',
      data_type: 'reference',
      reference_to: ['product_brands'],
      multiple: true,
      mandatory: false,
      field_metadata: {
        ref_multiple: true,
        ref_multiple_content_types: true,
        description: 'Exclude products from these brands',
      },
    },
    // Tag filters
    {
      display_name: 'Include Tags',
      uid: 'include_tags',
      data_type: 'reference',
      reference_to: ['product_tags'],
      multiple: true,
      mandatory: false,
      field_metadata: {
        ref_multiple: true,
        ref_multiple_content_types: true,
        description: 'Include products with any of these tags (OR logic within field). AND with other filter fields.',
      },
    },
    {
      display_name: 'Exclude Tags',
      uid: 'exclude_tags',
      data_type: 'reference',
      reference_to: ['product_tags'],
      multiple: true,
      mandatory: false,
      field_metadata: {
        ref_multiple: true,
        ref_multiple_content_types: true,
        description: 'Exclude products with any of these tags',
      },
    },
    // Technology type / strain filter
    {
      display_name: 'Strain Include',
      uid: 'strain_include',
      data_type: 'reference',
      reference_to: ['technology_types'],
      multiple: true,
      mandatory: false,
      field_metadata: {
        ref_multiple: true,
        ref_multiple_content_types: true,
        description: 'Include products of these technology types (Demolux equivalent of strain type). OR logic within field.',
      },
    },
    // Availability
    {
      display_name: 'In Stock Only',
      uid: 'in_stock_only',
      data_type: 'boolean',
      mandatory: false,
      field_metadata: {
        default_value: true,
        description: 'Only show products currently in stock at the selected store',
      },
    },
    {
      display_name: 'Global Visibility Fallback',
      uid: 'global_visibility_fallback',
      data_type: 'boolean',
      mandatory: false,
      field_metadata: {
        default_value: false,
        description: 'When true, block can render for users without a store selected',
      },
    },
    // Price range
    {
      display_name: 'Price Min',
      uid: 'price_min',
      data_type: 'number',
      mandatory: false,
      field_metadata: {
        description: 'Minimum price filter (inclusive). Must be less than or equal to price_max.',
      },
    },
    {
      display_name: 'Price Max',
      uid: 'price_max',
      data_type: 'number',
      mandatory: false,
      field_metadata: {
        description: 'Maximum price filter (inclusive). Must be greater than or equal to price_min.',
      },
    },
  ],
};

// ============================================================================
// CONTENT TYPE: dynamic_product_feed (Ticket #2)
// ============================================================================

const dynamicProductFeedSchema = {
  title: 'Dynamic Product Feed',
  uid: 'dynamic_product_feed',
  description:
    'Dynamic product shelf that uses merchandising_rule_group for structured product selection. Supports carousel/grid display, scheduling, and fallback rules.',
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
      display_name: 'Heading',
      uid: 'heading',
      data_type: 'text',
      mandatory: true,
      field_metadata: { description: 'Section heading displayed on the page' },
    },
    {
      display_name: 'Subheading',
      uid: 'subheading',
      data_type: 'text',
      mandatory: false,
      field_metadata: { description: 'Supporting copy below the heading' },
    },
    {
      display_name: 'Anchor ID',
      uid: 'anchor_id',
      data_type: 'text',
      mandatory: false,
      field_metadata: {
        description: 'Slug-safe anchor for page targeting (e.g., new-arrivals). Lowercase, hyphens only.',
      },
    },
    {
      display_name: 'Display Style',
      uid: 'display_style',
      data_type: 'text',
      display_type: 'dropdown',
      enum: {
        advanced: false,
        choices: [{ value: 'carousel' }, { value: 'grid' }],
      },
      mandatory: true,
      field_metadata: { default_value: 'carousel' },
    },
    {
      display_name: 'Max Products',
      uid: 'max_products',
      data_type: 'number',
      mandatory: true,
      field_metadata: {
        description: 'Maximum number of products to display (1-30)',
        default_value: 15,
      },
    },
    {
      display_name: 'CTA Label',
      uid: 'cta_label',
      data_type: 'text',
      mandatory: false,
      field_metadata: { description: 'Button label (e.g., Shop All)' },
    },
    {
      display_name: 'CTA Href',
      uid: 'cta_href',
      data_type: 'text',
      mandatory: false,
      field_metadata: { description: 'CTA destination URL' },
    },
    {
      display_name: 'Visibility',
      uid: 'visibility',
      data_type: 'boolean',
      mandatory: true,
      field_metadata: {
        default_value: true,
        description: 'When false, block is suppressed with no fetch triggered',
      },
    },
    {
      display_name: 'Sort Order',
      uid: 'sort_order',
      data_type: 'text',
      display_type: 'dropdown',
      enum: {
        advanced: false,
        choices: [
          { value: 'most_popular' },
          { value: 'new_arrivals' },
          { value: 'price_asc' },
          { value: 'price_desc' },
          { value: 'staff_picks' },
        ],
      },
      mandatory: false,
      field_metadata: { default_value: 'most_popular' },
    },
    {
      display_name: 'Badge Label',
      uid: 'badge_label',
      data_type: 'text',
      mandatory: false,
      field_metadata: { description: 'Optional label on shelf header (e.g., New, Limited, Staff Pick)' },
    },
    {
      display_name: 'Publish At',
      uid: 'publish_at',
      data_type: 'isodate',
      mandatory: false,
      field_metadata: { description: 'Block goes live at this datetime. If empty, follows entry publish state.' },
    },
    {
      display_name: 'Unpublish At',
      uid: 'unpublish_at',
      data_type: 'isodate',
      mandatory: false,
      field_metadata: { description: 'Block suppresses automatically after this datetime.' },
    },
    // Rule group (embedded global field)
    {
      display_name: 'Rule Group',
      uid: 'rule_group',
      data_type: 'global_field',
      reference_to: 'merchandising_rule_group',
      mandatory: true,
      field_metadata: {
        description: 'Primary merchandising rules that drive product selection',
      },
    },
    // Fallback rule group (embedded global field)
    {
      display_name: 'Fallback Rule Group',
      uid: 'fallback_rule_group',
      data_type: 'global_field',
      reference_to: 'merchandising_rule_group',
      mandatory: false,
      field_metadata: {
        description: 'Fires if the primary rule group returns zero products',
      },
    },
  ],
};

// ============================================================================
// CONTENT TYPE: dynamic_feeds_page
// Page that uses component_list to reference dynamic_product_feed entries.
// Mirrors the customer's modular page pattern where editors compose pages
// by adding block references to a component_list array.
// ============================================================================

const dynamicFeedsPageSchema = {
  title: 'Dynamic Feeds Page',
  uid: 'dynamic_feeds_page',
  description:
    'Page composed via component_list — editors add, remove, and reorder dynamic_product_feed block references. Demonstrates the modular page composition pattern.',
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
      field_metadata: { description: 'Page URL path for routing and Visual Builder (e.g., /dynamic-feeds)' },
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
      field_metadata: { description: 'Supporting copy below the page heading' },
    },
    {
      display_name: 'Component List',
      uid: 'component_list',
      data_type: 'reference',
      reference_to: ['dynamic_product_feed'],
      multiple: true,
      mandatory: false,
      field_metadata: {
        ref_multiple: true,
        ref_multiple_content_types: true,
        description:
          'Ordered list of dynamic_product_feed entries. Editors add, remove, and reorder feed blocks here. Each entry drives an independent product shelf on the page.',
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

async function createGlobalField(stack, schema) {
  try {
    console.log(`\n  Creating global field: ${schema.title}...`);
    try {
      await stack.globalField(schema.uid).fetch();
      console.log(`  -> Already exists (skipping)`);
      return { success: true, skipped: true };
    } catch (_) {
      // Doesn't exist
    }

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

async function main() {
  try {
    console.log('='.repeat(60));
    console.log('Dynamic Feed Schema Setup');
    console.log('Ticket #1: merchandising_rule_group Global Field');
    console.log('Ticket #2: dynamic_product_feed Content Type');
    console.log('='.repeat(60));

    console.log(`\nAPI Key: ${stackConfig.api_key ? stackConfig.api_key.substring(0, 10) + '...' : 'MISSING'}`);
    console.log(`Management Token: ${stackConfig.management_token ? stackConfig.management_token.substring(0, 10) + '...' : 'MISSING'}`);

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

    // Step 1: Create reference content types
    console.log('\n--- Step 1: Reference Content Types ---');
    for (const [key, schema] of Object.entries(referenceContentTypes)) {
      const result = await createContentType(stack, schema);
      if (result.success && !result.skipped) results.created.push(schema.title);
      else if (result.skipped) results.skipped.push(schema.title);
      else results.failed.push(schema.title);
    }

    // Step 2: Create Global Field (must come after reference types exist)
    console.log('\n--- Step 2: Global Field (merchandising_rule_group) ---');
    const gfResult = await createGlobalField(stack, merchandisingRuleGroupSchema);
    if (gfResult.success && !gfResult.skipped) results.created.push('Global Field: ' + merchandisingRuleGroupSchema.title);
    else if (gfResult.skipped) results.skipped.push('Global Field: ' + merchandisingRuleGroupSchema.title);
    else results.failed.push('Global Field: ' + merchandisingRuleGroupSchema.title);

    // Step 3: Create dynamic_product_feed content type (must come after global field)
    console.log('\n--- Step 3: Content Type (dynamic_product_feed) ---');
    const ctResult = await createContentType(stack, dynamicProductFeedSchema);
    if (ctResult.success && !ctResult.skipped) results.created.push(dynamicProductFeedSchema.title);
    else if (ctResult.skipped) results.skipped.push(dynamicProductFeedSchema.title);
    else results.failed.push(dynamicProductFeedSchema.title);

    // Step 4: Create dynamic_feeds_page content type (must come after dynamic_product_feed)
    console.log('\n--- Step 4: Content Type (dynamic_feeds_page) ---');
    const pageResult = await createContentType(stack, dynamicFeedsPageSchema);
    if (pageResult.success && !pageResult.skipped) results.created.push(dynamicFeedsPageSchema.title);
    else if (pageResult.skipped) results.skipped.push(dynamicFeedsPageSchema.title);
    else results.failed.push(dynamicFeedsPageSchema.title);

    // Summary
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

    console.log('\nNext: run `npm run seed-dynamic-feed-data` to populate reference entries and sample feeds.');
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
