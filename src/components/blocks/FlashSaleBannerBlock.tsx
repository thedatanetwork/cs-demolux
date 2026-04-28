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
  const linkColorClass = isLight ? 'text-white underline decoration-white/60' : 'text-gray-900 underline decoration-gray-500';

  const bgClass = backgroundColorClasses[background_color] || backgroundColorClasses.black;
  const heightClass = heightClasses[height] || heightClasses.standard;

  const Wrapper: React.ElementType = cta_link_url ? Link : 'section';
  const wrapperProps = cta_link_url ? { href: cta_link_url } : {};

  return (
    <Wrapper
      {...wrapperProps}
      // [container-type:inline-size] activates `cqi` units for fluid scaling
      // — same trick the product tile badges use, so text/spacing track the
      // banner width instead of viewport breakpoints.
      className={`relative block w-full overflow-hidden [container-type:inline-size] ${bgClass} ${textBaseClass}`}
    >
      {bgImage?.url && (
        <div className="absolute inset-0 -z-0" {...$['background_image']}>
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

      <div className={`relative container-padding ${heightClass}`}>
        {eyebrow_tag && (
          <div
            {...$['eyebrow_tag']}
            className={`absolute top-0 left-0 inline-flex items-center px-3 py-1 text-[clamp(10px,1.4cqi,14px)] font-bold uppercase tracking-wide ${
              tagColorClasses[eyebrow_tag_color] || tagColorClasses.orange
            }`}
          >
            {eyebrow_tag}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-x-[clamp(12px,2.5cqi,40px)] gap-y-3">
          {leftIcon?.url ? (
            <div
              {...$['left_icon']}
              className="relative shrink-0 h-[clamp(36px,7cqi,96px)] w-[clamp(36px,7cqi,96px)]"
            >
              <Image
                src={leftIcon.url}
                alt={leftIcon.title || ''}
                fill
                sizes="96px"
                className="object-contain"
              />
            </div>
          ) : (
            // Inline lightning-bolt fallback so the banner reads correctly
            // without requiring an icon upload. Editors override by adding
            // an asset to the Left Icon field.
            <DefaultBoltIcon {...$['left_icon']} />
          )}

          {(title_lead || title_middle || title_tail) && (
            <h2
              className={`font-heading leading-none tracking-tight text-[clamp(32px,7cqi,84px)] ${textBaseClass}`}
            >
              {title_lead && (
                <span
                  {...$['title_lead']}
                  className={`${weightClasses[title_lead_weight] || weightClasses.bold} ${
                    styleClasses[title_lead_style] || styleClasses.normal
                  }`}
                >
                  {title_lead}
                </span>
              )}
              {title_middle && (
                <span
                  {...$['title_middle']}
                  className={`${weightClasses[title_middle_weight] || weightClasses.regular} ${
                    styleClasses[title_middle_style] || styleClasses.italic
                  }`}
                >
                  {title_middle}
                </span>
              )}
              {title_tail && (
                <span
                  {...$['title_tail']}
                  className={`${weightClasses[title_tail_weight] || weightClasses.bold} ${
                    styleClasses[title_tail_style] || styleClasses.normal
                  }`}
                >
                  {title_tail}
                </span>
              )}
            </h2>
          )}

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
                      className="font-extrabold leading-none text-[clamp(28px,5.5cqi,68px)]"
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
            <div className={`text-[clamp(10px,1.3cqi,14px)] leading-tight max-w-[14ch] ${disclaimerColorClass}`}>
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
              className="relative shrink-0 h-[clamp(48px,9cqi,120px)] w-[clamp(80px,15cqi,200px)]"
            >
              <Image
                src={rightImage.url}
                alt={rightImage.title || ''}
                fill
                sizes="200px"
                className="object-contain"
              />
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
}

function DefaultBoltIcon(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className="shrink-0 h-[clamp(36px,7cqi,96px)] w-[clamp(36px,7cqi,96px)] text-orange-500"
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        className="h-full w-full"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M13.5 2 4 14h6l-1.5 8L20 9.5h-6L15.5 2z" />
      </svg>
    </div>
  );
}

interface DiscountCalloutProps {
  callout: FlashSaleBannerBlockType['discount_callouts'] extends (infer U)[] | undefined ? U : never;
}

// Layout pattern borrowed from the ProductTileBanner PriceBadge:
//   - eyebrow centered above the value
//   - row uses items-stretch so the suffix column matches the value's height
//   - suffix column uses flex-col + justify-between to pin unit to the top
//     (level with the top of the value) and suffix to the bottom (level with
//     the value's baseline) — the visual we get is "60" with "%" sitting at
//     its top-right and "OFF" sitting at its bottom-right, tightly clustered.
function DiscountCallout({ callout }: DiscountCalloutProps) {
  const c$ = (callout as any).$ || {};
  const { eyebrow, value, unit, suffix } = callout || {};

  if (!eyebrow && !value && !unit && !suffix) return null;

  const hasSuffixCol = Boolean(unit || suffix);

  return (
    <div className="flex flex-col items-center leading-none">
      {eyebrow && (
        <span
          {...c$['eyebrow']}
          className="text-[clamp(10px,1.6cqi,16px)] font-semibold italic leading-none mb-0.5 opacity-95"
        >
          {eyebrow}
        </span>
      )}
      <div className="flex items-stretch leading-none">
        {value && (
          <span
            {...c$['value']}
            className="font-extrabold tracking-tight leading-none text-[clamp(40px,8cqi,96px)]"
          >
            {value}
          </span>
        )}
        {hasSuffixCol && (
          <div className="flex flex-col justify-between leading-none ml-[2px] sm:ml-1 py-[2px]">
            {unit && (
              <span
                {...c$['unit']}
                className="font-bold leading-none text-[clamp(12px,2.6cqi,28px)]"
              >
                {unit}
              </span>
            )}
            {suffix && (
              <span
                {...c$['suffix']}
                className="font-bold leading-none text-[clamp(10px,1.6cqi,18px)]"
              >
                {suffix}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
