import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function PricingSection() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        element.classList.add('is-visible');
        observer.unobserve(element);
      }
    }, { threshold: 0.1 });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const features = [
    '3 coached training sessions every week',
    'Direct communication with your qualified personal trainer',
    'Cycle-responsive training',
    'Pre & postnatal support',
    'Perimenopause & menopause support',
    'Level 4 nutrition guidance',
    'Recovery and wellbeing tracking',
    'Progress tracking and coaching support'
  ];

  return (
    <section 
      ref={ref}
      className="py-20 md:py-32 px-4 sm:px-6 md:px-8 lg:px-24 bg-white opacity-0 translate-y-8 transition-all duration-1000 ease-out [&.is-visible]:opacity-100 [&.is-visible]:translate-y-0"
    >
      <div className="max-w-[100rem] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: '-100px' }}
          >

            <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-charcoal-black mb-6 leading-tight">
              Your <span className="italic">strongest self</span> starts here.
            </h2>
            <p className="font-paragraph text-base sm:text-lg md:text-xl text-charcoal-black/70 max-w-2xl mx-auto leading-relaxed">
              Personalised training, expert coaching and women's health support — all in one place.
            </p>
          </motion.div>
        </div>

        {/* Premium Pricing Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          viewport={{ once: true, margin: '-100px' }}
          className="max-w-2xl mx-auto"
        >
          <div className="relative">
            {/* Subtle decorative circle accent around price */}
            <div className="absolute -inset-8 md:-inset-12 rounded-full border border-warm-bronze/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Main Card */}
            <div className="relative bg-gradient-to-br from-soft-white to-soft-white/95 rounded-3xl border border-warm-cream/60 p-8 sm:p-10 md:p-14 shadow-lg hover:shadow-xl transition-all duration-500 group">
              
              {/* Card Label */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-center mb-4"
              >
                <p className="font-paragraph text-xs sm:text-sm tracking-widest uppercase font-bold text-warm-bronze">
                  TRAIN IN SYNC
                </p>
              </motion.div>

              {/* Program Title */}
              <motion.h3
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                viewport={{ once: true }}
                className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-charcoal-black text-center mb-8"
              >
                Online Personal Training
              </motion.h3>

              {/* Price - Main Visual Element */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-center mb-8"
              >
                <div className="relative inline-block">
                  {/* Subtle gold circle accent */}
                  <div className="absolute -inset-6 rounded-full border-2 border-gold/20 opacity-100" />
                  <div className="relative">
                    <p className="font-heading text-7xl sm:text-8xl md:text-9xl font-bold text-charcoal-black leading-none">
                      £79
                    </p>
                    <p className="font-paragraph text-lg sm:text-xl text-warm-bronze font-light mt-2">
                      / month
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Subheading under price */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                viewport={{ once: true }}
                className="font-paragraph text-base sm:text-lg text-charcoal-black/70 text-center mb-10 leading-relaxed"
              >
                Everything you need to train, progress and feel supported.
              </motion.p>

              {/* Features List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="space-y-4 mb-10"
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.05 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3 sm:gap-4"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle2 size={20} className="text-warm-bronze" strokeWidth={2.5} />
                    </div>
                    <p className="font-paragraph text-sm sm:text-base text-charcoal-black/80 leading-relaxed">
                      {feature}
                    </p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Divider */}
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                viewport={{ once: true }}
                className="h-px bg-gradient-to-r from-transparent via-warm-cream to-transparent my-10 origin-center"
              />

              {/* Statement Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.75 }}
                viewport={{ once: true }}
                className="text-center mb-10"
              >
                <p className="font-heading text-lg sm:text-xl md:text-2xl text-charcoal-black leading-relaxed">
                  <span className="font-bold">Not another workout library.</span>
                  <br />
                  <span className="italic text-charcoal-black/70">A complete coached training experience designed around women.</span>
                </p>
              </motion.div>

              {/* Primary Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full py-4 sm:py-5 md:py-6 rounded-xl font-bold text-base sm:text-lg md:text-xl transition-all duration-300 shadow-lg hover:shadow-xl text-white uppercase tracking-wide mb-6"
                style={{ backgroundColor: '#58355E' }}
              >
                Start Your Training Journey
              </motion.button>

              {/* Price confirmation under button */}
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.85 }}
                viewport={{ once: true }}
                className="font-paragraph text-sm sm:text-base text-charcoal-black/60 text-center mb-4"
              >
                £79 per month
              </motion.p>

              {/* Secondary Link */}
              <motion.a
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                viewport={{ once: true }}
                href="#contact-form"
                className="inline-flex items-center justify-center gap-2 w-full text-warm-bronze font-semibold text-sm sm:text-base hover:text-warm-bronze/80 transition-colors duration-300 group/link"
              >
                Have questions? Book a free chat
                <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform duration-300" />
              </motion.a>
            </div>
          </div>

          {/* Reassurance text below card */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.95 }}
            viewport={{ once: true }}
            className="font-paragraph text-xs sm:text-sm text-charcoal-black/50 text-center mt-8 italic"
          >
            Your training. Your coach. Your pace.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
