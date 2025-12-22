'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ShoppingBag, Search } from 'lucide-react';
import type { NavigationMenu, Product } from '@/lib/contentstack';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/contexts/CartContext';
import { SearchOverlay } from '@/components/search/SearchOverlay';

interface HeaderProps {
  navigation: NavigationMenu[];
  siteName: string;
  logoUrl?: string;
}

export function Header({ navigation, siteName, logoUrl }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const { state } = useCart();

  const headerNav = navigation.find(nav => nav.menu_location === 'header');
  const menuItems = headerNav?.menu_items?.filter(item => item.is_active) || [];

  // Fetch products when search is first opened
  useEffect(() => {
    if (searchOpen && products.length === 0 && !productsLoading) {
      setProductsLoading(true);
      fetch('/api/products')
        .then(res => res.json())
        .then(data => {
          setProducts(data.products || []);
          setProductsLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch products for search:', err);
          setProductsLoading(false);
        });
    }
  }, [searchOpen, products.length, productsLoading]);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container-padding">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              {logoUrl && logoUrl.trim() ? (
                <img
                  src={logoUrl}
                  alt={siteName}
                  className="h-8 w-auto lg:h-10"
                  onError={(e) => {
                    // Fallback to text if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const textSpan = target.nextElementSibling as HTMLSpanElement;
                    if (textSpan) textSpan.style.display = 'inline';
                  }}
                />
              ) : null}
              <span 
                className={`text-2xl font-heading font-bold text-gray-900 ${logoUrl && logoUrl.trim() ? 'hidden' : ''}`}
              >
                {siteName}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {menuItems
              .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
              .map((item) => (
                <Link
                  key={item.url}
                  href={item.url}
                  className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200"
                  {...(item.opens_new_tab && { target: '_blank', rel: 'noopener noreferrer' })}
                >
                  {item.label}
                </Link>
              ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Icon */}
            <button
              onClick={() => setSearchOpen(true)}
              className="text-gray-700 hover:text-gray-900 transition-colors duration-200"
              aria-label="Search products"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Shopping Cart */}
            <Link href="/cart" className="relative text-gray-700 hover:text-gray-900 transition-colors duration-200 group">
              <ShoppingBag className="h-5 w-5" />
              {state.itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium group-hover:bg-gold-600 transition-colors duration-200">
                  {state.itemCount > 99 ? '99+' : state.itemCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              className="lg:hidden text-gray-700 hover:text-gray-900 transition-colors duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="container-padding py-4">
            <nav className="flex flex-col space-y-3">
              {menuItems
                .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                .map((item) => (
                  <Link
                    key={item.url}
                    href={item.url}
                    className="text-gray-700 hover:text-gray-900 font-medium py-2 transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                    {...(item.opens_new_tab && { target: '_blank', rel: 'noopener noreferrer' })}
                  >
                    {item.label}
                  </Link>
                ))}
            </nav>
          </div>
        </div>
      )}

      {/* Search Overlay */}
      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        products={products}
      />
    </header>
  );
}
