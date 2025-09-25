'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Star, Award, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function HeroSection() {
  return (
    <section className="hero-gradient min-h-screen flex items-center">
      <div className="container-padding w-full">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Star className="h-4 w-4 text-gold-500" />
                <span className="text-sm font-medium text-gray-900">
                  Premium Luxury Technology
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Where Innovation
                <br />
                <span className="text-gradient bg-gradient-to-r from-gold-600 to-gold-400">
                  Meets Luxury
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl">
                Discover the future with Demolux premium wearable technology and innovative technofurniture. 
                Each piece is crafted where cutting-edge design meets exceptional performance.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/categories/wearable-tech">
                  <Button size="xl" className="w-full sm:w-auto group">
                    Shop Wearable Tech
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </Button>
                </Link>
                
                <Link href="/categories/technofurniture">
                  <Button variant="outline" size="xl" className="w-full sm:w-auto">
                    Explore Technofurniture
                  </Button>
                </Link>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gold-100 rounded-full flex items-center justify-center">
                    <Award className="h-5 w-5 text-gold-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Premium Quality</p>
                    <p className="text-sm text-gray-600">Exceptional craftsmanship</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gold-100 rounded-full flex items-center justify-center">
                    <Zap className="h-5 w-5 text-gold-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Innovation</p>
                    <p className="text-sm text-gray-600">Cutting-edge technology</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gold-100 rounded-full flex items-center justify-center">
                    <Star className="h-5 w-5 text-gold-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Luxury Design</p>
                    <p className="text-sm text-gray-600">Sophisticated aesthetics</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative">
              <div className="relative z-10">
                {/* Placeholder for hero image */}
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gold-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Zap className="h-8 w-8 text-gray-900" />
                    </div>
                    <p className="text-gray-600 font-medium">
                      Hero Product Image
                      <br />
                      <span className="text-sm">Coming Soon</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gold-400 rounded-full opacity-20 animate-float"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gray-900 rounded-full opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
