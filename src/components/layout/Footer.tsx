'use client';

import React from 'react';
import Link from 'next/link';
import { Instagram, Twitter, Linkedin, Youtube } from 'lucide-react';
import { NavigationMenu, SiteSettings } from '@/lib/contentstack';

interface FooterProps {
  navigation: NavigationMenu[];
  siteSettings: SiteSettings;
}

export function Footer({ navigation, siteSettings }: FooterProps) {
  const footerNav = navigation.find(nav => nav.menu_location === 'footer');
  const menuItems = footerNav?.menu_items?.filter(item => item.is_active) || [];

  const currentYear = new Date().getFullYear();

  const socialIcons = {
    instagram: Instagram,
    twitter: Twitter,
    linkedin: Linkedin,
    youtube: Youtube,
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-padding section-spacing">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              {siteSettings.logo ? (
                <img
                  src={siteSettings.logo.url}
                  alt={siteSettings.site_name}
                  className="h-8 w-auto filter brightness-0 invert"
                />
              ) : (
                <span className="text-2xl font-heading font-bold">
                  {siteSettings.site_name}
                </span>
              )}
            </Link>
            <p className="text-gray-300 mb-6 max-w-md">
              {siteSettings.tagline}
            </p>
            
            {/* Contact Info */}
            {siteSettings.contact_info && (
              <div className="space-y-2 text-gray-300">
                <p>{siteSettings.contact_info.email}</p>
                {siteSettings.contact_info.phone && (
                  <p>{siteSettings.contact_info.phone}</p>
                )}
                {siteSettings.contact_info.address && (
                  <p className="text-sm">{siteSettings.contact_info.address}</p>
                )}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {menuItems
                .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                .map((item) => (
                  <li key={item.url}>
                    <Link
                      href={item.url}
                      className="text-gray-300 hover:text-white transition-colors duration-200"
                      {...(item.opens_new_tab && { target: '_blank', rel: 'noopener noreferrer' })}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Stay Connected</h3>
            <p className="text-gray-300 text-sm mb-4">
              Subscribe to our newsletter for the latest updates on new products and innovations.
            </p>
            
            {/* Newsletter Signup */}
            <div className="mb-6">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
                />
                <button className="px-4 py-2 bg-gold-400 text-gray-900 rounded-r-md hover:bg-gold-500 transition-colors duration-200 font-medium">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Social Links */}
            {siteSettings.social_links && (
              <div className="flex space-x-4">
                {Object.entries(siteSettings.social_links).map(([platform, url]) => {
                  if (!url) return null;
                  const IconComponent = socialIcons[platform as keyof typeof socialIcons];
                  if (!IconComponent) return null;

                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      <IconComponent className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} {siteSettings.site_name}. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm mt-2 md:mt-0">
            Crafted with precision and innovation.
          </p>
        </div>
      </div>
    </footer>
  );
}
