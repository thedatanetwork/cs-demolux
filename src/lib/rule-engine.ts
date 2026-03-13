// ============================================================================
// MERCHANDISING RULE ENGINE
//
// Implements the filtering logic defined by the merchandising_rule_group
// Global Field (Ticket #1). This engine processes structured rule configs
// against the product inventory and returns filtered, sorted results.
//
// Logic:
//   - Separate fields (e.g., Brand AND Category) use AND logic
//   - Multiple selections within one field (e.g., Brand A OR Brand B) use OR logic
//   - price_min must be <= price_max
// ============================================================================

import { type InventoryProduct, productInventory } from '@/data/product-inventory';
import type { Product } from '@/lib/contentstack';

// ============================================================================
// TYPES - Mirrors the Contentstack merchandising_rule_group Global Field
// ============================================================================

export interface MerchandisingRuleGroup {
  // Discount/deal type filters
  discount_category_include?: string[];   // UIDs of discount_types entries
  discount_category_exclude?: string[];

  // Category filters
  include_categories?: string[];          // UIDs of product_categories entries
  exclude_categories?: string[];

  // Brand filters
  brand_include?: string[];              // UIDs of product_brands entries
  brand_exclude?: string[];

  // Tag filters
  include_tags?: string[];               // UIDs of product_tags entries
  exclude_tags?: string[];

  // Technology type filter (equivalent to customer's strain_include)
  technology_type_include?: string[];    // UIDs of technology_types entries

  // Availability
  in_stock_only: boolean;                // Default: true
  global_visibility_fallback: boolean;   // Default: false

  // Price range
  price_min?: number;                    // Minimum: 0
  price_max?: number;                    // Minimum: 0, must be >= price_min
}

// ============================================================================
// DYNAMIC PRODUCT FEED CONFIG - Mirrors Ticket #2 content type
// ============================================================================

export type SortOrder = 'most_popular' | 'new_arrivals' | 'price_asc' | 'price_desc' | 'staff_picks';
export type DisplayStyle = 'carousel' | 'grid';

export interface DynamicProductFeedConfig {
  heading: string;
  subheading?: string;
  anchor_id?: string;
  display_style: DisplayStyle;
  max_products: number;
  cta_label?: string;
  cta_href?: string;
  visibility: boolean;
  sort_order: SortOrder;
  badge_label?: string;
  publish_at?: string;     // ISO datetime
  unpublish_at?: string;   // ISO datetime
  rule_group: MerchandisingRuleGroup;
  fallback_rule_group?: MerchandisingRuleGroup;
}

// ============================================================================
// RULE ENGINE - Core filtering and sorting
// ============================================================================

/**
 * Apply a merchandising_rule_group to the product inventory.
 * Returns filtered products (unsorted — use sortProducts separately).
 */
export function applyRuleGroup(
  rules: MerchandisingRuleGroup,
  inventory: InventoryProduct[] = productInventory
): InventoryProduct[] {
  return inventory.filter(product => {
    // ── in_stock_only ──────────────────────────────────────────────────
    if (rules.in_stock_only && !product.in_stock) {
      return false;
    }

    // ── Category includes (OR within field) ────────────────────────────
    if (rules.include_categories && rules.include_categories.length > 0) {
      if (!rules.include_categories.includes(product.category)) {
        return false;
      }
    }

    // ── Category excludes ──────────────────────────────────────────────
    if (rules.exclude_categories && rules.exclude_categories.length > 0) {
      if (rules.exclude_categories.includes(product.category)) {
        return false;
      }
    }

    // ── Brand includes (OR within field) ───────────────────────────────
    if (rules.brand_include && rules.brand_include.length > 0) {
      if (!rules.brand_include.includes(product.brand)) {
        return false;
      }
    }

    // ── Brand excludes ─────────────────────────────────────────────────
    if (rules.brand_exclude && rules.brand_exclude.length > 0) {
      if (rules.brand_exclude.includes(product.brand)) {
        return false;
      }
    }

    // ── Tag includes (OR within field — product must have at least one) ──
    if (rules.include_tags && rules.include_tags.length > 0) {
      const productTags = product.product_tags || [];
      const hasMatchingTag = rules.include_tags.some(tag => productTags.includes(tag));
      if (!hasMatchingTag) {
        return false;
      }
    }

    // ── Tag excludes (product must not have any) ───────────────────────
    if (rules.exclude_tags && rules.exclude_tags.length > 0) {
      const productTags = product.product_tags || [];
      const hasExcludedTag = rules.exclude_tags.some(tag => productTags.includes(tag));
      if (hasExcludedTag) {
        return false;
      }
    }

    // ── Technology type includes (OR within field) ─────────────────────
    if (rules.technology_type_include && rules.technology_type_include.length > 0) {
      if (!rules.technology_type_include.includes(product.technology_type)) {
        return false;
      }
    }

    // ── Discount category includes (OR within field) ──────────────────
    if (rules.discount_category_include && rules.discount_category_include.length > 0) {
      if (!product.discount_type || !rules.discount_category_include.includes(product.discount_type)) {
        return false;
      }
    }

    // ── Discount category excludes ────────────────────────────────────
    if (rules.discount_category_exclude && rules.discount_category_exclude.length > 0) {
      if (product.discount_type && rules.discount_category_exclude.includes(product.discount_type)) {
        return false;
      }
    }

    // ── Price range ───────────────────────────────────────────────────
    if (rules.price_min !== undefined && rules.price_min > 0) {
      if (product.price < rules.price_min) {
        return false;
      }
    }

    if (rules.price_max !== undefined && rules.price_max > 0) {
      if (product.price > rules.price_max) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sort products by the specified sort order.
 */
export function sortProducts(
  products: InventoryProduct[],
  sortOrder: SortOrder
): InventoryProduct[] {
  const sorted = [...products];

  switch (sortOrder) {
    case 'most_popular':
      sorted.sort((a, b) => b.popularity_score - a.popularity_score);
      break;

    case 'new_arrivals':
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      break;

    case 'price_asc':
      sorted.sort((a, b) => a.price - b.price);
      break;

    case 'price_desc':
      sorted.sort((a, b) => b.price - a.price);
      break;

    case 'staff_picks':
      // Staff picks first, then by popularity within each group
      sorted.sort((a, b) => {
        if (a.staff_pick && !b.staff_pick) return -1;
        if (!a.staff_pick && b.staff_pick) return 1;
        return b.popularity_score - a.popularity_score;
      });
      break;

    default:
      sorted.sort((a, b) => b.popularity_score - a.popularity_score);
  }

  return sorted;
}

/**
 * Check if a block should be visible based on publish_at/unpublish_at schedule.
 */
export function isWithinSchedule(
  publishAt?: string,
  unpublishAt?: string,
  now: Date = new Date()
): boolean {
  if (publishAt) {
    const publishDate = new Date(publishAt);
    if (now < publishDate) return false;
  }

  if (unpublishAt) {
    const unpublishDate = new Date(unpublishAt);
    if (now > unpublishDate) return false;
  }

  return true;
}

/**
 * Convert an InventoryProduct to the base Product interface
 * so it can be rendered by the existing ProductCard component.
 */
export function toProduct(item: InventoryProduct): Product {
  return {
    uid: item.uid,
    title: item.title,
    url: item.url,
    description: item.description,
    detailed_description: item.detailed_description,
    featured_image: item.featured_image,
    price: item.price,
    category: item.category,
    product_tags: item.product_tags,
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
}

/**
 * Full pipeline: apply rule group, sort, limit, and convert to Product[].
 * If primary returns empty and fallback is provided, re-run with fallback.
 */
export function resolveDynamicFeed(config: DynamicProductFeedConfig): Product[] {
  // 1. Visibility gate
  if (!config.visibility) {
    return [];
  }

  // 2. Schedule gate
  if (!isWithinSchedule(config.publish_at, config.unpublish_at)) {
    return [];
  }

  // 3. Apply primary rule group
  let results = applyRuleGroup(config.rule_group);
  results = sortProducts(results, config.sort_order);
  results = results.slice(0, config.max_products);

  // 4. Fallback if primary returns empty
  if (results.length === 0 && config.fallback_rule_group) {
    results = applyRuleGroup(config.fallback_rule_group);
    results = sortProducts(results, config.sort_order);
    results = results.slice(0, config.max_products);
  }

  // 5. Convert to Product interface
  return results.map(toProduct);
}

// ============================================================================
// DEFAULT RULE GROUP - Convenience for creating new configs
// ============================================================================

export const defaultRuleGroup: MerchandisingRuleGroup = {
  in_stock_only: true,
  global_visibility_fallback: false,
};

// ============================================================================
// CMS DATA CONVERTER
// Transforms Contentstack entry data (with resolved references) into
// the rule engine's MerchandisingRuleGroup and DynamicProductFeedConfig.
// ============================================================================

import type {
  DynamicProductFeedEntry,
  CMSRuleGroup,
  RuleRefEntry,
  DynamicProductFeedDropdownEntry,
  CMSRuleGroupDropdown,
} from '@/lib/contentstack';

/** Extract the `value` field from resolved reference entries */
function extractValues(refs?: RuleRefEntry[]): string[] | undefined {
  if (!refs || refs.length === 0) return undefined;
  // Handle both resolved (full object) and unresolved (uid-only) refs
  return refs
    .map(r => (typeof r === 'object' && r.value) ? r.value : null)
    .filter((v): v is string => v !== null);
}

/** Convert a CMS rule group (with resolved references) to a MerchandisingRuleGroup */
export function convertCMSRuleGroup(cms: CMSRuleGroup): MerchandisingRuleGroup {
  return {
    discount_category_include: extractValues(cms.discount_category_include),
    discount_category_exclude: extractValues(cms.discount_category_exclude),
    include_categories: extractValues(cms.include_categories),
    exclude_categories: extractValues(cms.exclude_categories),
    brand_include: extractValues(cms.brand_include),
    brand_exclude: extractValues(cms.brand_exclude),
    include_tags: extractValues(cms.include_tags),
    exclude_tags: extractValues(cms.exclude_tags),
    // strain_include maps to technology_type_include in the rule engine
    technology_type_include: extractValues(cms.strain_include),
    in_stock_only: cms.in_stock_only ?? true,
    global_visibility_fallback: cms.global_visibility_fallback ?? false,
    price_min: cms.price_min,
    price_max: cms.price_max,
  };
}

/** Convert a full CMS DynamicProductFeedEntry to a DynamicProductFeedConfig */
export function convertCMSFeedEntry(entry: DynamicProductFeedEntry): DynamicProductFeedConfig {
  return {
    heading: entry.heading,
    subheading: entry.subheading,
    anchor_id: entry.anchor_id,
    display_style: entry.display_style || 'carousel',
    max_products: entry.max_products || 15,
    cta_label: entry.cta_label,
    cta_href: entry.cta_href,
    visibility: entry.visibility ?? true,
    sort_order: (entry.sort_order as SortOrder) || 'most_popular',
    badge_label: entry.badge_label,
    publish_at: entry.publish_at,
    unpublish_at: entry.unpublish_at,
    rule_group: convertCMSRuleGroup(entry.rule_group || {}),
    fallback_rule_group: entry.fallback_rule_group
      ? convertCMSRuleGroup(entry.fallback_rule_group)
      : undefined,
  };
}

// ============================================================================
// DROPDOWN-BASED CMS CONVERTER
// Simpler conversion — dropdown fields return string arrays directly,
// no need to extract `value` from resolved reference objects.
// ============================================================================

/** Convert a dropdown-based CMS rule group to a MerchandisingRuleGroup */
export function convertDropdownRuleGroup(cms: CMSRuleGroupDropdown): MerchandisingRuleGroup {
  const toArr = (v?: string | string[]): string[] | undefined => {
    if (!v) return undefined;
    // Contentstack may return a single string for single-select or string[] for multi
    const arr = Array.isArray(v) ? v : [v];
    return arr.length > 0 ? arr : undefined;
  };

  return {
    discount_category_include: toArr(cms.discount_category_include),
    discount_category_exclude: toArr(cms.discount_category_exclude),
    include_categories: toArr(cms.include_categories),
    exclude_categories: toArr(cms.exclude_categories),
    brand_include: toArr(cms.brand_include),
    brand_exclude: toArr(cms.brand_exclude),
    include_tags: toArr(cms.include_tags),
    exclude_tags: toArr(cms.exclude_tags),
    technology_type_include: toArr(cms.strain_include),
    in_stock_only: cms.in_stock_only ?? true,
    global_visibility_fallback: cms.global_visibility_fallback ?? false,
    price_min: cms.price_min,
    price_max: cms.price_max,
  };
}

/** Convert a dropdown-based feed entry to a DynamicProductFeedConfig */
export function convertDropdownFeedEntry(entry: DynamicProductFeedDropdownEntry): DynamicProductFeedConfig {
  return {
    heading: entry.heading,
    subheading: entry.subheading,
    anchor_id: entry.anchor_id,
    display_style: entry.display_style || 'carousel',
    max_products: entry.max_products || 15,
    cta_label: entry.cta_label,
    cta_href: entry.cta_href,
    visibility: entry.visibility ?? true,
    sort_order: (entry.sort_order as SortOrder) || 'most_popular',
    badge_label: entry.badge_label,
    publish_at: entry.publish_at,
    unpublish_at: entry.unpublish_at,
    rule_group: convertDropdownRuleGroup(entry.rule_group || {}),
    fallback_rule_group: entry.fallback_rule_group
      ? convertDropdownRuleGroup(entry.fallback_rule_group)
      : undefined,
  };
}
