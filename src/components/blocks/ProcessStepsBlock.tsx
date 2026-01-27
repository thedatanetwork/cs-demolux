'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { ProcessStepsBlock as ProcessStepsBlockType } from '@/lib/contentstack';
import { Button } from '@/components/ui/Button';
import {
  ArrowRight,
  CheckCircle,
  Sparkles,
  Users,
  Gift,
  Truck,
  Star,
  Zap,
  Heart,
  ShoppingBag,
  Palette,
  Target,
  Search,
  Package,
  HeartHandshake
} from 'lucide-react';

interface ProcessStepsBlockProps {
  block: ProcessStepsBlockType;
}

// Icon mapping for dynamic icon rendering
const iconMap: Record<string, React.ComponentType<any>> = {
  CheckCircle,
  Sparkles,
  Users,
  Gift,
  Truck,
  Star,
  Zap,
  Heart,
  ShoppingBag,
  Palette,
  Target,
  ArrowRight,
  Search,
  Package,
  HeartHandshake
};

export function ProcessStepsBlock({ block }: ProcessStepsBlockProps) {
  const {
    section_title,
    section_description,
    badge_text,
    steps,
    layout_style,
    show_step_numbers,
    show_connector_lines,
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
    case 'vertical':
      return <VerticalLayout block={block} bgClass={bgClass} />;
    case 'alternating':
      return <AlternatingLayout block={block} bgClass={bgClass} />;
    case 'horizontal':
    default:
      return <HorizontalLayout block={block} bgClass={bgClass} />;
  }
}

// Horizontal Layout - Steps in a row (like StitchFix)
function HorizontalLayout({
  block,
  bgClass
}: {
  block: ProcessStepsBlockType;
  bgClass: string;
}) {
  const { section_title, section_description, badge_text, steps, show_step_numbers, show_connector_lines } = block;

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
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              {section_description}
            </p>
          )}
        </div>

        {/* Steps Grid */}
        <div className="relative">
          {/* Connector Line */}
          {show_connector_lines && (steps || []).length > 1 && (
            <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold-300 to-transparent"
                 style={{ left: '15%', right: '15%' }} />
          )}

          <div className={`grid grid-cols-1 md:grid-cols-${Math.min((steps || []).length, 3)} lg:grid-cols-${Math.min((steps || []).length, 4)} gap-8 lg:gap-12`}>
            {(steps || []).map((step, index) => {
              const IconComponent = (step.icon && iconMap[step.icon]) || CheckCircle;
              const stepImage = Array.isArray(step.image) ? step.image[0] : step.image;

              return (
                <div key={index} className="relative text-center group">
                  {/* Step Number or Icon */}
                  <div className="relative z-10 mb-6">
                    {stepImage?.url ? (
                      <div className="w-32 h-32 mx-auto rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <Image
                          src={stepImage.url}
                          alt={step.title}
                          width={128}
                          height={128}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                        {show_step_numbers ? (
                          <span className="text-3xl font-bold text-white">
                            {step.step_number || index + 1}
                          </span>
                        ) : (
                          <IconComponent className="h-10 w-10 text-white" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Step Content */}
                  <h3 className="font-heading text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {step.description}
                  </p>

                  {/* Optional CTA */}
                  {step.cta && (
                    <Link href={step.cta.url}>
                      <Button variant="outline" size="sm" className="group/btn">
                        {step.cta.text}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// Vertical Layout - Steps stacked vertically
function VerticalLayout({
  block,
  bgClass
}: {
  block: ProcessStepsBlockType;
  bgClass: string;
}) {
  const { section_title, section_description, badge_text, steps, show_step_numbers, show_connector_lines } = block;

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

          <h2 className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {section_title}
          </h2>

          {section_description && (
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {section_description}
            </p>
          )}
        </div>

        {/* Vertical Steps */}
        <div className="max-w-3xl mx-auto">
          {(steps || []).map((step, index) => {
            const IconComponent = (step.icon && iconMap[step.icon]) || CheckCircle;
            const isLast = index === (steps || []).length - 1;

            return (
              <div key={index} className="relative flex gap-6 pb-12">
                {/* Connector Line */}
                {show_connector_lines && !isLast && (
                  <div className="absolute left-10 top-20 bottom-0 w-0.5 bg-gradient-to-b from-gold-400 to-gold-200" />
                )}

                {/* Step Number/Icon */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center shadow-lg">
                    {show_step_numbers ? (
                      <span className="text-2xl font-bold text-white">
                        {step.step_number || index + 1}
                      </span>
                    ) : (
                      <IconComponent className="h-10 w-10 text-white" />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <h3 className="font-heading text-2xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {step.description}
                  </p>
                  {step.cta && (
                    <Link href={step.cta.url} className="inline-block mt-4">
                      <Button variant="outline" size="sm" className="group">
                        {step.cta.text}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
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

// Alternating Layout - Steps alternate left/right
function AlternatingLayout({
  block,
  bgClass
}: {
  block: ProcessStepsBlockType;
  bgClass: string;
}) {
  const { section_title, section_description, badge_text, steps, show_step_numbers } = block;

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

          <h2 className="font-heading text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {section_title}
          </h2>

          {section_description && (
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {section_description}
            </p>
          )}
        </div>

        {/* Alternating Steps */}
        <div className="max-w-5xl mx-auto space-y-16">
          {(steps || []).map((step, index) => {
            const IconComponent = (step.icon && iconMap[step.icon]) || CheckCircle;
            const stepImage = Array.isArray(step.image) ? step.image[0] : step.image;
            const isEven = index % 2 === 0;

            return (
              <div
                key={index}
                className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 md:gap-16 items-center`}
              >
                {/* Visual */}
                <div className="flex-1 w-full">
                  {stepImage?.url ? (
                    <div className="aspect-video relative rounded-2xl overflow-hidden shadow-xl">
                      <Image
                        src={stepImage.url}
                        alt={step.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-gold-100 to-gold-200 rounded-2xl flex items-center justify-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center shadow-lg">
                        {show_step_numbers ? (
                          <span className="text-4xl font-bold text-white">
                            {step.step_number || index + 1}
                          </span>
                        ) : (
                          <IconComponent className="h-12 w-12 text-white" />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  {show_step_numbers && (
                    <span className="inline-block text-sm font-bold text-gold-600 mb-2">
                      Step {step.step_number || index + 1}
                    </span>
                  )}
                  <h3 className="font-heading text-3xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    {step.description}
                  </p>
                  {step.cta && (
                    <Link href={step.cta.url}>
                      <Button variant="gold" size="lg" className="group">
                        {step.cta.text}
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
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
