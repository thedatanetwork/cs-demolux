'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { CampaignCTABlock as CampaignCTABlockType, Image as ImageType } from '@/lib/contentstack';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';
import { useCTATracking } from '@/components/PersonalizeEventTracker';

interface CampaignCTABlockProps {
  block: CampaignCTABlockType;
}

export function CampaignCTABlock({ block }: CampaignCTABlockProps) {
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

  // Render based on variant
  switch (block.variant) {
    case 'centered_cta':
      return <CenteredCTA block={block} backgroundImage={backgroundImage} onCTAClick={handleCTAClick} />;

    case 'split_cta':
      return <SplitCTA block={block} backgroundImage={backgroundImage} onCTAClick={handleCTAClick} />;

    case 'announcement_banner':
      return <AnnouncementBanner block={block} onCTAClick={handleCTAClick} />;

    case 'full_width_cta':
    default:
      return <FullWidthCTA block={block} backgroundImage={backgroundImage} onCTAClick={handleCTAClick} />;
  }
}

// Full Width CTA Variant (default)
function FullWidthCTA({
  block,
  backgroundImage,
  onCTAClick
}: {
  block: CampaignCTABlockType;
  backgroundImage?: ImageType;
  onCTAClick: (id: string, url: string) => void;
}) {
  const heightClasses = {
    full: 'min-h-screen',
    large: 'py-32',
    medium: 'py-24',
    small: 'py-16'
  };

  const height = heightClasses[block.height || 'medium'];
  const isLightText = block.text_color === 'light';

  return (
    <section className={`relative ${height} overflow-hidden`}>
      {/* Background */}
      {backgroundImage?.url ? (
        <div className="absolute inset-0">
          <Image
            src={backgroundImage.url}
            alt={backgroundImage.title || block.title}
            fill
            className="object-cover"
          />
          <div className={`absolute inset-0 ${isLightText ? 'bg-black/50' : 'bg-white/50'}`}></div>
        </div>
      ) : (
        <div className={`absolute inset-0 ${block.background_style === 'gradient-dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black' : block.background_style === 'gradient-gold' ? 'bg-gradient-to-br from-gold-600 via-gold-500 to-gold-700' : 'bg-gray-900'}`}></div>
      )}

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${isLightText ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Content */}
      <div className="container-padding relative h-full flex items-center">
        <div className={`max-w-4xl mx-auto text-center ${isLightText ? 'text-white' : 'text-gray-900'}`}>
          {/* Badge */}
          {block.badge_text && (
            <div className={`inline-flex items-center space-x-2 ${isLightText ? 'bg-white/10' : 'bg-black/5'} backdrop-blur-sm rounded-full px-6 py-3 mb-8`}>
              <div className={`w-2 h-2 ${isLightText ? 'bg-gold-400' : 'bg-gold-600'} rounded-full`}></div>
              <span className="text-sm font-medium">
                {block.badge_text}
              </span>
            </div>
          )}

          {/* Title */}
          <h2 className="font-heading text-4xl md:text-6xl font-bold mb-6">
            {block.title.split(' ').map((word, index, arr) => (
              <span
                key={index}
                className={index === arr.length - 1 ? 'text-gradient bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent' : ''}
              >
                {word}{index < arr.length - 1 ? ' ' : ''}
              </span>
            ))}
          </h2>

          {/* Description */}
          {block.description && (
            <p className={`text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed font-light ${isLightText ? 'text-white/90' : 'text-gray-700'}`}>
              {block.description}
            </p>
          )}

          {/* Decorative Line */}
          <div className="mb-12 flex justify-center">
            <div className={`w-32 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent`}></div>
          </div>

          {/* CTA Buttons */}
          {(block.primary_cta || block.secondary_cta) && (
            <div className="inline-flex flex-col sm:flex-row gap-6">
              {block.primary_cta && (
                <Link
                  href={block.primary_cta.url}
                  onClick={() => onCTAClick('campaign_primary_cta', block.primary_cta!.url)}
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
                  onClick={() => onCTAClick('campaign_secondary_cta', block.secondary_cta!.url)}
                >
                  <Button
                    variant={block.secondary_cta.style || 'outline'}
                    size="xl"
                    className={isLightText ? 'border-white/30 text-white hover:bg-white hover:text-gray-900 shadow-2xl' : 'shadow-2xl'}
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

// Centered CTA Variant - Newsletter/Email Signup
function CenteredCTA({
  block,
  backgroundImage,
  onCTAClick
}: {
  block: CampaignCTABlockType;
  backgroundImage?: ImageType;
  onCTAClick: (id: string, url: string) => void;
}) {
  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    // Track the subscription attempt
    onCTAClick('newsletter_signup', email);

    // Simulate API call (replace with actual newsletter API)
    setTimeout(() => {
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 3000);
    }, 1000);
  };

  const isLightText = block.text_color === 'light';
  const heightClasses = {
    full: 'min-h-screen',
    large: 'py-32',
    medium: 'py-24',
    small: 'py-16'
  };
  const height = heightClasses[block.height || 'medium'];

  return (
    <section className={`relative ${height} overflow-hidden`}>
      {/* Background */}
      {backgroundImage?.url ? (
        <div className="absolute inset-0">
          <Image
            src={backgroundImage.url}
            alt={backgroundImage.title || block.title}
            fill
            className="object-cover"
          />
          <div className={`absolute inset-0 ${isLightText ? 'bg-black/60' : 'bg-white/60'}`}></div>
        </div>
      ) : (
        <div className={`absolute inset-0 ${block.background_style === 'gradient-dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black' : block.background_style === 'gradient-gold' ? 'bg-gradient-to-br from-gold-600 via-gold-500 to-gold-700' : 'bg-gray-900'}`}></div>
      )}

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${isLightText ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Content */}
      <div className="container-padding relative h-full flex items-center">
        <div className={`max-w-3xl mx-auto text-center ${isLightText ? 'text-white' : 'text-gray-900'}`}>
          {/* Badge */}
          {block.badge_text && (
            <div className="inline-flex items-center space-x-2 bg-gold-400/20 border-2 border-gold-400/40 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
              <div className="w-2 h-2 bg-gold-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-gold-300 uppercase tracking-wide">
                {block.badge_text}
              </span>
            </div>
          )}

          {/* Title */}
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6 text-white">
            {block.title.split(' ').map((word, index, arr) => (
              <span
                key={index}
                className={index === arr.length - 1 ? 'text-gradient bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent' : ''}
              >
                {word}{index < arr.length - 1 ? ' ' : ''}
              </span>
            ))}
          </h2>

          {/* Description */}
          {block.description && (
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed text-gray-200">
              {block.description}
            </p>
          )}

          {/* Decorative Line */}
          <div className="mb-8 flex justify-center">
            <div className={`w-24 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent`}></div>
          </div>

          {/* Newsletter Signup Form */}
          <div className="max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={status === 'submitting' || status === 'success'}
                  className={`flex-1 px-5 py-4 rounded-lg sm:rounded-r-none ${
                    isLightText
                      ? 'bg-white/10 border-2 border-white/20 text-white placeholder-white/60 focus:border-gold-400'
                      : 'bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gold-500'
                  } backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-gold-400/50 transition-all text-base`}
                />
                <button
                  type="submit"
                  disabled={status === 'submitting' || status === 'success'}
                  className="px-8 py-4 bg-gold-400 text-gray-900 rounded-lg sm:rounded-l-none hover:bg-gold-500 transition-all duration-200 font-semibold text-base shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {status === 'submitting' ? 'Subscribing...' : status === 'success' ? '✓ Subscribed!' : 'Subscribe'}
                </button>
              </div>

              {/* Success Message */}
              {status === 'success' && (
                <p className={`mt-3 text-sm ${isLightText ? 'text-green-300' : 'text-green-600'} font-medium`}>
                  Thanks for subscribing! Check your inbox.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

// Split CTA Variant - Content left, image/visual right
function SplitCTA({
  block,
  backgroundImage,
  onCTAClick
}: {
  block: CampaignCTABlockType;
  backgroundImage?: ImageType;
  onCTAClick: (id: string, url: string) => void;
}) {
  const isLightText = block.text_color === 'light';

  return (
    <section className={`section-spacing ${block.background_style === 'gradient-dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white' : block.background_style === 'gradient-gold' ? 'bg-gradient-to-br from-gold-600 to-gold-700 text-white' : 'bg-gray-50'} relative overflow-hidden`}>
      <div className="container-padding relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <div className={isLightText ? 'text-white' : 'text-gray-900'}>
            {/* Badge */}
            {block.badge_text && (
              <div className={`inline-flex items-center space-x-2 ${isLightText ? 'bg-white/10' : 'bg-white'} backdrop-blur-sm rounded-full px-6 py-3 mb-8`}>
                <div className="w-2 h-2 bg-gold-400 rounded-full"></div>
                <span className="text-sm font-medium">
                  {block.badge_text}
                </span>
              </div>
            )}

            {/* Title */}
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              {block.title}
            </h2>

            {/* Description */}
            {block.description && (
              <p className={`text-lg md:text-xl mb-8 leading-relaxed ${isLightText ? 'text-white/90' : 'text-gray-600'}`}>
                {block.description}
              </p>
            )}

            {/* CTA Buttons */}
            {(block.primary_cta || block.secondary_cta) && (
              <div className="flex flex-col sm:flex-row gap-4">
                {block.primary_cta && (
                  <Link
                    href={block.primary_cta.url}
                    onClick={() => onCTAClick('campaign_primary_cta', block.primary_cta!.url)}
                  >
                    <Button
                      variant={block.primary_cta.style || 'gold'}
                      size="lg"
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
                    onClick={() => onCTAClick('campaign_secondary_cta', block.secondary_cta!.url)}
                  >
                    <Button
                      variant={block.secondary_cta.style || 'outline'}
                      size="lg"
                      className={isLightText ? 'border-white/30 text-white hover:bg-white hover:text-gray-900' : ''}
                    >
                      {block.secondary_cta.text}
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Right - Image */}
          <div className="relative">
            {backgroundImage?.url ? (
              <div className="aspect-video relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={backgroundImage.url}
                  alt={backgroundImage.title || block.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl shadow-2xl"></div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Announcement Banner Variant - Slim horizontal banner
function AnnouncementBanner({
  block,
  onCTAClick
}: {
  block: CampaignCTABlockType;
  onCTAClick: (id: string, url: string) => void;
}) {
  const isLightText = block.text_color === 'light';

  return (
    <section className={`${block.background_style === 'gradient-dark' ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white' : block.background_style === 'gradient-gold' ? 'bg-gradient-to-r from-gold-600 to-gold-500 text-white' : 'bg-gray-900 text-white'} py-4`}>
      <div className="container-padding">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          {/* Message */}
          <div className="flex items-center space-x-4">
            {block.badge_text && (
              <span className="bg-white/20 rounded-full px-4 py-1 text-xs font-bold uppercase">
                {block.badge_text}
              </span>
            )}
            <p className="font-semibold">
              {block.title}
            </p>
          </div>

          {/* CTA */}
          {block.primary_cta && (
            <Link
              href={block.primary_cta.url}
              onClick={() => onCTAClick('announcement_cta', block.primary_cta!.url)}
              className="inline-flex items-center text-white hover:text-gold-300 font-semibold transition-colors"
            >
              {block.primary_cta.text}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
