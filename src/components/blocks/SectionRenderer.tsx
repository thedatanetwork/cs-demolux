'use client';

import React from 'react';
import { ModularBlock } from '@/lib/contentstack';
import { HeroSectionBlock } from './HeroSectionBlock';
import { FeaturedContentGridBlock } from './FeaturedContentGridBlock';
import { ValuesGridBlock } from './ValuesGridBlock';
import { CampaignCTABlock } from './CampaignCTABlock';
import { GallerySectionBlock } from './GallerySectionBlock';

interface SectionRendererProps {
  sections: ModularBlock[];
}

export function SectionRenderer({ sections }: SectionRendererProps) {
  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <>
      {sections.map((section: any, index) => {
        // Get the content type UID (for referenced entries) or block_type (for inline JSON)
        const blockType = section._content_type_uid || section.block_type;

        // Render the appropriate component based on content type
        switch (blockType) {
          case 'hero_section_block':
          case 'hero_section':
            return <HeroSectionBlock key={section.uid || index} block={section} />;

          case 'featured_content_grid_block':
          case 'featured_content_grid':
            return <FeaturedContentGridBlock key={section.uid || index} block={section} />;

          case 'values_grid_block':
          case 'values_grid':
            return <ValuesGridBlock key={section.uid || index} block={section} />;

          case 'campaign_cta_block':
          case 'campaign_cta':
            return <CampaignCTABlock key={section.uid || index} block={section} />;

          case 'gallery_section_block':
          case 'gallery_section':
            return <GallerySectionBlock key={section.uid || index} block={section} />;

          // Additional block types can be added here as they're implemented
          case 'text_media_section_block':
          case 'text_media_section':
          case 'product_showcase_block':
          case 'product_showcase':
          case 'collection_showcase_block':
          case 'collection_showcase':
          case 'testimonials_block':
          case 'testimonials':
          case 'statistics_block':
          case 'statistics':
            console.warn(`Block type "${blockType}" is not yet implemented`);
            return null;

          default:
            console.warn(`Unknown block type: ${blockType}`);
            return null;
        }
      })}
    </>
  );
}
