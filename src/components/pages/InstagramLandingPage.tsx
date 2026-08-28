import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, MessageCircle, Calendar, Zap, Heart, Dumbbell, Users, TrendingUp, Clock, Flame, Target, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Image } from '@/components/ui/image';
import PricingSection from '@/components/PricingSection';

export default function InstagramLandingPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [testimonialDirection, setTestimonialDirection] = useState(0);
  const [testimonialAutoPlay, setTestimonialAutoPlay] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const testimonialScrollRef = useRef<HTMLDivElement>(null);

  const fadeInUp = {
    initial: { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: 'easeOut' },
    viewport: { once: true, margin: '0px 0px -100px 0px' }
  };

  const handlePhaseScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.offsetWidth;
      scrollContainerRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Testimonial carousel pagination
  const testimonialPaginate = (newDirection: number) => {
    setTestimonialDirection(newDirection);
    setCurrentTestimonialIndex((prev) => (prev + newDirection + 6) % 6);
    setTestimonialAutoPlay(false);
  };

  // Auto-play testimonial carousel
  useEffect(() => {
    if (!testimonialAutoPlay) {
      const timer = setTimeout(() => setTestimonialAutoPlay(true), 5000);
      return () => clearTimeout(timer);
    }

    const interval = setInterval(() => {
      setTestimonialDirection(1);
      setCurrentTestimonialIndex((prev) => (prev + 1) % 6);
    }, 6000);

    return () => clearInterval(interval);
  }, [testimonialAutoPlay]);

  const testimonials = [
    {
      quote: "I finally understand my body. Training doesn't feel like fighting against myself anymore.",
      author: 'Sarah, 32',
      detail: 'Postpartum client'
    },
    {
      quote: "Having a real coach who actually responds to my messages has changed everything. I feel supported.",
      author: 'Emma, 28',
      detail: 'Strength training client'
    },
    {
      quote: "The nutrition guidance alongside training is exactly what I needed. No more guessing.",
      author: 'Jessica, 45',
      detail: 'Perimenopause client'
    },
    {
      quote: "I'm stronger than I've ever been, and I'm not exhausted all the time. This actually works.",
      author: 'Rachel, 35',
      detail: 'Cycle-synced training client'
    },
    {
      quote: "Worth every penny. I feel like I finally have someone in my corner.",
      author: 'Laura, 38',
      detail: 'Menopause support client'
    },
    {
      quote: "The flexibility is incredible. My plan adapts to my life, not the other way around.",
      author: 'Sophie, 31',
      detail: 'Busy professional'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Mobile Optimized */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-soft-white/98 backdrop-blur-sm border-b border-warm-sand-beige/20">

      </nav>
      {/* Hero Section - Mobile First */}
      <section className="pt-24 pb-12 sm:pt-32 sm:pb-24 px-4 sm:px-6 md:px-12 relative overflow-hidden min-h-screen flex items-center bg-cover bg-center bg-no-repeat" style={{
        backgroundImage: 'url(https://static.wixstatic.com/media/93e866_cadc437246bc4357bfefba591a09448b~mv2.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'scroll'
      }}>
            {/* Overlay for text readability */}
            <div className="absolute inset-0 bg-black/50 z-0" />
            <div className="max-w-[100rem] mx-auto relative z-10 w-full">
              <div className="lg:hidden flex flex-col space-y-8">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                  <h1 className="font-heading text-5xl sm:text-6xl text-white leading-tight mb-3">
                    Train in Sync.
                  </h1>
                  <p className="font-paragraph text-xl sm:text-2xl text-white italic font-light mb-5">
                    Feel your strongest.
                  </p>
                  <p className="font-paragraph text-base sm:text-lg text-white/90 leading-relaxed">
                    A woman's training and nutrition program that adapts to your cycle, your symptoms and your stage of life.
                  </p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white backdrop-blur-sm rounded-3xl p-6 border border-warm-sand-beige/40">
                  {[ { icon: '🏋️', title: '3 personalised training sessions per week', desc: 'via our easy-to-use app' }, { icon: '💬', title: 'Direct chat with your qualified coach', desc: '' }, { icon: '🔄', title: 'Cycle-synced training for every phase', desc: '' }, { icon: '🍎', title: 'Level 4 nutrition guidance that fits your life', desc: '' } ].map((feature, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <div className="text-3xl flex-shrink-0 bg-primary/10 rounded-full p-2">{feature.icon}</div>
                      <div className="flex-1">
                        <p className="font-paragraph font-semibold text-base text-primary-text">{feature.title}</p>
                        {feature.desc && <p className="font-paragraph text-sm text-secondary-text">{feature.desc}</p>}
                      </div>
                    </div>
                  ))}
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="pt-4 flex flex-col sm:flex-row gap-4">
                  <button className="flex-1 bg-primary text-white px-8 py-4 rounded-full font-paragraph font-semibold hover:bg-primary/90 transition text-base sm:text-lg h-12 flex items-center justify-center shadow-lg hover:shadow-xl border-2 border-white">
                    Start Your Journey
                  </button>
                  <button onClick={() => setShowChatModal(true)} className="flex-1 border-2 border-white text-white px-8 py-4 rounded-full font-paragraph font-semibold hover:bg-white/10 transition text-base sm:text-lg h-12 flex items-center justify-center whitespace-nowrap">
                    Book a Free Chat
                  </button>
                </motion.div>

              </div>
              <div className="hidden lg:grid grid-cols-12 gap-10 items-center">
                <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="col-span-6 space-y-8 pr-8">
                  <div className="space-y-4">
                    <div className="flex items-start gap-6">
                      <h1 className="font-heading text-6xl xl:text-7xl text-white leading-tight">
                        Train in Sync.
                      </h1>
                    </div>
                    <p className="font-paragraph text-2xl text-white italic font-light">
                      Feel your strongest.
                    </p>
                    <p className="font-paragraph text-lg text-white/90 leading-relaxed max-w-lg">
                      A woman's training and nutrition program that adapts to your cycle, your symptoms and your stage of life.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    {[ { icon: '🏋️', title: "Personalised Sessions", desc: '3 per week, tailored to your cycle' }, { icon: '👥', title: "Coach Access", desc: 'Direct messaging & form checks' }, { icon: '🥗', title: "Nutrition Guidance", desc: "Cycle-synced strategies" }, { icon: '📱', title: "All-in-One App", desc: 'Workouts, tracking, coaching' } ].map((feature, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 + idx * 0.05 }} className="flex gap-4 items-center backdrop-blur-sm rounded-xl p-5 border border-warm-sand-beige/40 hover:border-primary/20 transition group bg-primary-foreground">
                        <div className="text-3xl flex-shrink-0 bg-primary/10 rounded-full p-2 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                        <div className="flex-1 text-center">
                          <p className="font-paragraph font-semibold text-base text-primary-text">{feature.title}</p>
                          <p className="font-paragraph text-sm text-secondary-text">{feature.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }} className="flex gap-4 pt-4">
                    <button className="bg-primary text-white px-8 py-4 rounded-full font-paragraph font-semibold hover:bg-primary/90 transition text-lg h-12 flex items-center justify-center shadow-lg hover:shadow-xl border-2 border-white">
                      Start Your Journey
                    </button>
                    <button onClick={() => setShowChatModal(true)} className="border-2 border-white text-white px-8 py-4 rounded-full font-paragraph font-semibold hover:bg-white/10 transition text-lg h-12 flex items-center justify-center whitespace-nowrap">
                      Book a Free Chat
                    </button>
                  </motion.div>
                </motion.div>

              </div>
            </div>
          </section>
      {/* SECTION 2: Why This Is Different - Problem/Solution */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-[100rem] mx-auto">
          {/* Headline - Center Aligned */}
          <motion.div {...fadeInUp} className="mb-12 sm:mb-16 max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl text-primary leading-tight mb-4 sm:mb-6">
              Your body isn't a problem to solve.
            </h2>
            <p className="font-heading text-xl sm:text-2xl text-primary italic font-light mb-6 sm:mb-8">
              Your training should be able to adapt.
            </p>
            <p className="font-paragraph text-sm sm:text-base text-secondary-text leading-relaxed">
              Most online training programmes give you a plan and expect you to fit yourself around it. This works differently. Your training responds to your energy, recovery, symptoms, cycle and stage of life — while your coach helps you make the right adjustments.
            </p>
          </motion.div>

          {/* Comparison Layout - Stacked on Mobile */}
          <div className="flex justify-center mb-8 sm:mb-12">
            {/* This Approach Card - Centered on Desktop */}
            <motion.div
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.2 }}
              className="relative w-full max-w-2xl"
            >
              {/* Accent background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-warm-sand-beige/10 rounded-2xl" />
              
              {/* Content */}
              <div className="relative bg-warm-cream/80 backdrop-blur-sm p-8 sm:p-10 rounded-2xl border-2 border-primary/20 mx-auto">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
                
                <h3 className="font-heading text-2xl sm:text-3xl text-primary mb-8 relative z-10">The Natural Sync approach</h3>
                
                <ul className="space-y-5 relative z-10">
                  {[
                    'Training that adapts',
                    'Intensity that can change',
                    'Strength + recovery',
                    'Direct coach communication',
                    'Women\'s health and life-stage awareness',
                    'Nutrition support'
                  ].map((item, idx) => (
                    <li key={idx} className="flex gap-4 items-start">
                      <div className="flex-shrink-0 mt-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <span className="font-paragraph text-base sm:text-lg text-primary-text font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Science Statement */}
          <motion.div
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.3 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-warm-sand-beige/20 border border-warm-sand-beige/40 rounded-xl p-6 sm:p-8">
              <p className="font-paragraph text-sm sm:text-base text-secondary-text leading-relaxed italic">
                <span className="font-semibold text-primary-text">Science is still evolving around cycle-related performance.</span> We don't believe women should be forced into rigid hormonal rules. We use the cycle as a framework — and your real-world symptoms, energy and recovery as feedback.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Four Cycle Phases - Premium Section - Mobile Optimized */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-[100rem] mx-auto">
          {/* Headline and Supporting Text */}
          <motion.div {...fadeInUp} className="text-center mb-8 sm:mb-16">
            <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl text-primary leading-tight mb-4 sm:mb-6">
              Four phases.<br />One body.<br />A smarter way to train.
            </h2>
            <p className="font-paragraph text-sm sm:text-lg text-secondary-text max-w-3xl mx-auto leading-relaxed">
              Your training doesn't have to look the same every week. We use the four phases of the cycle as a flexible framework for adjusting training, recovery and nutrition.
            </p>
          </motion.div>

          {/* Mobile: Swipeable Carousel / Desktop: Grid */}
          <div className="lg:hidden mb-8 sm:mb-12">
            {/* Swipe Container */}
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-4 pb-4 scroll-smooth snap-x snap-mandatory"
              style={{ scrollBehavior: 'smooth' }}
            >
              {[
                {
                  phase: 'Menstrual',
                  tagline: 'Move & Rebuild',
                  description: 'Lower the intensity. Focus on mobility, movement, recovery and rebuilding.',
                  label: 'Listen · Recover · Rebuild',
                  accentColor: 'from-rose-blush/40 to-rose-blush/10',
                  borderColor: 'border-rose-blush/30',
                  textAccent: 'text-black'
                },
                {
                  phase: 'Follicular',
                  tagline: 'Build & Ramp Up',
                  description: 'Energy and motivation may rise. Build strength, increase training demand and create momentum.',
                  label: 'Build · Progress · Strengthen',
                  accentColor: 'from-emerald-green/40 to-emerald-green/10',
                  borderColor: 'border-emerald-green/30',
                  textAccent: 'text-emerald-green'
                },
                {
                  phase: 'Ovulatory',
                  tagline: 'Peak Performance',
                  description: 'A potential window to push harder when you feel strong and recovered.',
                  label: 'Challenge · Perform · Progress',
                  accentColor: 'from-gold/40 to-gold/10',
                  borderColor: 'border-gold/30',
                  textAccent: 'text-gold'
                },
                {
                  phase: 'Luteal',
                  tagline: 'Taper & Recover',
                  description: 'Deliberately reduce training volume and support recovery as your next period approaches.',
                  label: 'Maintain · Recover · Reset',
                  accentColor: 'from-warm-bronze/40 to-warm-bronze/10',
                  borderColor: 'border-warm-bronze/30',
                  textAccent: 'text-warm-bronze'
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`flex-shrink-0 w-full sm:w-80 snap-start`}
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className={`relative overflow-hidden rounded-2xl border ${item.borderColor} bg-warm-cream p-6 h-full`}
                  >
                    {/* Gradient accent background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.accentColor}`} />
                    
                    {/* Content */}
                    <div className="relative z-10 space-y-3">
                      {/* Phase name with accent */}
                      <div className="space-y-1 text-center">
                        <p className={`font-paragraph text-xs font-semibold uppercase tracking-wider ${item.textAccent}`}>
                          {item.phase}
                        </p>
                        <h3 className="font-heading text-xl sm:text-2xl text-primary leading-tight">
                          {item.tagline}
                        </h3>
                      </div>

                      {/* Description */}
                      <p className="font-paragraph text-sm text-secondary-text leading-relaxed pt-1">
                        {item.description}
                      </p>

                      {/* Small label */}
                      <div className="pt-3 border-t border-warm-sand-beige/20">
                        <p className="font-paragraph text-xs text-secondary-text font-medium tracking-wide">
                          {item.label}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
            
            {/* Scroll Indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {[0, 1, 2, 3].map((idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentPhaseIndex(idx);
                    if (scrollContainerRef.current) {
                      const scrollAmount = scrollContainerRef.current.offsetWidth;
                      scrollContainerRef.current.scrollTo({
                        left: scrollAmount * idx,
                        behavior: 'smooth'
                      });
                    }
                  }}
                  className={`w-2 h-2 rounded-full transition ${
                    currentPhaseIndex === idx ? 'bg-primary' : 'bg-warm-sand-beige/40'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Desktop: Grid Layout */}
          <div className="hidden lg:grid grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16">
            {[
              {
                phase: 'Menstrual',
                tagline: 'Move & Rebuild',
                description: 'Lower the intensity. Focus on mobility, movement, recovery and rebuilding.',
                label: 'Listen · Recover · Rebuild',
                accentColor: 'from-rose-blush/40 to-rose-blush/10',
                borderColor: 'border-rose-blush/30',
                textAccent: 'text-red-700'
              },
              {
                phase: 'Follicular',
                tagline: 'Build & Ramp Up',
                description: 'Energy and motivation may rise. Build strength, increase training demand and create momentum.',
                label: 'Build · Progress · Strengthen',
                accentColor: 'from-emerald-green/40 to-emerald-green/10',
                borderColor: 'border-emerald-green/30',
                textAccent: 'text-emerald-green'
              },
              {
                phase: 'Ovulatory',
                tagline: 'Peak Performance',
                description: 'A potential window to push harder when you feel strong and recovered.',
                label: 'Challenge · Perform · Progress',
                accentColor: 'from-gold/40 to-gold/10',
                borderColor: 'border-gold/30',
                textAccent: 'text-gold'
              },
              {
                phase: 'Luteal',
                tagline: 'Taper & Recover',
                description: 'Deliberately reduce training volume and support recovery as your next period approaches.',
                label: 'Maintain · Recover · Reset',
                accentColor: 'from-warm-bronze/40 to-warm-bronze/10',
                borderColor: 'border-warm-bronze/30',
                textAccent: 'text-warm-bronze'
              }
            ].map((item, idx) => {
              const isMenustrual = idx === 0;
              return (
              <motion.div
                key={idx}
                {...fadeInUp}
                transition={{ ...fadeInUp.transition, delay: idx * 0.08 }}
                className={`relative overflow-hidden rounded-2xl transition-all duration-300 group p-8 sm:p-10 ${
                  isMenustrual 
                    ? 'border border-rose-blush/30 bg-warm-cream hover:bg-red-600 hover:border-red-600 hover:shadow-[0_0_30px_rgba(220,38,38,0.4)]'
                    : `border ${item.borderColor} bg-warm-cream hover:border-primary/20`
                }`}
              >
                {/* Gradient accent background - only for non-menstrual cards */}
                {!isMenustrual && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                )}
                
                {/* Content */}
                <div className={`relative z-10 space-y-4 ${isMenustrual ? 'group-hover:text-white transition-colors duration-300' : ''}`}>
                  {/* Phase name with accent */}
                  <div className="space-y-2 text-center">
                    <p className={`font-paragraph text-xs font-semibold uppercase tracking-wider ${isMenustrual ? 'group-hover:text-white/90' : item.textAccent} transition-colors duration-300`}>
                      {item.phase}
                    </p>
                    <h3 className={`font-heading text-2xl sm:text-3xl leading-tight ${isMenustrual ? 'text-primary group-hover:text-white' : 'text-primary'} transition-colors duration-300`}>
                      {item.tagline}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className={`font-paragraph text-base leading-relaxed pt-2 ${isMenustrual ? 'text-secondary-text group-hover:text-white/90' : 'text-secondary-text'} transition-colors duration-300`}>
                    {item.description}
                  </p>

                  {/* Small label */}
                  <div className={`pt-4 border-t ${isMenustrual ? 'border-white/20 group-hover:border-white/30' : 'border-warm-sand-beige/20'} transition-colors duration-300`}>
                    <p className={`font-paragraph text-xs font-medium tracking-wide ${isMenustrual ? 'text-secondary-text group-hover:text-white/80' : 'text-secondary-text'} transition-colors duration-300`}>
                      {item.label}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
            })}
          </div>

          {/* Cycle Unpredictable Section */}
          <motion.div
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.4 }}
            className="bg-white border border-warm-sand-beige/30 rounded-2xl p-6 sm:p-10 mb-8 sm:mb-12"
          >
            <div className="max-w-3xl mx-auto">
              <h3 className="font-heading text-xl sm:text-2xl text-primary mb-3">
                Cycle unpredictable?
              </h3>
              <p className="font-paragraph text-sm sm:text-base text-secondary-text leading-relaxed">
                That's okay. Perimenopause, irregular cycles and changing symptoms don't disqualify you. Your body feedback becomes part of the plan.
              </p>
            </div>
          </motion.div>

          {/* Important Note */}
          <motion.div
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.5 }}
            className="bg-warm-sand-beige/10 border border-warm-sand-beige/30 rounded-xl p-5 sm:p-7 mb-8 sm:mb-12"
          >
            <p className="font-paragraph text-xs sm:text-sm text-secondary-text leading-relaxed italic text-center">
              <span className="font-semibold text-primary-text">These phases are a framework, not a guarantee.</span> We use language like "may", "typically", and "when you feel ready" because every body is different. For many women, these patterns show up. For others, they don't. Your symptoms and energy levels are what matter most.
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.6 }}
            className="text-center"
          >
            <button className="inline-flex items-center gap-2 font-paragraph font-semibold text-primary hover:text-primary/80 transition text-lg group">
              See how cycle-responsive training works
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </motion.div>
        </div>
      </section>
      {/* Train. Recover. Fuel. Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-[100rem] mx-auto">
          {/* Headline and Supporting Text */}
          <motion.div {...fadeInUp} className="text-center mb-12 sm:mb-20">
            <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl leading-tight mb-6 bg-gradient-to-r from-[#6b8a6b] to-[#a87878] bg-clip-text text-transparent">Move. Fuel. Recover</h2>
            <p className="text-lg sm:text-xl text-secondary-text max-w-3xl mx-auto leading-relaxed font-helvetica-neue-bold">
              Your training doesn't happen in isolation. We help you understand how movement, recovery and nutrition can work together.
            </p>
          </motion.div>

          {/* Four Phase Examples */}
          <motion.div
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.3 }}
            className="mb-12 sm:mb-16"
          >
            <h3 className="font-heading text-3xl sm:text-4xl text-primary text-center mb-8 sm:mb-12 font-bold">
              Nutrition Through Your Cycle
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {[
                {
                  phase: 'MENSTRUAL',
                  tagline: 'Rebuild + nourish',
                  description: 'Focus on nutrient-dense, protein-anchored meals and iron-rich foods.',
                  accentColor: 'from-rose-blush/40 to-rose-blush/10',
                  borderColor: 'border-rose-blush/30',
                  textAccent: 'text-rose-blush'
                },
                {
                  phase: 'FOLLICULAR',
                  tagline: 'Fuel the build',
                  description: 'Support increasing training demand with balanced meals and complex carbohydrates.',
                  accentColor: 'from-emerald-green/40 to-emerald-green/10',
                  borderColor: 'border-emerald-green/30',
                  textAccent: 'text-emerald-green'
                },
                {
                  phase: 'OVULATORY',
                  tagline: 'Support performance',
                  description: 'Prioritise hydration and nutrient-dense recovery foods.',
                  accentColor: 'from-gold/40 to-gold/10',
                  borderColor: 'border-gold/30',
                  textAccent: 'text-gold'
                },
                {
                  phase: 'LUTEAL',
                  tagline: 'Support recovery',
                  description: 'Focus on protein, fibre, balanced meals and magnesium-rich foods.',
                  accentColor: 'from-warm-bronze/40 to-warm-bronze/10',
                  borderColor: 'border-warm-bronze/30',
                  textAccent: 'text-warm-bronze'
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  {...fadeInUp}
                  transition={{ ...fadeInUp.transition, delay: 0.4 + idx * 0.08 }}
                  className={`relative overflow-hidden rounded-2xl border border-black bg-white p-6 sm:p-8 hover:border-primary/20 transition-all duration-300 group`}
                >
                  {/* Gradient accent background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  
                  {/* Content */}
                  <div className="relative z-10 space-y-3">
                    {/* Phase name with accent */}
                    <p className={`font-paragraph text-xs font-semibold uppercase tracking-wider text-black text-center`}>
                      {item.phase}
                    </p>
                    
                    {/* Tagline */}
                    <h4 className="font-heading text-xl sm:text-2xl text-primary leading-tight group-hover:text-red-600 transition-colors duration-300 text-center">
                      {item.tagline}
                    </h4>

                    {/* Description */}
                    <p className="font-paragraph text-sm sm:text-base text-secondary-text leading-relaxed text-center">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Disclaimer */}
          <motion.div
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.6 }}
            className="bg-warm-sand-beige/10 border border-warm-sand-beige/30 rounded-xl p-6 sm:p-8 max-w-3xl mx-auto"
          >
            <p className="font-paragraph text-sm sm:text-base text-secondary-text leading-relaxed text-center italic">
              <span className="font-semibold text-primary-text">Nutrition guidance is educational and personalised to your circumstances;</span> it does not replace medical or dietetic care.
            </p>
          </motion.div>
        </div>
      </section>
      {/* How It Works - Premium Editorial Layout */}
      {/* Training + Nutrition */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-warm-sand-beige">
        <div className="max-w-[100rem] mx-auto">
          {/* Training Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center mb-20 sm:mb-32">
            {/* Training Image */}
            <motion.div
              {...fadeInUp}
              className="order-2 lg:order-1"
            >
              <div className="rounded-2xl overflow-hidden bg-warm-sand-beige aspect-square shadow-md">
                <Image
                  src="https://static.wixstatic.com/media/93e866_3d4b88c1dc7b4a49a1cf59c257066084~mv2.png"
                  alt="Strength training - Built for your body"
                  width={500}
                  height={500}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            {/* Training Content */}
            <motion.div
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.1 }}
              className="order-1 lg:order-2"
            >
              <div className="space-y-6">
                <div>
                  <p className="font-paragraph text-sm uppercase tracking-widest text-primary mb-3">Strength Training</p>
                  <h2 className="font-heading text-4xl sm:text-5xl text-primary leading-tight mb-4">
                    Built for your body
                  </h2>
                  <p className="font-paragraph text-lg text-secondary-text leading-relaxed">
                    Strength-focused programming designed specifically for women, with cycle-synced intensity and progressive overload built in.
                  </p>
                </div>

                <ul className="space-y-3 pt-4">
                  <li className="flex gap-3 items-start">
                    <span className="text-primary text-xl leading-none mt-1">✓</span>
                    <span className="font-paragraph text-secondary-text">Strength-focused programming</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-primary text-xl leading-none mt-1">✓</span>
                    <span className="font-paragraph text-secondary-text">Cycle-synced intensity and volume</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-primary text-xl leading-none mt-1">✓</span>
                    <span className="font-paragraph text-secondary-text">Progressive overload built in</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-primary text-xl leading-none mt-1">✓</span>
                    <span className="font-paragraph text-secondary-text">Recovery weeks planned</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-primary text-xl leading-none mt-1">✓</span>
                    <span className="font-paragraph text-secondary-text">Adjustable based on your feedback</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Nutrition Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Nutrition Content */}
            <motion.div
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.2 }}
            >
              <div className="space-y-6">
                <div>
                  <p className="font-paragraph text-sm uppercase tracking-widest text-primary mb-3">Nutrition Guidance</p>
                  <h2 className="font-heading text-4xl sm:text-5xl text-primary leading-tight mb-4">
                    Fuel your performance
                  </h2>
                  <p className="font-paragraph text-lg text-secondary-text leading-relaxed">Personalised nutrition guidance from a Level 4 qualified coach, designed to support your goals.</p>
                </div>

                <ul className="space-y-3 pt-4">
                  <li className="flex gap-3 items-start">
                    <span className="text-primary text-xl leading-none mt-1">✓</span>
                    <span className="font-paragraph text-secondary-text">Level 4 qualified nutrition coach</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-primary text-xl leading-none mt-1">✓</span>
                    <span className="font-paragraph text-secondary-text">Personalised to your goals and preferences</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-primary text-xl leading-none mt-1">✓</span>
                    <span className="font-paragraph text-secondary-text">Cycle-responsive nutrition strategies</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-primary text-xl leading-none mt-1">✓</span>
                    <span className="font-paragraph text-secondary-text">No restrictive dieting</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-primary text-xl leading-none mt-1">✓</span>
                    <span className="font-paragraph text-secondary-text">Sustainable, real-world approach</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Nutrition Image */}
            <motion.div
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.3 }}
            >
              <div className="rounded-2xl overflow-hidden bg-warm-sand-beige aspect-square shadow-md">
                <Image
                  src="https://static.wixstatic.com/media/93e866_e10338cb6ee9437cb6af87daeec16f0b~mv2.png?originWidth=448&originHeight=448"
                  alt="Healthy nutrition - Balanced meal planning"
                  width={500}
                  height={500}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Premium Founder/Coach Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-[100rem] mx-auto">
          {/* Headline */}
          <motion.div {...fadeInUp} className="text-center mb-12 sm:mb-16">
            <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl text-primary leading-tight">
              There's a real person<br />behind your programme.
            </h2>
          </motion.div>

          {/* Main Content - Desktop: Side by Side, Mobile: Stacked */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center mb-12 sm:mb-16">
            {/* Left: Coach Portrait */}
            <motion.div
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.1 }}
              className="order-2 lg:order-1"
            >
              <div className="rounded-3xl overflow-hidden bg-warm-sand-beige/30 aspect-square shadow-lg">
                <Image
                  src="https://static.wixstatic.com/media/93e866_76f00dd13fe8436fafb689ddae881504~mv2.png"
                  alt="Women's Health Coach - Professional portrait"
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            {/* Right: Coach Story & Credentials */}
            <motion.div
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.2 }}
              className="order-1 lg:order-2 space-y-8"
            >
              {/* Credentials */}
              <div className="space-y-2">
                <p className="font-paragraph text-sm font-semibold uppercase tracking-wider text-primary">
                  Your Coach
                </p>
                <h3 className="font-heading text-3xl sm:text-4xl text-primary leading-tight">
                  Women's Health Coach
                </h3>
                <p className="font-paragraph text-lg text-secondary-text">
                  Level 4 Qualified<br />
                  Additional training in nutrition and menopause fitness
                </p>
              </div>

              {/* Personal Story */}
              <div className="space-y-4 border-l-4 border-primary pl-6">
                <p className="font-paragraph text-lg text-secondary-text leading-relaxed">
                  I built this approach because I know what it feels like when your body starts behaving differently and the usual fitness advice stops making sense.
                </p>
                <p className="font-paragraph text-lg text-secondary-text leading-relaxed">
                  My own experience with women's health symptoms led me to look beyond generic training plans and build an approach that listens to the woman, not just the calendar.
                </p>
              </div>

              {/* Core Philosophy */}
              <div className="bg-primary/5 rounded-2xl p-6 sm:p-8 border border-primary/10">
                <p className="font-heading text-2xl sm:text-3xl text-primary leading-tight mb-4">
                  My role isn't to tell you that your body should behave a certain way.
                </p>
                <p className="font-paragraph text-lg text-secondary-text leading-relaxed">
                  It's to help you understand it, train it, fuel it and become stronger in it.
                </p>
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                <button className="inline-flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-full font-paragraph font-semibold hover:bg-primary/90 transition text-lg group">
                  Meet Your Coach
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Social Proof - Testimonials with Side Scroll */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-[100rem] mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-12 sm:mb-16">
            <h2 className="font-heading text-4xl sm:text-5xl text-primary mb-4">What Women Are Saying</h2>
          </motion.div>

          {/* Mobile/Tablet: Swipeable Carousel */}
          <div className="lg:hidden">
            <div className="relative h-full overflow-hidden rounded-2xl mb-8">
              <AnimatePresence initial={false} custom={testimonialDirection} mode="wait">
                <motion.div
                  key={currentTestimonialIndex}
                  custom={testimonialDirection}
                  variants={{
                    enter: (direction: number) => ({
                      x: direction > 0 ? 1000 : -1000,
                      opacity: 0,
                    }),
                    center: {
                      zIndex: 1,
                      x: 0,
                      opacity: 1,
                    },
                    exit: (direction: number) => ({
                      zIndex: 0,
                      x: direction < 0 ? 1000 : -1000,
                      opacity: 0,
                    }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.5 },
                  }}
                  drag="x"
                  dragElastic={1}
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipe = Math.abs(offset.x) * velocity.x;
                    if (swipe < -10000) {
                      testimonialPaginate(1);
                    } else if (swipe > 10000) {
                      testimonialPaginate(-1);
                    }
                  }}
                  className="w-full"
                >
                  {/* Testimonial Card */}
                  <div className="group relative">
                    <div className="h-full rounded-2xl p-8 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 backdrop-blur-sm bg-white border-warm-cream hover:border-warm-bronze/60">
                      {/* Decorative star background */}
                      <div className="absolute top-6 right-6 opacity-10 transition-opacity group-hover:opacity-20 text-rose-blush">
                        <Star size={40} fill="currentColor" />
                      </div>

                      <div className="flex flex-col h-full justify-between relative z-10">
                        {/* Star Rating */}
                        <motion.div
                          className="flex gap-2 mb-6 h-8"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                        >
                          {[...Array(5)].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
                            >
                              <Star
                                size={24}
                                className="font-bold text-charcoal-black"
                                fill="currentColor"
                                strokeWidth={1.5}
                              />
                            </motion.div>
                          ))}
                        </motion.div>

                        {/* Testimonial Text */}
                        <motion.p
                          className="leading-relaxed mb-8 font-light text-lg text-charcoal-black"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          "{testimonials[currentTestimonialIndex].quote}"
                        </motion.p>

                        {/* Client Info */}
                        <motion.div
                          className="flex items-center gap-4 pt-6 border-t border-rose-blush/30"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                        >
                          <motion.div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border-2 bg-rose-blush/30 text-charcoal-black border-rose-blush/40"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                          >
                            {testimonials[currentTestimonialIndex].author.charAt(0)}
                          </motion.div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm md:text-base text-charcoal-black">
                              {testimonials[currentTestimonialIndex].author}
                            </h4>
                            <p className="text-xs md:text-sm text-charcoal-black/60">
                              {testimonials[currentTestimonialIndex].detail}
                            </p>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => testimonialPaginate(-1)}
                className="p-3 rounded-full bg-primary text-white hover:bg-warm-bronze transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={24} />
              </motion.button>

              {/* Dot Indicators */}
              <div className="flex gap-2 justify-center flex-1">
                {testimonials.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => {
                      setTestimonialDirection(index > currentTestimonialIndex ? 1 : -1);
                      setCurrentTestimonialIndex(index);
                      setTestimonialAutoPlay(false);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      index === currentTestimonialIndex ? 'w-8' : 'w-2'
                    }`}
                    style={{
                      backgroundColor: index === currentTestimonialIndex ? '#58355E' : '#D4C5C9'
                    }}
                    whileHover={{ scale: 1.2 }}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => testimonialPaginate(1)}
                className="p-3 rounded-full bg-primary text-white hover:bg-warm-bronze transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight size={24} />
              </motion.button>
            </div>
          </div>

          {/* Desktop Grid Layout */}
          <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((item, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                transition={{ ...fadeInUp.transition, delay: (idx % 3) * 0.1 }}
                className="group relative"
              >
                <div className="h-full rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 backdrop-blur-sm bg-white border-warm-cream hover:border-warm-bronze/60">
                  {/* Decorative star background */}
                  <div className="absolute top-6 right-6 opacity-10 transition-opacity group-hover:opacity-20 text-rose-blush">
                    <Star size={40} fill="currentColor" />
                  </div>

                  <div className="flex flex-col h-full justify-between relative z-10">
                    {/* Star Rating */}
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
                    <p className="leading-relaxed mb-8 font-light text-lg text-charcoal-black">
                      "{item.quote}"
                    </p>

                    {/* Client Info */}
                    <div className="flex items-center gap-4 pt-6 border-t border-rose-blush/30">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border-2 bg-rose-blush/30 text-charcoal-black border-rose-blush/40">
                        {item.author.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm md:text-base text-charcoal-black">
                          {item.author}
                        </h4>
                        <p className="text-xs md:text-sm text-charcoal-black/60">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Pricing Section */}
      <PricingSection />
      {/* FAQ */}
      <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-off-white">
        <div className="max-w-[100rem] mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-12 sm:mb-16">
            <h2 className="font-heading text-4xl sm:text-5xl text-primary mb-4">Questions before you start?</h2>
            <p className="font-paragraph text-lg text-secondary-text max-w-2xl mx-auto">
              We've answered the most common questions to help you feel confident about your decision.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: 'Do I need gym equipment?',
                a: 'Most sessions use basic equipment like dumbbells and resistance bands. We can modify everything for home or gym. We\'ll discuss your setup during your free chat so we can tailor the programme to what you have available.'
              },
              {
                q: 'How long are the workouts?',
                a: 'Three coached sessions per week, typically 45-60 minutes each. That\'s it. No extra "homework" workouts. We focus on quality strength training that actually moves the needle.'
              },
              {
                q: 'How many sessions do I do each week?',
                a: 'Three coached sessions per week. Each one is designed, coached, and adjustable. We prioritise consistency and sustainability over volume.'
              },
              {
                q: 'What if my cycle is irregular?',
                a: 'That\'s completely okay. We focus on your symptoms and energy levels instead of calendar dates. Irregular cycles don\'t disqualify you—your body feedback becomes part of the plan.'
              },
              {
                q: 'Can I use the programme during perimenopause?',
                a: 'Yes. This is exactly when cycle-synced training becomes even more valuable. Your body is changing. We help you adapt your training to manage symptoms, maintain bone health, and stay strong.'
              },
              {
                q: 'Is this suitable for postpartum women?',
                a: 'Yes. We have specific postpartum programming that respects your recovery, addresses pelvic floor health, and gradually rebuilds strength. We work with you, not against your body. Please discuss your timeline with your coach.'
              },
              {
                q: 'Can I message my coach?',
                a: 'Yes. Direct coach communication is part of the programme. Message anytime with questions, form checks, or adjustments. You\'re not training alone.'
              },
              {
                q: 'Is nutrition included?',
                a: 'Yes. You get Level 4 nutrition guidance integrated with your training plan. It\'s personalised, cycle-responsive, and designed to support your goals—not restrictive.'
              },
              {
                q: 'What happens if I miss a session?',
                a: 'Life happens. Your coach will help you catch up or adjust your plan. Missing one session doesn\'t derail your progress. We focus on consistency over perfection.'
              },
              {
                q: 'Do I need to be fit before I start?',
                a: 'No. We work with all fitness levels. Your coach will assess where you are and build from there. Strength training is for everyone, regardless of starting point.'
              },
              {
                q: 'Is this medical advice?',
                a: 'No. We provide training and nutrition guidance, not medical advice. If you have specific health concerns or medical conditions, please discuss them with your coach and healthcare provider. We\'ll work within any limitations you have.'
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                transition={{ ...fadeInUp.transition, delay: (idx % 6) * 0.05 }}
                className="bg-white rounded-2xl border border-warm-sand-beige/30 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className={`w-full px-8 py-6 flex justify-between items-center transition ${
                    expandedFaq === idx ? 'bg-secondary' : 'hover:bg-secondary'
                  }`}
                >
                  <h3 className="font-paragraph font-semibold text-primary-text text-left">{item.q}</h3>
                  <ChevronDown
                    className={`w-5 h-5 text-primary flex-shrink-0 transition-transform ${
                      expandedFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedFaq === idx && (
                  <div className="px-8 pb-6 border-t border-warm-sand-beige/30">
                    <p className="font-paragraph text-secondary-text leading-relaxed">{item.a}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Premium Final CTA Section - Deep Burgundy */}
      {/* Final CTA */}
      {/* Footer */}
      {/* Sticky Mobile CTA - Premium Mobile App Experience */}
      <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-white border-t border-warm-sand-beige/30 p-3 z-40 space-y-2">
        <button className="w-full bg-primary text-white px-6 py-3 rounded-full font-paragraph font-semibold hover:bg-primary/90 transition text-sm h-11 flex items-center justify-center">
          Start Your Training Journey
        </button>
        <button
          onClick={() => setShowChatModal(true)}
          className="w-full text-primary font-paragraph font-semibold text-xs hover:text-primary/80 transition"
        >
          Book a Free Chat
        </button>
      </div>
      {/* Spacer for sticky CTA */}
      <div className="sm:hidden h-28" />
      {/* Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full"
          >
            <h3 className="font-heading text-2xl text-primary mb-4">Book a Free Chat</h3>
            <p className="font-paragraph text-secondary-text mb-6">
              Let's talk about your goals and how we can help you train with your body.
            </p>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Your name"
                className="w-full px-4 py-3 border border-warm-sand-beige/30 rounded-lg font-paragraph focus:outline-none focus:border-primary"
              />
              <input
                type="email"
                placeholder="Your email"
                className="w-full px-4 py-3 border border-warm-sand-beige/30 rounded-lg font-paragraph focus:outline-none focus:border-primary"
              />
              <textarea
                placeholder="Tell us a bit about yourself"
                rows={3}
                className="w-full px-4 py-3 border border-warm-sand-beige/30 rounded-lg font-paragraph focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="w-full bg-primary text-white px-6 py-3 rounded-full font-paragraph font-semibold hover:bg-primary/90 transition"
              >
                Book My Free Chat
              </button>
            </form>
            <button
              onClick={() => setShowChatModal(false)}
              className="mt-4 w-full text-secondary-text font-paragraph hover:text-primary-text transition"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
