// HPI 1.6-G
import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Star, Activity, Heart, Zap, ShieldCheck, Dumbbell, Apple, Leaf, AlertCircle } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { BaseCrudService } from '@/integrations';
import { ClientTestimonials, ContactFormSubmissions } from '@/entities';
import { useLanguage } from '@/i18n/LanguageContext';

// --- Utility Components ---

// Mandatory Intersection Observer Component for Scroll Reveals
type AnimatedElementProps = {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
};

const AnimatedElement: React.FC<AnimatedElementProps> = ({ children, className, threshold = 0.1 }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                element.classList.add('is-visible');
                observer.unobserve(element); 
            }
        }, { threshold });

        observer.observe(element);
        return () => observer.disconnect();
    }, [threshold]);

    return <div ref={ref} className={`${className || ''} opacity-0 translate-y-8 transition-all duration-1000 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 [&.is-visible]:opacity-100 [&.is-visible]:translate-y-0`}>{children}</div>;
};

// --- Contact Form Component ---

function ContactForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    message: '',
    healthDataConsent: false,
    marketingConsent: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await BaseCrudService.create('contactformsubmissions', {
        _id: crypto.randomUUID(),
        fullName: formData.fullName,
        email: formData.email,
        message: formData.message,
        healthDataConsent: formData.healthDataConsent,
        marketingConsent: formData.marketingConsent,
        submittedAt: new Date().toISOString(),
        source: 'homepage',
      });

      setSubmitStatus('success');
      setFormData({
        fullName: '',
        email: '',
        message: '',
        healthDataConsent: false,
        marketingConsent: false,
      });

      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (error) {
      console.error('Failed to submit form:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* Next Steps Info Box */}
      <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 bg-soft-white rounded-xl border border-warm-sand-beige">
        <AlertCircle className="text-soft-bronze flex-shrink-0 mt-1" size={18} />
        <div>
          <h3 className="font-heading text-base sm:text-lg font-bold text-charcoal-black mb-2">
            Next Steps
          </h3>
          <ol className="font-paragraph text-sm sm:text-base text-warm-grey space-y-1 sm:space-y-2">
            <li><span className="font-bold">1.</span> Complete the PAR-Q questionnaire on our <Link to="/parq" className="text-soft-bronze hover:underline">health form page</Link></li>
            <li><span className="font-bold">2.</span> Schedule your free 15-minute consultation call</li>
            <li><span className="font-bold">3.</span> Start your personalised online coaching program</li>
          </ol>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-3 sm:space-y-4">
        <div>
          <label htmlFor="fullName" className="block font-paragraph font-medium text-charcoal-black mb-2 text-sm sm:text-base">
            Full Name *
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            required
            className="w-full px-3 sm:px-4 py-3 border border-warm-sand-beige rounded-lg font-paragraph text-charcoal-black placeholder-warm-grey/50 focus:outline-none focus:ring-2 focus:ring-soft-bronze/50 text-base min-h-[44px] bg-soft-white"
            placeholder="Your name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block font-paragraph font-medium text-charcoal-black mb-2 text-sm sm:text-base">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-3 sm:px-4 py-3 border border-warm-sand-beige rounded-lg font-paragraph text-charcoal-black placeholder-warm-grey/50 focus:outline-none focus:ring-2 focus:ring-soft-bronze/50 text-base min-h-[44px] bg-soft-white"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label htmlFor="message" className="block font-paragraph font-medium text-charcoal-black mb-2 text-sm sm:text-base">
            Tell me about your fitness goals *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            required
            rows={4}
            className="w-full px-3 sm:px-4 py-3 border border-warm-sand-beige rounded-lg font-paragraph text-charcoal-black placeholder-warm-grey/50 focus:outline-none focus:ring-2 focus:ring-soft-bronze/50 resize-none text-base min-h-[120px] bg-soft-white"
            placeholder="Share your fitness goals, challenges, and what you're looking for in a coach..."
          />
        </div>
      </div>

      {/* Checkboxes */}
      <div className="space-y-2 sm:space-y-3">
        <label className="flex items-start gap-2 sm:gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="healthDataConsent"
            checked={formData.healthDataConsent}
            onChange={handleInputChange}
            className="mt-1 w-4 h-4 accent-soft-bronze flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
          />
          <span className="font-paragraph text-xs sm:text-sm text-charcoal-black/80 pt-1">
            I consent to sharing my health information for personalised coaching *
          </span>
        </label>

        <label className="flex items-start gap-2 sm:gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="marketingConsent"
            checked={formData.marketingConsent}
            onChange={handleInputChange}
            className="mt-1 w-4 h-4 accent-soft-bronze flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
          />
          <span className="font-paragraph text-xs sm:text-sm text-charcoal-black/80 pt-1">
            I'd like to receive updates about coaching programs and fitness tips
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-charcoal-black text-soft-white py-3 sm:py-4 rounded-lg font-medium text-base sm:text-lg hover:bg-soft-bronze transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
      >
        {isSubmitting ? 'Sending...' : 'Send My Information'}
      </button>

      {/* Status Messages */}
      {submitStatus === 'success' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 sm:p-4 bg-sage-green/10 border border-sage-green/30 rounded-lg text-center"
        >
          <p className="font-paragraph text-sage-green font-medium text-sm sm:text-base">
            Thank you! I'll be in touch within 24 hours.
          </p>
        </motion.div>
      )}

      {submitStatus === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 sm:p-4 bg-rose-blush/10 border border-rose-blush/30 rounded-lg text-center"
        >
          <p className="font-paragraph text-rose-blush font-medium text-sm sm:text-base">
            Something went wrong. Please try again or email <span className="font-bold">hello@motivasi.co.uk</span>
          </p>
        </motion.div>
      )}

      {/* Direct Contact */}
      <div className="text-center pt-4 sm:pt-6 border-t border-warm-sand-beige">
        <p className="font-paragraph text-sm sm:text-base text-warm-grey mb-3 sm:mb-4">
          Or reach out directly:
        </p>
        <a
          href="mailto:hello@motivasi.co.uk"
          className="text-soft-bronze font-bold hover:underline text-sm sm:text-base"
        >
          <span className="font-bold">hello@motivasi.co.uk</span>
        </a>
      </div>
    </form>
  );
}

// --- Main Component ---

export default function HomePage() {
  // --- Data Fidelity Protocol: Identify, Canonize, Preserve ---
  const { t } = useLanguage();
  const [testimonials, setTestimonials] = useState<ClientTestimonials[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showStickyButton, setShowStickyButton] = useState(false);

  useEffect(() => {
    // Defer testimonial loading to avoid blocking initial render
    const timer = setTimeout(async () => {
      try {
        const { items } = await BaseCrudService.getAll<ClientTestimonials>('clienttestimonials', [], { limit: 3 });
        setTestimonials(items.filter(t => t.featuredOnHomepage));
      } catch (error) {
        console.error('Failed to load testimonials:', error);
      } finally {
        setIsLoading(false);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // --- Scroll Progress for Parallax & Sticky Button Visibility ---
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Show sticky button after scrolling past hero section (roughly 80vh) and keep it visible
  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight * 0.8;
      setShowStickyButton(window.scrollY > heroHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ensure button stays visible once shown
  useEffect(() => {
    if (showStickyButton) {
      // Button is visible and will remain so
      return;
    }
  }, [showStickyButton]);

  return (
    <div className="bg-white min-h-screen w-full overflow-clip font-sans text-charcoal-black selection:bg-warm-cream selection:text-charcoal-black">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-warm-bronze via-warm-bronze to-warm-bronze origin-left z-50"
        style={{ scaleX }}
      />
      {/* Sticky CTA Button - Appears after hero section and stays visible */}
      {showStickyButton && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-40 px-2"
        >

        </motion.div>
      )}
      {/* --- Hero Section - Full Background Image with Header Overlap --- */}
      <section className="relative w-full min-h-screen overflow-hidden -mt-16 sm:-mt-20 md:-mt-24 lg:-mt-32 pt-16 sm:pt-20 md:pt-24 lg:pt-32">
        {/* Background Image - Full Coverage */}
        <div className="absolute inset-0 w-full h-full">
          <motion.div 
            className="w-full h-full" 
            initial={{ scale: 1.15, x: 20 }} 
            animate={{ scale: 1.05, x: 0 }} 
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <Image
              src="https://static.wixstatic.com/media/93e866_befb471af6704f8eacfde13d90bf0e65~mv2.png"
              className="w-full h-full object-cover object-center"
              width={1200}
              focalPointX={75.20458265139116}
              focalPointY={27.72873194221509}
              originWidth={611}
              originHeight={623}
              alt="Hero Background"
              loading="eager"
            />
          </motion.div>
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal-black/40 via-charcoal-black/50 to-charcoal-black/70" />
        </div>

        {/* Content - Positioned Over Background */}
        <div className="relative z-10 w-full flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.16))] sm:min-h-[calc(100vh-theme(spacing.20))] md:min-h-[calc(100vh-theme(spacing.24))] lg:min-h-[calc(100vh-theme(spacing.32))] pb-8 sm:pb-12 md:pb-16 px-3 sm:px-6 md:px-12">
          {/* Centered Brand Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-6 sm:mb-12 md:mb-16 flex justify-center flex-shrink-0"
          >
            <Image
              src="https://static.wixstatic.com/media/93e866_09b0ccd0d04e40cda3d278b62df0355f~mv2.png"
              alt="Brand Logo"
              className="w-48 sm:w-56 md:w-64 lg:w-80 h-auto object-contain"
              width={320}
              loading="eager"
            />
          </motion.div>

          {/* Main Content - Text Only */}
          <div className="w-full flex items-center justify-center">
            <div className="flex flex-col justify-center text-center w-full max-w-3xl px-3">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3 }}>
                <h2 className="font-sans font-black leading-tight mb-3 sm:mb-6 text-white drop-shadow-lg text-2xl sm:text-3xl md:text-5xl lg:text-6xl break-words" style={{ fontWeight: 900, letterSpacing: '0.05em', lineHeight: 1.1, wordBreak: 'break-word' }}>
                  TRANSFORM YOUR STRENGTH
                </h2>
                <motion.div className="mt-3 sm:mt-6 flex items-center justify-center gap-1 sm:gap-4 flex-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.6 }}>
                  <div className="h-px w-6 sm:w-16 bg-warm-bronze/80 flex-shrink-0" />
                  <span className="text-xs sm:text-sm md:text-base lg:text-lg tracking-widest uppercase font-medium text-white px-2 flex-shrink-0">
                    {t.home.tagline}
                  </span>
                  <div className="h-px w-6 sm:w-16 bg-warm-bronze/80 flex-shrink-0" />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      {/* --- Keywords Section with Softer Design --- */}
      {/* --- The Philosophy (Text Heavy / Editorial) --- */}
      <section className="py-12 px-8 lg:px-24 bg-white">
        <div className="max-w-[100rem] mx-auto">
          {/* Title and Subtitle Section */}
          <div className="mb-12">
            <AnimatedElement>
              <h2 className="font-heading text-5xl md:text-6xl font-bold text-charcoal-black mb-8 leading-tight">
                {t.home.transformationTitle} 
                <span className="bg-gradient-to-r from-[#a8b8a8] to-[#d4a8a8] bg-clip-text text-transparent italic font-black">{t.home.transformationSubtitle}</span>
              </h2>
            </AnimatedElement>
            <AnimatedElement className="delay-200">
              <div className="w-24 h-1.5 bg-gradient-to-r from-sage-green to-rose-blush mb-8 rounded-full" />
              <p className="text-lg text-charcoal-black mb-8 leading-relaxed font-light max-w-2xl">
                You've tried the crash diets. You've done the endless cardio. It's time for a sustainable approach that honours your body and your busy life.
              </p>
              <Link to="/about" className="text-charcoal-black font-medium border-b-2 border-sage-green pb-2 hover:text-sage-green transition-colors inline-flex items-center gap-2">
                {t.home.readFullBio} <ArrowRight size={16} />
              </Link>
            </AnimatedElement>
          </div>

          {/* Three Feature Cards in a Single Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature card 1 */}
            <AnimatedElement className={`group bg-sage-green/5 p-12 rounded-3xl shadow-md hover:shadow-2xl transition-all duration-500 border border-warm-cream/50 hover:border-warm-cream border-l-2 border-l-sage-green`}>
              <div className="flex flex-col gap-8 items-start h-full">
                <div className={`w-20 h-20 rounded-full bg-rose-blush flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 border-2 border-sage-green/40 shadow-md`}>
                  <div className="text-green-600">
                    <Apple className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-3 group-hover:text-sage-green transition-colors">
                    {t.home.noExtremeDiets}
                  </h3>
                  <p className="text-charcoal-black/70 text-base leading-relaxed font-light">
                    {t.home.noExtremeDietsDesc}
                  </p>
                </div>
              </div>
            </AnimatedElement>

            {/* Feature card 2 */}
            <AnimatedElement className={`group bg-rose-blush/5 p-12 rounded-3xl shadow-md hover:shadow-2xl transition-all duration-500 border border-warm-cream/50 hover:border-warm-cream border-l-2 border-l-rose-blush`}>
              <div className="flex flex-col gap-8 items-start h-full">
                <div className={`w-20 h-20 rounded-full bg-rose-blush flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 border-2 border-rose-blush/40 shadow-md`}>
                  <div className="text-red-500">
                    <Dumbbell className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-3 group-hover:text-sage-green transition-colors">
                    {t.home.buildRealStrength}
                  </h3>
                  <p className="text-charcoal-black/70 text-base leading-relaxed font-light">
                    {t.home.buildRealStrengthDesc}
                  </p>
                </div>
              </div>
            </AnimatedElement>

            {/* Feature card 3 */}
            <AnimatedElement className={`group bg-soft-lavender/5 p-12 rounded-3xl shadow-md hover:shadow-2xl transition-all duration-500 border border-warm-cream/50 hover:border-warm-cream border-l-2 border-l-soft-lavender`}>
              <div className="flex flex-col gap-8 items-start h-full">
                <div className={`w-20 h-20 rounded-full bg-rose-blush flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 border-2 border-soft-lavender/40 shadow-md`}>
                  <div className="text-emerald-500">
                    <Leaf className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-3 group-hover:text-sage-green transition-colors">
                    {t.home.sustainableResults}
                  </h3>
                  <p className="text-charcoal-black/70 text-base leading-relaxed font-light">
                    {t.home.sustainableResultsDesc}
                  </p>
                </div>
              </div>
            </AnimatedElement>
          </div>
        </div>
      </section>
      {/* --- Visual Breather (Parallax) --- */}
      <section className="relative h-[80vh] w-full overflow-hidden flex items-center justify-center">

        <div className="relative z-10 text-center max-w-4xl px-8">
          <AnimatedElement>

          </AnimatedElement>
        </div>
      </section>
      {/* --- Invest in Yourself Hero Section - Redesigned --- */}
      <section className="relative min-h-screen w-full overflow-hidden bg-white py-8 md:py-12 lg:py-16 px-4 md:px-8 lg:px-24">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-warm-bronze/5 to-transparent pointer-events-none" />
        
        {/* Decorative Glowing Orbs - Top Left */}
        <motion.div
          className="absolute -top-40 -left-40 w-96 h-96 bg-sage-green/20 rounded-full blur-3xl opacity-30 pointer-events-none"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Decorative Glowing Orbs - Bottom Right */}
        <motion.div
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-rose-blush/20 rounded-full blur-3xl opacity-30 pointer-events-none"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        {/* Content Container - Asymmetrical Layout */}
        <div className="relative z-10 max-w-[100rem] mx-auto w-full h-full flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Left: Large Pricing Card - Takes Visual Priority */}
          <motion.div 
            className="w-full lg:w-1/2 flex items-center justify-center lg:justify-end"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="w-full max-w-md">
              {/* Premium Pricing Card with Enhanced Design */}
              <div className="relative group">
                {/* Glowing border effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-sage-green via-warm-bronze to-rose-blush rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
                
                {/* Main Card */}
                <div className="relative bg-gradient-to-br from-charcoal-black/80 to-charcoal-black/60 backdrop-blur-xl p-10 md:p-14 rounded-3xl border border-white/10 overflow-hidden">
                  {/* Decorative background elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-sage-green/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-blush/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                  
                  <div className="relative z-10">
                    {/* Premium Badge */}
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      viewport={{ once: true }}
                      className="inline-block mb-6"
                    >
                      <span className="inline-block py-2 px-4 border border-sage-green/40 rounded-full text-sage-green text-xs tracking-widest uppercase font-medium bg-sage-green/5">
                        Limited Availability
                      </span>
                    </motion.div>

                    <p className="text-white/60 mb-8 font-light text-base md:text-lg">{t.home.cancelAnytime}</p>
                    {/* Price Display - Prominent */}
                    <motion.div 
                      className="flex items-baseline gap-3 mb-12 pb-8 border-b border-white/10"
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <span className="font-heading text-7xl md:text-8xl font-bold text-white">£499</span>
                      <div className="flex flex-col">
                        <span className="text-lg md:text-xl text-white/70 font-light">per</span>
                        <span className="text-lg md:text-xl text-white/70 font-light">12 weeks</span>
                      </div>
                    </motion.div>
                    {/* Features List - Enhanced */}
                    <div className="space-y-4 mb-10">
                      {[
                        t.home.customTrainingApp,
                        t.home.formAnalysis,
                        t.home.habitTracking,
                        t.home.prioritySupport,
                        t.home.monthlyStrategyCalls
                      ].map((item, i) => (
                        <motion.div 
                          key={i} 
                          className="flex items-center gap-3"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                          viewport={{ once: true }}
                        >
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-sage-green to-warm-bronze flex items-center justify-center flex-shrink-0">
                            <CheckCircle size={14} className="text-white" />
                          </div>
                          <span className="text-base md:text-lg text-white/90 font-light">{item}</span>
                        </motion.div>
                      ))}
                    </div>
                    {/* CTA Button */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300, damping: 10 }}
                      className="mb-6"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                      viewport={{ once: true }}
                    >
                      <Link
                        to="/store"
                        className="block w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-charcoal-black text-center py-5 md:py-6 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-yellow-500/40 transition-all duration-300"
                      >
                        {t.home.secureYourSpot}
                      </Link>
                    </motion.div>
                    <p className="text-center text-xs md:text-sm text-white/50 font-light">{t.home.limitedSpaces}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Text Content - Positioned Asymmetrically */}
          <motion.div 
            className="w-full lg:w-1/2 flex flex-col justify-center lg:justify-start"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="max-w-2xl">
              <AnimatedElement className="mb-8">
                <span className="inline-block py-2 px-4 border border-yellow-500/40 rounded-full text-yellow-600 text-sm tracking-widest uppercase font-medium bg-yellow-500/5">
                  Transform Your Life
                </span>
              </AnimatedElement>

              <div className="relative z-20 mb-12">
                <motion.div
                  className="absolute -inset-8 bg-gradient-to-br from-sage-green/20 via-warm-bronze/10 to-transparent rounded-3xl blur-2xl -z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
                
                <h2 className="font-heading text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] mb-8 tracking-tight">
                  <span className="bg-gradient-to-r from-[#a8b8a8] to-[#d4a8a8] bg-clip-text text-transparent">Invest in Yourself</span>
                </h2>
              </div>

              <AnimatedElement className="mb-12 delay-300">
                <p className="text-lg md:text-xl lg:text-2xl text-charcoal-black leading-relaxed max-w-lg font-light tracking-wide">
                  Your body is your most valuable asset. Transform your fitness journey with personalised coaching designed specifically for your life, goals, and challenges.
                </p>
              </AnimatedElement>

              {/* Key Benefits - Vertical List */}
              <AnimatedElement className="mb-12 delay-500 space-y-4">
                {[
                  { icon: Heart, text: "Personalised programming tailored to you" },
                  { icon: Zap, text: "Real results in 12 weeks or less" },
                  { icon: ShieldCheck, text: "Expert form analysis & injury prevention" }
                ].map((benefit, idx) => {
                  const Icon = benefit.icon;
                  return (
                    <motion.div
                      key={idx}
                      className="flex items-center gap-4"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.7 + idx * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${idx === 0 ? 'from-sage-green to-warm-bronze' : idx === 1 ? 'from-warm-bronze to-rose-blush' : 'from-rose-blush to-sage-green'} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={18} className="text-yellow-400" />
                      </div>
                      <span className="text-base md:text-lg text-charcoal-black font-light">{benefit.text}</span>
                    </motion.div>
                  );
                })}
              </AnimatedElement>

              {/* Decorative Floral Divider */}
              <motion.div
                className="flex items-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.6 }}
              >
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-sage-green/30 to-transparent" />
                <svg className="w-6 h-6 text-sage-green/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2C12 2 8 6 8 10C8 13.3 10 16 12 16C14 16 16 13.3 16 10C16 6 12 2 12 2Z" />
                  <path d="M12 16C12 16 10 18 10 20C10 21.1 11 22 12 22C13 22 14 21.1 14 20C14 18 12 16 12 16Z" />
                </svg>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-warm-bronze/30 to-transparent" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
      {/* --- Early CTA Section (Reduced Friction) --- */}
      <section className="relative py-24 px-8 lg:px-24 bg-gradient-to-r from-sage-green/95 to-sage-green overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-blush rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 max-w-[100rem] mx-auto text-center">
          <AnimatedElement>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-charcoal-black mb-6">
              Ready to get started?
            </h2>
            <p className="text-lg text-charcoal-black/90 mb-10 max-w-2xl mx-auto font-light">
              Join my coaching program and transform your fitness journey. Limited spaces available.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
              className="inline-block"
            >
              <Link
                to="/store"
                className="inline-flex items-center gap-3 bg-white text-charcoal-black px-12 py-5 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-white/30 transition-all duration-300"
              >
                Book Your Package <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </AnimatedElement>
        </div>
      </section>
      {/* --- Testimonials (Dynamic Masonry Layout) --- */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-warm-cream overflow-hidden">
          <div className="px-8 lg:px-24 mb-16 max-w-[100rem] mx-auto">
            <AnimatedElement>
              <h2 className="font-heading text-5xl md:text-6xl font-bold text-charcoal-black mb-6">
                {t.home.realWomen}
              </h2>
              <p className="text-xl text-charcoal-black/70 font-light max-w-2xl">
                {t.home.realWomenDesc}
              </p>
            </AnimatedElement>
          </div>

          {/* Dynamic Masonry Grid */}
          <div className="px-8 lg:px-24 max-w-[100rem] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-max">
              {testimonials.map((testimonial, index) => {
                return (
                  <motion.div
                    key={testimonial._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className={`group relative`}
                  >
                    {/* White background for all testimonials */}
                    <div className={`h-full rounded-2xl p-8 md:p-10 shadow-md hover:shadow-2xl transition-all duration-500 border backdrop-blur-sm bg-white border-warm-cream/60 hover:border-warm-cream`}>
                      {/* Decorative star background */}
                      <div className={`absolute top-6 right-6 opacity-10 transition-opacity group-hover:opacity-20 ${
                        index === 1 ? 'text-rose-blush' : index === 2 ? 'text-sage-green' : 'text-rose-blush'
                      }`}>
                        <Star size={40} fill="currentColor" />
                      </div>
                      
                      <div className="flex flex-col h-full justify-between relative z-10">
                        {/* Star Rating - Fixed height for alignment */}
                        <div className="flex gap-2 mb-6 h-8">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={24} 
                              className="font-bold text-charcoal-black"
                              fill="currentColor" 
                              strokeWidth={1.5}
                            />
                          ))}
                        </div>

                        {/* Testimonial Text */}
                        <p className={`leading-relaxed mb-8 font-light text-lg text-charcoal-black`}>
                          "{testimonial.testimonialText}"
                        </p>

                        {/* Client Info */}
                        <div className={`flex items-center gap-4 pt-6 border-t ${
                          index === 1 
                            ? 'border-rose-blush/30'
                            : index === 2
                            ? 'border-sage-green/20'
                            : 'border-rose-blush/30'
                        }`}>
                          {testimonial.transformationImage ? (
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 flex-shrink-0" style={{
                              borderColor: index === 1 ? 'rgba(251,232,240,0.5)' : index === 2 ? 'rgba(232,244,241,0.5)' : 'rgba(251,232,240,0.5)'
                            }}>
                              <Image
                                src={testimonial.transformationImage}
                                alt={testimonial.clientName || "Client"}
                                className="w-full h-full object-cover"
                                width={48}
                              />
                            </div>
                          ) : (
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border-2 ${
                              index === 1 
                                ? 'bg-rose-blush/30 text-charcoal-black border-rose-blush/40'
                                : index === 2
                                ? 'bg-sage-green/20 text-charcoal-black border-sage-green/40'
                                : 'bg-rose-blush/30 text-charcoal-black border-rose-blush/40'
                            }`}>
                              {testimonial.clientName?.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className={`font-bold text-sm md:text-base text-charcoal-black`}>
                              {testimonial.clientName}
                            </h4>
                            <div className={`flex flex-col sm:flex-row sm:gap-2 text-xs md:text-sm text-charcoal-black/60`}>
                              {testimonial.clientAgeRange && <span>{testimonial.clientAgeRange}</span>}
                              {testimonial.keyAchievement && (
                                <>
                                  <span className="hidden sm:inline">•</span>
                                  <span className={`font-medium text-charcoal-black/80`}>
                                    {testimonial.keyAchievement}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}
      {/* --- Contact Form Section --- */}
      <section className="py-24 px-8 lg:px-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-4">
              Let's Get Started
            </h2>
            <p className="font-paragraph text-lg text-warm-grey">
              Fill out the form below and I'll be in touch within 24 hours to discuss your personalised coaching plan.
            </p>
          </div>

          <div className="bg-white border border-warm-sand-beige rounded-2xl p-8 md:p-12">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
