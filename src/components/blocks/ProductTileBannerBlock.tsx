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
  tight: 'gap-x-3 gap-y-6 md:gap-x-4 md:gap-y-8',
  normal: 'gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10',
  loose: 'gap-x-6 gap-y-10 md:gap-x-10 md:gap-y-14',
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

// Tile caption sizes — 'lg' is the new default (previous default was sm/base
// and read too small at typical browsing distance).
const LABEL_SIZE_CLASSES: Record<string, string> = {
  sm: 'text-sm md:text-base',
  md: 'text-base md:text-lg',
  lg: 'text-lg md:text-xl',
  xl: 'text-xl md:text-2xl',
  '2xl': 'text-2xl md:text-3xl',
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
    tile_label_size = 'lg',
    gap_size = 'normal',
    badge_size = 'medium',
    badge_angle = 'tilt_left',
    badge_font_scale = 'md',
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
              badgeFontScale={badge_font_scale}
              aspectRatio={tile_aspect_ratio}
              imageFit={tile_image_fit}
              tileBg={tile_background}
              cornerRadius={corner_radius}
              labelAlignment={label_alignment}
              labelSize={tile_label_size}
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
  badgeFontScale: string;
  aspectRatio: string;
  imageFit: string;
  tileBg: string;
  cornerRadius: string;
  labelAlignment: string;
  labelSize: string;
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
  badgeFontScale,
  aspectRatio,
  imageFit,
  tileBg,
  cornerRadius,
  labelAlignment,
  labelSize,
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
  const isBannerNotchShape = badgeShape === 'banner_notch';

  return (
    <TileWrapper {...wrapperProps} {...itemTag} className="group block [container-type:inline-size]">
      {isBannerNotchShape && hasBadge && (
        <PriceBadge
          tile={tile}
          t$={t$}
          color={badgeColor}
          shape={badgeShape}
          position={badgePosition}
          size={badgeSize}
          angle={badgeAngle}
          fontScale={badgeFontScale}
        />
      )}
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

        {hasBadge && !isBannerNotchShape && (
          <PriceBadge
            tile={tile}
            t$={t$}
            color={badgeColor}
            shape={badgeShape}
            position={badgePosition}
            size={badgeSize}
            angle={badgeAngle}
            fontScale={badgeFontScale}
          />
        )}
      </div>

      {showLabels && tile.label && (
        <div
          {...t$['label']}
          className={`mt-3 md:mt-4 ${LABEL_SIZE_CLASSES[labelSize] || LABEL_SIZE_CLASSES.lg} font-medium ${labelAlignClass} ${
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
const NOTCH_WIDTH = 19; // px of the arrow notch
const HOLE_RADIUS = 4;
const HOLE_INSET = 14; // px from the leading edge to the hole center (inside the arrow tip)
const HOLE_MASK_LEFT = `radial-gradient(circle ${HOLE_RADIUS}px at ${HOLE_INSET}px 50%, transparent 99%, #000 100%)`;
const HOLE_MASK_RIGHT = `radial-gradient(circle ${HOLE_RADIUS}px at calc(100% - ${HOLE_INSET}px) 50%, transparent 99%, #000 100%)`;
const ARROW_CLIP_LEFT = `polygon(${NOTCH_WIDTH}px 0, 100% 0, 100% 100%, ${NOTCH_WIDTH}px 100%, 0 50%)`;
const ARROW_CLIP_RIGHT = `polygon(0 0, calc(100% - ${NOTCH_WIDTH}px) 0, 100% 50%, calc(100% - ${NOTCH_WIDTH}px) 100%, 0 100%)`;

// Circular tag — round badge that hangs from a hole punched near the top edge.
// Hole sits ~10% in from the top so the tag dangles like a coat-check token.
const CIRCLE_HOLE_RADIUS = 4;
const CIRCLE_CLIP = 'circle(50% at 50% 50%)';
const CIRCLE_HOLE_MASK = `radial-gradient(circle ${CIRCLE_HOLE_RADIUS}px at 50% 11%, transparent 99%, #000 100%)`;

// Burst tag — JCP-style starburst silhouette built from a 16-point polygon
// alternating outer (peak) and inner (valley) radii. Centered at 50%/50%.
// Outer points sit at radius 50%, inner valleys at ~38% — gives crisp peaks
// without making the inner edge look ragged. Generated once at module load.
function buildBurstClipPath(points = 16, outer = 50, inner = 38) {
  const coords: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI * 2 * i) / (points * 2) - Math.PI / 2; // start at 12 o'clock
    const x = 50 + r * Math.cos(angle);
    const y = 50 + r * Math.sin(angle);
    coords.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
  }
  return `polygon(${coords.join(', ')})`;
}
const BURST_CLIP = buildBurstClipPath();

// Banner-notch — JCP-style banner: rectangle with a downward V-notch cut into
// the bottom-center. Renders in-flow ABOVE the image: the rectangular portion
// extends the tile upward, while only the chevron tabs overhang into the
// image. The V-peak is pinned to the image's top edge via calc() — the bottom
// `--banner-chevron` of the badge is what overlaps the image, and a matching
// negative margin-bottom pulls subsequent layout up so only that strip covers
// the photo.
const BANNER_NOTCH_CHEVRON = 'clamp(36px, 14cqi, 100px)';
const BANNER_NOTCH_CLIP = `polygon(0% 0%, 100% 0%, 100% 100%, 50% calc(100% - var(--banner-chevron)), 0% 100%)`;

// Per-size tokens. Padding is explicit pl/pr so Tailwind class ordering
// doesn't trip on px-* vs pl-* conflicts.
const SIZE_TOKENS: Record<string, {
  py: string;
  notchLeftPad: string; // notch on left:  large pl-, small pr-
  notchRightPad: string; // notch on right: small pl-, large pr-
  rectPad: string; // for non-priceTag shapes
  roundSize: string; // square min dimensions for circle/burst shapes
  eyebrow: string;
  prefix: string;
  value: string;
  suffix: string;
  sublabel: string;
  eyebrowGap: string;
  colGap: string;
}> = {
  small: {
    py: 'py-2',
    notchLeftPad: 'pl-7 sm:pl-8 pr-3',
    notchRightPad: 'pl-3 pr-7 sm:pr-8',
    rectPad: 'pl-3 pr-3',
    roundSize: 'min-w-[72px] min-h-[72px] px-2',
    eyebrow: 'text-[clamp(9px,3cqi,12px)]',
    prefix: 'text-[clamp(10px,3.5cqi,14px)]',
    value: 'text-[clamp(18px,9cqi,30px)]',
    suffix: 'text-[clamp(10px,3.5cqi,14px)]',
    sublabel: 'text-[clamp(9px,3cqi,12px)]',
    eyebrowGap: 'mb-0',
    colGap: 'gap-px',
  },
  medium: {
    py: 'py-2.5',
    notchLeftPad: 'pl-8 sm:pl-9 pr-4',
    notchRightPad: 'pl-4 pr-8 sm:pr-9',
    rectPad: 'pl-4 pr-4',
    roundSize: 'min-w-[96px] min-h-[96px] px-3',
    eyebrow: 'text-[clamp(11px,4cqi,16px)]',
    prefix: 'text-[clamp(12px,5cqi,18px)]',
    value: 'text-[clamp(22px,13cqi,44px)]',
    suffix: 'text-[clamp(12px,5cqi,18px)]',
    sublabel: 'text-[clamp(11px,4cqi,15px)]',
    eyebrowGap: 'mb-0.5',
    colGap: 'gap-0.5',
  },
  large: {
    py: 'py-3.5',
    notchLeftPad: 'pl-9 sm:pl-11 pr-5',
    notchRightPad: 'pl-5 pr-9 sm:pr-11',
    rectPad: 'pl-5 pr-5',
    roundSize: 'min-w-[124px] min-h-[124px] px-4',
    eyebrow: 'text-[clamp(13px,4.5cqi,18px)]',
    prefix: 'text-[clamp(14px,5.5cqi,20px)]',
    value: 'text-[clamp(26px,16cqi,54px)]',
    suffix: 'text-[clamp(14px,5.5cqi,20px)]',
    sublabel: 'text-[clamp(13px,4.5cqi,18px)]',
    eyebrowGap: 'mb-1',
    colGap: 'gap-1',
  },
};

const ANGLE_TRANSFORMS: Record<string, string> = {
  straight: 'rotate(0deg)',
  tilt_left: 'rotate(-7deg)',
  tilt_right: 'rotate(7deg)',
};

// Multiplier applied via transform: scale() so it stacks cleanly with rotation.
// Scales the entire badge silhouette: text, padding, notch, hole.
const FONT_SCALE_MULTIPLIERS: Record<string, number> = {
  xs: 0.7,
  sm: 0.85,
  md: 1.0,
  lg: 1.2,
  xl: 1.4,
  '2xl': 1.65,
};

function PriceBadge({
  tile,
  t$,
  color,
  shape,
  position,
  size,
  angle,
  fontScale,
}: {
  tile: any;
  t$: Record<string, any>;
  color: string;
  shape: string;
  position: string;
  size: string;
  angle: string;
  fontScale: string;
}) {
  const colorClass = badgeColorClasses[color] || badgeColorClasses.teal;
  const tokens = SIZE_TOKENS[size] || SIZE_TOKENS.medium;
  const isPriceTag = shape === 'price_tag';
  // Only the price-tag silhouette tilts — rectangle/pill/circle/burst stay level
  // even if an angle is selected, so the badge keeps a deliberate look.
  const rotateTransform = isPriceTag
    ? (ANGLE_TRANSFORMS[angle] || ANGLE_TRANSFORMS.straight)
    : 'rotate(0deg)';
  const scaleMultiplier = FONT_SCALE_MULTIPLIERS[fontScale] ?? 1.0;
  const isPill = shape === 'pill';
  const isCircle = shape === 'circle_tag';
  const isBurst = shape === 'burst_tag';
  const isBannerNotch = shape === 'banner_notch';
  const isRound = isCircle || isBurst;
  // banner_notch always renders as a full-width top ribbon — it ignores both
  // position and angle so it locks to the top of the tile like the JCP layout.
  const isCentered = !isBannerNotch && position === 'center';
  const onRight = !isBannerNotch && position === 'top_right';

  // Position classes — banner_notch spans the full top edge; centered pins
  // to TOP-center (horizontally centered, top-anchored, just like the corner
  // positions but in the middle); corners pin a slight inset.
  const positionClass = isBannerNotch
    ? 'top-0 inset-x-0'
    : isCentered
      ? 'top-2 left-1/2 sm:top-3'
      : onRight
        ? 'top-2 right-2 sm:top-3 sm:right-3'
        : 'top-2 left-2 sm:top-3 sm:left-3';

  // Shape classes — extra padding on the leading side hosts the notch + hole;
  // clip-path shapes (price_tag, burst, circle) skip border-radius; circle and
  // burst use a square min-size and center their content.
  const shapeClass = isPill
    ? `rounded-full ${tokens.rectPad} ${tokens.py}`
    : isPriceTag
      ? `${onRight ? tokens.notchRightPad : tokens.notchLeftPad} ${tokens.py}`
      : isRound
        ? `${tokens.roundSize} ${tokens.py} items-center justify-center text-center`
        : isBannerNotch
          ? 'w-full px-4 sm:px-6 pt-3 sm:pt-4 items-center justify-start text-center'
          : `rounded-md ${tokens.rectPad} ${tokens.py}`;

  // clip-path silhouette + (for circle) transparent punch hole. drop-shadow
  // honors both so the shadow follows the visible tag shape.
  let tagStyle: React.CSSProperties | undefined;
  if (isPriceTag) {
    const clip = onRight ? ARROW_CLIP_RIGHT : ARROW_CLIP_LEFT;
    const mask = onRight ? HOLE_MASK_RIGHT : HOLE_MASK_LEFT;
    tagStyle = { clipPath: clip, WebkitClipPath: clip, WebkitMaskImage: mask, maskImage: mask };
  } else if (isCircle) {
    tagStyle = {
      clipPath: CIRCLE_CLIP,
      WebkitClipPath: CIRCLE_CLIP,
      WebkitMaskImage: CIRCLE_HOLE_MASK,
      maskImage: CIRCLE_HOLE_MASK,
    };
  } else if (isBurst) {
    tagStyle = { clipPath: BURST_CLIP, WebkitClipPath: BURST_CLIP };
  } else if (isBannerNotch) {
    tagStyle = {
      clipPath: BANNER_NOTCH_CLIP,
      WebkitClipPath: BANNER_NOTCH_CLIP,
      paddingBottom: 'var(--banner-chevron)',
    };
  }

  const hasSuffixCol = Boolean(tile.suffix || tile.sublabel);

  // Transform origin governs both rotation pivot and scale anchor. Corner-
  // anchored shapes (rectangle, pill, circle, burst) anchor at the inset
  // corner so any fontScale > 1 expands INTO the tile rather than leaking
  // past the inset and getting clipped by the tile's overflow:hidden.
  // price_tag uses the hole position so the tag swings from its "string".
  const transformOrigin = isBannerNotch
    ? '50% 0%'
    : isCentered
      ? '50% 50%'
      : isPriceTag
        ? onRight
          ? `calc(100% - ${HOLE_INSET}px) 50%`
          : `${HOLE_INSET}px 50%`
        : onRight
          ? '100% 0%'
          : '0% 0%';

  // Compose final transform. Centered badges need translate(-50%,-50%) so they
  // sit at the tile midpoint regardless of their own size; rotation and scale
  // stack on top. banner_notch is full-width and locked, so no transforms.
  const transformParts = isBannerNotch
    ? []
    : [
        isCentered ? 'translate(-50%, -50%)' : '',
        rotateTransform,
        scaleMultiplier !== 1 ? `scale(${scaleMultiplier})` : '',
      ].filter(Boolean);
  const transform = transformParts.join(' ');

  const outerStyle: React.CSSProperties = isBannerNotch
    ? {
        // CSS var drives both the bottom padding (chevron strip inside the
        // banner element) and the negative margin-bottom (pulls the image up
        // so only that chevron strip overlaps the photo). Defined here so the
        // value is shared by tagStyle and the outer wrapper.
        ['--banner-chevron' as any]: BANNER_NOTCH_CHEVRON,
        marginBottom: 'calc(-1 * var(--banner-chevron))',
        filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.22))',
      }
    : {
        filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.22))',
        transform,
        transformOrigin,
      };

  const outerClassName = isBannerNotch
    ? 'relative z-10 select-none'
    : `absolute ${positionClass} z-10 select-none`;

  return (
    <div
      style={outerStyle}
      className={outerClassName}
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
