'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { FlashSaleBannerBlock as FlashSaleBannerBlockType } from '@/lib/contentstack';

interface FlashSaleBannerBlockProps {
  block: FlashSaleBannerBlockType & { $?: Record<string, any> };
}

const backgroundColorClasses: Record<string, string> = {
  black: 'bg-black',
  navy: 'bg-slate-900',
  red: 'bg-red-700',
  orange: 'bg-orange-500',
  white: 'bg-white',
  transparent: 'bg-transparent',
};

const tagColorClasses: Record<string, string> = {
  orange: 'bg-orange-500 text-white',
  red: 'bg-red-600 text-white',
  gold: 'bg-amber-500 text-gray-900',
  navy: 'bg-slate-800 text-white',
  teal: 'bg-teal-700 text-white',
};

const heightClasses: Record<string, string> = {
  compact: 'py-3 sm:py-4',
  standard: 'py-5 sm:py-6 md:py-7',
  tall: 'py-7 sm:py-9 md:py-12',
};

const weightClasses: Record<string, string> = {
  regular: 'font-normal',
  medium: 'font-medium',
  bold: 'font-bold',
};

const styleClasses: Record<string, string> = {
  normal: 'not-italic',
  italic: 'italic',
};

function getImage(field?: { url?: string; title?: string } | { url?: string; title?: string }[]) {
  if (!field) return null;
  return Array.isArray(field) ? field[0] : field;
}

export function FlashSaleBannerBlock({ block }: FlashSaleBannerBlockProps) {
  const {
    eyebrow_tag,
    eyebrow_tag_color = 'orange',
    title_lead,
    title_lead_weight = 'bold',
    title_lead_style = 'normal',
    title_middle,
    title_middle_weight = 'regular',
    title_middle_style = 'italic',
    title_tail,
    title_tail_weight = 'bold',
    title_tail_style = 'normal',
    discount_callouts = [],
    disclaimer,
    disclaimer_link_text,
    disclaimer_link_url,
    left_icon,
    right_image,
    background_color = 'black',
    background_image,
    text_color = 'light',
    cta_link_url,
    height = 'standard',
  } = block;

  const $ = block.$ || {};

  const leftIcon = getImage(left_icon);
  const rightImage = getImage(right_image);
  const bgImage = getImage(background_image);

  const isLight = text_color === 'light';
  // Globals.css applies text-gray-900 to all h1-h6, so the heading color must
  // be set explicitly (not just inherited from the wrapper).
  const textBaseClass = isLight ? 'text-white' : 'text-gray-900';
  const disclaimerColorClass = isLight ? 'text-white/85' : 'text-gray-700';
  const linkColorClass = isLight
    ? 'text-white underline decoration-white/70 underline-offset-2'
    : 'text-gray-900 underline decoration-gray-500 underline-offset-2';

  const bgClass = backgroundColorClasses[background_color] || backgroundColorClasses.black;
  const heightClass = heightClasses[height] || heightClasses.standard;

  const Wrapper: React.ElementType = cta_link_url ? Link : 'section';
  const wrapperProps = cta_link_url ? { href: cta_link_url } : {};

  return (
    <Wrapper
      {...wrapperProps}
      // [container-type:inline-size] activates `cqi` units so type/icon/spacing
      // scale with the banner's own width — same trick the product tile badges
      // use. overflow-hidden lets the bolt bleed off top/bottom edges cleanly.
      className={`relative block w-full overflow-hidden [container-type:inline-size] ${bgClass} ${textBaseClass}`}
    >
      {bgImage?.url && (
        <div className="absolute inset-0 z-0" {...$['background_image']}>
          <Image
            src={bgImage.url}
            alt={bgImage.title || ''}
            fill
            sizes="100vw"
            className="object-cover"
            priority={false}
          />
        </div>
      )}

      {eyebrow_tag && (
        <div
          {...$['eyebrow_tag']}
          className={`absolute top-0 left-0 z-20 inline-flex items-center px-3 py-1 text-[clamp(10px,1.4cqi,14px)] font-bold uppercase tracking-[0.04em] ${
            tagColorClasses[eyebrow_tag_color] || tagColorClasses.orange
          }`}
        >
          {eyebrow_tag}
        </div>
      )}

      {/* Bolt: anchored to the left, sized larger than the banner so the
          tail bleeds off the bottom edge (overflow-hidden on the wrapper
          clips it cleanly). Both the CMS asset path and the SVG fallback
          share the same container so they render at identical scale. */}
      <div
        {...(leftIcon?.url ? $['left_icon'] : {})}
        className="absolute left-[clamp(8px,1.5cqi,32px)] top-1/2 -translate-y-1/2 z-10 h-[clamp(110px,22cqi,260px)] w-[clamp(60px,12cqi,140px)] pointer-events-none"
      >
        {leftIcon?.url ? (
          <Image
            src={leftIcon.url}
            alt={leftIcon.title || ''}
            fill
            sizes="160px"
            className="object-contain"
          />
        ) : (
          <DefaultBoltIcon />
        )}
      </div>

      <div className={`relative z-10 container-padding ${heightClass}`}>
        {/* The bolt occupies a reserved chunk of left padding so the rest of
            the row centers cleanly beside it instead of crashing into it. */}
        <div className="flex flex-wrap items-center justify-center gap-x-[clamp(16px,3cqi,56px)] gap-y-3 pl-[clamp(70px,14cqi,170px)]">
          <Headline
            $={$}
            lead={title_lead}
            leadWeight={title_lead_weight}
            leadStyle={title_lead_style}
            middle={title_middle}
            middleWeight={title_middle_weight}
            middleStyle={title_middle_style}
            tail={title_tail}
            tailWeight={title_tail_weight}
            tailStyle={title_tail_style}
            colorClass={textBaseClass}
          />

          {discount_callouts.length > 0 && (
            <div
              {...$['discount_callouts']}
              className="flex items-center gap-x-[clamp(8px,1.6cqi,24px)]"
            >
              {discount_callouts.map((callout, index) => (
                <React.Fragment key={callout._metadata?.uid || index}>
                  {index > 0 && (
                    <span
                      aria-hidden
                      className="font-extrabold leading-none text-[clamp(28px,5.5cqi,68px)] -mx-1"
                    >
                      +
                    </span>
                  )}
                  <DiscountCallout callout={callout} />
                </React.Fragment>
              ))}
            </div>
          )}

          {(disclaimer || disclaimer_link_text) && (
            <div
              className={`text-[clamp(9px,1.05cqi,12px)] leading-[1.15] max-w-[12ch] font-medium ${disclaimerColorClass}`}
            >
              {disclaimer && <span {...$['disclaimer']}>{disclaimer}</span>}
              {disclaimer_link_text && (
                disclaimer_link_url ? (
                  <Link
                    href={disclaimer_link_url}
                    {...$['disclaimer_link_text']}
                    className={`block ${linkColorClass}`}
                  >
                    {disclaimer_link_text}
                  </Link>
                ) : (
                  <span {...$['disclaimer_link_text']} className={`block ${linkColorClass}`}>
                    {disclaimer_link_text}
                  </span>
                )
              )}
            </div>
          )}

          {rightImage?.url && (
            <div
              {...$['right_image']}
              className="relative shrink-0 h-[clamp(56px,11cqi,140px)] w-[clamp(96px,18cqi,220px)]"
            >
              <Image
                src={rightImage.url}
                alt={rightImage.title || ''}
                fill
                sizes="220px"
                className="object-contain"
              />
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
}

// ----- Headline -----------------------------------------------------------
// Each part of the composite headline is rendered as its own little span so
// the editor's per-part weight + italic settings can be dialed in without
// the parts bleeding into one another. Tight tracking + leading reproduces
// the JCP-style "JewelryFlashSale" run-together look without manual kerning.
function Headline({
  $,
  lead,
  leadWeight,
  leadStyle,
  middle,
  middleWeight,
  middleStyle,
  tail,
  tailWeight,
  tailStyle,
  colorClass,
}: {
  $: Record<string, any>;
  lead?: string;
  leadWeight: string;
  leadStyle: string;
  middle?: string;
  middleWeight: string;
  middleStyle: string;
  tail?: string;
  tailWeight: string;
  tailStyle: string;
  colorClass: string;
}) {
  if (!lead && !middle && !tail) return null;

  const partClass = (weight: string, style: string) =>
    `${weightClasses[weight] || weightClasses.bold} ${styleClasses[style] || styleClasses.normal}`;

  return (
    <h2
      className={`font-sans leading-[0.95] tracking-[-0.025em] text-[clamp(34px,7.4cqi,92px)] whitespace-nowrap ${colorClass}`}
    >
      {lead && (
        <span {...$['title_lead']} className={partClass(leadWeight, leadStyle)}>
          {lead}
        </span>
      )}
      {middle && (
        <span {...$['title_middle']} className={partClass(middleWeight, middleStyle)}>
          {middle}
        </span>
      )}
      {tail && (
        <span {...$['title_tail']} className={partClass(tailWeight, tailStyle)}>
          {tail}
        </span>
      )}
    </h2>
  );
}

// ----- Default bolt icon --------------------------------------------------
// Outline (stroke, not fill) so the orange reads as a graphic accent rather
// than a chunky fill. Stroke width is set in viewBox units so it scales
// proportionally with the icon size. Lightning-bolt path is the standard
// 7-vertex polygon used in Lucide's Zap icon.
function DefaultBoltIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-full w-full text-orange-500"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinejoin="round"
      strokeLinecap="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

// ----- Discount callout ---------------------------------------------------
// Layout pattern borrowed from the ProductTileBanner PriceBadge:
//   - row uses items-stretch so the right column matches the value's height
//   - right column is a flex-col with justify-between, putting eyebrow at
//     the top, unit in the middle, and suffix at the bottom — together they
//     read as a tight rectangle stacked beside the big number.
interface DiscountCalloutProps {
  callout: FlashSaleBannerBlockType['discount_callouts'] extends (infer U)[] | undefined ? U : never;
}

function DiscountCallout({ callout }: DiscountCalloutProps) {
  const c$ = (callout as any).$ || {};
  const { eyebrow, value, unit, suffix } = callout || {};

  if (!eyebrow && !value && !unit && !suffix) return null;

  const hasRightCol = Boolean(eyebrow || unit || suffix);

  return (
    <div className="flex items-stretch leading-none">
      {value && (
        <span
          {...c$['value']}
          className="font-extrabold tracking-[-0.02em] leading-[0.85] text-[clamp(44px,9cqi,108px)]"
        >
          {value}
        </span>
      )}
      {hasRightCol && (
        <div className="flex flex-col justify-between leading-none ml-[3px] py-[2px] text-left">
          {eyebrow && (
            <span
              {...c$['eyebrow']}
              className="font-semibold italic leading-none text-[clamp(10px,1.6cqi,16px)] -mt-1"
            >
              {eyebrow}
            </span>
          )}
          {unit && (
            <span
              {...c$['unit']}
              className="font-extrabold leading-none text-[clamp(13px,2.4cqi,28px)]"
            >
              {unit}
            </span>
          )}
          {suffix && (
            <span
              {...c$['suffix']}
              className="font-bold leading-none tracking-wide text-[clamp(9px,1.4cqi,14px)] -mb-0.5"
            >
              {suffix}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
