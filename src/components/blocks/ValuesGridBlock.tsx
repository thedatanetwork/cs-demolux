'use client';

import React from 'react';
import Image from 'next/image';
import type { ValuesGridBlock as ValuesGridBlockType } from '@/lib/contentstack';
import { Sparkles, Users, Globe, Award, Zap, Star, Heart, Shield, TrendingUp, Leaf } from 'lucide-react';

interface ValuesGridBlockProps {
  block: ValuesGridBlockType & {
    $?: Record<string, any>;  // Editable tags from addEditableTags()
  };
}

// Icon mapping for dynamic icon rendering
const iconMap: Record<string, React.ComponentType<any>> = {
  Sparkles,
  Users,
  Globe,
  Award,
  Zap,
  Star,
  Heart,
  Shield,
  TrendingUp,
  Leaf
};

// Contentstack image API: resize large images via CDN
function optimizeImageUrl(url: string, width: number = 800): string {
  if (!url || !url.includes('contentstack.io')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}width=${width}&auto=webp`;
}

export function ValuesGridBlock({ block }: ValuesGridBlockProps) {
  const {
    section_title,
    section_description,
    badge_text,
    values,
    layout_style,
    card_style,
    icon_style = 'filled',
    background_style
  } = block;
  const $ = block.$ || {};

  // Background styles
  const backgroundClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    gradient: 'bg-gradient-to-b from-white to-gray-50'
  };

  // Grid column classes based on layout
  const gridClasses = {
    'grid-2': 'grid-cols-1 md:grid-cols-2',
    'grid-3': 'grid-cols-1 md:grid-cols-3',
    'grid-4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    'horizontal-scroll': 'flex overflow-x-auto space-x-6 pb-4 snap-x snap-mandatory'
  };

  // Card style classes
  const cardStyleClasses = {
    elevated: 'bg-white rounded-lg p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2',
    flat: 'bg-white rounded-lg p-8 hover:bg-gray-50 transition-colors duration-300',
    bordered: 'bg-transparent rounded-lg p-8 border-2 border-gray-200 hover:border-gold-400 transition-colors duration-300',
    minimal: 'bg-transparent p-8'
  };

  const bgClass = backgroundClasses[background_style];
  const gridClass = layout_style === 'horizontal-scroll' ? '' : `grid ${gridClasses[layout_style]} gap-8`;
  const cardClass = cardStyleClasses[card_style];

  return (
    <section className={`section-spacing ${bgClass} relative overflow-hidden`}>
      <div className="container-padding relative">
        {/* Section Header */}
        <div className="text-center mb-20">
          {/* Badge */}
          {badge_text && (
            <div className="inline-flex items-center space-x-2 bg-gray-50 backdrop-blur-sm rounded-full px-6 py-3 mb-8 shadow-sm">
              <div className="w-2 h-2 bg-gold-400 rounded-full"></div>
              <span className="text-sm font-medium text-gray-900">
                {badge_text}
              </span>
            </div>
          )}

          {/* Title */}
          {section_title && (
            <h2 {...$['section_title']} className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {section_title.split(' ').map((word, index, arr) => (
                <span
                  key={index}
                  className={index === arr.length - 1 ? 'text-gradient bg-gradient-to-r from-gold-600 to-gold-400 bg-clip-text text-transparent' : ''}
                >
                  {word}{index < arr.length - 1 ? ' ' : ''}
                </span>
              ))}
            </h2>
          )}

          {/* Description */}
          {section_description && (
            <p {...$['section_description']} className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              {section_description}
            </p>
          )}

          {/* Decorative Line */}
          <div className="mt-8 flex justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent"></div>
          </div>
        </div>

        {/* Values Grid/Scroll */}
        <div className={layout_style === 'horizontal-scroll' ? 'flex overflow-x-auto space-x-6 pb-4 snap-x snap-mandatory' : gridClass}>
          {(values || []).map((value, index) => {
            const IconComponent = iconMap[value.icon] || Sparkles;
            const backgroundImage = Array.isArray(value.background_image) ? value.background_image[0] : value.background_image;
            const hasBackgroundImage = !!backgroundImage?.url;

            return (
              <div
                key={index}
                className={`relative group overflow-hidden ${layout_style === 'horizontal-scroll' ? `flex-shrink-0 w-80 snap-start ${cardClass}` : cardClass}`}
              >
                {/* Background Image with Overlay */}
                {hasBackgroundImage && (
                  <>
                    <Image
                      src={optimizeImageUrl(backgroundImage.url)}
                      alt={backgroundImage.title || value.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      unoptimized
                    />
                    {/* Dark overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70 z-[1]" />
                  </>
                )}

                <div className="relative z-10">
                  {/* Icon - no background, gold color */}
                  <div className="flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300">
                    <IconComponent className={`h-12 w-12 ${hasBackgroundImage ? 'text-gold-400' : 'text-gold-500'} drop-shadow-lg`} />
                  </div>

                  {/* Title in frosted glass bubble */}
                  <div className="flex justify-center mb-6">
                    <div className={`inline-flex px-6 py-2.5 ${hasBackgroundImage ? 'bg-white/10 backdrop-blur-md border border-white/20' : 'bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200'} rounded-full shadow-sm`}>
                      <h3 className={`font-heading text-xl font-bold text-center ${hasBackgroundImage ? 'text-white' : 'text-gray-900'}`}>
                        {value.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className={`leading-relaxed text-base text-center ${hasBackgroundImage ? 'text-white/90' : 'text-gray-600'}`}>
                    {value.description}
                  </p>

                  {/* Optional Link */}
                  {'link_url' in value && 'link_text' in value && value.link_url && value.link_text && (
                    <div className="mt-6 text-center">
                      <a
                        href={value.link_url}
                        className={`inline-flex items-center px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300 ${hasBackgroundImage ? 'bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30' : 'bg-gold-500 text-white hover:bg-gold-600 shadow-md hover:shadow-lg'}`}
                      >
                        {value.link_text}
                        <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
