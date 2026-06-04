#!/usr/bin/env node

/**
 * Add a shared `seo` group field to the `product` and `blog_post` content types.
 *
 * This is the real-world Contentstack SEO pattern: editors control title/description/
 * social image/canonical/keywords per entry. The Next.js app reads these via the `seo`
 * field and falls back to existing fields when empty. Server-rendered metadata + JSON-LD
 * built from these values is also what the Lytics content crawler ingests.
 *
 * Idempotent: skips a content type that already has the `seo` field.
 */

const contentstack = require('@contentstack/management');
require('dotenv').config();

const stackConfig = {
  api_key: process.env.CONTENTSTACK_API_KEY,
  management_token: process.env.CONTENTSTACK_MANAGEMENT_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'dev',
  region: process.env.CONTENTSTACK_REGION || 'US',
};

if (!stackConfig.api_key || !stackConfig.management_token) {
  console.error('❌ Missing CONTENTSTACK_API_KEY / CONTENTSTACK_MANAGEMENT_TOKEN in scripts/.env');
  process.exit(1);
}

const client = contentstack.client();
const stack = client.stack({
  api_key: stackConfig.api_key,
  management_token: stackConfig.management_token,
});

const seoField = {
  display_name: 'SEO',
  uid: 'seo',
  data_type: 'group',
  multiple: false,
  mandatory: false,
  field_metadata: {
    description:
      'Search & answer-engine optimization. Controls the page <title>, meta description, social share image, canonical URL, and topic keywords. Leave blank to auto-derive from the entry.',
  },
  schema: [
    {
      display_name: 'Meta Title',
      uid: 'meta_title',
      data_type: 'text',
      mandatory: false,
      field_metadata: {
        description: 'Browser tab / search result title. ~50-60 chars. Defaults to the entry title.',
      },
    },
    {
      display_name: 'Meta Description',
      uid: 'meta_description',
      data_type: 'text',
      mandatory: false,
      field_metadata: {
        description: 'Search result + social snippet. ~150-160 chars.',
        multiline: true,
      },
    },
    {
      display_name: 'Social Image (OG Image)',
      uid: 'og_image',
      data_type: 'file',
      mandatory: false,
      field_metadata: {
        description: 'Image shown when the page is shared and used by the Lytics content crawler. Recommended 1200x630.',
      },
    },
    {
      display_name: 'Canonical URL',
      uid: 'canonical_url',
      data_type: 'text',
      mandatory: false,
      field_metadata: {
        description: 'Override the canonical URL. Leave blank to use the page URL.',
      },
    },
    {
      display_name: 'Keywords / Topics',
      uid: 'keywords',
      data_type: 'text',
      mandatory: false,
      field_metadata: {
        description: 'Comma-separated topics. Feeds <meta keywords> and Lytics content topics.',
        multiline: true,
      },
    },
  ],
};

async function addSeoToContentType(uid) {
  console.log(`\n📋 Fetching "${uid}" content type...`);
  const contentType = await stack.contentType(uid).fetch();

  if (contentType.schema.find((f) => f.uid === 'seo')) {
    console.log(`⚠️  "${uid}" already has an "seo" field — skipping.`);
    return;
  }

  contentType.schema.push(seoField);
  await contentType.update();
  console.log(`✅ Added "seo" group field to "${uid}".`);
}

async function main() {
  console.log('🚀 Adding SEO group field to product & blog_post content types...');
  try {
    await addSeoToContentType('product');
    await addSeoToContentType('blog_post');
    console.log('\n🎉 Done. Next: run "npm run add-product-faqs" then "npm run backfill-seo-content".');
  } catch (error) {
    console.error('\n❌ Failed:', error.message);
    if (error.errors) console.error(JSON.stringify(error.errors, null, 2));
    process.exit(1);
  }
}

if (require.main === module) main();

module.exports = { addSeoToContentType };
