import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Currency = 'GBP' | 'USD' | 'EUR';

interface Package {
  id: string;
  title: string;
  description: string;
  duration: string;
  prices: {
    GBP: number;
    USD: number;
    EUR: number;
  };
  features: string[];
  featured?: boolean;
  cta: string;
}

const packages: Package[] = [
  {
    id: 'online',
    title: 'Online Coaching',
    description: 'Personalised online coaching with weekly check-ins and nutrition guidance.',
    duration: 'per month',
    prices: {
      GBP: 150,
      USD: 200,
      EUR: 170,
    },
    features: [
      'Custom Training Platform Access',
      'Form Analysis & Feedback',
      'Habit Tracking & Lifestyle Coaching',
      'Priority Support via WhatsApp',
      'Monthly Strategy Calls',
    ],
    featured: true,
    cta: 'Start Online Coaching',
  },
  {
    id: 'face-to-face-8',
    title: '8-Week Face-to-Face Package',
    description: 'Build momentum with consistent one-on-one training over 8 weeks.',
    duration: '16 sessions',
    prices: {
      GBP: 640,
      USD: 853,
      EUR: 680,
    },
    features: [
      'Progressive training programme',
      'Nutrition Guidance',
      'Form analysis & adjustments',
      'Priority scheduling',
      'Real-time feedback',
    ],
    cta: 'Book 8-Week Package',
  },
  {
    id: 'face-to-face-12',
    title: '12-Week Transformation',
    description: 'Complete transformation programme with comprehensive support.',
    duration: '24 sessions',
    prices: {
      GBP: 960,
      USD: 1280,
      EUR: 1020,
    },
    features: [
      'Personalised training sessions',
      'Nutrition Guidance',
      'Progress tracking & photos',
      'Flexible scheduling',
      'Comprehensive support',
    ],
    cta: 'Book 12-Week Package',
  },
];

export default function CoachingPackages() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('GBP');
  const navigate = useNavigate();

  const currencySymbols: Record<Currency, string> = {
    GBP: '£',
    USD: '$',
    EUR: '€',
  };

  const handleCheckout = (pkg: Package) => {
    // Store the selected package in localStorage
    const checkoutItem = {
      id: pkg.id,
      title: pkg.title,
      price: pkg.prices[selectedCurrency],
      currency: currencySymbols[selectedCurrency],
      quantity: 1,
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('checkoutItems', JSON.stringify([checkoutItem]));
    }
    // Navigate to checkout page
    navigate('/checkout');
  };

  return (
    <div className="w-full">
      {/* Currency Selector */}
      <div className="flex justify-center gap-4 mb-16">
        {(['GBP', 'USD', 'EUR'] as Currency[]).map((currency) => (
          <button
            key={currency}
            onClick={() => setSelectedCurrency(currency)}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
              selectedCurrency === currency
                ? 'bg-charcoal-black text-soft-white'
                : 'bg-warm-sand-beige text-charcoal-black hover:bg-warm-sand-beige/80'
            }`}
          >
            {currency}
          </button>
        ))}
      </div>

      {/* Packages Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`rounded-2xl p-8 transition-all duration-300 flex flex-col ${
              pkg.featured
                ? 'bg-charcoal-black text-soft-white border-2 border-soft-bronze shadow-xl md:scale-105'
                : 'bg-soft-white border border-warm-sand-beige hover:border-soft-bronze'
            }`}
          >
            {/* Featured Badge */}
            {pkg.featured && (
              <div className="inline-block bg-soft-bronze text-soft-white px-4 py-1 rounded-full text-sm font-medium mb-4 w-fit">
                Most Popular
              </div>
            )}

            {/* Title */}
            <h3
              className={`font-heading text-2xl md:text-3xl font-bold mb-2 ${
                pkg.featured ? 'text-soft-white' : 'text-charcoal-black'
              }`}
            >
              {pkg.title}
            </h3>

            {/* Description */}
            <p
              className={`font-paragraph text-base mb-6 ${
                pkg.featured ? 'text-warm-grey' : 'text-charcoal-black/70'
              }`}
            >
              {pkg.description}
            </p>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-2 mb-1">
                <span
                  className={`font-heading text-4xl md:text-5xl font-bold ${
                    pkg.featured ? 'text-soft-bronze' : 'text-soft-bronze'
                  }`}
                >
                  {currencySymbols[selectedCurrency]}
                  {pkg.prices[selectedCurrency]}
                </span>
              </div>
              <p
                className={`font-paragraph text-sm ${
                  pkg.featured ? 'text-warm-grey' : 'text-warm-grey'
                }`}
              >
                {pkg.duration}
              </p>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-8 flex-grow">
              {pkg.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle
                    size={20}
                    className={`flex-shrink-0 mt-0.5 ${
                      pkg.featured ? 'text-soft-bronze' : 'text-soft-bronze'
                    }`}
                  />
                  <span
                    className={`font-paragraph text-sm ${
                      pkg.featured ? 'text-soft-white/90' : 'text-charcoal-black'
                    }`}
                  >
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <button
              onClick={() => handleCheckout(pkg)}
              className={`w-full py-3 rounded-lg font-medium text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                pkg.featured
                  ? 'bg-soft-bronze text-soft-white hover:bg-soft-white hover:text-charcoal-black'
                  : 'bg-charcoal-black text-soft-white hover:bg-soft-bronze'
              }`}
            >
              {pkg.cta}
              <ArrowRight size={20} />
            </button>
          </div>
        ))}
      </div>

      {/* Info Section */}
      <div className="mt-16 p-8 bg-warm-sand-beige/30 rounded-2xl">
        <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
          Which Package is Right for You?
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-heading text-lg font-bold text-charcoal-black mb-2">
              Online Coaching
            </h4>
            <p className="font-paragraph text-sm text-charcoal-black/70">
              Perfect for busy women who want flexibility and support from anywhere. Ideal for building sustainable habits.
            </p>
          </div>
          <div>
            <h4 className="font-heading text-lg font-bold text-charcoal-black mb-2">
              8-Week Face-to-Face
            </h4>
            <p className="font-paragraph text-sm text-charcoal-black/70">
              Great for getting started with in-person training. Build momentum with consistent sessions and direct feedback.
            </p>
          </div>
          <div>
            <h4 className="font-heading text-lg font-bold text-charcoal-black mb-2">
              12-Week Transformation
            </h4>
            <p className="font-paragraph text-sm text-charcoal-black/70">
              Our most comprehensive package for complete transformation. Maximum results with extended support and tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
