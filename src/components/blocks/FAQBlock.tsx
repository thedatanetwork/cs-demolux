'use client';

import React, { useState } from 'react';
import type { FAQBlock as FAQBlockType } from '@/lib/contentstack';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQBlockProps {
  block: FAQBlockType;
}

export function FAQBlock({ block }: FAQBlockProps) {
  const {
    section_title,
    section_description,
    badge_text,
    faqs,
    layout_style,
    show_categories,
    expand_first,
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
    case 'two-column':
      return <TwoColumnLayout block={block} bgClass={bgClass} />;
    case 'cards':
      return <CardsLayout block={block} bgClass={bgClass} />;
    case 'accordion':
    default:
      return <AccordionLayout block={block} bgClass={bgClass} />;
  }
}

// Accordion Layout (default - like StitchFix)
function AccordionLayout({
  block,
  bgClass
}: {
  block: FAQBlockType;
  bgClass: string;
}) {
  const { section_title, section_description, badge_text, faqs, show_categories, expand_first } = block;
  const [openIndex, setOpenIndex] = useState<number | null>(expand_first ? 0 : null);

  // Group FAQs by category if show_categories is true
  const groupedFaqs = show_categories
    ? faqs.reduce((acc, faq) => {
        const category = faq.category || 'General';
        if (!acc[category]) acc[category] = [];
        acc[category].push(faq);
        return acc;
      }, {} as Record<string, typeof faqs>)
    : { 'All': faqs };

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  let globalIndex = 0;

  return (
    <section className={`section-spacing ${bgClass} relative overflow-hidden`}>
      <div className="container-padding">
        {/* Section Header */}
        <div className="text-center mb-16">
          {badge_text && (
            <div className="inline-flex items-center space-x-2 bg-gold-50 border border-gold-200 rounded-full px-6 py-3 mb-8">
              <HelpCircle className="h-4 w-4 text-gold-600" />
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

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          {Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
            <div key={category} className="mb-8">
              {/* Category Header */}
              {show_categories && category !== 'All' && (
                <h3 className="font-heading text-xl font-bold text-gray-900 mb-4 pl-2">
                  {category}
                </h3>
              )}

              {/* FAQ Items */}
              <div className="space-y-4">
                {categoryFaqs.map((faq, index) => {
                  const currentGlobalIndex = globalIndex++;
                  const isOpen = openIndex === currentGlobalIndex;

                  return (
                    <div
                      key={currentGlobalIndex}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFaq(currentGlobalIndex)}
                        className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-semibold text-gray-900 text-lg">
                          {faq.question}
                        </span>
                        <ChevronDown
                          className={`h-5 w-5 text-gold-500 flex-shrink-0 transition-transform duration-300 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {/* Answer */}
                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          isOpen ? 'max-h-96' : 'max-h-0'
                        }`}
                      >
                        <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Two Column Layout
function TwoColumnLayout({
  block,
  bgClass
}: {
  block: FAQBlockType;
  bgClass: string;
}) {
  const { section_title, section_description, badge_text, faqs, expand_first } = block;
  const [openIndex, setOpenIndex] = useState<number | null>(expand_first ? 0 : null);

  // Split FAQs into two columns
  const midPoint = Math.ceil(faqs.length / 2);
  const leftColumn = faqs.slice(0, midPoint);
  const rightColumn = faqs.slice(midPoint);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const renderFaqItem = (faq: typeof faqs[0], index: number) => {
    const isOpen = openIndex === index;

    return (
      <div
        key={index}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <button
          onClick={() => toggleFaq(index)}
          className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
        >
          <span className="font-semibold text-gray-900">
            {faq.question}
          </span>
          <ChevronDown
            className={`h-5 w-5 text-gold-500 flex-shrink-0 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ${
            isOpen ? 'max-h-96' : 'max-h-0'
          }`}
        >
          <div className="px-5 pb-4 text-gray-600 leading-relaxed text-sm">
            {faq.answer}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className={`section-spacing ${bgClass} relative overflow-hidden`}>
      <div className="container-padding">
        {/* Section Header */}
        <div className="text-center mb-16">
          {badge_text && (
            <div className="inline-flex items-center space-x-2 bg-gold-50 border border-gold-200 rounded-full px-6 py-3 mb-8">
              <HelpCircle className="h-4 w-4 text-gold-600" />
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

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          <div className="space-y-4">
            {leftColumn.map((faq, index) => renderFaqItem(faq, index))}
          </div>
          <div className="space-y-4">
            {rightColumn.map((faq, index) => renderFaqItem(faq, index + midPoint))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Cards Layout
function CardsLayout({
  block,
  bgClass
}: {
  block: FAQBlockType;
  bgClass: string;
}) {
  const { section_title, section_description, badge_text, faqs, show_categories } = block;

  // Group FAQs by category if show_categories is true
  const groupedFaqs = show_categories
    ? faqs.reduce((acc, faq) => {
        const category = faq.category || 'General';
        if (!acc[category]) acc[category] = [];
        acc[category].push(faq);
        return acc;
      }, {} as Record<string, typeof faqs>)
    : { 'All': faqs };

  return (
    <section className={`section-spacing ${bgClass} relative overflow-hidden`}>
      <div className="container-padding">
        {/* Section Header */}
        <div className="text-center mb-16">
          {badge_text && (
            <div className="inline-flex items-center space-x-2 bg-gold-50 border border-gold-200 rounded-full px-6 py-3 mb-8">
              <HelpCircle className="h-4 w-4 text-gold-600" />
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

        {/* FAQ Cards */}
        {Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
          <div key={category} className="mb-12 last:mb-0">
            {/* Category Header */}
            {show_categories && category !== 'All' && (
              <h3 className="font-heading text-2xl font-bold text-gray-900 mb-6 text-center">
                {category}
              </h3>
            )}

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {categoryFaqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100"
                >
                  <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center mb-4">
                    <HelpCircle className="h-5 w-5 text-gold-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    {faq.question}
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
