'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import type { TestimonialsBlock as TestimonialsBlockType } from '@/lib/contentstack';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface TestimonialsBlockProps {
  block: TestimonialsBlockType;
}

export function TestimonialsBlock({ block }: TestimonialsBlockProps) {
  const {
    section_title,
    section_description,
    badge_text,
    testimonials,
    layout_style,
    show_ratings,
    show_images,
    background_style
  } = block;

  // Background styles
  const backgroundClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    gradient: 'bg-gradient-to-b from-white to-gray-50'
  };

  const bgClass = backgroundClasses[background_style] || 'bg-white';

  // Render based on layout
  switch (layout_style) {
    case 'grid':
      return <GridLayout block={block} bgClass={bgClass} />;
    case 'single-featured':
      return <SingleFeaturedLayout block={block} bgClass={bgClass} />;
    case 'carousel':
    default:
      return <CarouselLayout block={block} bgClass={bgClass} />;
  }
}

// Carousel Layout
function CarouselLayout({
  block,
  bgClass
}: {
  block: TestimonialsBlockType;
  bgClass: string;
}) {
  const { section_title, section_description, badge_text, testimonials, show_ratings, show_images } = block;
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];
  const customerImage = Array.isArray(currentTestimonial?.customer_image)
    ? currentTestimonial.customer_image[0]
    : currentTestimonial?.customer_image;

  return (
    <section className={`section-spacing ${bgClass} relative overflow-hidden`}>
      <div className="container-padding">
        {/* Section Header */}
        <div className="text-center mb-16">
          {badge_text && (
            <div className="inline-flex items-center space-x-2 bg-gold-50 border border-gold-200 rounded-full px-6 py-3 mb-8">
              <div className="w-2 h-2 bg-gold-400 rounded-full"></div>
              <span className="text-sm font-medium text-gold-800">
                {badge_text}
              </span>
            </div>
          )}

          {section_title && (
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-6">
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

          {section_description && (
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {section_description}
            </p>
          )}
        </div>

        {/* Testimonial Carousel */}
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-white rounded-2xl shadow-xl p-8 md:p-12">
            {/* Quote Icon */}
            <Quote className="absolute top-6 left-6 h-12 w-12 text-gold-200" />

            {/* Testimonial Content */}
            <div className="relative z-10 text-center">
              {/* Customer Image */}
              {show_images && customerImage?.url && (
                <div className="w-20 h-20 mx-auto mb-6 rounded-full overflow-hidden border-4 border-gold-200 shadow-lg">
                  <Image
                    src={customerImage.url}
                    alt={currentTestimonial.customer_name}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}

              {/* Rating */}
              {show_ratings && currentTestimonial.rating && (
                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < currentTestimonial.rating! ? 'text-gold-400 fill-gold-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              )}

              {/* Testimonial Text */}
              <blockquote className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-8 italic">
                "{currentTestimonial.testimonial_text}"
              </blockquote>

              {/* Customer Info */}
              <div>
                <p className="font-heading text-lg font-bold text-gray-900">
                  {currentTestimonial.customer_name}
                </p>
                {currentTestimonial.customer_title && (
                  <p className="text-gray-500">
                    {currentTestimonial.customer_title}
                  </p>
                )}
              </div>
            </div>

            {/* Navigation Arrows */}
            {testimonials.length > 1 && (
              <>
                <button
                  onClick={goToPrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-100 hover:bg-gold-100 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="h-6 w-6 text-gray-600" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-100 hover:bg-gold-100 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="h-6 w-6 text-gray-600" />
                </button>
              </>
            )}
          </div>

          {/* Dots Indicator */}
          {testimonials.length > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-gold-500 w-8'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Grid Layout
function GridLayout({
  block,
  bgClass
}: {
  block: TestimonialsBlockType;
  bgClass: string;
}) {
  const { section_title, section_description, badge_text, testimonials, show_ratings, show_images } = block;

  return (
    <section className={`section-spacing ${bgClass} relative overflow-hidden`}>
      <div className="container-padding">
        {/* Section Header */}
        <div className="text-center mb-16">
          {badge_text && (
            <div className="inline-flex items-center space-x-2 bg-gold-50 border border-gold-200 rounded-full px-6 py-3 mb-8">
              <div className="w-2 h-2 bg-gold-400 rounded-full"></div>
              <span className="text-sm font-medium text-gold-800">
                {badge_text}
              </span>
            </div>
          )}

          {section_title && (
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {section_title}
            </h2>
          )}

          {section_description && (
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {section_description}
            </p>
          )}
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => {
            const customerImage = Array.isArray(testimonial.customer_image)
              ? testimonial.customer_image[0]
              : testimonial.customer_image;

            return (
              <div
                key={testimonial.uid || index}
                className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
              >
                {/* Quote Icon */}
                <Quote className="h-8 w-8 text-gold-300 mb-4" />

                {/* Testimonial Text */}
                <p className="text-gray-700 leading-relaxed mb-6 italic">
                  "{testimonial.testimonial_text}"
                </p>

                {/* Rating */}
                {show_ratings && testimonial.rating && (
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < testimonial.rating! ? 'text-gold-400 fill-gold-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                )}

                {/* Customer Info */}
                <div className="flex items-center gap-4">
                  {show_images && customerImage?.url && (
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gold-200">
                      <Image
                        src={customerImage.url}
                        alt={testimonial.customer_name}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {testimonial.customer_name}
                    </p>
                    {testimonial.customer_title && (
                      <p className="text-sm text-gray-500">
                        {testimonial.customer_title}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Single Featured Layout
function SingleFeaturedLayout({
  block,
  bgClass
}: {
  block: TestimonialsBlockType;
  bgClass: string;
}) {
  const { section_title, badge_text, testimonials, show_ratings, show_images } = block;

  // Use first testimonial as featured
  const featured = testimonials[0];
  if (!featured) return null;

  const customerImage = Array.isArray(featured.customer_image)
    ? featured.customer_image[0]
    : featured.customer_image;

  return (
    <section className={`section-spacing ${bgClass} relative overflow-hidden`}>
      <div className="container-padding">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image Side */}
            {show_images && customerImage?.url && (
              <div className="relative">
                <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={customerImage.url}
                    alt={featured.customer_name}
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gold-400 rounded-full opacity-20"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gray-900 rounded-full opacity-10"></div>
              </div>
            )}

            {/* Content Side */}
            <div>
              {badge_text && (
                <div className="inline-flex items-center space-x-2 bg-gold-50 border border-gold-200 rounded-full px-6 py-3 mb-6">
                  <div className="w-2 h-2 bg-gold-400 rounded-full"></div>
                  <span className="text-sm font-medium text-gold-800">
                    {badge_text}
                  </span>
                </div>
              )}

              {section_title && (
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                  {section_title}
                </h2>
              )}

              <Quote className="h-12 w-12 text-gold-300 mb-6" />

              <blockquote className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-8 italic">
                "{featured.testimonial_text}"
              </blockquote>

              {/* Rating */}
              {show_ratings && featured.rating && (
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 ${i < featured.rating! ? 'text-gold-400 fill-gold-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              )}

              {/* Customer Info */}
              <div>
                <p className="font-heading text-xl font-bold text-gray-900">
                  {featured.customer_name}
                </p>
                {featured.customer_title && (
                  <p className="text-gray-500">
                    {featured.customer_title}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
