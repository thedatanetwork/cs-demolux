'use client';

import React, { useState } from 'react';
import { DynamicProductFeedBlock } from '@/components/blocks/DynamicProductFeedBlock';
import type { DynamicProductFeedConfig } from '@/lib/rule-engine';
import { productInventory, inventoryStats } from '@/data/product-inventory';
import {
  productCategories,
  productBrands,
  productTags,
  technologyTypes,
  discountTypes,
} from '@/data/reference-data';

// ============================================================================
// DEMO FEED CONFIGURATIONS
// Each one simulates a dynamic_product_feed entry in Contentstack
// with its own rule_group (and optional fallback_rule_group).
// ============================================================================

const demoFeeds: DynamicProductFeedConfig[] = [
  // ── Feed 1: New Arrivals (carousel) ────────────────────────────────────
  {
    heading: 'New Arrivals',
    subheading: 'The latest additions to our luxury tech collection',
    anchor_id: 'new-arrivals',
    display_style: 'carousel',
    max_products: 12,
    cta_label: 'View All New',
    cta_href: '/products',
    visibility: true,
    sort_order: 'new_arrivals',
    badge_label: 'Just Dropped',
    rule_group: {
      include_tags: ['tag-new'],
      in_stock_only: true,
      global_visibility_fallback: false,
    },
  },

  // ── Feed 2: Premium Wearables Under $1000 (grid) ──────────────────────
  {
    heading: 'Premium Wearables Under $1,000',
    subheading: 'High-end wearable technology at accessible price points',
    anchor_id: 'wearables-under-1000',
    display_style: 'grid',
    max_products: 8,
    cta_label: 'Shop All Wearables',
    cta_href: '/categories/wearable-tech',
    visibility: true,
    sort_order: 'most_popular',
    rule_group: {
      include_categories: ['cat-wearable'],
      in_stock_only: true,
      global_visibility_fallback: false,
      price_max: 1000,
    },
  },

  // ── Feed 3: Staff Picks from AetherWear (carousel) ────────────────────
  {
    heading: 'Staff Picks: AetherWear',
    subheading: 'Our team\'s favorite picks from the AetherWear collection',
    anchor_id: 'staff-picks-aetherwear',
    display_style: 'carousel',
    max_products: 10,
    visibility: true,
    sort_order: 'staff_picks',
    badge_label: 'Staff Picks',
    rule_group: {
      brand_include: ['brand-aetherwear'],
      in_stock_only: true,
      global_visibility_fallback: false,
    },
  },

  // ── Feed 4: Smart Home Essentials (grid) ──────────────────────────────
  {
    heading: 'Smart Home Essentials',
    subheading: 'Build your connected home with CirrusHome',
    anchor_id: 'smart-home-essentials',
    display_style: 'grid',
    max_products: 6,
    cta_label: 'Explore Smart Home',
    cta_href: '/products',
    visibility: true,
    sort_order: 'most_popular',
    rule_group: {
      include_categories: ['cat-smarthome'],
      brand_include: ['brand-cirrushome'],
      in_stock_only: true,
      global_visibility_fallback: false,
    },
  },

  // ── Feed 5: AI-Enhanced Products (carousel) ───────────────────────────
  {
    heading: 'AI-Enhanced Collection',
    subheading: 'Products powered by artificial intelligence across all categories',
    anchor_id: 'ai-enhanced',
    display_style: 'carousel',
    max_products: 15,
    visibility: true,
    sort_order: 'most_popular',
    badge_label: 'AI Powered',
    rule_group: {
      technology_type_include: ['tech-ai'],
      in_stock_only: true,
      global_visibility_fallback: false,
    },
  },

  // ── Feed 6: Luxury Technofurniture (grid) ─────────────────────────────
  {
    heading: 'Luxury Technofurniture',
    subheading: 'Premium smart furniture over $2,000',
    anchor_id: 'luxury-furniture',
    display_style: 'grid',
    max_products: 8,
    cta_label: 'Shop Furniture',
    cta_href: '/categories/technofurniture',
    visibility: true,
    sort_order: 'price_desc',
    badge_label: 'Premium',
    rule_group: {
      include_categories: ['cat-furniture'],
      in_stock_only: true,
      global_visibility_fallback: false,
      price_min: 2000,
    },
  },

  // ── Feed 7: Launch Specials (carousel) ────────────────────────────────
  {
    heading: 'Launch Specials',
    subheading: 'Special pricing on newly released products',
    anchor_id: 'launch-specials',
    display_style: 'carousel',
    max_products: 10,
    visibility: true,
    sort_order: 'new_arrivals',
    badge_label: 'Limited Time',
    rule_group: {
      discount_category_include: ['dt-launch'],
      in_stock_only: true,
      global_visibility_fallback: false,
    },
  },

  // ── Feed 8: Wellness + Audio Bundle Ideas (grid) ──────────────────────
  {
    heading: 'Wellness & Audio',
    subheading: 'Products that enhance your wellbeing through sound and technology',
    anchor_id: 'wellness-audio',
    display_style: 'grid',
    max_products: 8,
    visibility: true,
    sort_order: 'staff_picks',
    rule_group: {
      include_categories: ['cat-wellness', 'cat-audio'],
      in_stock_only: true,
      global_visibility_fallback: false,
      price_max: 1000,
    },
  },

  // ── Feed 9: HIDDEN BLOCK (visibility: false) ─────────────────────────
  // This demonstrates the visibility suppression — renders nothing
  {
    heading: 'This Should Not Appear',
    subheading: 'If you can see this, visibility suppression is broken',
    display_style: 'grid',
    max_products: 5,
    visibility: false,
    sort_order: 'most_popular',
    rule_group: {
      in_stock_only: true,
      global_visibility_fallback: false,
    },
  },

  // ── Feed 10: Fallback Demo ────────────────────────────────────────────
  // Primary rule group returns 0 results (impossible combo),
  // so fallback fires with bestsellers
  {
    heading: 'Curated For You',
    subheading: 'Personalized recommendations (fallback demo — primary returns empty, fallback fires)',
    anchor_id: 'curated-for-you',
    display_style: 'carousel',
    max_products: 8,
    visibility: true,
    sort_order: 'most_popular',
    badge_label: 'Recommended',
    rule_group: {
      // Impossible combo: wearables from TerraForm (TerraForm only makes furniture)
      include_categories: ['cat-wearable'],
      brand_include: ['brand-terraform'],
      in_stock_only: true,
      global_visibility_fallback: false,
    },
    fallback_rule_group: {
      // Fallback: top bestsellers across all categories
      include_tags: ['tag-bestseller'],
      in_stock_only: true,
      global_visibility_fallback: false,
    },
  },
];

// ============================================================================
// DEMO PAGE
// ============================================================================

export default function DynamicFeedsPage() {
  const [showRuleDetails, setShowRuleDetails] = useState(false);
  const [showImages, setShowImages] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="bg-gray-900 text-white">
        <div className="container-padding py-16 md:py-24">
          <div className="max-w-4xl">
            <div className="inline-flex items-center space-x-2 bg-gold-400/20 rounded-full px-4 py-1.5 mb-6">
              <div className="w-1.5 h-1.5 bg-gold-400 rounded-full"></div>
              <span className="text-xs font-semibold text-gold-400 uppercase tracking-wider">
                Dynamic Product Feeds Demo
              </span>
            </div>

            <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
                Merchandising
              </span>{' '}
              <span className="text-white">Rule Engine</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl">
              This page demonstrates how the <code className="text-gold-400 bg-white/10 px-2 py-0.5 rounded text-sm">merchandising_rule_group</code> Global
              Field and <code className="text-gold-400 bg-white/10 px-2 py-0.5 rounded text-sm">dynamic_product_feed</code> content
              type work together to drive structured, editor-controlled product merchandising.
            </p>

            {/* Inventory Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total Products" value={inventoryStats.totalProducts} />
              <StatCard label="In Stock" value={inventoryStats.inStock} />
              <StatCard label="Staff Picks" value={inventoryStats.staffPicks} />
              <StatCard label="With Discounts" value={inventoryStats.withDiscounts} />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowImages(!showImages)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  showImages ? 'bg-gold-400 text-gray-900 hover:bg-gold-500' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {showImages ? 'Images On' : 'Images Off'}
              </button>

              <button
                onClick={() => setShowRuleDetails(!showRuleDetails)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  showRuleDetails ? 'bg-white/20' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {showRuleDetails ? 'Hide' : 'Show'} Rule Details
              </button>

              <div className="px-5 py-2.5 bg-white/5 rounded-lg text-sm text-gray-400">
                {demoFeeds.length} feeds configured &middot; {demoFeeds.filter(f => f.visibility).length} visible &middot; {demoFeeds.filter(f => !f.visibility).length} suppressed
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feed Navigation */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="container-padding">
          <div className="flex overflow-x-auto gap-1 py-3" style={{ scrollbarWidth: 'none' }}>
            {demoFeeds.filter(f => f.visibility).map((feed, i) => (
              <a
                key={i}
                href={`#${feed.anchor_id || ''}`}
                className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors whitespace-nowrap"
              >
                {feed.heading}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Render all feeds */}
      {demoFeeds.map((feed, index) => (
        <div key={index}>
          {/* Optional rule details overlay */}
          {showRuleDetails && feed.visibility && (
            <RuleDetailsBar config={feed} index={index} />
          )}
          <DynamicProductFeedBlock config={feed} showImages={showImages} />
        </div>
      ))}

      {/* How It Works Section */}
      <section className="bg-gray-50 section-spacing">
        <div className="container-padding">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-3xl font-bold text-gray-900 mb-8">
              How It Works
            </h2>

            <div className="space-y-6">
              <HowItWorksStep
                number={1}
                title="merchandising_rule_group (Global Field)"
                description="Editors configure structured filters: categories, brands, tags, technology types, price range, stock status. Separate fields use AND logic; multiple selections within a field use OR logic."
              />
              <HowItWorksStep
                number={2}
                title="dynamic_product_feed (Content Type)"
                description="Each feed instance references a rule_group, specifies display style (carousel/grid), sort order, max products, scheduling, and optional fallback rules."
              />
              <HowItWorksStep
                number={3}
                title="Rule Engine (Frontend)"
                description="The rule engine compiles the rule_group into filters, applies them against the product inventory, sorts results, and returns the matching products."
              />
              <HowItWorksStep
                number={4}
                title="Rendering"
                description="The DynamicProductFeedBlock component checks visibility and schedule gates, runs the rule engine, and renders products using the existing ProductCard component."
              />
            </div>

            <div className="mt-12 p-6 bg-white rounded-xl border border-gray-200">
              <h3 className="font-heading text-lg font-semibold text-gray-900 mb-3">
                Key Features Demonstrated
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-gold-600 mt-1">&#10003;</span>
                  <span>Multiple independent feeds stacked on one page</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-600 mt-1">&#10003;</span>
                  <span>AND/OR filter logic (Brand AND Category = AND; Brand A OR Brand B = OR)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-600 mt-1">&#10003;</span>
                  <span>Price range filtering (min/max)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-600 mt-1">&#10003;</span>
                  <span>5 sort options: most_popular, new_arrivals, price_asc, price_desc, staff_picks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-600 mt-1">&#10003;</span>
                  <span>Visibility suppression (Feed 9 is hidden — no DOM rendered)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-600 mt-1">&#10003;</span>
                  <span>Fallback rule group (Feed 10 — primary returns empty, fallback fires with bestsellers)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-600 mt-1">&#10003;</span>
                  <span>Carousel and grid display styles</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-600 mt-1">&#10003;</span>
                  <span>Badge labels on feed sections</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-600 mt-1">&#10003;</span>
                  <span>Discount/deal type filtering (Launch Specials feed)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-600 mt-1">&#10003;</span>
                  <span>Technology type filtering (AI-Enhanced feed — equivalent to strain filtering)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white/10 rounded-xl p-4">
      <div className="text-2xl font-bold text-gold-400">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}

function HowItWorksStep({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold-400 flex items-center justify-center text-gray-900 font-bold text-sm">
        {number}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}

function RuleDetailsBar({ config, index }: { config: DynamicProductFeedConfig; index: number }) {
  const rg = config.rule_group;

  const lookupLabel = (uid: string, list: { uid: string; title: string }[]): string => {
    return list.find(e => e.uid === uid)?.title || uid;
  };

  const chips: string[] = [];

  if (rg.include_categories?.length) {
    chips.push(`Categories: ${rg.include_categories.map(u => lookupLabel(u, productCategories)).join(', ')}`);
  }
  if (rg.brand_include?.length) {
    chips.push(`Brands: ${rg.brand_include.map(u => lookupLabel(u, productBrands)).join(', ')}`);
  }
  if (rg.include_tags?.length) {
    chips.push(`Tags: ${rg.include_tags.map(u => lookupLabel(u, productTags)).join(', ')}`);
  }
  if (rg.technology_type_include?.length) {
    chips.push(`Tech: ${rg.technology_type_include.map(u => lookupLabel(u, technologyTypes)).join(', ')}`);
  }
  if (rg.discount_category_include?.length) {
    chips.push(`Deals: ${rg.discount_category_include.map(u => lookupLabel(u, discountTypes)).join(', ')}`);
  }
  if (rg.price_min || rg.price_max) {
    const min = rg.price_min ? `$${rg.price_min}` : '$0';
    const max = rg.price_max ? `$${rg.price_max}` : 'any';
    chips.push(`Price: ${min} – ${max}`);
  }
  if (rg.in_stock_only) {
    chips.push('In-stock only');
  }

  chips.push(`Sort: ${config.sort_order}`);
  chips.push(`Max: ${config.max_products}`);
  chips.push(`Style: ${config.display_style}`);

  if (config.fallback_rule_group) {
    chips.push('Has fallback');
  }

  return (
    <div className="bg-gray-900 text-white py-3 border-b border-gray-800">
      <div className="container-padding">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gold-400 font-mono font-semibold flex-shrink-0">
            Feed #{index + 1}
          </span>
          <span className="text-gray-500">|</span>
          <div className="flex flex-wrap gap-1.5">
            {chips.map((chip, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-white/10 rounded text-gray-300 whitespace-nowrap"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
