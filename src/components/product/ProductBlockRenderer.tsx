'use client';

import React from 'react';
import Image from 'next/image';
import * as LucideIcons from 'lucide-react';

interface ProductBlock {
  [key: string]: any;
  $?: Record<string, any>;  // Editable tags from addEditableTags() for Visual Builder
}

interface ProductBlockRendererProps {
  blocks: ProductBlock[];
}

export function ProductBlockRenderer({ blocks }: ProductBlockRendererProps) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="container-padding">
        <div className="max-w-6xl mx-auto divide-y divide-gray-200">
          {blocks.map((block, index) => {
            const blockType = Object.keys(block)[0];
            const blockData = block[blockType];

            switch (blockType) {
              case 'product_highlights':
                return <ProductHighlights key={index} data={blockData} />;
              case 'tech_specs':
                return <TechSpecs key={index} data={blockData} />;
              case 'materials_craftsmanship':
                return <MaterialsCraftsmanship key={index} data={blockData} />;
              case 'whats_included':
                return <WhatsIncluded key={index} data={blockData} />;
              case 'video_showcase':
                return <VideoShowcase key={index} data={blockData} />;
              case 'image_gallery':
                return <ImageGallery key={index} data={blockData} />;
              case 'size_fit_guide':
                return <SizeFitGuide key={index} data={blockData} />;
              case 'care_maintenance':
                return <CareMaintenance key={index} data={blockData} />;
              case 'sustainability':
                return <Sustainability key={index} data={blockData} />;
              case 'awards_recognition':
                return <AwardsRecognition key={index} data={blockData} />;
              default:
                return null;
            }
          })}
        </div>
      </div>
    </div>
  );
}

// Product Highlights Block
function ProductHighlights({ data }: { data: any }) {
  if (!data?.highlights || data.highlights.length === 0) return null;
  const $ = data.$ || {};

  return (
    <div className="py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {data.highlights.map((highlight: any, i: number) => {
          const IconComponent = (LucideIcons as any)[highlight.icon] || LucideIcons.Star;
          const highlight$ = highlight.$ || {};
          return (
            <div key={i} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gold-100 rounded-full mb-4">
                <IconComponent className="h-8 w-8 text-gold-600" />
              </div>
              <h3 {...highlight$?.title} className="font-heading text-lg font-bold text-gray-900 mb-2">
                {highlight.title}
              </h3>
              {highlight.description && (
                <p {...highlight$?.description} className="text-sm text-gray-600">{highlight.description}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Technical Specifications Block
function TechSpecs({ data }: { data: any }) {
  if (!data?.specs || data.specs.length === 0) return null;
  const $ = data.$ || {};

  return (
    <div className="py-12">
      {data.section_title && (
        <h2 {...$?.section_title} className="font-heading text-2xl font-bold text-gray-900 mb-6">
          {data.section_title}
        </h2>
      )}
      <div className="space-y-4">
        {data.specs.map((spec: any, i: number) => (
          <div
            key={i}
            className="grid grid-cols-2 gap-4 py-3 border-b border-gray-200 last:border-0"
          >
            <div className="font-semibold text-gray-900">{spec.label}</div>
            <div className="text-gray-700">{spec.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Materials & Craftsmanship Block
function MaterialsCraftsmanship({ data }: { data: any }) {
  if (!data?.description) return null;
  const $ = data.$ || {};

  const image = Array.isArray(data.image) ? data.image[0] : data.image;

  return (
    <div className="py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div>
          {data.title && (
            <h2 {...$?.title} className="font-heading text-2xl font-bold text-gray-900 mb-4">
              {data.title}
            </h2>
          )}
          <div
            {...$?.description}
            className="prose max-w-none text-gray-700 mb-6"
            dangerouslySetInnerHTML={{ __html: data.description }}
          />
          {data.materials && data.materials.length > 0 && (
            <div className="space-y-3">
              {data.materials.map((material: any, i: number) => (
                <div key={i} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-gold-500 rounded-full mt-2" />
                  <div>
                    <div className="font-semibold text-gray-900">{material.name}</div>
                    {material.description && (
                      <div className="text-sm text-gray-600">{material.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {image?.url && (
          <div className="relative aspect-square rounded-lg overflow-hidden shadow-lg">
            <Image
              src={image.url}
              alt={image.title || 'Materials'}
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// What's Included Block
function WhatsIncluded({ data }: { data: any }) {
  if (!data?.items) return null;
  const $ = data.$ || {};

  const image = Array.isArray(data.image) ? data.image[0] : data.image;

  return (
    <div className="py-12">
      {data.title && (
        <h2 {...$?.title} className="font-heading text-2xl font-bold text-gray-900 mb-6">
          {data.title}
        </h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
          {...$?.items}
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: data.items }}
        />
        {image?.url && (
          <div className="relative aspect-square rounded-lg overflow-hidden">
            <Image
              src={image.url}
              alt={image.title || "What's included"}
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Video Showcase Block
function VideoShowcase({ data }: { data: any }) {
  if (!data?.video_url) return null;
  const $ = data.$ || {};

  const thumbnail = Array.isArray(data.thumbnail) ? data.thumbnail[0] : data.thumbnail;

  return (
    <div className="py-12">
      {data.title && (
        <h2 {...$?.title} className="font-heading text-2xl font-bold text-gray-900 mb-6">
          {data.title}
        </h2>
      )}
      <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
        {/* Video embed - you can enhance this with react-player or similar */}
        <div className="relative w-full h-full">
          {thumbnail?.url ? (
            <Image src={thumbnail.url} alt="Video thumbnail" fill className="object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <LucideIcons.Play className="h-20 w-20 text-white/50" />
            </div>
          )}
        </div>
      </div>
      {data.caption && (
        <p {...$?.caption} className="text-gray-600 mt-3 text-sm">{data.caption}</p>
      )}
    </div>
  );
}

// Image Gallery Block
function ImageGallery({ data }: { data: any }) {
  if (!data?.images || data.images.length === 0) return null;
  const $ = data.$ || {};

  const layout = data.layout || 'grid';

  return (
    <div className="py-12">
      {data.title && (
        <h2 {...$?.title} className="font-heading text-2xl font-bold text-gray-900 mb-6">
          {data.title}
        </h2>
      )}
      <div
        className={
          layout === 'masonry'
            ? 'columns-1 md:columns-2 lg:columns-3 gap-4'
            : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
        }
      >
        {data.images.map((image: any, i: number) => (
          <div key={i} className="relative aspect-square rounded-lg overflow-hidden shadow-md">
            <Image
              src={image.url}
              alt={image.title || `Gallery image ${i + 1}`}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Size & Fit Guide Block
function SizeFitGuide({ data }: { data: any }) {
  if (!data?.dimensions || data.dimensions.length === 0) return null;
  const $ = data.$ || {};

  const sizeChart = Array.isArray(data.size_chart) ? data.size_chart[0] : data.size_chart;

  return (
    <div className="py-12">
      {data.title && (
        <h2 {...$?.title} className="font-heading text-2xl font-bold text-gray-900 mb-6">
          {data.title}
        </h2>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        {data.dimensions.map((dim: any, i: number) => (
          <div key={i} className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">{dim.dimension}</div>
            <div className="font-bold text-xl text-gray-900">{dim.measurement}</div>
          </div>
        ))}
      </div>
      {sizeChart?.url && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden mt-6">
          <Image
            src={sizeChart.url}
            alt="Size chart"
            fill
            className="object-contain"
          />
        </div>
      )}
    </div>
  );
}

// Care & Maintenance Block
function CareMaintenance({ data }: { data: any }) {
  if (!data?.instructions) return null;
  const $ = data.$ || {};

  return (
    <div className="py-12">
      {data.title && (
        <h2 {...$?.title} className="font-heading text-2xl font-bold text-gray-900 mb-6">
          {data.title}
        </h2>
      )}
      <div
        {...$?.instructions}
        className="prose max-w-none mb-6"
        dangerouslySetInnerHTML={{ __html: data.instructions }}
      />
      {data.tips && data.tips.length > 0 && (
        <div className="space-y-3 mt-6">
          {data.tips.map((tip: any, i: number) => (
            <div key={i} className="flex items-start space-x-3">
              <LucideIcons.Check className="h-5 w-5 text-gold-600 flex-shrink-0 mt-1" />
              <span className="text-gray-700">{tip.tip}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Sustainability Block
function Sustainability({ data }: { data: any }) {
  if (!data?.story) return null;
  const $ = data.$ || {};

  return (
    <div className="py-12">
      {data.title && (
        <h2 {...$?.title} className="font-heading text-2xl font-bold text-gray-900 mb-6">
          {data.title}
        </h2>
      )}
      <div
        {...$?.story}
        className="prose max-w-none text-gray-700 mb-6"
        dangerouslySetInnerHTML={{ __html: data.story }}
      />
      {data.certifications && data.certifications.length > 0 && (
        <div className="flex flex-wrap gap-6 mt-8">
          {data.certifications.map((cert: any, i: number) => {
            const badge = Array.isArray(cert.badge) ? cert.badge[0] : cert.badge;
            return (
              <div key={i} className="flex items-center space-x-3 bg-green-50 px-4 py-3 rounded-lg">
                {badge?.url && (
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <Image
                      src={badge.url}
                      alt={cert.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                <div className="text-sm font-semibold text-gray-900">{cert.name}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Awards & Recognition Block
function AwardsRecognition({ data }: { data: any }) {
  if (!data?.awards || data.awards.length === 0) return null;
  const $ = data.$ || {};

  return (
    <div className="py-12">
      {data.title && (
        <h2 {...$?.title} className="font-heading text-2xl font-bold text-gray-900 mb-6">
          {data.title}
        </h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.awards.map((award: any, i: number) => {
          const logo = Array.isArray(award.logo) ? award.logo[0] : award.logo;
          return (
            <div
              key={i}
              className="flex items-start space-x-4 p-5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {logo?.url && (
                <div className="relative w-16 h-16 flex-shrink-0">
                  <Image
                    src={logo.url}
                    alt={award.title}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <div>
                <h3 className="font-heading text-lg font-bold text-gray-900 mb-1">
                  {award.title}
                  {award.year && (
                    <span className="text-gold-600 ml-2 text-base">({award.year})</span>
                  )}
                </h3>
                {award.description && (
                  <p className="text-gray-600 text-sm italic">&ldquo;{award.description}&rdquo;</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
