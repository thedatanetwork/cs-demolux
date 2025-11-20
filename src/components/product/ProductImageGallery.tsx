'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageData {
  uid: string;
  url: string;
  title: string;
  filename: string;
}

interface ProductImageGalleryProps {
  productTitle: string;
  featuredImage: ImageData[] | ImageData;
  additionalImages?: ImageData[];
}

export function ProductImageGallery({
  productTitle,
  featuredImage,
  additionalImages = [],
}: ProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Combine all images into a single array
  const featuredImages = Array.isArray(featuredImage)
    ? featuredImage
    : featuredImage ? [featuredImage] : [];

  const allImages = [...featuredImages, ...additionalImages];

  // If no images, show placeholder
  if (allImages.length === 0) {
    return (
      <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">No Image Available</span>
      </div>
    );
  }

  const currentImage = allImages[selectedImageIndex];
  const hasMultipleImages = allImages.length > 1;

  const handlePrevious = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setSelectedImageIndex((prev) =>
      prev === allImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
        <Image
          src={currentImage.url}
          alt={currentImage.title || `${productTitle} - Image ${selectedImageIndex + 1}`}
          fill
          className="object-cover"
          priority={selectedImageIndex === 0}
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* Navigation Arrows (only show if multiple images) */}
        {hasMultipleImages && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6 text-gray-800" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6 text-gray-800" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {hasMultipleImages && (
          <div className="absolute bottom-4 right-4 bg-black/60 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
            {selectedImageIndex + 1} / {allImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {hasMultipleImages && (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {allImages.map((image, index) => (
            <button
              key={image.uid}
              onClick={() => setSelectedImageIndex(index)}
              className={`
                relative aspect-square bg-gray-100 rounded-lg overflow-hidden
                transition-all duration-200 cursor-pointer
                ${
                  selectedImageIndex === index
                    ? 'ring-2 ring-gray-900 ring-offset-2'
                    : 'hover:ring-2 hover:ring-gray-400 hover:ring-offset-2 opacity-70 hover:opacity-100'
                }
              `}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image.url}
                alt={image.title || `${productTitle} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 20vw, 10vw"
              />
            </button>
          ))}
        </div>
      )}

      {/* Mobile Swipe Indicator (optional) */}
      {hasMultipleImages && (
        <div className="md:hidden text-center text-sm text-gray-500">
          Tap the arrows or thumbnails to view more images
        </div>
      )}
    </div>
  );
}
