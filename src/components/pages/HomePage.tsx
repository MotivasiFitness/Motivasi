// HPI 1.6-G
import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Star, Activity, Heart, Zap, ShieldCheck } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { BaseCrudService } from '@/integrations';
import { ClientTestimonials } from '@/entities';
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

  // Show sticky button after scrolling past hero section (roughly 80vh)
  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight * 0.8;
      setShowStickyButton(window.scrollY > heroHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-warm-cream min-h-screen w-full overflow-clip font-paragraph text-charcoal-black selection:bg-rose-blush selection:text-charcoal-black">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-sage-green via-rose-blush to-soft-lavender origin-left z-50"
        style={{ scaleX }}
      />
      
      {/* Sticky CTA Button - Appears after hero section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showStickyButton ? 1 : 0, y: showStickyButton ? 0 : 20 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-8 right-8 z-40 pointer-events-none"
        style={{ pointerEvents: showStickyButton ? 'auto' : 'none' }}
      >
        <Link
          to="/store"
          className="group flex items-center gap-3 bg-gradient-to-r from-sage-green to-sage-green/90 text-white px-8 py-4 rounded-full font-bold text-base shadow-lg hover:shadow-2xl hover:shadow-sage-green/40 transition-all duration-300 hover:scale-105"
        >
          Book Your Package <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
      {/* --- Hero Section --- */}
      <section className="relative min-h-screen w-full flex flex-col lg:flex-row overflow-hidden bg-gradient-to-br from-warm-cream via-warm-cream to-rose-blush/30">
        {/* Subtle gradient overlay for refined effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-rose-blush/5 to-transparent pointer-events-none" />
        
        {/* Decorative Botanical Line Illustration - Top Right Corner */}
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 opacity-8 pointer-events-none"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.08, scale: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full text-sage-green" preserveAspectRatio="none">
            {/* Botanical vine with leaves */}
            <path d="M200 0 Q180 20 170 40 Q160 60 165 80 Q170 100 160 120 Q150 140 155 160 Q160 180 150 200" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            {/* Leaf details */}
            <path d="M170 40 Q175 35 180 40 Q175 45 170 40" stroke="currentColor" strokeWidth="0.8" fill="none" />
            <path d="M165 80 Q172 75 178 82 Q171 87 165 80" stroke="currentColor" strokeWidth="0.8" fill="none" />
            <path d="M160 120 Q168 115 175 123 Q167 128 160 120" stroke="currentColor" strokeWidth="0.8" fill="none" />
            <path d="M155 160 Q163 155 170 163 Q162 168 155 160" stroke="currentColor" strokeWidth="0.8" fill="none" />
          </svg>
        </motion.div>

        {/* Decorative Botanical Elements - Bottom Left */}
        <motion.div
          className="absolute bottom-0 left-0 w-80 h-80 opacity-6 pointer-events-none"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.06, scale: 1 }}
          transition={{ duration: 1.4, delay: 0.2, ease: "easeOut" }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full text-rose-blush" preserveAspectRatio="none">
            {/* Botanical vine with leaves - mirrored */}
            <path d="M0 200 Q20 180 30 160 Q40 140 35 120 Q30 100 40 80 Q50 60 45 40 Q40 20 50 0" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            {/* Leaf details */}
            <path d="M30 160 Q25 165 20 160 Q25 155 30 160" stroke="currentColor" strokeWidth="0.8" fill="none" />
            <path d="M35 120 Q28 125 22 118 Q29 113 35 120" stroke="currentColor" strokeWidth="0.8" fill="none" />
            <path d="M40 80 Q32 85 25 77 Q33 72 40 80" stroke="currentColor" strokeWidth="0.8" fill="none" />
            <path d="M45 40 Q37 45 30 37 Q38 32 45 40" stroke="currentColor" strokeWidth="0.8" fill="none" />
          </svg>
        </motion.div>

        {/* Left Content */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-24 py-40 lg:py-64 z-10">
          <div className="max-w-2xl">
            <AnimatedElement className="mb-8">
              <span className="inline-block py-2 px-4 border border-sage-green/40 rounded-full text-sage-green text-sm tracking-widest uppercase font-medium bg-sage-green/5">
                {t.home.tagline}
              </span>
            </AnimatedElement>
            
            {/* Gradient Overlay Background for Text */}
            <div className="relative z-20">
              {/* Subtle gradient backdrop behind heading */}
              <motion.div
                className="absolute -inset-8 bg-gradient-to-br from-rose-blush/20 via-soft-lavender/15 to-transparent rounded-3xl blur-2xl -z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              
              <h1 className="font-heading text-6xl md:text-7xl lg:text-8xl font-bold text-charcoal-black leading-[1.1] mb-16 tracking-tight">
                <span className="block overflow-hidden">
                  <motion.span 
                    initial={{ y: "100%" }} 
                    animate={{ y: 0 }} 
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="block my-0.5 mx-0"
                  >
                    {t.home.heroTitle}
                  </motion.span>
                </span>
                <span className="block overflow-hidden bg-gradient-to-r from-sage-green to-rose-blush bg-clip-text text-transparent">
                  <motion.span 
                    initial={{ y: "100%" }} 
                    animate={{ y: 0 }} 
                    transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="block my-3.5 mx-0"
                  >
                    {t.home.heroSubtitle}
                  </motion.span>
                </span>
              </h1>
            </div>

            <AnimatedElement className="mb-16 delay-300">
              <p className="text-xl md:text-2xl text-charcoal-black/70 leading-relaxed max-w-lg font-light tracking-wide">
                {t.home.readyToFeelDesc}
              </p>
            </AnimatedElement>

            <AnimatedElement className="flex flex-wrap gap-6 delay-500">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <Link
                  to="/store"
                  className="group relative overflow-hidden bg-sage-green text-white px-12 py-6 rounded-full font-medium text-lg transition-all duration-300 hover:shadow-lg hover:shadow-sage-green/30 inline-flex items-center gap-2"
                >
                  Let's get started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <Link
                  to="/about"
                  className="group flex items-center gap-2 px-12 py-6 rounded-full border-2 border-rose-blush text-charcoal-black font-medium text-lg hover:bg-rose-blush/5 hover:border-rose-blush transition-all duration-300 bg-white"
                >
                  {t.home.myPhilosophy}
                </Link>
              </motion.div>
            </AnimatedElement>

            {/* Decorative Floral Divider */}
            <motion.div
              className="mt-16 flex items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.6 }}
            >
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-sage-green/30 to-transparent" />
              <svg className="w-6 h-6 text-sage-green/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2C12 2 8 6 8 10C8 13.3 10 16 12 16C14 16 16 13.3 16 10C16 6 12 2 12 2Z" />
                <path d="M12 16C12 16 10 18 10 20C10 21.1 11 22 12 22C13 22 14 21.1 14 20C14 18 12 16 12 16Z" />
              </svg>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-rose-blush/30 to-transparent" />
            </motion.div>
          </div>
        </div>

        {/* Right Image - Parallax */}
        <div className="w-full lg:w-1/2 h-[60vh] lg:h-auto relative overflow-hidden flex items-center justify-center p-8 lg:p-12">
          <motion.div 
            className="w-full h-full relative"
            style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]) }}
          >
            <Image
              src="https://static.wixstatic.com/media/93e866_ef269d4e34974b55aceddc01c79a92ad~mv2.png"
              alt="Professional fitness coach portrait"
              className="w-full h-full object-cover rounded-[2rem] lg:rounded-[3rem]"
              width={1200}
              focalPointX={48.19272855630074}
              focalPointY={38.573949876456055} />
          </motion.div>
        </div>
      </section>
      {/* --- Keywords Section with Softer Design --- */}
      <div className="relative py-32 px-8 lg:px-24 bg-rose-blush/8 overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute top-20 left-12 w-32 h-32 bg-sage-green/3 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-12 w-40 h-40 bg-soft-lavender/3 rounded-full blur-3xl" />

        {/* Main Content */}
        <div className="relative z-10 max-w-[100rem] mx-auto">
          {/* Keywords Display - Text only with dividers */}
          <motion.div 
            className="flex gap-0 items-center justify-center flex-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {[
              { label: t.home.marqueeConfidence },
              { label: t.home.marqueeBalance },
              { label: t.home.marqueeNutrition },
              { label: t.home.marqueeStrength }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="flex items-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <span className="text-2xl md:text-3xl lg:text-4xl font-heading text-charcoal-black/85 px-4 md:px-6">
                  {item.label}
                </span>
                
                {/* Rose/Gold divider between items */}
                {idx < 3 && (
                  <motion.div
                    className="text-2xl md:text-3xl text-soft-bronze/60"
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ repeat: Infinity, duration: 3, delay: idx * 0.2 }}
                  >
                    ✦
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
      {/* --- The Philosophy (Text Heavy / Editorial) --- */}
      <section className="py-32 px-8 lg:px-24 bg-gradient-to-b from-warm-cream via-rose-blush/5 to-soft-lavender/5">
        <div className="max-w-[100rem] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
          <div className="lg:col-span-5 relative">
            <div className="sticky top-32">
              <AnimatedElement>
                <h2 className="font-heading text-5xl md:text-6xl font-bold text-charcoal-black mb-8 leading-tight">
                  {t.home.transformationTitle} <br/>
                  <span className="bg-gradient-to-r from-sage-green to-rose-blush bg-clip-text text-transparent italic">{t.home.transformationSubtitle}</span>
                </h2>
              </AnimatedElement>
              <AnimatedElement className="delay-200">
                <div className="w-24 h-1.5 bg-gradient-to-r from-sage-green to-rose-blush mb-8 rounded-full" />
                <p className="text-lg text-charcoal-black/70 mb-8 leading-relaxed font-light">
                  You've tried the crash diets. You've done the endless cardio. It's time for a sustainable approach that honours your body and your busy life.
                </p>
                <Link to="/about" className="text-charcoal-black font-medium border-b-2 border-sage-green pb-2 hover:text-sage-green transition-colors inline-flex items-center gap-2">
                  {t.home.readFullBio} <ArrowRight size={16} />
                </Link>
              </AnimatedElement>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Feature card 1 */}
            <AnimatedElement className={`group bg-sage-green/5 p-16 rounded-3xl shadow-md hover:shadow-2xl transition-all duration-500 border border-warm-cream/50 hover:border-warm-cream border-l-2 border-l-sage-green`}>
              <div className="flex flex-col gap-8 items-start h-full">
                <div className={`w-24 h-24 rounded-full bg-rose-blush flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-sage-green">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                </div>
                <div>
                  <h3 className="font-heading text-3xl font-bold text-charcoal-black mb-4 group-hover:text-sage-green transition-colors">
                    {t.home.noExtremeDiets}
                  </h3>
                  <p className="text-charcoal-black/70 text-lg leading-relaxed font-light">
                    {t.home.noExtremeDietsDesc}
                  </p>
                </div>
              </div>
            </AnimatedElement>

            {/* Feature card 2 */}
            <AnimatedElement className={`group bg-rose-blush/5 p-16 rounded-3xl shadow-md hover:shadow-2xl transition-all duration-500 border border-warm-cream/50 hover:border-warm-cream border-l-2 border-l-rose-blush`}>
              <div className="flex flex-col gap-8 items-start h-full">
                <div className={`w-24 h-24 rounded-full bg-rose-blush flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-rose-blush">
                    <Zap className="w-8 h-8" />
                  </div>
                </div>
                <div>
                  <h3 className="font-heading text-3xl font-bold text-charcoal-black mb-4 group-hover:text-sage-green transition-colors">
                    {t.home.buildRealStrength}
                  </h3>
                  <p className="text-charcoal-black/70 text-lg leading-relaxed font-light">
                    {t.home.buildRealStrengthDesc}
                  </p>
                </div>
              </div>
            </AnimatedElement>

            {/* Feature card 3 */}
            <AnimatedElement className={`group bg-soft-lavender/5 p-16 rounded-3xl shadow-md hover:shadow-2xl transition-all duration-500 border border-warm-cream/50 hover:border-warm-cream border-l-2 border-l-soft-lavender`}>
              <div className="flex flex-col gap-8 items-start h-full">
                <div className={`w-24 h-24 rounded-full bg-rose-blush flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-soft-lavender">
                    <Activity className="w-8 h-8" />
                  </div>
                </div>
                <div>
                  <h3 className="font-heading text-3xl font-bold text-charcoal-black mb-4 group-hover:text-sage-green transition-colors">
                    {t.home.sustainableResults}
                  </h3>
                  <p className="text-charcoal-black/70 text-lg leading-relaxed font-light">
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
        <div className="absolute inset-0 z-0">
          <Image
            src="https://static.wixstatic.com/media/93e866_6e3c159e55534317b0b18c64fe452474~mv2.png"
            alt="Professional home gym setup with strength training equipment"
            className="w-full h-full object-cover"
            width={1600}
          />
          <div className="absolute inset-0 bg-charcoal-black/40" />
        </div>
        <div className="relative z-10 text-center max-w-4xl px-8">
          <AnimatedElement>
            <h2 className="font-heading text-5xl md:text-7xl text-soft-white font-bold mb-8 leading-tight">
              {t.home.quote}
            </h2>
            <p className="font-paragraph text-xl md:text-2xl text-warm-grey">
              {t.home.quoteAuthor}
            </p>
          </AnimatedElement>
        </div>
      </section>
      {/* --- Sticky Signature Offer Section --- */}
      <section className="relative bg-gradient-to-b from-warm-cream via-soft-lavender/8 to-rose-blush/5 py-32 px-8 lg:px-24">
        <div className="max-w-[100rem] mx-auto">
          <div className="flex flex-col lg:flex-row gap-20 lg:gap-32">
            
            {/* Left: Scrollable Details */}
            <div className="w-full lg:w-1/2 space-y-24 flex flex-col">
              <div>
                <AnimatedElement>
                  <span className="text-sage-green font-medium tracking-widest uppercase mb-4 block text-sm">The Signature Package</span>
                  <h2 className="font-heading text-5xl md:text-6xl font-bold text-charcoal-black mb-8">
                    {t.home.everythingYouNeed}
                  </h2>
                  <p className="text-xl text-charcoal-black/70 leading-relaxed font-light">
                    {t.home.everythingYouNeedDesc}
                  </p>
                </AnimatedElement>
              </div>

              <div className="space-y-16">
                {[
                  {
                    title: t.home.fourPersonalised,
                    desc: t.home.fourPersonalisedDesc,
                    image: "https://static.wixstatic.com/media/93e866_7d48abe991484564b3dbdd6baf6b5d8a~mv2.png?originWidth=768&originHeight=448"
                  },
                  {
                    title: t.home.weeklyCheckIns,
                    desc: t.home.weeklyCheckInsDesc,
                    image: "https://static.wixstatic.com/media/93e866_cabe766402e14ec98f048ee9b1a0a4eb~mv2.png?originWidth=768&originHeight=448"
                  },
                  {
                    title: t.home.nutritionGuidance,
                    desc: t.home.nutritionGuidanceDesc,
                    image: "https://static.wixstatic.com/media/93e866_29519bae313f4a8aa77d31574d6fa866~mv2.png?originWidth=768&originHeight=448"
                  }
                ].map((feature, i) => (
                  <AnimatedElement key={i} className="group">
                    <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-8 relative">
                      <Image 
                        src={feature.image} 
                        alt={feature.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        width={800}
                      />
                      <div className="absolute inset-0 bg-charcoal-black/10 group-hover:bg-transparent transition-colors" />
                    </div>
                    <h3 className="font-heading text-3xl font-bold text-charcoal-black mb-4">{feature.title}</h3>
                    <p className="text-lg text-charcoal-black/70 leading-relaxed font-light">{feature.desc}</p>
                  </AnimatedElement>
                ))}
              </div>
            </div>

            {/* Right: Sticky Pricing Card */}
            <div className="w-full lg:w-1/2 relative">
              <div className="sticky top-32">
                {/* Pricing Section Background Wrapper */}
                <div className="bg-gradient-to-br from-soft-lavender to-rose-blush/20 p-12 md:p-16 rounded-3xl shadow-lg">
                  {/* Section Title */}
                  <h2 className="font-heading text-4xl md:text-5xl font-bold text-charcoal-black mb-12 text-center">
                    Invest in Yourself
                  </h2>
                  
                  {/* Pricing Card */}
                  <div className="bg-gradient-to-br from-dark-gray to-dark-gray/95 text-white p-12 md:p-16 rounded-2xl shadow-2xl relative overflow-hidden border-t-4 border-t-rose-blush">
                  {/* Decorative background elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-sage-green/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-blush/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                  
                  <div className="relative z-10">
                    <h3 className="font-heading text-4xl font-bold mb-3">{t.home.monthlyCoaching}</h3>
                    <p className="text-white/70 mb-12 font-light">{t.home.cancelAnytime}</p>
                    
                    <div className="flex items-baseline gap-3 mb-12">
                      <span className="font-heading text-7xl font-bold text-rose-blush">£499</span>
                      <span className="text-xl text-white/70 font-light">/ 12 weeks</span>
                    </div>

                    <div className="space-y-5 mb-12">
                      {[
                        t.home.customTrainingApp,
                        t.home.formAnalysis,
                        t.home.habitTracking,
                        t.home.prioritySupport,
                        t.home.monthlyStrategyCalls
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="w-6 h-6 rounded-full bg-sage-green/30 flex items-center justify-center flex-shrink-0">
                            <CheckCircle size={14} className="text-sage-green" />
                          </div>
                          <span className="text-lg text-white/90 font-light">{item}</span>
                        </div>
                      ))}
                    </div>

                    <Link
                      to="/store"
                      className="block w-full bg-sage-green text-white text-center py-6 rounded-full font-medium text-lg hover:shadow-lg hover:shadow-sage-green/40 transition-all duration-300"
                    >
                      {t.home.secureYourSpot}
                    </Link>
                    <p className="text-center text-sm text-white/60 mt-6 font-light">{t.home.limitedSpaces}</p>
                  </div>
                </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
      {/* --- CTA After Pricing Section (Increased Visibility) --- */}
      <section className="relative py-20 px-8 lg:px-24 bg-gradient-to-r from-rose-blush/90 to-rose-blush/80 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-sage-green rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 max-w-[100rem] mx-auto text-center">
          <AnimatedElement>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to transform your fitness?
            </h2>
            <p className="text-lg text-white/95 mb-8 max-w-2xl mx-auto font-light">
              Secure your spot in my coaching program today. Limited spaces available each month.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
              className="inline-block"
            >
              <Link
                to="/store"
                className="inline-flex items-center gap-3 bg-sage-green text-white px-12 py-5 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-sage-green/40 transition-all duration-300"
              >
                Book Your Package <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </AnimatedElement>
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
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to get started?
            </h2>
            <p className="text-lg text-white/90 mb-10 max-w-2xl mx-auto font-light">
              Join my coaching program and transform your fitness journey. Limited spaces available.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
              className="inline-block"
            >
              <Link
                to="/store"
                className="inline-flex items-center gap-3 bg-white text-sage-green px-12 py-5 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-white/30 transition-all duration-300"
              >
                Book Your Package <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </AnimatedElement>
        </div>
      </section>
      {/* --- Testimonials (Dynamic Masonry Layout) --- */}
      {testimonials.length > 0 && (
        <section className="py-32 bg-gradient-to-b from-rose-blush/10 to-soft-lavender/10 overflow-hidden">
          <div className="px-8 lg:px-24 mb-20 max-w-[100rem] mx-auto">
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
                // Vary card sizes and positions for rhythm
                const isLarge = index === 0; // First card spans more
                const isStaggered = index === 1; // Second card offset
                const gridColSpan = isLarge ? 'lg:col-span-1' : '';
                const gridRowSpan = isLarge ? 'lg:row-span-1' : '';
                
                return (
                  <motion.div
                    key={testimonial._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className={`group relative ${gridColSpan} ${gridRowSpan}`}
                  >
                    {/* Varied background colors for visual interest */}
                    <div className={`h-full rounded-2xl p-8 md:p-10 shadow-md hover:shadow-2xl transition-all duration-500 border backdrop-blur-sm ${
                      index === 0 
                        ? 'bg-rose-blush/90 border-rose-blush/60 hover:border-rose-blush' 
                        : index === 1 
                        ? 'bg-soft-lavender/80 border-soft-lavender/60 hover:border-soft-lavender'
                        : 'bg-sage-green/10 border-sage-green/40 hover:border-sage-green/60'
                    }`}>
                      {/* Decorative star background */}
                      <div className={`absolute top-6 right-6 opacity-10 transition-opacity group-hover:opacity-20 ${
                        index === 0 ? 'text-sage-green' : index === 1 ? 'text-rose-blush' : 'text-sage-green'
                      }`}>
                        <Star size={isLarge ? 56 : 40} fill="currentColor" />
                      </div>
                      
                      <div className="flex flex-col h-full justify-between relative z-10">
                        {/* Star Rating */}
                        <div className="flex gap-1 mb-6">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={14} 
                              className={index === 0 ? 'text-white' : index === 1 ? 'text-rose-blush' : 'text-sage-green'} 
                              fill="currentColor" 
                            />
                          ))}
                        </div>

                        {/* Testimonial Text */}
                        <p className={`leading-relaxed mb-8 font-light ${
                          index === 0 
                            ? 'font-heading text-xl md:text-2xl text-white' 
                            : 'text-lg text-charcoal-black'
                        }`}>
                          "{testimonial.testimonialText}"
                        </p>

                        {/* Client Info */}
                        <div className={`flex items-center gap-4 pt-6 border-t ${
                          index === 0 
                            ? 'border-white/30' 
                            : index === 1 
                            ? 'border-rose-blush/30'
                            : 'border-sage-green/20'
                        }`}>
                          {testimonial.transformationImage ? (
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 flex-shrink-0" style={{
                              borderColor: index === 0 ? 'rgba(255,255,255,0.5)' : index === 1 ? 'rgba(251,232,240,0.5)' : 'rgba(232,244,241,0.5)'
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
                              index === 0 
                                ? 'bg-white/20 text-white border-white/40' 
                                : index === 1 
                                ? 'bg-rose-blush/30 text-charcoal-black border-rose-blush/40'
                                : 'bg-sage-green/20 text-charcoal-black border-sage-green/40'
                            }`}>
                              {testimonial.clientName?.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className={`font-bold text-sm md:text-base ${
                              index === 0 ? 'text-white' : 'text-charcoal-black'
                            }`}>
                              {testimonial.clientName}
                            </h4>
                            <div className={`flex flex-col sm:flex-row sm:gap-2 text-xs md:text-sm ${
                              index === 0 ? 'text-white/70' : 'text-charcoal-black/60'
                            }`}>
                              {testimonial.clientAgeRange && <span>{testimonial.clientAgeRange}</span>}
                              {testimonial.keyAchievement && (
                                <>
                                  <span className="hidden sm:inline">•</span>
                                  <span className={`font-medium ${index === 0 ? 'text-white' : 'text-charcoal-black/80'}`}>
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
      {/* --- Final CTA --- */}
      <section className="relative py-32 px-8 lg:px-24 bg-gradient-to-br from-charcoal-black via-charcoal-black to-charcoal-black/95 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
           <Image
              src="https://static.wixstatic.com/media/93e866_2d4f518df7c941ac89afe5c8f996af14~mv2.png?originWidth=1600&originHeight=768"
              alt="Texture"
              className="w-full h-full object-cover"
              width={1600}
            />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <AnimatedElement>
            <h2 className="font-heading text-6xl md:text-8xl font-bold text-white mb-10 tracking-tight">
              {t.home.readyToFeel} <span className="bg-gradient-to-r from-sage-green to-rose-blush bg-clip-text text-transparent">stronger?</span>
            </h2>
            <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
              {t.home.readyToFeelDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
                className="w-full sm:w-auto"
              >
                <Link
                  to="/store"
                  className="block w-full bg-gradient-to-r from-sage-green to-rose-blush text-white px-14 py-6 rounded-full font-medium text-xl hover:shadow-lg hover:shadow-sage-green/30 transition-all duration-300 text-center"
                >
                  Begin your journey (£150/mo)
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
                className="w-full sm:w-auto"
              >
                <Link
                  to="/about"
                  className="block w-full px-14 py-6 rounded-full border-2 border-white/30 text-white font-medium text-xl hover:bg-white/10 hover:border-white/50 transition-all duration-300 text-center"
                >
                  {t.home.learnMoreAboutMe}
                </Link>
              </motion.div>
            </div>
          </AnimatedElement>
        </div>
      </section>
    </div>
  );
}