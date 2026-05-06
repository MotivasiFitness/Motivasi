import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Zap, Heart, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Mobile-Specific CTA Variations
 * Different CTA styles optimized for different contexts and scroll positions
 */

// 1. URGENCY CTA - Creates mobile-appropriate urgency
export function UrgencyCTA() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-2xl p-4 md:p-6 mb-6"
    >
      <div className="flex items-start gap-3">
        <Zap className="text-yellow-600 flex-shrink-0 mt-1" size={20} />
        <div className="flex-1">
          <h3 className="font-bold text-charcoal-black text-sm md:text-base mb-1">
            ⏰ Only 2 coaching spots available this month
          </h3>
          <p className="text-charcoal-black/70 text-xs md:text-sm mb-3">
            New clients are filling up fast. Next intake closes in 5 days.
          </p>
          <Link
            to="/store"
            className="inline-flex items-center gap-2 text-yellow-700 font-bold text-sm hover:text-yellow-800 transition-colors"
          >
            Secure your spot now <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// 2. QUICK ACTION CTA - For busy women checking phones
export function QuickActionCTA() {
  const whatsappMessage = encodeURIComponent(
    "Hi! I'm interested in your coaching program. What's the next step?"
  );
  const whatsappLink = `https://wa.me/447700000000?text=${whatsappMessage}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="space-y-2 md:space-y-3"
    >
      {/* Primary: WhatsApp - Fastest engagement */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 md:py-4 rounded-lg transition-all hover:shadow-lg text-sm md:text-base min-h-[44px]"
      >
        💬 Quick chat on WhatsApp
      </a>

      {/* Secondary: Book consultation */}
      <Link
        to="/store"
        className="flex items-center justify-center gap-2 w-full bg-charcoal-black hover:bg-charcoal-black/90 text-white font-bold py-3 md:py-4 rounded-lg transition-all text-sm md:text-base min-h-[44px]"
      >
        📅 Book Free Consultation <ArrowRight size={16} />
      </Link>

      {/* Trust indicator */}
      <p className="text-center text-charcoal-black/60 text-xs md:text-sm">
        ✓ Response within 2 hours • No commitment
      </p>
    </motion.div>
  );
}

// 3. BENEFIT-FOCUSED CTA - Emphasizes value for busy women
export function BenefitFocusedCTA() {
  const benefits = [
    { icon: Clock, text: "15 min/day workouts" },
    { icon: Heart, text: "Personalized for you" },
    { icon: Zap, text: "Real results in 12 weeks" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="bg-soft-white rounded-2xl p-4 md:p-6 border border-warm-sand-beige"
    >
      {/* Benefits grid */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-4">
        {benefits.map((benefit, idx) => {
          const Icon = benefit.icon;
          return (
            <div key={idx} className="text-center">
              <div className="flex justify-center mb-2">
                <Icon className="text-warm-bronze" size={20} />
              </div>
              <p className="text-charcoal-black text-xs md:text-sm font-medium">
                {benefit.text}
              </p>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <Link
        to="/store"
        className="block w-full bg-charcoal-black hover:bg-charcoal-black/90 text-white font-bold py-3 rounded-lg transition-all text-center text-sm md:text-base min-h-[44px] flex items-center justify-center"
      >
        Start Your Transformation
      </Link>
    </motion.div>
  );
}

// 4. LIMITED AVAILABILITY CTA - Mobile-optimized messaging
export function LimitedAvailabilityCTA() {
  const [spotsLeft] = useState(2);
  const [daysLeft] = useState(5);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-charcoal-black to-charcoal-black/90 p-4 md:p-6"
    >
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/10 to-yellow-500/0"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      <div className="relative z-10">
        {/* Urgency indicators */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <span className="text-yellow-500 font-bold text-xs md:text-sm uppercase tracking-wider">
              Limited Availability
            </span>
          </div>
          <span className="text-white/60 text-xs md:text-sm">
            {spotsLeft} spots • {daysLeft} days
          </span>
        </div>

        {/* Main message */}
        <h3 className="text-white font-bold text-base md:text-lg mb-2">
          Don't miss out on your transformation
        </h3>
        <p className="text-white/80 text-sm md:text-base mb-4 leading-relaxed">
          I only take {spotsLeft} new clients this month. The next intake closes in {daysLeft} days.
        </p>

        {/* CTA */}
        <Link
          to="/store"
          className="block w-full bg-yellow-500 hover:bg-yellow-600 text-charcoal-black font-bold py-3 md:py-4 rounded-lg transition-all text-center text-sm md:text-base min-h-[44px] flex items-center justify-center"
        >
          Secure Your Spot Now
        </Link>

        {/* Social proof */}
        <p className="text-white/50 text-xs md:text-sm text-center mt-3">
          ✓ 47 women transformed in the last 6 months
        </p>
      </div>
    </motion.div>
  );
}

// 5. MOBILE BANNER CTA - Sticky header variant
export function MobileBannerCTA() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-charcoal-black to-charcoal-black/90 text-white py-3 px-4 flex items-center justify-between gap-3 sticky top-0 z-30"
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs md:text-sm font-bold truncate">
          🎯 Limited spots available
        </p>
        <p className="text-xs text-white/70 truncate">
          Next intake closes in 5 days
        </p>
      </div>
      <a
        href="https://wa.me/447700000000?text=Hi%21%20I%27m%20interested%20in%20your%20coaching%20program"
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 rounded-lg text-xs transition-colors"
      >
        Chat
      </a>
    </motion.div>
  );
}

// 6. CONTEXT-AWARE CTA - Shows different messaging based on scroll position
interface ContextAwareCTAProps {
  scrollPosition: number;
}

export function ContextAwareCTA({ scrollPosition }: ContextAwareCTAProps) {
  // Different messaging based on where user is on page
  const getContextMessage = () => {
    if (scrollPosition < 500) {
      return {
        title: "Curious about coaching?",
        description: "Let's chat about your fitness goals",
        cta: "Learn More"
      };
    } else if (scrollPosition < 1500) {
      return {
        title: "Ready to transform?",
        description: "Book your free 15-minute consultation",
        cta: "Book Now"
      };
    } else {
      return {
        title: "Don't wait - spots filling up",
        description: "Only 2 coaching spots left this month",
        cta: "Secure Your Spot"
      };
    }
  };

  const context = getContextMessage();

  return (
    <motion.div
      key={context.title}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-soft-white rounded-xl p-4 border border-warm-sand-beige"
    >
      <h4 className="font-bold text-charcoal-black text-sm md:text-base mb-1">
        {context.title}
      </h4>
      <p className="text-charcoal-black/70 text-xs md:text-sm mb-3">
        {context.description}
      </p>
      <Link
        to="/store"
        className="inline-flex items-center gap-2 text-warm-bronze font-bold text-sm hover:text-warm-bronze/80 transition-colors"
      >
        {context.cta} <ArrowRight size={14} />
      </Link>
    </motion.div>
  );
}

// 7. SOCIAL PROOF CTA - Builds trust for mobile users
export function SocialProofCTA() {
  const stats = [
    { number: "47", label: "Women transformed" },
    { number: "4.9★", label: "Average rating" },
    { number: "12 wks", label: "Average results" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="bg-gradient-to-br from-sage-green/5 to-rose-blush/5 rounded-2xl p-4 md:p-6 border border-warm-sand-beige"
    >
      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-warm-sand-beige">
        {stats.map((stat, idx) => (
          <div key={idx} className="text-center">
            <p className="text-charcoal-black font-bold text-lg md:text-xl">
              {stat.number}
            </p>
            <p className="text-charcoal-black/60 text-xs md:text-sm">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link
        to="/store"
        className="block w-full bg-charcoal-black hover:bg-charcoal-black/90 text-white font-bold py-3 rounded-lg transition-all text-center text-sm md:text-base min-h-[44px] flex items-center justify-center"
      >
        Join the transformation
      </Link>
    </motion.div>
  );
}
