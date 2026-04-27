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
  const textBaseClass = isLight ? 'text-white' : 'text-gray-900';
  const disclaimerColorClass = isLight ? 'text-white/85' : 'text-gray-700';
  const linkColorClass = isLight ? 'text-white underline decoration-white/60' : 'text-gray-900 underline decoration-gray-500';

  const bgClass = backgroundColorClasses[background_color] || backgroundColorClasses.black;
  const heightClass = heightClasses[height] || heightClasses.standard;

  // Wrapper anchors the relative bg image stack and the optional outer link.
  const Wrapper: React.ElementType = cta_link_url ? Link : 'section';
  const wrapperProps = cta_link_url ? { href: cta_link_url } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={`relative block w-full overflow-hidden ${bgClass} ${textBaseClass}`}
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
            className={`absolute top-0 left-0 inline-flex items-center px-3 py-1 text-xs sm:text-sm font-semibold uppercase tracking-wide ${
              tagColorClasses[eyebrow_tag_color] || tagColorClasses.orange
            }`}
          >
            {eyebrow_tag}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 sm:gap-x-6 md:gap-x-8">
          {leftIcon?.url && (
            <div
              {...$['left_icon']}
              className="relative shrink-0 h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16"
            >
              <Image
                src={leftIcon.url}
                alt={leftIcon.title || ''}
                fill
                sizes="64px"
                className="object-contain"
              />
            </div>
          )}

          {(title_lead || title_middle || title_tail) && (
            <h2 className="font-heading leading-none tracking-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
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
              className="flex items-center gap-x-3 sm:gap-x-4 md:gap-x-5"
            >
              {discount_callouts.map((callout, index) => (
                <React.Fragment key={callout._metadata?.uid || index}>
                  {index > 0 && (
                    <span aria-hidden className="text-3xl sm:text-4xl md:text-5xl font-bold leading-none">
                      +
                    </span>
                  )}
                  <DiscountCallout callout={callout} />
                </React.Fragment>
              ))}
            </div>
          )}

          {(disclaimer || disclaimer_link_text) && (
            <div className={`text-xs sm:text-sm leading-tight max-w-[16ch] ${disclaimerColorClass}`}>
              {disclaimer && (
                <span {...$['disclaimer']}>{disclaimer}</span>
              )}
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
              className="relative shrink-0 h-12 w-20 sm:h-16 sm:w-28 md:h-20 md:w-36"
            >
              <Image
                src={rightImage.url}
                alt={rightImage.title || ''}
                fill
                sizes="(max-width: 640px) 80px, 144px"
                className="object-contain"
              />
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
}

interface DiscountCalloutProps {
  callout: FlashSaleBannerBlockType['discount_callouts'] extends (infer U)[] | undefined ? U : never;
}

function DiscountCallout({ callout }: DiscountCalloutProps) {
  const c$ = (callout as any).$ || {};
  const { eyebrow, value, unit, suffix } = callout || {};

  if (!eyebrow && !value && !unit && !suffix) return null;

  return (
    <div className="flex items-baseline leading-none">
      <div className="flex flex-col items-center">
        {eyebrow && (
          <span
            {...c$['eyebrow']}
            className="text-[clamp(10px,2cqi,14px)] font-semibold leading-none mb-0.5 italic opacity-95"
          >
            {eyebrow}
          </span>
        )}
        {value && (
          <span
            {...c$['value']}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-none"
          >
            {value}
          </span>
        )}
      </div>
      {(unit || suffix) && (
        <div className="flex flex-col leading-none ml-0.5">
          {unit && (
            <span
              {...c$['unit']}
              className="text-base sm:text-lg md:text-xl font-bold leading-none"
            >
              {unit}
            </span>
          )}
          {suffix && (
            <span
              {...c$['suffix']}
              className="text-xs sm:text-sm md:text-base font-bold leading-none mt-0.5"
            >
              {suffix}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
