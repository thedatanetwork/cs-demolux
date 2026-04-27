'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { HeroSevenBlock as HeroSevenBlockType } from '@/lib/contentstack';
import { ArrowRight } from 'lucide-react';

interface HeroSevenBlockProps {
  block: HeroSevenBlockType & { $?: Record<string, any> };
}

const sectionBgClasses: Record<string, string> = {
  white: 'bg-white text-gray-900',
  gray: 'bg-gray-50 text-gray-900',
  dark: 'bg-gray-900 text-white',
};

const cornerClasses: Record<string, string> = {
  none: 'rounded-none',
  small: 'rounded-md',
  medium: 'rounded-lg',
  large: 'rounded-2xl',
};

const gapClasses: Record<string, string> = {
  tight: 'gap-2 md:gap-3',
  normal: 'gap-3 md:gap-4',
  loose: 'gap-5 md:gap-6',
};

// Grid templates per right_columns + right_rows. Hero spans all rows.
// Mobile is always 2-col with hero spanning the full width on top.
function gridClasses(rightColumns: string, rightRows: string, heroOnRight: boolean): string {
  // total columns at desktop = 1 (hero) + rightColumns
  const totalCols = 1 + Number(rightColumns || 3);
  const colsClass = totalCols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3';
  const rowsClass = rightRows === '1' ? 'lg:grid-rows-1' : 'lg:grid-rows-2';
  return `grid grid-cols-2 ${colsClass} ${rowsClass}`;
}

function heroPlacementClasses(rightRows: string, heroOnRight: boolean): string {
  const rowSpan = rightRows === '1' ? '' : 'lg:row-span-2';
  const colStart = heroOnRight ? 'lg:col-start-2 xl:col-start-2' : 'lg:col-start-1';
  // Mobile: hero spans full width
  return `col-span-2 lg:col-span-1 ${rowSpan} ${colStart}`.trim();
}

const overlayPositionClasses: Record<string, string> = {
  top_left: 'items-start justify-start text-left',
  top_right: 'items-start justify-end text-right',
  bottom_left: 'items-end justify-start text-left',
  bottom_right: 'items-end justify-end text-right',
  center: 'items-center justify-center text-center',
};

const scrimGradientByPosition: Record<string, string> = {
  top_left: 'bg-gradient-to-br from-black/55 via-black/15 to-transparent',
  top_right: 'bg-gradient-to-bl from-black/55 via-black/15 to-transparent',
  bottom_left: 'bg-gradient-to-tr from-black/55 via-black/15 to-transparent',
  bottom_right: 'bg-gradient-to-tl from-black/55 via-black/15 to-transparent',
  center: 'bg-black/30',
};

export function HeroSevenBlock({ block }: HeroSevenBlockProps) {
  const {
    eyebrow_label,
    section_title,
    section_description,
    background_style = 'white',
    right_columns = '3',
    right_rows = '2',
    hero_position = 'left',
    hero_overlay_position = 'top_left',
    hero_overlay_text_color = 'light',
    show_hero_scrim = true,
    show_tile_labels = true,
    tile_corner_radius = 'medium',
    gap_size = 'normal',
    tiles = [],
  } = block;

  const $ = block.$ || {};
  const isDark = background_style === 'dark';
  const heroOnRight = hero_position === 'right';

  const [hero, ...secondaries] = tiles;
  if (!hero) return null;

  const cornerClass = cornerClasses[tile_corner_radius] || cornerClasses.medium;
  const gapClass = gapClasses[gap_size] || gapClasses.normal;

  // Cap secondary tiles to fill the right grid exactly
  const maxSecondaries = Number(right_columns) * Number(right_rows);
  const visibleSecondaries = secondaries.slice(0, maxSecondaries);

  return (
    <section className={`section-spacing ${sectionBgClasses[background_style] || sectionBgClasses.white}`}>
      <div className="container-padding">
        {(eyebrow_label || section_title || section_description) && (
          <div className="text-center mb-8 md:mb-12">
            {eyebrow_label && (
              <div
                {...$['eyebrow_label']}
                className={`inline-block text-xs font-semibold uppercase tracking-widest mb-3 ${
                  isDark ? 'text-gold-400' : 'text-gold-600'
                }`}
              >
                {eyebrow_label}
              </div>
            )}
            {section_title && (
              <h2
                {...$['section_title']}
                className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
              >
                {section_title}
              </h2>
            )}
            {section_description && (
              <p
                {...$['section_description']}
                className={`text-base md:text-lg max-w-3xl mx-auto leading-relaxed ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {section_description}
              </p>
            )}
          </div>
        )}

        <div
          {...$['tiles']}
          className={`${gridClasses(right_columns, right_rows, heroOnRight)} ${gapClass}`}
        >
          {/* Hero tile */}
          <HeroTile
            tile={hero}
            placement={heroPlacementClasses(right_rows, heroOnRight)}
            cornerClass={cornerClass}
            overlayPosition={hero_overlay_position}
            textColor={hero_overlay_text_color}
            showScrim={show_hero_scrim !== false}
            tileTag={$['tiles__0'] || {}}
          />

          {/* Secondary tiles fill remaining cells */}
          {visibleSecondaries.map((tile, i) => (
            <SecondaryTile
              key={tile._metadata?.uid || i}
              tile={tile}
              cornerClass={cornerClass}
              showLabel={show_tile_labels !== false}
              isDark={isDark}
              tileTag={$[`tiles__${i + 1}`] || {}}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function HeroTile({
  tile,
  placement,
  cornerClass,
  overlayPosition,
  textColor,
  showScrim,
  tileTag,
}: {
  tile: any;
  placement: string;
  cornerClass: string;
  overlayPosition: string;
  textColor: string;
  showScrim: boolean;
  tileTag: Record<string, any>;
}) {
  const t$ = tile.$ || {};
  const image = Array.isArray(tile.image) ? tile.image[0] : tile.image;
  const TileWrapper: React.ElementType = tile.link_url ? Link : 'div';
  const wrapperProps = tile.link_url ? { href: tile.link_url } : {};

  const isLight = textColor !== 'dark';
  const headlineColor = isLight ? 'text-white' : 'text-gray-900';
  const subColor = isLight ? 'text-white/90' : 'text-gray-700';
  const ctaClass = isLight
    ? 'bg-white text-gray-900 hover:bg-gray-100'
    : 'bg-gray-900 text-white hover:bg-gray-800';

  const overlayAlignClass = overlayPositionClasses[overlayPosition] || overlayPositionClasses.top_left;
  const scrimGradient = scrimGradientByPosition[overlayPosition] || scrimGradientByPosition.top_left;

  return (
    <TileWrapper
      {...wrapperProps}
      {...tileTag}
      className={`group relative ${cornerClass} ${placement} overflow-hidden block aspect-[4/3] lg:aspect-auto lg:min-h-[460px]`}
    >
      {image?.url && (
        <div {...t$['image']} className="absolute inset-0">
          <Image
            src={image.url}
            alt={image.title || tile.overlay_headline || 'Hero'}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </div>
      )}

      {showScrim && (
        <div aria-hidden className={`absolute inset-0 pointer-events-none ${scrimGradient}`} />
      )}

      {(tile.overlay_headline || tile.overlay_subheadline || tile.overlay_cta_label) && (
        <div className={`absolute inset-0 p-6 sm:p-8 lg:p-10 flex flex-col ${overlayAlignClass}`}>
          <div className="max-w-md">
            {tile.overlay_headline && (
              <h3
                {...t$['overlay_headline']}
                className={`font-heading text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-3 sm:mb-4 ${headlineColor}`}
              >
                {tile.overlay_headline}
              </h3>
            )}
            {tile.overlay_subheadline && (
              <p
                {...t$['overlay_subheadline']}
                className={`text-base sm:text-lg leading-relaxed mb-5 sm:mb-6 ${subColor}`}
              >
                {tile.overlay_subheadline}
              </p>
            )}
            {tile.overlay_cta_label && (
              <span
                {...t$['overlay_cta_label']}
                className={`inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-colors shadow-md ${ctaClass}`}
              >
                {tile.overlay_cta_label}
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </div>
        </div>
      )}
    </TileWrapper>
  );
}

function SecondaryTile({
  tile,
  cornerClass,
  showLabel,
  isDark,
  tileTag,
}: {
  tile: any;
  cornerClass: string;
  showLabel: boolean;
  isDark: boolean;
  tileTag: Record<string, any>;
}) {
  const t$ = tile.$ || {};
  const image = Array.isArray(tile.image) ? tile.image[0] : tile.image;
  const TileWrapper: React.ElementType = tile.link_url ? Link : 'div';
  const wrapperProps = tile.link_url ? { href: tile.link_url } : {};

  return (
    <TileWrapper
      {...wrapperProps}
      {...tileTag}
      className="group block"
    >
      <div className={`relative aspect-square ${cornerClass} bg-gray-100 overflow-hidden`}>
        {image?.url && (
          <div {...t$['image']} className="absolute inset-0">
            <Image
              src={image.url}
              alt={image.title || tile.label || 'Tile'}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
        {/* Label overlay at the bottom of the tile (matches JCP style) */}
        {showLabel && tile.label && (
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent h-1/3 pointer-events-none"
          />
        )}
        {showLabel && tile.label && (
          <div
            {...t$['label']}
            className="absolute inset-x-0 bottom-0 px-3 py-2 text-center text-sm sm:text-base font-semibold text-white"
          >
            {tile.label}
          </div>
        )}
      </div>
    </TileWrapper>
  );
}
