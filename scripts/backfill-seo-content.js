#!/usr/bin/env node

/**
 * Backfill the new `seo` group (and product `faqs`) on existing entries with sensible,
 * on-brand values derived from each entry's content, then publish so the Delivery API
 * serves them.
 *
 * Safe + idempotent:
 *  - Only fills fields that are currently empty (never overwrites editor edits).
 *  - `og_image` is intentionally left for editors — the app already falls back to the
 *    entry's featured_image for OG/Twitter/JSON-LD, so no asset wiring is needed here.
 *  - Re-running only touches entries still missing values.
 *
 * Requires `npm run add-seo-fields` and `npm run add-product-faqs` to have run first.
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

/** Trim to ~maxLen chars at a word boundary. */
function truncate(text, maxLen = 158) {
  if (!text) return '';
  const clean = String(text).replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLen) return clean;
  const cut = clean.slice(0, maxLen);
  return cut.slice(0, cut.lastIndexOf(' ')).trim() + '…';
}

function categoryLabel(category) {
  if (category === 'wearable-tech') return 'wearable tech';
  if (category === 'technofurniture') return 'technofurniture';
  return 'luxury tech';
}

/** Generic but on-brand FAQs, lightly customized per product. */
function buildFaqs(product) {
  const name = product.title;
  const cat = categoryLabel(product.category);
  return [
    {
      question: `What makes the ${name} different from other ${cat}?`,
      answer: `The ${name} pairs premium materials with Demolux's signature intelligent design, delivering luxury craftsmanship and cutting-edge technology in a single piece.`,
    },
    {
      question: `What warranty comes with the ${name}?`,
      answer: `Every Demolux product, including the ${name}, includes a 2-year warranty with full coverage against manufacturing defects.`,
    },
    {
      question: `How long does shipping take and is it free?`,
      answer: `Orders over $500 ship free. Standard delivery typically arrives within 3–5 business days, with expedited options available at checkout.`,
    },
    {
      question: `What is the return policy for the ${name}?`,
      answer: `The ${name} is covered by our 30-day money-back guarantee. If it isn't right for you, return it within 30 days for a full refund.`,
    },
  ];
}

async function findAll(contentTypeUid) {
  const entries = [];
  let skip = 0;
  const limit = 100;
  // Paginate defensively in case the catalog grows.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const res = await stack
      .contentType(contentTypeUid)
      .entry()
      .query({ skip, limit, include_count: true })
      .find();
    entries.push(...(res.items || []));
    if (!res.items || res.items.length < limit) break;
    skip += limit;
  }
  return entries;
}

async function publish(contentTypeUid, uid) {
  try {
    const entry = await stack.contentType(contentTypeUid).entry(uid).fetch();
    await entry.publish({
      publishDetails: { environments: [stackConfig.environment], locales: ['en-us'] },
    });
  } catch (e) {
    const msg = (e.message || '').toLowerCase();
    if (!msg.includes('already published') && !msg.includes('already been published')) {
      console.warn(`   ⚠️  publish warning for ${uid}: ${e.message}`);
    }
  }
}

function hasSeo(entry) {
  return entry.seo && (entry.seo.meta_title || entry.seo.meta_description);
}

async function backfillProducts() {
  console.log('\n📦 Backfilling products...');
  const products = await findAll('product');
  let updated = 0;

  for (const item of products) {
    const entry = await stack.contentType('product').entry(item.uid).fetch();
    let changed = false;

    if (!hasSeo(entry)) {
      const keywords = [...(entry.product_tags || []), entry.category]
        .filter(Boolean)
        .join(', ');
      entry.seo = {
        meta_title: `${entry.title} | Demolux`,
        meta_description: truncate(entry.description || entry.detailed_description),
        canonical_url: '',
        keywords,
      };
      changed = true;
    }

    if (!entry.faqs || entry.faqs.length === 0) {
      entry.faqs = buildFaqs(entry);
      changed = true;
    }

    if (changed) {
      await entry.update();
      await publish('product', entry.uid);
      updated++;
      console.log(`   ✅ ${entry.title}`);
    } else {
      console.log(`   ⏭️  ${entry.title} (already has SEO + FAQs)`);
    }
  }
  console.log(`📦 Products: ${updated}/${products.length} updated.`);
}

async function backfillBlogPosts() {
  console.log('\n📝 Backfilling blog posts...');
  const posts = await findAll('blog_post');
  let updated = 0;

  for (const item of posts) {
    const entry = await stack.contentType('blog_post').entry(item.uid).fetch();
    if (hasSeo(entry)) {
      console.log(`   ⏭️  ${entry.title} (already has SEO)`);
      continue;
    }
    entry.seo = {
      meta_title: `${entry.title} | Demolux`,
      meta_description: truncate(entry.excerpt),
      canonical_url: '',
      keywords: (entry.post_tags || []).join(', '),
    };
    await entry.update();
    await publish('blog_post', entry.uid);
    updated++;
    console.log(`   ✅ ${entry.title}`);
  }
  console.log(`📝 Blog posts: ${updated}/${posts.length} updated.`);
}

async function main() {
  console.log('🚀 Backfilling SEO + FAQ content on existing entries...');
  try {
    await backfillProducts();
    await backfillBlogPosts();
    console.log('\n🎉 Backfill complete.');
  } catch (error) {
    console.error('\n❌ Failed:', error.message);
    if (error.errors) console.error(JSON.stringify(error.errors, null, 2));
    process.exit(1);
  }
}

if (require.main === module) main();
