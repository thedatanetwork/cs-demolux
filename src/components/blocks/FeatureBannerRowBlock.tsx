'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { FeatureBannerRowBlock as FeatureBannerRowBlockType } from '@/lib/contentstack';

interface FeatureBannerRowBlockProps {
  block: FeatureBannerRowBlockType & { $?: Record<string, any> };
}

const sectionBgClasses: Record<string, string> = {
  white: 'bg-white text-gray-900',
  gray: 'bg-gray-50 text-gray-900',
  dark: 'bg-gray-900 text-white',
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

const gapClasses: Record<string, string> = {
  tight: 'gap-2 md:gap-3',
  normal: 'gap-4 md:gap-6',
  loose: 'gap-6 md:gap-10',
};

const panelPaddingClasses: Record<string, string> = {
  none: 'p-0',
  xs: 'p-3 md:p-4',
  sm: 'p-4 md:p-6',
  md: 'p-6 md:p-8 lg:p-10',
  lg: 'p-8 md:p-12 lg:p-16',
  xl: 'p-10 md:p-16 lg:p-20',
};

const panelGridClasses: Record<string, string> = {
  '2': 'grid-cols-1 md:grid-cols-2',
  '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

// In a flex-col, items-* = horizontal alignment, justify-* = vertical.
const positionClasses: Record<string, string> = {
  top_left: 'items-start justify-start text-left',
  top_center: 'items-center justify-start text-center',
  top_right: 'items-end justify-start text-right',
  middle_left: 'items-start justify-center text-left',
  center: 'items-center justify-center text-center',
  middle_right: 'items-end justify-center text-right',
  bottom_left: 'items-start justify-end text-left',
  bottom_center: 'items-center justify-end text-center',
  bottom_right: 'items-end justify-end text-right',
};

const scrimByPosition: Record<string, string> = {
  top_left: 'bg-gradient-to-br from-black/55 via-black/15 to-transparent',
  top_center: 'bg-gradient-to-b from-black/55 via-black/15 to-transparent',
  top_right: 'bg-gradient-to-bl from-black/55 via-black/15 to-transparent',
  middle_left: 'bg-gradient-to-r from-black/55 via-black/15 to-transparent',
  center: 'bg-black/30',
  middle_right: 'bg-gradient-to-l from-black/55 via-black/15 to-transparent',
  bottom_left: 'bg-gradient-to-tr from-black/55 via-black/15 to-transparent',
  bottom_center: 'bg-gradient-to-t from-black/55 via-black/15 to-transparent',
  bottom_right: 'bg-gradient-to-tl from-black/55 via-black/15 to-transparent',
};

export function FeatureBannerRowBlock({ block }: FeatureBannerRowBlockProps) {
  const {
    eyebrow_label,
    section_title,
    section_description,
    background_style = 'white',
    panel_count = '3',
    panel_aspect_ratio = 'portrait_4_5',
    gap_size = 'normal',
    corner_radius = 'medium',
    panel_padding = 'md',
    panels = [],
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
          {...$['panels']}
          className={`grid ${panelGridClasses[panel_count] || panelGridClasses['3']} ${
            gapClasses[gap_size] || gapClasses.normal
          }`}
        >
          {panels.slice(0, Number(panel_count)).map((panel, i) => (
            <FeaturePanel
              key={panel._metadata?.uid || i}
              panel={panel}
              aspectClass={aspectClasses[panel_aspect_ratio] || aspectClasses.portrait_4_5}
              cornerClass={cornerClasses[corner_radius] || cornerClasses.medium}
              paddingClass={panelPaddingClasses[panel_padding] || panelPaddingClasses.md}
              panelTag={$[`panels__${i}`] || {}}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturePanel({
  panel,
  aspectClass,
  cornerClass,
  paddingClass,
  panelTag,
}: {
  panel: any;
  aspectClass: string;
  cornerClass: string;
  paddingClass: string;
  panelTag: Record<string, any>;
}) {
  const p$ = panel.$ || {};
  const bg = Array.isArray(panel.background_image) ? panel.background_image[0] : panel.background_image;
  const logo = Array.isArray(panel.logo_image) ? panel.logo_image[0] : panel.logo_image;
  const isLight = panel.text_color === 'light';
  const positionClass = positionClasses[panel.text_position] || positionClasses.top_center;
  const scrimClass = scrimByPosition[panel.text_position] || scrimByPosition.top_center;

  const PanelWrapper: React.ElementType = panel.link_url ? Link : 'div';
  const wrapperProps = panel.link_url ? { href: panel.link_url } : {};

  // Inner stack alignment derived from text_position so eyebrow/logo/headline
  // line up with the rest of the overlay text.
  const pos = panel.text_position || 'top_center';
  const innerAlignClass = pos.endsWith('_right')
    ? 'items-end'
    : pos.endsWith('_left')
      ? 'items-start'
      : 'items-center';

  // CTA color: light text panels get white pill buttons; dark text panels get dark pill buttons
  const ctaButtonStyles: Record<string, string> = {
    primary: isLight
      ? 'bg-white text-gray-900 hover:bg-gray-100'
      : 'bg-gray-900 text-white hover:bg-gray-800',
    outline: isLight
      ? 'border border-white text-white hover:bg-white hover:text-gray-900'
      : 'border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white',
    underline: isLight
      ? 'text-white underline underline-offset-4 hover:no-underline'
      : 'text-gray-900 underline underline-offset-4 hover:no-underline',
  };

  return (
    <PanelWrapper
      {...wrapperProps}
      {...panelTag}
      className={`group relative ${aspectClass} ${cornerClass} overflow-hidden block`}
    >
      {bg?.url && (
        <div {...p$['background_image']} className="absolute inset-0">
          <Image
            src={bg.url}
            alt={bg.title || 'Feature panel'}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </div>
      )}

      {panel.show_scrim && (
        <div aria-hidden className={`absolute inset-0 pointer-events-none ${scrimClass}`} />
      )}

      {/* Custom HTML escape hatch — replaces structured overlay if present */}
      {panel.custom_html_override && panel.custom_html_override.trim() ? (
        <div
          className={`absolute inset-0 ${paddingClass} flex flex-col ${positionClass} ${
            isLight ? 'text-white' : 'text-gray-900'
          }`}
          dangerouslySetInnerHTML={{ __html: panel.custom_html_override }}
        />
      ) : (
        <div
          className={`absolute inset-0 ${paddingClass} flex flex-col ${positionClass}`}
          style={{
            // Text-shadow defense layer: improves legibility over busy
            // photography regardless of scrim state. Light text gets a dark
            // halo, dark text gets a light halo.
            textShadow: isLight
              ? '0 1px 6px rgba(0,0,0,0.45)'
              : '0 1px 6px rgba(255,255,255,0.65)',
          }}
        >
          <div className={`max-w-md flex flex-col gap-3 sm:gap-4 ${innerAlignClass}`}>
            {panel.eyebrow && (
              <div
                {...p$['eyebrow']}
                className={`text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] ${
                  isLight ? 'text-white/95' : 'text-gray-800'
                }`}
              >
                {panel.eyebrow}
              </div>
            )}

            {logo?.url && (
              <div {...p$['logo_image']} className="relative h-14 sm:h-16 w-auto max-w-[180px]">
                <img
                  src={logo.url}
                  alt={logo.title || 'Logo'}
                  className="h-full w-auto object-contain"
                />
              </div>
            )}

            {panel.headline && (
              <h3
                {...p$['headline']}
                className={`font-heading text-3xl sm:text-4xl lg:text-5xl leading-tight ${
                  isLight ? 'text-white' : 'text-gray-900'
                }`}
              >
                <RteRenderer doc={panel.headline} />
              </h3>
            )}

            {panel.description && (
              <div
                {...p$['description']}
                className={`text-base sm:text-lg leading-relaxed ${
                  isLight ? 'text-white/90' : 'text-gray-700'
                }`}
              >
                <RteRenderer doc={panel.description} />
              </div>
            )}

            {panel.ctas && panel.ctas.length > 0 && (
              <div {...p$['ctas']} className="flex flex-wrap gap-3 mt-2">
                {panel.ctas.map((cta: any, i: number) => (
                  <Link
                    key={i}
                    href={cta.url || '#'}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full font-semibold text-xs sm:text-sm uppercase tracking-wider transition-colors shadow-sm ${
                      ctaButtonStyles[cta.style] || ctaButtonStyles.primary
                    }`}
                  >
                    {cta.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </PanelWrapper>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// JSON RTE renderer
// Maps Contentstack JSON RTE marks/nodes to brand-styled React elements.
// Whitelist approach: unknown marks degrade gracefully to plain text.
// ──────────────────────────────────────────────────────────────────────────

function RteRenderer({ doc }: { doc: any }) {
  if (!doc) return null;
  // doc may be the document root or already its children
  const children = doc.children || (Array.isArray(doc) ? doc : null);
  if (!children) return null;
  return <>{children.map((node: any, i: number) => renderNode(node, i))}</>;
}

function renderNode(node: any, key: number): React.ReactNode {
  if (!node) return null;

  // Text leaf
  if (typeof node.text === 'string') {
    let el: React.ReactNode = node.text;
    if (node.italic) el = <em key={key}>{el}</em>;
    if (node.bold) el = <strong key={key}>{el}</strong>;
    if (node.underline) el = <span key={key} className="underline">{el}</span>;
    if (node.strikethrough) el = <s key={key}>{el}</s>;
    return <React.Fragment key={key}>{el}</React.Fragment>;
  }

  const childArr = node.children || [];
  const renderChildren = () => childArr.map((c: any, i: number) => renderNode(c, i));

  switch (node.type) {
    case 'doc':
      return <React.Fragment key={key}>{renderChildren()}</React.Fragment>;
    case 'p':
      return <p key={key} className="mb-1 last:mb-0">{renderChildren()}</p>;
    case 'br':
      return <br key={key} />;
    case 'a': {
      const href = node.attrs?.url || node.attrs?.href || '#';
      return (
        <a key={key} href={href} className="underline underline-offset-2 hover:no-underline">
          {renderChildren()}
        </a>
      );
    }
    case 'reference':
    case 'img': {
      const url = node.attrs?.['asset-link'] || node.attrs?.src || node.attrs?.url;
      if (!url) return null;
      return (
        <img
          key={key}
          src={url}
          alt={node.attrs?.alt || ''}
          className="inline-block h-[1em] w-auto align-baseline mx-1"
        />
      );
    }
    case 'span':
      return <span key={key}>{renderChildren()}</span>;
    default:
      // Unknown node type: render children inline so content isn't lost
      return <React.Fragment key={key}>{renderChildren()}</React.Fragment>;
  }
}
