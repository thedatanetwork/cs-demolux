'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import type { GallerySectionBlock as GallerySectionBlockType } from '@/lib/contentstack';
import { X } from 'lucide-react';

interface GallerySectionBlockProps {
  block: GallerySectionBlockType & {
    $?: Record<string, any>;  // Editable tags from addEditableTags()
  };
}

export function GallerySectionBlock({ block }: GallerySectionBlockProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const {
    variant,
    section_title,
    section_description,
    images,
    columns = 3,
    spacing = 'normal',
    enable_lightbox,
    enable_captions,
    background_style
  } = block;
  const $ = block.$ || {};

  const handleImageClick = (index: number) => {
    if (enable_lightbox) {
      setLightboxIndex(index);
      setLightboxOpen(true);
    }
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setLightboxIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setLightboxIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  // Background styles
  const backgroundClasses = {
    white: 'bg-white',
    black: 'bg-black',
    gray: 'bg-gray-50'
  };

  // Spacing classes
  const spacingClasses = {
    tight: 'gap-2',
    normal: 'gap-6',
    loose: 'gap-12'
  };

  // Column classes
  const columnClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5'
  };

  const bgClass = backgroundClasses[background_style];
  const spacingClass = spacingClasses[spacing];
  const columnClass = columnClasses[columns];

  return (
    <section className={`section-spacing ${bgClass} relative`}>
      <div className="container-padding">
        {/* Section Header */}
        {(section_title || section_description) && (
          <div className={`text-center mb-16 ${background_style === 'black' ? 'text-white' : 'text-gray-900'}`}>
            {section_title && (
              <h2 {...$['section_title']} className="font-heading text-4xl md:text-5xl font-bold mb-6">
                {section_title}
              </h2>
            )}
            {section_description && (
              <p {...$['section_description']} className={`text-lg md:text-xl max-w-3xl mx-auto leading-relaxed ${background_style === 'black' ? 'text-gray-300' : 'text-gray-600'}`}>
                {section_description}
              </p>
            )}
            <div className="mt-8 flex justify-center">
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent"></div>
            </div>
          </div>
        )}

        {/* Gallery Grid */}
        {variant === 'grid_gallery' && (
          <div className={`grid ${columnClass} ${spacingClass}`}>
            {images.map((image, index) => (
              <div
                key={index}
                className={`relative aspect-square overflow-hidden rounded-lg ${enable_lightbox ? 'cursor-pointer' : ''} group`}
                onClick={() => handleImageClick(index)}
              >
                <Image
                  src={image.url}
                  alt={image.title || `Gallery image ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {enable_captions && image.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <p className="text-white text-sm font-medium">{image.title}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Masonry Gallery */}
        {variant === 'masonry_gallery' && (
          <div className={`columns-1 md:columns-2 lg:columns-${columns} ${spacingClass}`}>
            {images.map((image, index) => (
              <div
                key={index}
                className={`relative mb-${spacing === 'tight' ? 2 : spacing === 'normal' ? 6 : 12} break-inside-avoid overflow-hidden rounded-lg ${enable_lightbox ? 'cursor-pointer' : ''} group`}
                onClick={() => handleImageClick(index)}
              >
                <img
                  src={image.url}
                  alt={image.title || `Gallery image ${index + 1}`}
                  className="w-full group-hover:scale-110 transition-transform duration-500"
                />
                {enable_captions && image.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <p className="text-white text-sm font-medium">{image.title}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Carousel Gallery */}
        {variant === 'carousel_gallery' && (
          <div className="flex overflow-x-auto space-x-6 pb-4 snap-x snap-mandatory">
            {images.map((image, index) => (
              <div
                key={index}
                className={`flex-shrink-0 w-80 aspect-square relative overflow-hidden rounded-lg snap-start ${enable_lightbox ? 'cursor-pointer' : ''} group`}
                onClick={() => handleImageClick(index)}
              >
                <Image
                  src={image.url}
                  alt={image.title || `Gallery image ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {enable_captions && image.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <p className="text-white text-sm font-medium">{image.title}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Fullscreen Gallery */}
        {variant === 'fullscreen_gallery' && (
          <div className={`grid ${columnClass} ${spacingClass}`}>
            {images.map((image, index) => (
              <div
                key={index}
                className={`relative aspect-video overflow-hidden rounded-lg ${enable_lightbox ? 'cursor-pointer' : ''} group`}
                onClick={() => handleImageClick(index)}
              >
                <Image
                  src={image.url}
                  alt={image.title || `Gallery image ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {enable_captions && image.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <p className="text-white text-sm font-medium">{image.title}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && enable_lightbox && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <X className="h-8 w-8" />
          </button>

          {/* Previous Button */}
          <button
            onClick={prevImage}
            className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Image */}
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-8">
            <img
              src={images[lightboxIndex].url}
              alt={images[lightboxIndex].title || `Gallery image ${lightboxIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            {enable_captions && images[lightboxIndex].title && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm rounded-lg px-6 py-3">
                <p className="text-white text-center">{images[lightboxIndex].title}</p>
              </div>
            )}
          </div>

          {/* Next Button */}
          <button
            onClick={nextImage}
            className="absolute right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </section>
  );
}
