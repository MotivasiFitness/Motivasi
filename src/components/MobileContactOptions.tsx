import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Phone, Mail, Clock, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Mobile Contact Options Component
 * Provides multiple ways to connect optimized for mobile users
 * Includes WhatsApp, phone, email, and booking options
 */

interface ContactOption {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  action: () => void;
  actionLabel: string;
  color: string;
  badge?: string;
}

export default function MobileContactOptions() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const whatsappMessage = encodeURIComponent(
    "Hi! I'm interested in your coaching program. Can you tell me about availability and pricing?"
  );

  const contactOptions: ContactOption[] = [
    {
      id: 'whatsapp',
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'WhatsApp',
      description: 'Fastest way to connect. I usually reply within 2 hours.',
      action: () => {
        window.open(`https://wa.me/447700000000?text=${whatsappMessage}`, '_blank');
        setSelectedOption('whatsapp');
      },
      actionLabel: 'Open WhatsApp',
      color: 'from-green-500 to-green-600',
      badge: 'Fastest'
    },
    {
      id: 'phone',
      icon: <Phone className="w-6 h-6" />,
      title: 'Phone Call',
      description: 'Prefer to chat? Call me directly. Available Mon-Fri, 9am-6pm GMT.',
      action: () => {
        window.location.href = 'tel:+447700000000';
        setSelectedOption('phone');
      },
      actionLabel: '+44 (0)7700 000000',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'email',
      icon: <Mail className="w-6 h-6" />,
      title: 'Email',
      description: 'Detailed questions? Email me and I\'ll respond within 24 hours.',
      action: () => {
        window.location.href = 'mailto:hello@motivasi.co.uk';
        setSelectedOption('email');
      },
      actionLabel: 'hello@motivasi.co.uk',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'booking',
      icon: <Clock className="w-6 h-6" />,
      title: 'Book Consultation',
      description: 'Ready to dive in? Schedule your free 15-minute consultation.',
      action: () => {
        setSelectedOption('booking');
      },
      actionLabel: 'View Packages',
      color: 'from-yellow-500 to-yellow-600'
    }
  ];

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="font-bold text-charcoal-black text-base md:text-lg mb-1">
          How would you like to connect?
        </h3>
        <p className="text-charcoal-black/60 text-sm">
          Choose what works best for you
        </p>
      </div>

      {/* Contact Options */}
      <div className="space-y-2 md:space-y-3">
        {contactOptions.map((option) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={() => setExpandedId(expandedId === option.id ? null : option.id)}
              className="w-full text-left"
            >
              <div className={`relative overflow-hidden rounded-xl p-4 bg-gradient-to-r ${option.color} text-white transition-all hover:shadow-lg`}>
                {/* Badge */}
                {option.badge && (
                  <div className="absolute top-2 right-2 bg-white/20 px-2 py-1 rounded-full text-xs font-bold">
                    {option.badge}
                  </div>
                )}

                {/* Content */}
                <div className="flex items-start gap-3 pr-8">
                  <div className="flex-shrink-0 mt-1">
                    {option.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-base mb-1">
                      {option.title}
                    </h4>
                    <p className="text-sm text-white/90 leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                  <ChevronDown
                    className={`flex-shrink-0 transition-transform ${
                      expandedId === option.id ? 'rotate-180' : ''
                    }`}
                    size={20}
                  />
                </div>
              </div>
            </button>

            {/* Expanded Action */}
            <AnimatePresence>
              {expandedId === option.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white/50 rounded-b-xl p-3 border-t border-white/20">
                    {option.id === 'booking' ? (
                      <Link
                        to="/store"
                        className="block w-full bg-charcoal-black hover:bg-charcoal-black/90 text-white font-bold py-3 rounded-lg transition-all text-center text-sm min-h-[44px] flex items-center justify-center"
                      >
                        {option.actionLabel}
                      </Link>
                    ) : (
                      <button
                        onClick={option.action}
                        className="w-full bg-charcoal-black hover:bg-charcoal-black/90 text-white font-bold py-3 rounded-lg transition-all text-sm min-h-[44px]"
                      >
                        {option.actionLabel}
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Trust Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-soft-white rounded-xl p-3 md:p-4 border border-warm-sand-beige mt-4"
      >
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-charcoal-black/70">
            <span className="text-green-600 font-bold">✓</span>
            <span>WhatsApp: Response within 2 hours</span>
          </div>
          <div className="flex items-center gap-2 text-charcoal-black/70">
            <span className="text-green-600 font-bold">✓</span>
            <span>Phone: Available Mon-Fri, 9am-6pm GMT</span>
          </div>
          <div className="flex items-center gap-2 text-charcoal-black/70">
            <span className="text-green-600 font-bold">✓</span>
            <span>Email: Response within 24 hours</span>
          </div>
        </div>
      </motion.div>

      {/* FAQ Hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="text-center text-xs md:text-sm text-charcoal-black/60 pt-2"
      >
        <p>
          Not sure which option? <span className="font-semibold">WhatsApp is fastest!</span>
        </p>
      </motion.div>
    </div>
  );
}

/**
 * Compact Mobile Contact Bar
 * For use in sticky headers or minimal spaces
 */
export function CompactContactBar() {
  const whatsappMessage = encodeURIComponent(
    "Hi! I'm interested in your coaching program"
  );

  return (
    <div className="flex gap-2 md:gap-3">
      {/* WhatsApp - Primary */}
      <a
        href={`https://wa.me/447700000000?text=${whatsappMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 md:py-3 rounded-lg transition-all text-xs md:text-sm min-h-[40px]"
        title="Message on WhatsApp"
      >
        <MessageCircle size={16} />
        <span className="hidden sm:inline">WhatsApp</span>
      </a>

      {/* Phone - Secondary */}
      <a
        href="tel:+447700000000"
        className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 md:py-3 rounded-lg transition-all text-xs md:text-sm min-h-[40px]"
        title="Call us"
      >
        <Phone size={16} />
        <span className="hidden sm:inline">Call</span>
      </a>

      {/* Email - Tertiary */}
      <a
        href="mailto:hello@motivasi.co.uk"
        className="flex-1 flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 md:py-3 rounded-lg transition-all text-xs md:text-sm min-h-[40px]"
        title="Email us"
      >
        <Mail size={16} />
        <span className="hidden sm:inline">Email</span>
      </a>
    </div>
  );
}
