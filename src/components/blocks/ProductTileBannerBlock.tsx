'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { ProductTileBannerBlock as ProductTileBannerBlockType } from '@/lib/contentstack';

interface ProductTileBannerBlockProps {
  block: ProductTileBannerBlockType & {
    $?: Record<string, any>;
  };
}

const sectionBgClasses: Record<string, string> = {
  white: 'bg-white text-gray-900',
  gray: 'bg-gray-50 text-gray-900',
  dark: 'bg-gray-900 text-white',
};

// Responsive grid: scales smoothly from 2 cols on mobile up to the configured max
// columns prop is the LARGEST breakpoint count
const columnClasses: Record<string, string> = {
  '4': 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
  '5': 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
  '6': 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
};

const gapClasses: Record<string, string> = {
  tight: 'gap-x-2 gap-y-4 md:gap-x-3 md:gap-y-6',
  normal: 'gap-x-3 gap-y-6 md:gap-x-5 md:gap-y-8',
  loose: 'gap-x-5 gap-y-8 md:gap-x-8 md:gap-y-12',
};

const aspectClasses: Record<string, string> = {
  square: 'aspect-square',
  portrait_4_5: 'aspect-[4/5]',
  portrait_3_4: 'aspect-[3/4]',
  landscape_4_3: 'aspect-[4/3]',
};

const cornerClasses: Record<string, string> = {
  none: 'rounded-none',
  small: 'rounded-md',
  medium: 'rounded-lg',
  large: 'rounded-2xl',
};

const tileBgClasses: Record<string, string> = {
  transparent: 'bg-gray-100',
  white: 'bg-white border border-gray-100',
  soft_gray: 'bg-gray-50 border border-gray-100',
  soft_warm: 'bg-stone-50 border border-stone-100',
};

const badgeColorClasses: Record<string, string> = {
  teal: 'bg-teal-700 text-white',
  gold: 'bg-amber-500 text-gray-900',
  red: 'bg-red-700 text-white',
  navy: 'bg-slate-800 text-white',
  black: 'bg-black text-white',
};

// Color used for the "punch hole" on price-tag shape (matches section background)
const holeColorClasses: Record<string, string> = {
  white: 'bg-white',
  gray: 'bg-gray-50',
  dark: 'bg-gray-900',
};

export function ProductTileBannerBlock({ block }: ProductTileBannerBlockProps) {
  const {
    eyebrow_label,
    section_title,
    section_description,
    columns = '6',
    background_style = 'white',
    badge_color = 'teal',
    badge_shape = 'price_tag',
    badge_position = 'top_left',
    tile_aspect_ratio = 'square',
    tile_image_fit = 'cover',
    tile_background = 'transparent',
    corner_radius = 'medium',
    label_alignment = 'center',
    show_labels = true,
    gap_size = 'normal',
    tiles = [],
  } = block;

  const $ = block.$ || {};
  const isDark = background_style === 'dark';

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
          className={`grid ${columnClasses[String(columns)] || columnClasses['6']} ${
            gapClasses[gap_size] || gapClasses.normal
          }`}
        >
          {tiles.map((tile, index) => (
            <ProductTile
              key={tile._metadata?.uid || index}
              tile={tile}
              badgeColor={badge_color}
              badgeShape={badge_shape}
              badgePosition={badge_position}
              aspectRatio={tile_aspect_ratio}
              imageFit={tile_image_fit}
              tileBg={tile_background}
              cornerRadius={corner_radius}
              labelAlignment={label_alignment}
              showLabels={show_labels !== false}
              backgroundStyle={background_style}
              isDark={isDark}
              itemTag={$[`tiles__${index}`] || {}}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface ProductTileProps {
  tile: ProductTileBannerBlockType['tiles'][number] & { $?: Record<string, any> };
  badgeColor: string;
  badgeShape: string;
  badgePosition: string;
  aspectRatio: string;
  imageFit: string;
  tileBg: string;
  cornerRadius: string;
  labelAlignment: string;
  showLabels: boolean;
  backgroundStyle: string;
  isDark: boolean;
  itemTag: Record<string, any>;
}

function ProductTile({
  tile,
  badgeColor,
  badgeShape,
  badgePosition,
  aspectRatio,
  imageFit,
  tileBg,
  cornerRadius,
  labelAlignment,
  showLabels,
  backgroundStyle,
  isDark,
  itemTag,
}: ProductTileProps) {
  const t$ = tile.$ || {};
  const image = Array.isArray(tile.image) ? tile.image[0] : tile.image;
  const hasBadge = Boolean(tile.eyebrow || tile.prefix || tile.value || tile.suffix || tile.sublabel);

  const TileWrapper: React.ElementType = tile.link_url ? Link : 'div';
  const wrapperProps = tile.link_url ? { href: tile.link_url } : {};

  const aspectClass = aspectClasses[aspectRatio] || aspectClasses.square;
  const cornerClass = cornerClasses[cornerRadius] || cornerClasses.medium;
  const tileBgClass = tileBgClasses[tileBg] || tileBgClasses.transparent;
  const objectFitClass = imageFit === 'contain' ? 'object-contain p-3 sm:p-4' : 'object-cover';

  const labelAlignClass = labelAlignment === 'left' ? 'text-left' : 'text-center';

  return (
    <TileWrapper {...wrapperProps} {...itemTag} className="group block">
      <div className={`relative ${aspectClass} ${cornerClass} ${tileBgClass} overflow-hidden`}>
        {image?.url && (
          <div {...t$['image']} className="absolute inset-0">
            <Image
              src={image.url}
              alt={image.title || tile.label || 'Product tile'}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
              className={`${objectFitClass} group-hover:scale-105 transition-transform duration-500`}
            />
          </div>
        )}

        {hasBadge && (
          <PriceBadge
            tile={tile}
            t$={t$}
            color={badgeColor}
            shape={badgeShape}
            position={badgePosition}
            backgroundStyle={backgroundStyle}
          />
        )}
      </div>

      {showLabels && tile.label && (
        <div
          {...t$['label']}
          className={`mt-2 md:mt-3 text-xs md:text-sm font-medium ${labelAlignClass} ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          {tile.label}
        </div>
      )}
    </TileWrapper>
  );
}

function PriceBadge({
  tile,
  t$,
  color,
  shape,
  position,
  backgroundStyle,
}: {
  tile: any;
  t$: Record<string, any>;
  color: string;
  shape: string;
  position: string;
  backgroundStyle: string;
}) {
  const colorClass = badgeColorClasses[color] || badgeColorClasses.teal;
  const holeClass = holeColorClasses[backgroundStyle] || holeColorClasses.white;

  const isPriceTag = shape === 'price_tag';
  const isPill = shape === 'pill';

  // Position classes — slight inset so badge "pins" inside the tile
  const positionClass =
    position === 'top_right'
      ? 'top-2 right-2 sm:top-3 sm:right-3'
      : 'top-2 left-2 sm:top-3 sm:left-3';

  // Shape classes
  const shapeClass = isPill
    ? 'rounded-full px-3 py-1.5'
    : isPriceTag
      ? 'rounded-md pl-4 pr-3 py-1.5 sm:pl-5 sm:pr-4 sm:py-2'
      : 'rounded-md px-3 py-1.5 sm:px-4 sm:py-2';

  return (
    <div
      className={`absolute ${positionClass} ${colorClass} ${shapeClass} shadow-sm flex items-stretch gap-1 sm:gap-1.5 z-10 select-none`}
    >
      {/* Price-tag punch hole — stylized as a small ring on the leading edge */}
      {isPriceTag && (
        <span
          aria-hidden
          className={`absolute top-1/2 -translate-y-1/2 ${
            position === 'top_right' ? 'right-1.5' : 'left-1.5'
          } w-1.5 h-1.5 rounded-full ${holeClass} ring-1 ring-black/10`}
        />
      )}

      {/* Left column: eyebrow + value (and prefix nestled with it) */}
      <div className={`flex flex-col ${isPriceTag && position === 'top_right' ? 'mr-3 sm:mr-4' : ''} ${isPriceTag && position === 'top_left' ? 'ml-2 sm:ml-3' : ''}`}>
        {tile.eyebrow && (
          <span
            {...t$['eyebrow']}
            className="text-[9px] sm:text-[10px] font-medium leading-none italic opacity-95 mb-0.5"
          >
            {tile.eyebrow}
          </span>
        )}
        <div className="flex items-baseline gap-0.5">
          {tile.prefix && (
            <span
              {...t$['prefix']}
              className="text-[10px] sm:text-xs font-bold leading-none self-start mt-0.5"
            >
              {tile.prefix}
            </span>
          )}
          {tile.value && (
            <span
              {...t$['value']}
              className="text-xl sm:text-2xl md:text-3xl font-bold leading-none tracking-tight"
            >
              {tile.value}
            </span>
          )}
        </div>
      </div>

      {/* Right column: suffix + sublabel stacked */}
      {(tile.suffix || tile.sublabel) && (
        <div className="flex flex-col justify-between py-0.5">
          {tile.suffix && (
            <span
              {...t$['suffix']}
              className="text-[10px] sm:text-xs font-bold leading-none"
            >
              {tile.suffix}
            </span>
          )}
          {tile.sublabel && (
            <span
              {...t$['sublabel']}
              className="text-[9px] sm:text-[10px] font-medium leading-none mt-auto opacity-95"
            >
              {tile.sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
