'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { HeroSectionBlock as HeroSectionBlockType, Image as ImageType } from '@/lib/contentstack';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Star, Award, Zap, Sparkles, Users, Globe, ChevronRight } from 'lucide-react';
import { useCTATracking } from '@/components/PersonalizeEventTracker';

interface HeroSectionBlockProps {
  block: HeroSectionBlockType;
}

// Icon mapping for dynamic icon rendering
const iconMap: Record<string, React.ComponentType<any>> = {
  Star,
  Award,
  Zap,
  Sparkles,
  Users,
  Globe,
  ChevronRight
};

export function HeroSectionBlock({ block }: HeroSectionBlockProps) {
  const { trackCTAClick } = useCTATracking();

  const handleCTAClick = (ctaId: string, destination: string) => {
    trackCTAClick(ctaId, destination);
  };

  // Helper to get first image from array or single object
  const getImage = (media: any): ImageType | undefined => {
    if (!media) return undefined;
    return Array.isArray(media) ? media[0] : media;
  };

  const backgroundImage = getImage(block.background_media);
  const heroImage = getImage(block.hero_image) || backgroundImage;
  const badgeIconComponent = (block.badge_icon && iconMap[block.badge_icon]) || Star;
  const BadgeIcon = badgeIconComponent || Star;

  // Render based on variant
  switch (block.variant) {
    case 'split_hero':
      return <SplitHero block={block} backgroundImage={heroImage} BadgeIcon={BadgeIcon} onCTAClick={handleCTAClick} />;

    case 'minimal_hero':
      return <MinimalHero block={block} BadgeIcon={BadgeIcon} onCTAClick={handleCTAClick} />;

    case 'image_hero':
      return <ImageHero block={block} backgroundImage={backgroundImage} BadgeIcon={BadgeIcon} onCTAClick={handleCTAClick} />;

    case 'campaign_hero':
      return <CampaignHero block={block} backgroundImage={backgroundImage} BadgeIcon={BadgeIcon} onCTAClick={handleCTAClick} />;

    default:
      return <SplitHero block={block} backgroundImage={backgroundImage} BadgeIcon={BadgeIcon} onCTAClick={handleCTAClick} />;
  }
}

// Split Hero Variant (default) - Content left, Image right
function SplitHero({
  block,
  backgroundImage,
  BadgeIcon,
  onCTAClick
}: {
  block: HeroSectionBlockType;
  backgroundImage?: ImageType;
  BadgeIcon: React.ComponentType<any>;
  onCTAClick: (id: string, url: string) => void;
}) {
  const heightClasses = {
    full: 'min-h-screen',
    large: 'min-h-[85vh]',
    medium: 'min-h-[70vh]',
    small: 'min-h-[50vh]'
  };

  const height = heightClasses[block.height || 'large'];
  const textAlign = block.text_alignment || 'left';

  return (
    <section className={`hero-gradient ${height} flex items-center py-16 lg:py-24`}>
      <div className="container-padding w-full">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* Left Column - Content */}
            <div className={`text-${textAlign === 'center' ? 'center lg:text-center' : 'center lg:text-left'}`}>
              {/* Badge */}
              {block.badge_text && (
                <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-5 py-2.5 mb-8">
                  <BadgeIcon className="h-4 w-4 text-gold-500" />
                  <span className="text-sm font-medium text-gray-900">
                    {block.badge_text}
                  </span>
                </div>
              )}

              {/* Main Headline - Cleaner structure */}
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] mb-8">
                <span className="text-gradient bg-gradient-to-r from-gold-600 to-gold-400 bg-clip-text text-transparent">
                  {block.title}
                </span>
              </h1>

              {/* Description */}
              {block.description && (
                <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-xl leading-relaxed">
                  {block.description}
                </p>
              )}

              {/* CTA Buttons */}
              {(block.primary_cta || block.secondary_cta) && (
                <div className="flex flex-col sm:flex-row gap-4">
                  {block.primary_cta && (
                    <Link
                      href={block.primary_cta.url}
                      onClick={() => onCTAClick('hero_primary_cta', block.primary_cta!.url)}
                    >
                      <Button
                        variant={block.primary_cta.style || 'gold'}
                        size="xl"
                        className="w-full sm:w-auto group"
                      >
                        {block.primary_cta.text}
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                      </Button>
                    </Link>
                  )}

                  {block.secondary_cta && (
                    <Link
                      href={block.secondary_cta.url}
                      onClick={() => onCTAClick('hero_secondary_cta', block.secondary_cta!.url)}
                    >
                      <Button
                        variant={block.secondary_cta.style || 'outline'}
                        size="xl"
                        className="w-full sm:w-auto"
                      >
                        {block.secondary_cta.text}
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Visual */}
            <div className="relative">
              <div className="relative z-10">
                {backgroundImage?.url ? (
                  <div className="aspect-[4/3] lg:aspect-square relative rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                      src={backgroundImage.url}
                      alt={backgroundImage.title || block.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] lg:aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-2xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gold-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Zap className="h-8 w-8 text-gray-900" />
                      </div>
                      <p className="text-gray-500 font-medium">Hero Image</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gold-400 rounded-full opacity-20 animate-float"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gray-900 rounded-full opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
            </div>
          </div>

          {/* Feature Items - Moved outside grid for cleaner separation */}
          {block.feature_items && block.feature_items.length > 0 && (
            <div className="mt-16 pt-12 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl">
                {block.feature_items.map((feature, index) => {
                  const FeatureIcon = iconMap[feature.icon] || Star;
                  return (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gold-50 rounded-xl flex items-center justify-center">
                        <FeatureIcon className="h-6 w-6 text-gold-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">{feature.title}</p>
                        <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Minimal Hero Variant - Centered text, no image
function MinimalHero({
  block,
  BadgeIcon,
  onCTAClick
}: {
  block: HeroSectionBlockType;
  BadgeIcon: React.ComponentType<any>;
  onCTAClick: (id: string, url: string) => void;
}) {
  const heightClasses = {
    full: 'min-h-screen',
    large: 'min-h-[80vh]',
    medium: 'min-h-[60vh]',
    small: 'min-h-[40vh]'
  };

  const height = heightClasses[block.height || 'medium'];

  return (
    <section className={`bg-white ${height} flex items-center relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="container-padding w-full relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          {block.badge_text && (
            <div className="inline-flex items-center space-x-2 bg-gray-100 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
              <BadgeIcon className="h-4 w-4 text-gold-500" />
              <span className="text-sm font-medium text-gray-900">
                {block.badge_text}
              </span>
            </div>
          )}

          {/* Main Headline */}
          <h1 className="font-heading text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-8">
            {block.subtitle && (
              <>
                {block.subtitle}
                <br />
              </>
            )}
            <span className="text-gradient bg-gradient-to-r from-gold-600 to-gold-400 bg-clip-text text-transparent">
              {block.title}
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            {block.description}
          </p>

          {/* Decorative Line */}
          <div className="mb-12 flex justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent"></div>
          </div>

          {/* CTA Buttons */}
          {(block.primary_cta || block.secondary_cta) && (
            <div className="inline-flex flex-col sm:flex-row gap-4">
              {block.primary_cta && (
                <Link
                  href={block.primary_cta.url}
                  onClick={() => onCTAClick('hero_primary_cta', block.primary_cta!.url)}
                >
                  <Button
                    variant={block.primary_cta.style || 'primary'}
                    size="xl"
                    className="group"
                  >
                    {block.primary_cta.text}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </Button>
                </Link>
              )}

              {block.secondary_cta && (
                <Link
                  href={block.secondary_cta.url}
                  onClick={() => onCTAClick('hero_secondary_cta', block.secondary_cta!.url)}
                >
                  <Button
                    variant={block.secondary_cta.style || 'outline'}
                    size="xl"
                  >
                    {block.secondary_cta.text}
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Image Hero Variant - Full-width background image with overlay
function ImageHero({
  block,
  backgroundImage,
  BadgeIcon,
  onCTAClick
}: {
  block: HeroSectionBlockType;
  backgroundImage?: ImageType;
  BadgeIcon: React.ComponentType<any>;
  onCTAClick: (id: string, url: string) => void;
}) {
  const heightClasses = {
    full: 'min-h-screen',
    large: 'min-h-[80vh]',
    medium: 'min-h-[60vh]',
    small: 'min-h-[40vh]'
  };

  const overlayClasses = {
    dark: 'bg-black/50',
    light: 'bg-white/50',
    gradient: 'bg-gradient-to-b from-black/30 to-black/70',
    none: ''
  };

  const height = heightClasses[block.height || 'full'];
  const overlay = overlayClasses[block.overlay_style || 'dark'];
  const textAlign = block.text_alignment || 'center';

  return (
    <section className={`relative ${height} flex items-center`}>
      {/* Background Image */}
      {backgroundImage?.url && (
        <div className="absolute inset-0">
          <Image
            src={backgroundImage.url}
            alt={backgroundImage.title || block.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Overlay */}
      <div className={`absolute inset-0 ${overlay}`}></div>

      {/* Content */}
      <div className="container-padding w-full relative z-10">
        <div className={`max-w-4xl ${textAlign === 'center' ? 'mx-auto text-center' : ''} text-white`}>
          {/* Badge */}
          {block.badge_text && (
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
              <BadgeIcon className="h-4 w-4 text-gold-400" />
              <span className="text-sm font-medium text-white">
                {block.badge_text}
              </span>
            </div>
          )}

          {/* Main Headline */}
          <h1 className="font-heading text-5xl md:text-7xl font-bold leading-tight mb-8 text-white">
            {block.subtitle && (
              <>
                {block.subtitle}
                <br />
              </>
            )}
            <span className="text-gradient bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
              {block.title}
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed">
            {block.description}
          </p>

          {/* CTA Buttons */}
          {(block.primary_cta || block.secondary_cta) && (
            <div className="inline-flex flex-col sm:flex-row gap-4">
              {block.primary_cta && (
                <Link
                  href={block.primary_cta.url}
                  onClick={() => onCTAClick('hero_primary_cta', block.primary_cta!.url)}
                >
                  <Button
                    variant={block.primary_cta.style || 'gold'}
                    size="xl"
                    className="group shadow-2xl"
                  >
                    {block.primary_cta.text}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </Button>
                </Link>
              )}

              {block.secondary_cta && (
                <Link
                  href={block.secondary_cta.url}
                  onClick={() => onCTAClick('hero_secondary_cta', block.secondary_cta!.url)}
                >
                  <Button
                    variant="outline"
                    size="xl"
                    className="border-white/30 text-white hover:bg-white hover:text-gray-900 shadow-2xl"
                  >
                    {block.secondary_cta.text}
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Campaign Hero Variant - Promotional style
function CampaignHero({
  block,
  backgroundImage,
  BadgeIcon,
  onCTAClick
}: {
  block: HeroSectionBlockType;
  backgroundImage?: ImageType;
  BadgeIcon: React.ComponentType<any>;
  onCTAClick: (id: string, url: string) => void;
}) {
  return (
    <section className="relative bg-gradient-to-br from-gold-600 via-gold-500 to-gold-700 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      {/* Content */}
      <div className="container-padding section-spacing relative">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          {block.badge_text && (
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-8 animate-pulse">
              <BadgeIcon className="h-5 w-5 text-white" />
              <span className="text-sm font-bold text-white uppercase tracking-wide">
                {block.badge_text}
              </span>
            </div>
          )}

          {/* Main Headline */}
          <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-8 text-white drop-shadow-lg">
            {block.title}
          </h1>

          {/* Description */}
          <p className="text-2xl md:text-3xl text-white/95 mb-12 leading-relaxed font-light">
            {block.description}
          </p>

          {/* Decorative Line */}
          <div className="mb-12 flex justify-center">
            <div className="w-32 h-1 bg-white/50"></div>
          </div>

          {/* CTA Buttons */}
          {(block.primary_cta || block.secondary_cta) && (
            <div className="inline-flex flex-col sm:flex-row gap-6">
              {block.primary_cta && (
                <Link
                  href={block.primary_cta.url}
                  onClick={() => onCTAClick('hero_primary_cta', block.primary_cta!.url)}
                >
                  <Button
                    variant="primary"
                    size="xl"
                    className="bg-white text-gold-600 hover:bg-gray-100 group shadow-2xl text-lg px-12 py-6"
                  >
                    {block.primary_cta.text}
                    <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform duration-200" />
                  </Button>
                </Link>
              )}

              {block.secondary_cta && (
                <Link
                  href={block.secondary_cta.url}
                  onClick={() => onCTAClick('hero_secondary_cta', block.secondary_cta!.url)}
                >
                  <Button
                    variant="outline"
                    size="xl"
                    className="border-2 border-white text-white hover:bg-white hover:text-gold-600 shadow-2xl text-lg px-12 py-6"
                  >
                    {block.secondary_cta.text}
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
