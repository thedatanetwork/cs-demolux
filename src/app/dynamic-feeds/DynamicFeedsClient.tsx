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

interface DynamicFeedsClientProps {
  feedConfigs: DynamicProductFeedConfig[];
  fetchError: string | null;
  pageHeading?: string;
  pageSubheading?: string;
}

export function DynamicFeedsClient({ feedConfigs, fetchError, pageHeading, pageSubheading }: DynamicFeedsClientProps) {
  const [showRuleDetails, setShowRuleDetails] = useState(false);
  const [showImages, setShowImages] = useState(false);

  const visibleFeeds = feedConfigs.filter(f => f.visibility);
  const suppressedFeeds = feedConfigs.filter(f => !f.visibility);

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
                {pageHeading?.split(' ').slice(0, 1).join(' ') || 'Merchandising'}
              </span>{' '}
              <span className="text-white">
                {pageHeading?.split(' ').slice(1).join(' ') || 'Rule Engine'}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl">
              {pageSubheading || (
                <>
                  This page demonstrates how the <code className="text-gold-400 bg-white/10 px-2 py-0.5 rounded text-sm">merchandising_rule_group</code> Global
                  Field and <code className="text-gold-400 bg-white/10 px-2 py-0.5 rounded text-sm">dynamic_product_feed</code> content
                  type work together to drive structured, editor-controlled product merchandising.
                  All feed configurations are fetched from Contentstack.
                </>
              )}
            </p>

            {/* Error banner */}
            {fetchError && (
              <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-4 mb-8">
                <p className="text-red-300 text-sm font-medium">Failed to load feeds from Contentstack</p>
                <p className="text-red-400 text-xs mt-1">{fetchError}</p>
                <p className="text-red-400 text-xs mt-2">
                  Run <code className="bg-white/10 px-1.5 py-0.5 rounded">cd scripts && npm run setup-dynamic-feeds</code> to
                  create the schemas and seed data.
                </p>
              </div>
            )}

            {/* Inventory Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total Products" value={inventoryStats.totalProducts} />
              <StatCard label="In Stock" value={inventoryStats.inStock} />
              <StatCard label="Staff Picks" value={inventoryStats.staffPicks} />
              <StatCard label="CMS Feeds" value={feedConfigs.length} />
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
                {feedConfigs.length} feeds from CMS &middot; {visibleFeeds.length} visible &middot; {suppressedFeeds.length} suppressed
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feed Navigation */}
      {visibleFeeds.length > 0 && (
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="container-padding">
            <div className="flex overflow-x-auto gap-1 py-3" style={{ scrollbarWidth: 'none' }}>
              {visibleFeeds.map((feed, i) => (
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
      )}

      {/* Empty state */}
      {feedConfigs.length === 0 && !fetchError && (
        <div className="text-center py-24">
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">No feeds configured</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Create <code className="bg-gray-100 px-2 py-0.5 rounded text-sm">dynamic_product_feed</code> entries
            in Contentstack to populate this page.
          </p>
        </div>
      )}

      {/* Render all feeds */}
      {feedConfigs.map((feed, index) => (
        <div key={index}>
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
                description="Each feed instance references a rule_group, specifies display style (carousel/grid), sort order, max products, scheduling, and optional fallback rules. All managed in Contentstack."
              />
              <HowItWorksStep
                number={3}
                title="Rule Engine (Frontend)"
                description="The rule engine compiles the CMS rule_group into filters, applies them against the product inventory, sorts results, and returns matching products."
              />
              <HowItWorksStep
                number={4}
                title="Schedule & Visibility"
                description="publish_at and unpublish_at control when blocks appear. Visibility toggle suppresses blocks entirely. Both are checked client-side; publish_at/unpublish_at can also drive Contentstack Automate workflows."
              />
            </div>

            <div className="mt-12 p-6 bg-white rounded-xl border border-gray-200">
              <h3 className="font-heading text-lg font-semibold text-gray-900 mb-3">
                Key Features Demonstrated
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-gold-600 mt-1">&#10003;</span>
                  <span>Feed configurations stored in Contentstack CMS (not hardcoded)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-600 mt-1">&#10003;</span>
                  <span>merchandising_rule_group Global Field with structured reference filters</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-600 mt-1">&#10003;</span>
                  <span>AND/OR filter logic (Brand AND Category = AND; Brand A OR Brand B = OR)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-600 mt-1">&#10003;</span>
                  <span>5 sort options: most_popular, new_arrivals, price_asc, price_desc, staff_picks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-600 mt-1">&#10003;</span>
                  <span>publish_at / unpublish_at scheduling (frontend-enforced, Automate-ready)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-600 mt-1">&#10003;</span>
                  <span>Visibility suppression — no DOM rendered when false</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-600 mt-1">&#10003;</span>
                  <span>Fallback rule group fires when primary returns zero products</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-600 mt-1">&#10003;</span>
                  <span>Personalize-ready: variant aliases passed through to CMS queries</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gold-600 mt-1">&#10003;</span>
                  <span>Carousel and grid display styles</span>
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

  const chips: string[] = [];

  if (rg.include_categories?.length) {
    const labels = rg.include_categories.map(v => {
      const found = productCategories.find(c => c.uid === v);
      return found?.title || v;
    });
    chips.push(`Categories: ${labels.join(', ')}`);
  }
  if (rg.brand_include?.length) {
    const labels = rg.brand_include.map(v => {
      const found = productBrands.find(b => b.uid === v);
      return found?.title || v;
    });
    chips.push(`Brands: ${labels.join(', ')}`);
  }
  if (rg.include_tags?.length) {
    const labels = rg.include_tags.map(v => {
      const found = productTags.find(t => t.uid === v);
      return found?.title || v;
    });
    chips.push(`Tags: ${labels.join(', ')}`);
  }
  if (rg.technology_type_include?.length) {
    const labels = rg.technology_type_include.map(v => {
      const found = technologyTypes.find(t => t.uid === v);
      return found?.title || v;
    });
    chips.push(`Tech: ${labels.join(', ')}`);
  }
  if (rg.discount_category_include?.length) {
    const labels = rg.discount_category_include.map(v => {
      const found = discountTypes.find(d => d.uid === v);
      return found?.title || v;
    });
    chips.push(`Deals: ${labels.join(', ')}`);
  }
  if (rg.price_min || rg.price_max) {
    const min = rg.price_min ? `$${rg.price_min}` : '$0';
    const max = rg.price_max ? `$${rg.price_max}` : 'any';
    chips.push(`Price: ${min} - ${max}`);
  }
  if (rg.in_stock_only) chips.push('In-stock only');

  chips.push(`Sort: ${config.sort_order}`);
  chips.push(`Max: ${config.max_products}`);
  chips.push(`Style: ${config.display_style}`);

  if (config.publish_at) chips.push(`Publish: ${new Date(config.publish_at).toLocaleDateString()}`);
  if (config.unpublish_at) chips.push(`Unpublish: ${new Date(config.unpublish_at).toLocaleDateString()}`);
  if (config.fallback_rule_group) chips.push('Has fallback');

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
