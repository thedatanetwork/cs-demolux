'use client';

import React, { useEffect, useState, useRef } from 'react';
import type { StatisticsBlock as StatisticsBlockType } from '@/lib/contentstack';
import {
  TrendingUp,
  Users,
  Award,
  Clock,
  Star,
  ShoppingBag,
  Heart,
  Zap,
  Globe,
  CheckCircle
} from 'lucide-react';

interface StatisticsBlockProps {
  block: StatisticsBlockType;
}

// Icon mapping for dynamic icon rendering
const iconMap: Record<string, React.ComponentType<any>> = {
  TrendingUp,
  Users,
  Award,
  Clock,
  Star,
  ShoppingBag,
  Heart,
  Zap,
  Globe,
  CheckCircle
};

export function StatisticsBlock({ block }: StatisticsBlockProps) {
  const {
    section_title,
    section_description,
    badge_text,
    metrics,
    layout_style,
    background_style,
    animated
  } = block;

  // Background styles
  const backgroundClasses = {
    white: 'bg-white text-gray-900',
    dark: 'bg-gray-900 text-white',
    gradient: 'bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white',
    'gradient-gold': 'bg-gradient-to-br from-gold-600 via-gold-500 to-gold-700 text-white'
  };

  const bgClass = backgroundClasses[background_style] || 'bg-white text-gray-900';
  const isDark = background_style === 'dark' || background_style === 'gradient' || background_style === 'gradient-gold';

  // Grid classes based on layout
  const gridClasses = {
    horizontal: 'flex flex-wrap justify-center gap-8 lg:gap-16',
    'grid-3': 'grid grid-cols-1 md:grid-cols-3 gap-8',
    'grid-4': 'grid grid-cols-2 md:grid-cols-4 gap-8'
  };

  const gridClass = gridClasses[layout_style] || gridClasses.horizontal;

  return (
    <section className={`section-spacing ${bgClass} relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)'} 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="container-padding relative">
        {/* Section Header */}
        {(section_title || badge_text) && (
          <div className="text-center mb-16">
            {badge_text && (
              <div className={`inline-flex items-center space-x-2 ${isDark ? 'bg-white/10' : 'bg-gray-100'} rounded-full px-6 py-3 mb-8`}>
                <div className={`w-2 h-2 ${isDark ? 'bg-gold-400' : 'bg-gold-500'} rounded-full`}></div>
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {badge_text}
                </span>
              </div>
            )}

            {section_title && (
              <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">
                {section_title.split(' ').map((word, index, arr) => (
                  <span
                    key={index}
                    className={index === arr.length - 1 ? 'text-gradient bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent' : ''}
                  >
                    {word}{index < arr.length - 1 ? ' ' : ''}
                  </span>
                ))}
              </h2>
            )}

            {section_description && (
              <p className={`text-lg md:text-xl max-w-3xl mx-auto ${isDark ? 'text-white/80' : 'text-gray-600'}`}>
                {section_description}
              </p>
            )}
          </div>
        )}

        {/* Metrics */}
        <div className={gridClass}>
          {(metrics || []).map((metric, index) => (
            <StatisticItem
              key={index}
              metric={metric}
              isDark={isDark}
              animated={animated}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Individual Statistic Item with animation
function StatisticItem({
  metric,
  isDark,
  animated,
  index
}: {
  metric: StatisticsBlockType['metrics'][0];
  isDark: boolean;
  animated: boolean;
  index: number;
}) {
  const [displayValue, setDisplayValue] = useState(animated ? '0' : metric.value);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const IconComponent = metric.icon ? iconMap[metric.icon] : TrendingUp;

  useEffect(() => {
    if (!animated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [animated, isVisible]);

  useEffect(() => {
    if (!animated || !isVisible) return;

    // Parse the target value - extract numbers and suffix
    const numericMatch = metric.value.match(/^([\d,]+)/);
    if (!numericMatch) {
      setDisplayValue(metric.value);
      return;
    }

    const targetNumber = parseInt(numericMatch[1].replace(/,/g, ''));
    const suffix = metric.value.slice(numericMatch[0].length);
    const prefix = metric.value.match(/^[^\d]*/)?.[0] || '';

    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      // Easing function for smoother animation
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(targetNumber * easedProgress);

      setDisplayValue(prefix + currentValue.toLocaleString() + suffix);

      if (currentStep >= steps) {
        clearInterval(timer);
        setDisplayValue(metric.value);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [animated, isVisible, metric.value]);

  return (
    <div
      ref={ref}
      className="text-center group"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Icon */}
      {metric.icon && (
        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 ${isDark ? 'bg-white/10' : 'bg-gold-100'} group-hover:scale-110 transition-transform duration-300`}>
          <IconComponent className={`h-7 w-7 ${isDark ? 'text-gold-400' : 'text-gold-600'}`} />
        </div>
      )}

      {/* Value */}
      <div className={`font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {displayValue}
      </div>

      {/* Label */}
      <div className={`text-lg font-semibold mb-1 ${isDark ? 'text-white/90' : 'text-gray-900'}`}>
        {metric.label}
      </div>

      {/* Description */}
      {metric.description && (
        <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
          {metric.description}
        </p>
      )}
    </div>
  );
}
