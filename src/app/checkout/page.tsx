'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';
import { ArrowLeft, CreditCard, Shield, Truck, ShoppingBag } from 'lucide-react';
import { dataService } from '@/lib/data-service';

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  billingSame: boolean;
  billingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    apartment: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export default function CheckoutPage() {
  const { state } = useCart();
  const [navigation, setNavigation] = React.useState<any[]>([]);
  const [siteSettings, setSiteSettings] = React.useState<any>(null);
  const [currentStep, setCurrentStep] = useState<'shipping' | 'payment' | 'demo'>('shipping');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
    billingSame: true,
    billingAddress: {
      firstName: '',
      lastName: '',
      address: '',
      apartment: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
    }
  });

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

  // Redirect if cart is empty
  React.useEffect(() => {
    if (state.items.length === 0) {
      window.location.href = '/cart';
    }
  }, [state.items.length]);

  const fallbackSiteSettings = siteSettings || {
    uid: 'fallback',
    site_name: 'Demolux',
    tagline: 'Premium Wearable Tech & Technofurniture',
    logo: undefined,
    contact_info: undefined,
    social_links: undefined,
    seo: undefined
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBillingInputChange = (field: keyof FormData['billingAddress'], value: string) => {
    setFormData(prev => ({
      ...prev,
      billingAddress: {
        ...prev.billingAddress,
        [field]: value
      }
    }));
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('demo');
  };

  if (state.items.length === 0) {
    return null; // Will redirect
  }

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
                  Secure Checkout
                </span>
              </div>

              <h1 className="font-heading text-4xl md:text-7xl font-bold mb-8 text-white">
                {currentStep === 'demo' ? (
                  <>Demo <span className="text-gradient bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">Complete</span></>
                ) : (
                  <>Secure <span className="text-gradient bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">Checkout</span></>
                )}
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-4xl mx-auto font-light">
                {currentStep === 'demo' 
                  ? 'This is where payment processing would begin in a live environment'
                  : `${state.itemCount} item${state.itemCount !== 1 ? 's' : ''} • ${formatPrice(state.total)} total`
                }
              </p>

              {/* Decorative Line */}
              <div className="mt-12 flex justify-center">
                <div className="w-32 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Checkout Content */}
        <section className="section-spacing bg-gray-50">
          <div className="container-padding">
            {currentStep === 'demo' ? (
              /* Demo Complete State */
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
                  <div className="w-20 h-20 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Shield className="h-10 w-10 text-gold-600" />
                  </div>
                  <h2 className="font-heading text-3xl font-bold text-gray-900 mb-4">
                    This is a Demonstration
                  </h2>
                  <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    In a live environment, this is where you would be redirected to a secure payment processor 
                    (like Stripe, PayPal, or Square) to enter your credit card information and complete the transaction.
                  </p>
                  
                  <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                    <h3 className="font-semibold text-gray-900 mb-3">What would happen next:</h3>
                    <div className="space-y-2 text-left text-gray-600">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4 text-gold-600" />
                        <span>Secure payment processing with SSL encryption</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-gold-600" />
                        <span>Order confirmation and receipt via email</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Truck className="h-4 w-4 text-gold-600" />
                        <span>Order fulfillment and shipping tracking</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/cart">
                      <Button variant="outline" size="lg">
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        Back to Cart
                      </Button>
                    </Link>
                    <Link href="/">
                      <Button variant="primary" size="lg">
                        Continue Shopping
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              /* Checkout Form */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {/* Form Section */}
                <div className="bg-white rounded-3xl shadow-xl p-6">
                  {/* Steps */}
                  <div className="flex items-center space-x-4 mb-8">
                    <div className={`flex items-center space-x-2 ${currentStep === 'shipping' ? 'text-gold-600' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        currentStep === 'shipping' ? 'bg-gold-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        1
                      </div>
                      <span className="font-medium">Shipping</span>
                    </div>
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <div className={`flex items-center space-x-2 ${currentStep === 'payment' ? 'text-gold-600' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        currentStep === 'payment' ? 'bg-gold-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        2
                      </div>
                      <span className="font-medium">Payment</span>
                    </div>
                  </div>

                  {currentStep === 'shipping' ? (
                    /* Shipping Form */
                    <form onSubmit={handleShippingSubmit}>
                      <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">
                        Shipping Information
                      </h2>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                            placeholder="your.email@example.com"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              First Name
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.firstName}
                              onChange={(e) => handleInputChange('firstName', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Last Name
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.lastName}
                              onChange={(e) => handleInputChange('lastName', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                            placeholder="123 Main Street"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Apartment, suite, etc. (optional)
                          </label>
                          <input
                            type="text"
                            value={formData.apartment}
                            onChange={(e) => handleInputChange('apartment', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              City
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.city}
                              onChange={(e) => handleInputChange('city', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              State
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.state}
                              onChange={(e) => handleInputChange('state', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              ZIP Code
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.zipCode}
                              onChange={(e) => handleInputChange('zipCode', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                            placeholder="(555) 123-4567"
                          />
                        </div>
                      </div>

                      <div className="flex gap-4 mt-8">
                        <Link href="/cart" className="flex-1">
                          <Button variant="outline" size="lg" className="w-full">
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Back to Cart
                          </Button>
                        </Link>
                        <Button type="submit" variant="primary" size="lg" className="flex-1">
                          Continue to Payment
                        </Button>
                      </div>
                    </form>
                  ) : (
                    /* Payment Form (Demo) */
                    <form onSubmit={handlePaymentSubmit}>
                      <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">
                        Payment Information
                      </h2>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-800">
                          <strong>Demo Mode:</strong> This is for demonstration purposes only. 
                          No actual payment will be processed.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Card Number
                          </label>
                          <input
                            type="text"
                            placeholder="4242 4242 4242 4242"
                            disabled
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              disabled
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              CVC
                            </label>
                            <input
                              type="text"
                              placeholder="123"
                              disabled
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cardholder Name
                          </label>
                          <input
                            type="text"
                            placeholder="John Doe"
                            disabled
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                          />
                        </div>
                      </div>

                      <div className="flex gap-4 mt-8">
                        <Button 
                          type="button"
                          variant="outline" 
                          size="lg" 
                          className="flex-1"
                          onClick={() => setCurrentStep('shipping')}
                        >
                          <ArrowLeft className="mr-2 h-5 w-5" />
                          Back to Shipping
                        </Button>
                        <Button type="submit" variant="gold" size="lg" className="flex-1">
                          <CreditCard className="mr-2 h-5 w-5" />
                          Complete Demo
                        </Button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-3xl shadow-xl p-6">
                  <h3 className="font-heading text-2xl font-bold text-gray-900 mb-6">
                    Order Summary
                  </h3>

                  <div className="space-y-4 mb-6">
                    {state.items.map((item) => {
                      const mainImage = Array.isArray(item.product.featured_image) 
                        ? item.product.featured_image[0] 
                        : item.product.featured_image;

                      return (
                        <div key={item.product.uid} className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {mainImage?.url ? (
                              <Image
                                src={mainImage.url}
                                alt={item.product.title}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                <ShoppingBag className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {item.product.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="font-semibold text-gray-900">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-2 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
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
                    <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                      <span>Total</span>
                      <span>{formatPrice(state.total)}</span>
                    </div>
                  </div>

                  {/* Security Features */}
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span>SSL encrypted checkout</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Truck className="h-4 w-4 text-blue-600" />
                      <span>Free shipping on all orders</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CreditCard className="h-4 w-4 text-purple-600" />
                      <span>Secure payment processing</span>
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
