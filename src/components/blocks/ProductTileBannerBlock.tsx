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
    badge_size = 'medium',
    badge_angle = 'tilt_left',
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
              badgeSize={badge_size}
              badgeAngle={badge_angle}
              aspectRatio={tile_aspect_ratio}
              imageFit={tile_image_fit}
              tileBg={tile_background}
              cornerRadius={corner_radius}
              labelAlignment={label_alignment}
              showLabels={show_labels !== false}
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
  badgeSize: string;
  badgeAngle: string;
  aspectRatio: string;
  imageFit: string;
  tileBg: string;
  cornerRadius: string;
  labelAlignment: string;
  showLabels: boolean;
  isDark: boolean;
  itemTag: Record<string, any>;
}

function ProductTile({
  tile,
  badgeColor,
  badgeShape,
  badgePosition,
  badgeSize,
  badgeAngle,
  aspectRatio,
  imageFit,
  tileBg,
  cornerRadius,
  labelAlignment,
  showLabels,
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
            size={badgeSize}
            angle={badgeAngle}
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

// Price-tag silhouette:
//   - clip-path polygon carves an arrow notch on the leading edge
//   - mask-image radial-gradient punches a real circular hole through the tag
// Both use absolute pixel offsets so the notch and hole stay crisp regardless
// of how wide the badge gets. The hole is parked between the notch and the
// content padding so it always sits in the body of the tag, not in the notch.
const NOTCH_WIDTH = 14; // px of the arrow notch
const HOLE_RADIUS = 3;
const HOLE_INSET = 10; // px from the leading edge to the hole center (inside the arrow tip)
const HOLE_MASK_LEFT = `radial-gradient(circle ${HOLE_RADIUS}px at ${HOLE_INSET}px 50%, transparent 99%, #000 100%)`;
const HOLE_MASK_RIGHT = `radial-gradient(circle ${HOLE_RADIUS}px at calc(100% - ${HOLE_INSET}px) 50%, transparent 99%, #000 100%)`;
const ARROW_CLIP_LEFT = `polygon(${NOTCH_WIDTH}px 0, 100% 0, 100% 100%, ${NOTCH_WIDTH}px 100%, 0 50%)`;
const ARROW_CLIP_RIGHT = `polygon(0 0, calc(100% - ${NOTCH_WIDTH}px) 0, 100% 50%, calc(100% - ${NOTCH_WIDTH}px) 100%, 0 100%)`;

// Per-size tokens. Padding is explicit pl/pr so Tailwind class ordering
// doesn't trip on px-* vs pl-* conflicts.
const SIZE_TOKENS: Record<string, {
  py: string;
  notchLeftPad: string; // notch on left:  large pl-, small pr-
  notchRightPad: string; // notch on right: small pl-, large pr-
  rectPad: string; // for non-priceTag shapes
  eyebrow: string;
  prefix: string;
  value: string;
  suffix: string;
  sublabel: string;
  eyebrowGap: string;
  colGap: string;
}> = {
  small: {
    py: 'py-1.5',
    notchLeftPad: 'pl-5 sm:pl-6 pr-2.5',
    notchRightPad: 'pl-2.5 pr-5 sm:pr-6',
    rectPad: 'pl-2.5 pr-2.5',
    eyebrow: 'text-[9px] sm:text-[10px]',
    prefix: 'text-[10px] sm:text-xs',
    value: 'text-xl sm:text-2xl',
    suffix: 'text-[10px] sm:text-xs',
    sublabel: 'text-[9px] sm:text-[10px]',
    eyebrowGap: 'mb-0.5',
    colGap: 'gap-0.5',
  },
  medium: {
    py: 'py-2',
    notchLeftPad: 'pl-6 sm:pl-7 pr-3',
    notchRightPad: 'pl-3 pr-6 sm:pr-7',
    rectPad: 'pl-3 pr-3',
    eyebrow: 'text-[11px] sm:text-xs',
    prefix: 'text-sm',
    value: 'text-[28px] sm:text-[32px]',
    suffix: 'text-sm',
    sublabel: 'text-[10px] sm:text-[11px]',
    eyebrowGap: 'mb-1',
    colGap: 'gap-1',
  },
  large: {
    py: 'py-2.5',
    notchLeftPad: 'pl-7 sm:pl-8 pr-3.5',
    notchRightPad: 'pl-3.5 pr-7 sm:pr-8',
    rectPad: 'pl-3.5 pr-3.5',
    eyebrow: 'text-xs sm:text-sm',
    prefix: 'text-base',
    value: 'text-[34px] sm:text-[40px]',
    suffix: 'text-base',
    sublabel: 'text-xs',
    eyebrowGap: 'mb-1.5',
    colGap: 'gap-1.5',
  },
};

const ANGLE_TRANSFORMS: Record<string, string> = {
  straight: 'rotate(0deg)',
  tilt_left: 'rotate(-7deg)',
  tilt_right: 'rotate(7deg)',
};

function PriceBadge({
  tile,
  t$,
  color,
  shape,
  position,
  size,
  angle,
}: {
  tile: any;
  t$: Record<string, any>;
  color: string;
  shape: string;
  position: string;
  size: string;
  angle: string;
}) {
  const colorClass = badgeColorClasses[color] || badgeColorClasses.teal;
  const tokens = SIZE_TOKENS[size] || SIZE_TOKENS.medium;
  const transform = ANGLE_TRANSFORMS[angle] || ANGLE_TRANSFORMS.straight;

  const isPriceTag = shape === 'price_tag';
  const isPill = shape === 'pill';
  const onRight = position === 'top_right';

  // Position classes — slight inset so badge "pins" inside the tile.
  // Origin matches the rotation pivot (the tip of the arrow on the leading edge).
  const positionClass = onRight
    ? 'top-2 right-2 sm:top-3 sm:right-3'
    : 'top-2 left-2 sm:top-3 sm:left-3';

  // Shape classes — extra padding on the leading side hosts the notch + hole;
  // price_tag shape is defined by clip-path so we skip border-radius on it.
  const shapeClass = isPill
    ? `rounded-full ${tokens.rectPad} ${tokens.py}`
    : isPriceTag
      ? `${onRight ? tokens.notchRightPad : tokens.notchLeftPad} ${tokens.py}`
      : `rounded-md ${tokens.rectPad} ${tokens.py}`;

  // Real notched silhouette + transparent punch hole. drop-shadow honors both
  // clip-path and mask alpha so the shadow follows the visible tag shape.
  const tagStyle = isPriceTag
    ? {
        clipPath: onRight ? ARROW_CLIP_RIGHT : ARROW_CLIP_LEFT,
        WebkitClipPath: onRight ? ARROW_CLIP_RIGHT : ARROW_CLIP_LEFT,
        WebkitMaskImage: onRight ? HOLE_MASK_RIGHT : HOLE_MASK_LEFT,
        maskImage: onRight ? HOLE_MASK_RIGHT : HOLE_MASK_LEFT,
      }
    : undefined;

  const hasSuffixCol = Boolean(tile.suffix || tile.sublabel);

  // Pivot rotation around the leading edge so the tag swings from the "string"
  // (the punch hole) rather than from the center, matching how a real paper
  // tag dangles. Origin: hole position on leading edge.
  const transformOrigin = onRight
    ? `calc(100% - ${HOLE_INSET}px) 50%`
    : `${HOLE_INSET}px 50%`;

  return (
    <div
      style={{
        filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.22))',
        transform,
        transformOrigin,
      }}
      className={`absolute ${positionClass} z-10 select-none`}
    >
      <div
        style={tagStyle}
        className={`${colorClass} ${shapeClass} flex flex-col`}
      >
        {/* Eyebrow row — centered above the value */}
        {tile.eyebrow && (
          <span
            {...t$['eyebrow']}
            className={`${tokens.eyebrow} font-semibold leading-none italic text-center ${tokens.eyebrowGap} opacity-95`}
          >
            {tile.eyebrow}
          </span>
        )}

        {/* Value row — prefix top-left, big value, suffix top-right with sublabel underneath */}
        <div className={`flex items-stretch ${hasSuffixCol || tile.prefix ? tokens.colGap : ''} justify-center`}>
          {tile.prefix && (
            <span
              {...t$['prefix']}
              className={`${tokens.prefix} font-bold leading-none self-start`}
            >
              {tile.prefix}
            </span>
          )}
          {tile.value && (
            <span
              {...t$['value']}
              className={`${tokens.value} font-bold leading-none tracking-tight`}
            >
              {tile.value}
            </span>
          )}
          {hasSuffixCol && (
            <div className="flex flex-col justify-between leading-none">
              {tile.suffix && (
                <span
                  {...t$['suffix']}
                  className={`${tokens.suffix} font-bold leading-none`}
                >
                  {tile.suffix}
                </span>
              )}
              {tile.sublabel && (
                <span
                  {...t$['sublabel']}
                  className={`${tokens.sublabel} font-medium leading-none italic opacity-95`}
                >
                  {tile.sublabel}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
