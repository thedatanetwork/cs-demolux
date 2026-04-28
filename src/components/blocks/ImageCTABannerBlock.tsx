'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type {
  ImageCTABannerBlock as ImageCTABannerBlockType,
  ImageCTAButton,
  CTAAnchor,
} from '@/lib/contentstack';

interface ImageCTABannerBlockProps {
  block: ImageCTABannerBlockType & { $?: Record<string, any> };
}

// Anchor placement system: each 9-zone anchor pins the CTA's *own* anchor
// point (computed via translate) to the corresponding point on the image.
// Editor offset_x / offset_y then nudge the CTA from there as a percentage
// of the image's width / height. This combines a fast rough placement with
// pixel-precise nudging without forcing editors to set absolute coords.
const ANCHORS: Record<CTAAnchor, { x: number; y: number; tx: number; ty: number }> = {
  top_left:      { x: 0,   y: 0,   tx: 0,    ty: 0    },
  top_center:    { x: 50,  y: 0,   tx: -50,  ty: 0    },
  top_right:     { x: 100, y: 0,   tx: -100, ty: 0    },
  middle_left:   { x: 0,   y: 50,  tx: 0,    ty: -50  },
  center:        { x: 50,  y: 50,  tx: -50,  ty: -50  },
  middle_right:  { x: 100, y: 50,  tx: -100, ty: -50  },
  bottom_left:   { x: 0,   y: 100, tx: 0,    ty: -100 },
  bottom_center: { x: 50,  y: 100, tx: -50,  ty: -100 },
  bottom_right:  { x: 100, y: 100, tx: -100, ty: -100 },
};

const VARIANT_CLASSES: Record<string, string> = {
  solid_dark:
    'bg-black text-white border border-transparent hover:bg-gray-800',
  solid_light:
    'bg-white text-gray-900 border border-transparent hover:bg-gray-100',
  outline_dark:
    'bg-transparent text-gray-900 border-2 border-gray-900 hover:bg-gray-900 hover:text-white',
  outline_light:
    'bg-transparent text-white border-2 border-white hover:bg-white hover:text-gray-900',
  pill_dark:
    'bg-black text-white border border-transparent rounded-full hover:bg-gray-800',
  pill_light:
    'bg-white text-gray-900 border border-transparent rounded-full hover:bg-gray-100',
  pill_outline_dark:
    'bg-transparent text-gray-900 border-2 border-gray-900 rounded-full hover:bg-gray-900 hover:text-white',
  pill_outline_light:
    'bg-transparent text-white border-2 border-white rounded-full hover:bg-white hover:text-gray-900',
  text_link:
    'bg-transparent text-current underline underline-offset-4 hover:opacity-80',
};

// Pill variants are already rounded-full; non-pill variants pick up a subtle
// rounded corner. text_link gets no rounding.
const NEEDS_DEFAULT_CORNER = (variant: string) =>
  !variant.startsWith('pill_') && variant !== 'text_link';

// Sizes are cqi-clamped so the CTA scales with the banner — same idea as the
// flash-sale block. Min/max keep it readable at extreme widths.
const SIZE_CLASSES: Record<string, string> = {
  sm:
    'text-[clamp(11px,1.2cqi,14px)] px-[clamp(8px,1.6cqi,18px)] py-[clamp(4px,0.7cqi,8px)]',
  md:
    'text-[clamp(13px,1.55cqi,18px)] px-[clamp(12px,2.2cqi,28px)] py-[clamp(6px,1cqi,12px)]',
  lg:
    'text-[clamp(15px,2cqi,22px)] px-[clamp(16px,2.8cqi,36px)] py-[clamp(8px,1.3cqi,16px)]',
  xl:
    'text-[clamp(18px,2.6cqi,28px)] px-[clamp(20px,3.4cqi,44px)] py-[clamp(10px,1.6cqi,20px)]',
};

const FONT_WEIGHT_CLASSES: Record<string, string> = {
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const BG_COLOR_CLASSES: Record<string, string> = {
  transparent: '',
  white: 'bg-white',
  black: 'bg-black',
  soft_gray: 'bg-gray-100',
};

const PRESET_ASPECT_RATIOS: Record<string, string> = {
  '21_9': '21 / 9',
  '16_9': '16 / 9',
  '5_2': '5 / 2',
  '4_3': '4 / 3',
  '3_1': '3 / 1',
  '2_1': '2 / 1',
};

function getImage(field?: any) {
  if (!field) return null;
  return Array.isArray(field) ? field[0] : field;
}

function computeCtaPositionStyle(
  position: CTAAnchor = 'bottom_center',
  offsetX = 0,
  offsetY = 0,
): React.CSSProperties {
  const a = ANCHORS[position] || ANCHORS.bottom_center;
  return {
    position: 'absolute',
    left: `${a.x + offsetX}%`,
    top: `${a.y + offsetY}%`,
    transform: `translate(${a.tx}%, ${a.ty}%)`,
  };
}

function resolveAspectRatio(
  setting: ImageCTABannerBlockType['aspect_ratio'],
  custom: string | undefined,
  imageWidth: number | undefined,
  imageHeight: number | undefined,
): string | undefined {
  if (setting === 'custom' && custom) {
    return custom.replace(':', '/');
  }
  if (setting && setting !== 'image_natural' && PRESET_ASPECT_RATIOS[setting]) {
    return PRESET_ASPECT_RATIOS[setting];
  }
  if (imageWidth && imageHeight) {
    return `${imageWidth} / ${imageHeight}`;
  }
  // Fallback wide-banner ratio if the asset metadata isn't present
  return '21 / 9';
}

export function ImageCTABannerBlock({ block }: ImageCTABannerBlockProps) {
  const {
    image,
    image_alt,
    image_object_fit = 'cover',
    aspect_ratio = 'image_natural',
    custom_aspect_ratio,
    background_color = 'transparent',
    link_url,
    ctas = [],
  } = block;

  const $ = block.$ || {};
  const img = getImage(image);

  if (!img?.url) return null;

  // Contentstack assets expose width/height under `dimension`; some SDK
  // shapes return `width`/`height` directly. Try both.
  const imgWidth: number | undefined = img.dimension?.width ?? img.width;
  const imgHeight: number | undefined = img.dimension?.height ?? img.height;

  const aspectRatio = resolveAspectRatio(
    aspect_ratio,
    custom_aspect_ratio,
    imgWidth,
    imgHeight,
  );
  const bgClass = BG_COLOR_CLASSES[background_color] || BG_COLOR_CLASSES.transparent;
  const objectFitClass = image_object_fit === 'contain' ? 'object-contain' : 'object-cover';

  const Wrapper: React.ElementType = link_url ? Link : 'div';
  const wrapperProps = link_url ? { href: link_url } : {};

  return (
    <section
      // [container-type:inline-size] activates cqi units so CTA sizing scales
      // with the banner's own width regardless of viewport breakpoints.
      className={`relative w-full overflow-hidden [container-type:inline-size] ${bgClass}`}
    >
      <Wrapper {...wrapperProps} className="relative block w-full">
        <div className="relative w-full" style={{ aspectRatio }}>
          <Image
            {...$['image']}
            src={img.url}
            alt={image_alt || img.title || ''}
            fill
            sizes="100vw"
            className={objectFitClass}
            priority={false}
          />
          {ctas.map((cta, index) => (
            <CTAOverlay
              key={cta._metadata?.uid || index}
              cta={cta}
              parentLinked={Boolean(link_url)}
            />
          ))}
        </div>
      </Wrapper>
    </section>
  );
}

interface CTAOverlayProps {
  cta: ImageCTAButton & { $?: Record<string, any> };
  parentLinked: boolean;
}

function CTAOverlay({ cta, parentLinked }: CTAOverlayProps) {
  const c$ = (cta as any).$ || {};
  const {
    label,
    url,
    position = 'bottom_center',
    offset_x = 0,
    offset_y = 0,
    variant = 'solid_dark',
    size = 'md',
    font_weight = 'semibold',
    uppercase,
    open_in_new_tab,
  } = cta;

  if (!label) return null;

  const positionStyle = computeCtaPositionStyle(position, offset_x, offset_y);
  const variantClass = VARIANT_CLASSES[variant] || VARIANT_CLASSES.solid_dark;
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const fontWeightClass = FONT_WEIGHT_CLASSES[font_weight] || FONT_WEIGHT_CLASSES.semibold;
  const cornerClass = NEEDS_DEFAULT_CORNER(variant) ? 'rounded-md' : '';
  const caseClass = uppercase ? 'uppercase tracking-wide' : '';

  const className = `inline-flex items-center justify-center whitespace-nowrap leading-none transition-colors duration-150 select-none ${variantClass} ${sizeClass} ${fontWeightClass} ${cornerClass} ${caseClass}`;

  // If the parent banner is already wrapped in a link, render the CTA as a
  // styled span so we don't nest <a> tags. The visual stays the same and the
  // outer link still works for click-through.
  if (!url || parentLinked) {
    return (
      <span {...c$} style={positionStyle} className={className}>
        {label}
      </span>
    );
  }

  const linkProps: Record<string, any> = { href: url };
  if (open_in_new_tab) {
    linkProps.target = '_blank';
    linkProps.rel = 'noopener noreferrer';
  }

  return (
    <Link {...linkProps} {...c$} style={positionStyle} className={className}>
      {label}
    </Link>
  );
}
