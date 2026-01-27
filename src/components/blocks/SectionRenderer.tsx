'use client';

import React from 'react';
import type { ModularBlock } from '@/lib/contentstack';
import { HeroSectionBlock } from './HeroSectionBlock';
import { FeaturedContentGridBlock } from './FeaturedContentGridBlock';
import { ValuesGridBlock } from './ValuesGridBlock';
import { CampaignCTABlock } from './CampaignCTABlock';
import { GallerySectionBlock } from './GallerySectionBlock';
import { ProcessStepsBlock } from './ProcessStepsBlock';
import { StatisticsBlock } from './StatisticsBlock';
import { TestimonialsBlock } from './TestimonialsBlock';
import { FAQBlock } from './FAQBlock';

interface SectionRendererProps {
  sections: (ModularBlock | EmbeddedBlock)[] | ModularBlock[] | EmbeddedBlock[];
  entry?: any;  // Parent entry for Live Preview context
  fieldPath?: string;  // Field path for editable tags (e.g., 'page_sections')
}

/**
 * Embedded modular block format from Contentstack
 * When using actual modular blocks (not references), blocks come in this format:
 * { hero_section: { variant: '...', headline: '...' } }
 */
interface EmbeddedBlock {
  [blockType: string]: {
    _metadata?: { uid: string };
    [key: string]: any;
  };
}

/**
 * Map embedded block type names to content type UIDs
 * Supports both the short name (from modular blocks) and the full content type UID
 */
const BLOCK_TYPE_MAP: Record<string, string> = {
  // Short names (from true modular blocks)
  hero_section: 'hero_section_block',
  featured_content_grid: 'featured_content_grid_block',
  values_grid: 'values_grid_block',
  campaign_cta: 'campaign_cta_block',
  gallery_section: 'gallery_section_block',
  process_steps: 'process_steps_block',
  statistics: 'statistics_block',
  testimonials: 'testimonials_block',
  faq: 'faq_block',
  text_media_section: 'text_media_section_block',
  product_showcase: 'product_showcase_block',
  collection_showcase: 'collection_showcase_block',
  // Full UIDs (from reference-based blocks) - map to themselves
  hero_section_block: 'hero_section_block',
  featured_content_grid_block: 'featured_content_grid_block',
  values_grid_block: 'values_grid_block',
  campaign_cta_block: 'campaign_cta_block',
  gallery_section_block: 'gallery_section_block',
  process_steps_block: 'process_steps_block',
  statistics_block: 'statistics_block',
  testimonials_block: 'testimonials_block',
  faq_block: 'faq_block',
  text_media_section_block: 'text_media_section_block',
  product_showcase_block: 'product_showcase_block',
  collection_showcase_block: 'collection_showcase_block',
};

/**
 * Normalize a block from either format to a consistent structure
 * Handles three block formats:
 * 1. Reference blocks: { _content_type_uid: 'hero_section_block', ... }
 * 2. Embedded modular blocks: { hero_section: { variant: '...', ... } }
 * 3. Inline JSON blocks: { block_type: 'hero_section', ... }
 */
function normalizeBlock(block: any): { type: string; data: any; uid: string; blockKey?: string } | null {
  // Format 1: Reference block (has _content_type_uid)
  if (block._content_type_uid) {
    const mappedType = BLOCK_TYPE_MAP[block._content_type_uid] || block._content_type_uid;
    return {
      type: mappedType,
      data: block,
      uid: block.uid || block._metadata?.uid || '',
    };
  }

  // Format 3: Inline JSON block (has block_type)
  if (block.block_type) {
    const mappedType = BLOCK_TYPE_MAP[block.block_type] || block.block_type;
    return {
      type: mappedType,
      data: block,
      uid: block.uid || block._metadata?.uid || '',
    };
  }

  // Format 2: Embedded modular block - find the block type key
  const blockKeys = Object.keys(block).filter(key => !key.startsWith('_') && key !== '$');
  if (blockKeys.length === 0) return null;

  const blockType = blockKeys[0];
  const blockData = block[blockType];
  const mappedType = BLOCK_TYPE_MAP[blockType];

  if (!mappedType) {
    console.warn(`Unknown embedded block type: ${blockType}`);
    return null;
  }

  return {
    type: mappedType,
    data: {
      ...blockData,
      _content_type_uid: mappedType,
      // Pass through the $ editable tags if present
      $: blockData.$ || {},
    },
    uid: blockData._metadata?.uid || '',
    blockKey: blockType,
  };
}

/**
 * Get editable attributes for a block wrapper
 * This enables the Add/Remove block controls in Visual Builder
 */
function getBlockEditableProps(
  entry: any,
  fieldPath: string | undefined,
  index: number
): Record<string, any> {
  if (!entry || !fieldPath || !entry.$) {
    return {};
  }

  // For modular blocks array, the editable attribute format is:
  // entry.$?.[`${fieldPath}__${index}`] for individual blocks
  const blockEditableKey = `${fieldPath}__${index}`;
  return entry.$?.[blockEditableKey] || {};
}

/**
 * SectionRenderer - Core component for rendering modular blocks from Contentstack
 *
 * This component acts as a router, rendering the appropriate block component
 * based on the block type.
 *
 * Supports three block formats:
 * 1. Reference blocks: { _content_type_uid: 'hero_section_block', ... }
 * 2. Embedded modular blocks: { hero_section: { variant: '...', ... } }
 * 3. Inline JSON blocks: { block_type: 'hero_section', ... }
 *
 * Live Preview / Visual Builder Integration:
 * - Wraps each block in a div with data-cslp attributes for field-level editing
 * - Passes $ editable tags to child components for individual field editing
 * - Enables Add/Remove block controls in Visual Builder
 */
export function SectionRenderer({ sections, entry, fieldPath }: SectionRendererProps) {
  if (!sections || sections.length === 0) {
    return null;
  }

  // Get array-level editable props for the blocks container
  const containerEditableProps = entry?.$?.[fieldPath || 'page_sections'] || {};

  return (
    <div {...containerEditableProps} data-add-direction="vertical">
      {sections.map((section: any, index) => {
        const normalized = normalizeBlock(section);
        if (!normalized) return null;

        const { type, data, uid } = normalized;
        const key = uid || `block-${index}`;

        // Get editable props for this specific block (enables Add/Remove in Visual Builder)
        const blockEditableProps = getBlockEditableProps(entry, fieldPath, index);

        // Render the appropriate component based on normalized block type
        const renderBlock = () => {
          switch (type) {
            case 'hero_section_block':
              return <HeroSectionBlock block={data} />;

            case 'featured_content_grid_block':
              return <FeaturedContentGridBlock block={data} />;

            case 'values_grid_block':
              return <ValuesGridBlock block={data} />;

            case 'campaign_cta_block':
              return <CampaignCTABlock block={data} />;

            case 'gallery_section_block':
              return <GallerySectionBlock block={data} />;

            case 'process_steps_block':
              return <ProcessStepsBlock block={data} />;

            case 'statistics_block':
              return <StatisticsBlock block={data} />;

            case 'testimonials_block':
              return <TestimonialsBlock block={data} />;

            case 'faq_block':
              return <FAQBlock block={data} />;

            // Additional block types - not yet implemented
            case 'text_media_section_block':
            case 'product_showcase_block':
            case 'collection_showcase_block':
              console.warn(`Block type "${type}" is not yet implemented`);
              return null;

            default:
              console.warn(`Unknown block type: ${type}`);
              return null;
          }
        };

        return (
          <div key={key} {...blockEditableProps}>
            {renderBlock()}
          </div>
        );
      })}
    </div>
  );
}
