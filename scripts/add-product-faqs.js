#!/usr/bin/env node

/**
 * Add a repeatable `faqs` group field to the `product` content type for AEO
 * (Answer Engine Optimization). Each FAQ renders on the product page AND powers
 * FAQPage JSON-LD, which AI answer engines and search rich results consume.
 *
 * Idempotent: skips if the `faqs` field already exists.
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

const faqsField = {
  display_name: 'FAQs',
  uid: 'faqs',
  data_type: 'group',
  multiple: true,
  mandatory: false,
  field_metadata: {
    description:
      'Frequently asked questions. Rendered on the product page and exposed as FAQPage structured data for AI answer engines and search rich results.',
  },
  schema: [
    {
      display_name: 'Question',
      uid: 'question',
      data_type: 'text',
      mandatory: true,
      field_metadata: { description: 'The question, phrased as a user would ask it.' },
    },
    {
      display_name: 'Answer',
      uid: 'answer',
      data_type: 'text',
      mandatory: true,
      field_metadata: { description: 'A clear, self-contained answer.', multiline: true },
    },
  ],
};

async function main() {
  console.log('🚀 Adding "faqs" field to product content type...');
  try {
    const contentType = await stack.contentType('product').fetch();
    if (contentType.schema.find((f) => f.uid === 'faqs')) {
      console.log('⚠️  "product" already has a "faqs" field — skipping.');
      return;
    }
    contentType.schema.push(faqsField);
    await contentType.update();
    console.log('✅ Added "faqs" field to product. Next: run "npm run backfill-seo-content".');
  } catch (error) {
    console.error('\n❌ Failed:', error.message);
    if (error.errors) console.error(JSON.stringify(error.errors, null, 2));
    process.exit(1);
  }
}

if (require.main === module) main();

module.exports = { faqsField };
