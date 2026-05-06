import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Phone, Mail, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MobileOptimizedCTAProps {
  showAfterScroll?: number; // pixels to scroll before showing
  variant?: 'floating' | 'sticky-bottom' | 'minimal';
}

/**
 * Mobile-Optimized CTA Strategy Component
 * 
 * Features:
 * - Thumb-reach positioning (bottom 1/3 of screen)
 * - Non-intrusive floating design
 * - WhatsApp integration
 * - Mobile-specific messaging
 * - Smart visibility based on scroll position
 */
export default function MobileOptimizedCTA({ 
  showAfterScroll = 800, 
  variant = 'floating' 
}: MobileOptimizedCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showContactOptions, setShowContactOptions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show CTA after scroll threshold
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      setIsVisible(scrolled > showAfterScroll && !isDismissed);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfterScroll, isDismissed]);

  if (!isMobile) return null;

  const whatsappMessage = encodeURIComponent(
    "Hi! I'm interested in learning more about your coaching program. Can you tell me about availability and pricing?"
  );
  const whatsappLink = `https://wa.me/447700000000?text=${whatsappMessage}`;

  // Floating CTA - Thumb-reach optimized
  if (variant === 'floating') {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-20 right-4 left-4 z-40 max-w-sm mx-auto"
          >
            <div className="relative">
              {/* Pulse animation for attention */}
              <motion.div
                className="absolute inset-0 bg-yellow-500/20 rounded-2xl"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Main CTA Card */}
              <div className="relative bg-gradient-to-r from-charcoal-black to-charcoal-black/90 rounded-2xl p-4 shadow-2xl border border-yellow-500/30 backdrop-blur-sm">
                {/* Close button - top right */}
                <button
                  onClick={() => setIsDismissed(true)}
                  className="absolute top-3 right-3 p-1 hover:bg-white/10 rounded-full transition-colors"
                  aria-label="Dismiss"
                >
                  <X size={18} className="text-white/60" />
                </button>

                {/* Limited Availability Badge - Mobile Optimized */}
                <div className="flex items-center gap-2 mb-3 pr-8">
                  <AlertCircle size={16} className="text-yellow-500 flex-shrink-0" />
                  <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider">
                    Only 2 spots left
                  </span>
                </div>

                {/* Main CTA Text */}
                <h3 className="text-white font-bold text-sm mb-2 leading-tight">
                  Ready to transform?
                </h3>
                <p className="text-white/80 text-xs mb-4 leading-relaxed">
                  Chat with me about your goals. Free 15-min consultation.
                </p>

                {/* Quick Action Buttons - Thumb-reach optimized */}
                <div className="space-y-2">
                  {/* Primary: WhatsApp (fastest) */}
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-colors text-sm min-h-[44px]"
                  >
                    <MessageCircle size={18} />
                    Message on WhatsApp
                  </a>

                  {/* Secondary: Other options */}
                  <button
                    onClick={() => setShowContactOptions(!showContactOptions)}
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
                  >
                    Other ways to connect
                  </button>
                </div>

                {/* Expanded Contact Options */}
                <AnimatePresence>
                  {showContactOptions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t border-white/10 space-y-2"
                    >
                      {/* Phone */}
                      <a
                        href="tel:+447700000000"
                        className="flex items-center gap-2 text-white/80 hover:text-white text-xs py-2 transition-colors"
                      >
                        <Phone size={16} className="flex-shrink-0" />
                        <span>Call: +44 (0)7700 000000</span>
                      </a>

                      {/* Email */}
                      <a
                        href="mailto:hello@motivasi.co.uk"
                        className="flex items-center gap-2 text-white/80 hover:text-white text-xs py-2 transition-colors"
                      >
                        <Mail size={16} className="flex-shrink-0" />
                        <span>Email: hello@motivasi.co.uk</span>
                      </a>

                      {/* Book consultation */}
                      <Link
                        to="/store"
                        className="flex items-center gap-2 text-yellow-500 hover:text-yellow-400 text-xs py-2 transition-colors font-semibold"
                      >
                        <Clock size={16} className="flex-shrink-0" />
                        <span>Book consultation</span>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Trust indicator */}
                <p className="text-white/50 text-xs mt-3 text-center">
                  ✓ Response within 2 hours
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Sticky bottom CTA - Minimal variant
  if (variant === 'sticky-bottom') {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-charcoal-black via-charcoal-black to-transparent p-4 pb-6 safe-area-inset-bottom"
          >
            <div className="max-w-sm mx-auto space-y-3">
              {/* Quick stat */}
              <div className="flex items-center justify-center gap-2 text-yellow-500 text-xs font-bold">
                <Clock size={14} />
                <span>Limited availability - 2 spots left</span>
              </div>

              {/* Main CTA */}
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-charcoal-black font-bold py-4 rounded-lg transition-all hover:shadow-lg text-sm min-h-[48px]"
              >
                <MessageCircle size={18} />
                Start Your Free Consultation
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return null;
}
