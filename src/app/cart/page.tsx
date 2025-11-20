'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';
import { Plus, Minus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { dataService } from '@/lib/data-service';

export default function CartPage() {
  const { state, updateQuantity, removeItem, clearCart } = useCart();
  const [navigation, setNavigation] = React.useState<any[]>([]);
  const [siteSettings, setSiteSettings] = React.useState<any>(null);

  // Fetch navigation and site settings
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [nav, settings] = await Promise.all([
          dataService.getNavigationMenus(),
          dataService.getSiteSettings()
        ]);
        setNavigation(nav);
        setSiteSettings(settings);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const fallbackSiteSettings = siteSettings || {
    uid: 'fallback',
    site_name: 'Demolux',
    tagline: 'Premium Wearable Tech & Technofurniture',
    logo: undefined,
    contact_info: undefined,
    social_links: undefined,
    seo: undefined
  };

  const handleQuantityChange = (productId: string, newQuantity: number, product: any) => {
    // Track quantity change with Lytics
    if (typeof window !== 'undefined' && window.jstag) {
      window.jstag.send({
        stream: 'cart_quantity_change',
        data: {
          product_id: productId,
          product_title: product.title,
          old_quantity: product.quantity,
          new_quantity: newQuantity,
          timestamp: new Date().toISOString()
        }
      });
    }

    if (newQuantity <= 0) {
      removeItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId: string, product: any) => {
    // Track item removal with Lytics
    if (typeof window !== 'undefined' && window.jstag) {
      window.jstag.send({
        stream: 'cart_remove_item',
        data: {
          product_id: productId,
          product_title: product.title,
          product_price: product.price,
          product_category: product.category,
          quantity: product.quantity,
          timestamp: new Date().toISOString()
        }
      });
    }

    removeItem(productId);
  };

  const handleClearCart = () => {
    // Track clear cart with Lytics
    if (typeof window !== 'undefined' && window.jstag) {
      window.jstag.send({
        stream: 'cart_clear',
        data: {
          items_count: state.itemCount,
          cart_total: state.total,
          timestamp: new Date().toISOString()
        }
      });
    }

    clearCart();
  };

  const handleProceedToCheckout = () => {
    // Track proceed to checkout with Lytics
    if (typeof window !== 'undefined' && window.jstag) {
      window.jstag.send({
        stream: 'proceed_to_checkout',
        data: {
          items_count: state.itemCount,
          cart_total: state.total,
          items: state.items.map(item => ({
            product_id: item.product.uid,
            product_title: item.product.title,
            quantity: item.quantity,
            price: item.product.price
          })),
          timestamp: new Date().toISOString()
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header 
        navigation={navigation}
        siteName={fallbackSiteSettings.site_name}
        logoUrl={fallbackSiteSettings.logo?.url}
      />

      <main>
        {/* Fancy Hero Section */}
        <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-black/20"></div>
          
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-32 h-32 bg-gold-400 rounded-full opacity-10 animate-float"></div>
            <div className="absolute top-40 right-20 w-20 h-20 bg-white rounded-full opacity-5 animate-float" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-gold-400 rounded-full opacity-8 animate-float" style={{ animationDelay: '4s' }}></div>
            <div className="absolute bottom-40 right-1/3 w-16 h-16 bg-white rounded-full opacity-10 animate-float" style={{ animationDelay: '1s' }}></div>
          </div>

          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>
          
          <div className="relative container-padding py-20">
            <div className="max-w-5xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
                <div className="w-2 h-2 bg-gold-400 rounded-full"></div>
                <span className="text-sm font-medium text-white/90">
                  Your Cart
                </span>
              </div>

              <h1 className="font-heading text-4xl md:text-7xl font-bold mb-8 text-white">
                Shopping <span className="text-gradient bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">Cart</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-4xl mx-auto font-light">
                {state.itemCount > 0 
                  ? `${state.itemCount} item${state.itemCount !== 1 ? 's' : ''} ready for checkout`
                  : 'Your cart is currently empty'
                }
              </p>

              {/* Decorative Line */}
              <div className="mt-12 flex justify-center">
                <div className="w-32 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Cart Content */}
        <section className="section-spacing bg-gray-50">
          <div className="container-padding">
            {state.items.length === 0 ? (
              /* Empty Cart State */
              <div className="text-center py-16 bg-white rounded-3xl shadow-xl">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-gray-900 mb-4">
                  Your cart is empty
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Looks like you haven't added any items to your cart yet. Start exploring our premium collection!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/categories/wearable-tech">
                    <Button variant="primary" size="lg" className="group">
                      Shop Wearable Tech
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </Button>
                  </Link>
                  <Link href="/categories/technofurniture">
                    <Button variant="outline" size="lg">
                      Explore Technofurniture
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              /* Cart Items */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items List */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-3xl shadow-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-heading text-2xl font-bold text-gray-900">
                        Cart Items ({state.itemCount})
                      </h2>
                      {state.items.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearCart}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear Cart
                        </Button>
                      )}
                    </div>

                    <div className="divide-y divide-gray-100">
                      {state.items.map((item) => {
                        const mainImage = Array.isArray(item.product.featured_image) 
                          ? item.product.featured_image[0] 
                          : item.product.featured_image;

                        return (
                          <div key={item.product.uid} className="py-6 flex items-start space-x-4">
                            {/* Product Image */}
                            <div className="flex-shrink-0">
                              <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                                {mainImage?.url ? (
                                  <Image
                                    src={mainImage.url}
                                    alt={item.product.title}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                    <ShoppingBag className="h-8 w-8 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900 mb-1">
                                    <Link href={item.product.url} className="hover:text-gold-600 transition-colors">
                                      {item.product.title}
                                    </Link>
                                  </h3>
                                  {item.product.category && (
                                    <p className="text-sm text-gray-500 capitalize mb-2">
                                      {item.product.category.replace('-', ' ')}
                                    </p>
                                  )}
                                  <p className="text-lg font-bold text-gray-900">
                                    {formatPrice(item.product.price)}
                                  </p>
                                </div>

                                <div className="flex items-center space-x-3 ml-4">
                                  {/* Quantity Controls */}
                                  <div className="flex items-center space-x-1 bg-gray-50 rounded-lg">
                                    <button
                                      onClick={() => handleQuantityChange(item.product.uid, item.quantity - 1, item)}
                                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                      disabled={item.quantity <= 1}
                                    >
                                      <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="px-4 py-2 min-w-[3rem] text-center font-medium">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() => handleQuantityChange(item.product.uid, item.quantity + 1, item)}
                                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </button>
                                  </div>

                                  {/* Remove Button */}
                                  <button
                                    onClick={() => handleRemoveItem(item.product.uid, item.product)}
                                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-3xl shadow-xl p-6 sticky top-8">
                    <h3 className="font-heading text-2xl font-bold text-gray-900 mb-6">
                      Order Summary
                    </h3>

                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal ({state.itemCount} items)</span>
                        <span>{formatPrice(state.total)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
                        <span className="text-green-600">Free</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Tax</span>
                        <span>Calculated at checkout</span>
                      </div>
                      <hr className="border-gray-200" />
                      <div className="flex justify-between text-xl font-bold text-gray-900">
                        <span>Total</span>
                        <span>{formatPrice(state.total)}</span>
                      </div>
                    </div>

                    <Link href="/checkout" className="block" onClick={handleProceedToCheckout}>
                      <Button variant="primary" size="lg" className="w-full group shadow-lg">
                        Proceed to Checkout
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                      </Button>
                    </Link>

                    <div className="mt-4">
                      <Link href="/">
                        <Button variant="outline" size="lg" className="w-full">
                          Continue Shopping
                        </Button>
                      </Link>
                    </div>

                    {/* Security Badge */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Secure checkout with SSL encryption</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer navigation={navigation} siteSettings={fallbackSiteSettings} />
    </div>
  );
}
