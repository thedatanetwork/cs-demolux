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

const backgroundClasses: Record<string, string> = {
  white: 'bg-white text-gray-900',
  gray: 'bg-gray-50 text-gray-900',
  dark: 'bg-gray-900 text-white',
};

const columnClasses: Record<string, string> = {
  '4': 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  '5': 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
  '6': 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
};

const badgeColorClasses: Record<string, string> = {
  teal: 'bg-teal-700/90 text-white',
  gold: 'bg-gold-500/95 text-gray-900',
  red: 'bg-red-700/90 text-white',
  navy: 'bg-slate-800/90 text-white',
  black: 'bg-black/85 text-white',
};

export function ProductTileBannerBlock({ block }: ProductTileBannerBlockProps) {
  const {
    eyebrow_label,
    section_title,
    section_description,
    columns = '6',
    background_style = 'white',
    badge_color = 'teal',
    tiles = [],
  } = block;

  const $ = block.$ || {};
  const isDark = background_style === 'dark';
  const bgClass = backgroundClasses[background_style] || backgroundClasses.white;
  const columnClass = columnClasses[String(columns)] || columnClasses['6'];
  const badgeClass = badgeColorClasses[badge_color] || badgeColorClasses.teal;

  return (
    <section className={`section-spacing ${bgClass}`}>
      <div className="container-padding">
        {/* Header */}
        {(eyebrow_label || section_title || section_description) && (
          <div className="text-center mb-10 md:mb-14">
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

        {/* Tile grid — Level 1: container tag */}
        <div {...$['tiles']} className={`grid ${columnClass} gap-3 md:gap-5`}>
          {tiles.map((tile, index) => (
            <ProductTile
              key={tile._metadata?.uid || index}
              tile={tile}
              index={index}
              badgeClass={badgeClass}
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
  index: number;
  badgeClass: string;
  isDark: boolean;
  itemTag: Record<string, any>;
}

function ProductTile({ tile, badgeClass, isDark, itemTag }: ProductTileProps) {
  const t$ = tile.$ || {};
  const image = Array.isArray(tile.image) ? tile.image[0] : tile.image;
  const hasBadge = Boolean(tile.eyebrow || tile.prefix || tile.value || tile.suffix || tile.sublabel);

  const TileWrapper: React.ElementType = tile.link_url ? Link : 'div';
  const wrapperProps = tile.link_url ? { href: tile.link_url } : {};

  return (
    <TileWrapper
      {...wrapperProps}
      {...itemTag}
      className="group block"
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        {image?.url && (
          <div {...t$['image']} className="absolute inset-0">
            <Image
              src={image.url}
              alt={image.title || tile.label || 'Product tile'}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}

        {/* Badge overlay */}
        {hasBadge && (
          <div className={`absolute top-0 left-0 px-3 py-2 rounded-br-xl ${badgeClass} flex items-baseline gap-1`}>
            {tile.eyebrow && (
              <span
                {...t$['eyebrow']}
                className="text-[10px] md:text-xs font-medium leading-none mr-0.5 self-start mt-1"
              >
                {tile.eyebrow}
              </span>
            )}
            {tile.prefix && (
              <span
                {...t$['prefix']}
                className="text-xs md:text-sm font-bold leading-none self-start mt-1"
              >
                {tile.prefix}
              </span>
            )}
            {tile.value && (
              <span
                {...t$['value']}
                className="text-2xl md:text-3xl font-bold leading-none tracking-tight"
              >
                {tile.value}
              </span>
            )}
            <div className="flex flex-col items-start">
              {tile.suffix && (
                <span
                  {...t$['suffix']}
                  className="text-xs md:text-sm font-bold leading-none"
                >
                  {tile.suffix}
                </span>
              )}
              {tile.sublabel && (
                <span
                  {...t$['sublabel']}
                  className="text-[10px] md:text-xs font-medium leading-none mt-0.5 opacity-90"
                >
                  {tile.sublabel}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {tile.label && (
        <div
          {...t$['label']}
          className={`mt-2 text-center text-xs md:text-sm font-medium ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          {tile.label}
        </div>
      )}
    </TileWrapper>
  );
}
