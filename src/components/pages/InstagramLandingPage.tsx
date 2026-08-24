import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Check, MessageCircle, Calendar, Zap, Heart, Dumbbell, Users, TrendingUp, Clock, Flame, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function InstagramLandingPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="min-h-screen bg-soft-white">
      {/* Navigation - Mobile Optimized */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-soft-white/98 backdrop-blur-sm border-b border-warm-sand-beige/20">
        <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
          <div className="font-heading text-xl sm:text-2xl text-primary font-semibold">Cycle Synced</div>
          <div className="hidden sm:flex gap-8 text-sm font-paragraph text-primary-text">
            <a href="#faq" className="hover:text-primary transition">FAQ</a>
          </div>
        </div>
      </nav>
      {/* Hero Section - Mobile First */}
      <section className="pt-20 pb-8 sm:pt-32 sm:pb-20 px-4 sm:px-6 lg:px-8 bg-warm-cream">
        <div className="max-w-[100rem] mx-auto">
          {/* Mobile Layout - Stacked Vertically */}
          <div className="lg:hidden space-y-6 flex flex-col">
            {/* Headline - IMMEDIATELY VISIBLE */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="font-heading text-4xl sm:text-5xl text-primary leading-tight mb-2">
                Train in sync.
              </h1>
              <p className="font-paragraph text-lg sm:text-xl text-primary italic font-light mb-4">
                Feel your strongest.
              </p>
              <p className="font-paragraph text-sm sm:text-base text-secondary-text leading-relaxed">
                A woman's training and nutrition program that adapts to your cycle, your symptoms and your stage of life.
              </p>
            </motion.div>

            {/* Features with Icons - Compact */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-3 bg-white rounded-2xl p-4 border border-warm-sand-beige/30"
            >
              {[
                { icon: '🏋️', title: '3 Coached Sessions', desc: 'Every week' },
                { icon: '👥', title: 'Coach Access', desc: 'Direct messaging' },
                { icon: '🥗', title: 'Cycle-Synced Nutrition', desc: 'Personalized guidance' }
              ].map((feature, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="text-2xl flex-shrink-0">{feature.icon}</div>
                  <div className="flex-1">
                    <p className="font-paragraph font-semibold text-sm text-primary-text">{feature.title}</p>
                    <p className="font-paragraph text-xs text-secondary-text">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Primary CTA - FULL WIDTH, 44px+ */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="pt-2"
            >
              <button className="w-full bg-primary text-white px-6 py-3.5 rounded-full font-paragraph font-semibold hover:bg-primary/90 transition text-sm sm:text-base h-11 sm:h-12 flex items-center justify-center">
                Start Your Journey
              </button>
            </motion.div>

            {/* Secondary CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <button
                onClick={() => setShowChatModal(true)}
                className="w-full border-2 border-primary text-primary px-6 py-3 rounded-full font-paragraph font-semibold hover:bg-primary/5 transition text-sm sm:text-base h-11 flex items-center justify-center"
              >
                Book a Free Chat
              </button>
            </motion.div>

            {/* Mobile App Mockup - LARGE & READABLE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="pt-2"
            >
              <div className="mx-auto w-72 h-auto">
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden border-8 border-gray-900">
                  {/* Phone Status Bar */}
                  <div className="bg-gray-900 text-white px-4 py-2 text-xs flex justify-between items-center">
                    <span>9:41</span>
                    <div className="flex gap-1">
                      <span>📶</span>
                      <span>🔋</span>
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="bg-gradient-to-b from-primary/10 to-white p-4 space-y-4">
                    {/* Cycle Phase */}
                    <div className="bg-white rounded-2xl p-4 border border-warm-sand-beige/30">
                      <p className="font-paragraph text-xs text-secondary-text mb-1">Today's Phase</p>
                      <p className="font-heading text-lg text-primary">Ovulation</p>
                      <p className="font-paragraph text-xs text-secondary-text">Peak energy day</p>
                    </div>

                    {/* Today's Workout */}
                    <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
                      <p className="font-paragraph text-xs text-secondary-text mb-2">Today's Workout</p>
                      <p className="font-heading text-base text-primary mb-1">Strength: Lower Body</p>
                      <p className="font-paragraph text-xs text-secondary-text">45 minutes</p>
                    </div>

                    {/* Check-in */}
                    <div className="bg-white rounded-2xl p-4 border border-warm-sand-beige/30">
                      <p className="font-paragraph text-xs text-secondary-text mb-2">How are you feeling?</p>
                      <div className="flex gap-2 justify-between">
                        {['😴', '😐', '💪'].map((emoji, idx) => (
                          <button key={idx} className="flex-1 py-2 rounded-lg hover:bg-warm-sand-beige/20 transition text-lg">
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Coach Message */}
                    <div className="bg-primary/10 rounded-2xl p-3 border-l-4 border-primary">
                      <p className="font-paragraph text-xs text-secondary-text mb-1">Coach Message</p>
                      <p className="font-paragraph text-xs text-primary-text leading-relaxed">
                        "Great energy today! Push hard on these lifts. 💪"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Desktop Layout - Asymmetrical with Image Right */}
          <div className="hidden lg:grid grid-cols-3 gap-8 items-start">
            {/* Left: Content (2 columns) */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="col-span-2 space-y-8"
            >
              {/* Headline with Badge */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <h1 className="font-heading text-6xl xl:text-7xl text-primary leading-tight">
                    Train in sync.
                  </h1>
                  <div className="w-20 h-20 rounded-full border-4 border-primary/20 flex items-center justify-center flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-2xl">
                      🔄
                    </div>
                  </div>
                </div>
                <p className="font-paragraph text-2xl text-primary italic font-light">
                  Feel your strongest.
                </p>
                <p className="font-paragraph text-lg text-secondary-text leading-relaxed max-w-lg">
                  A woman's training and nutrition program that adapts to your cycle, your symptoms and your stage of life.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 gap-4">
                {[
                  { icon: '🏋️', title: "3 Personalised online program Sessions per a week", desc: 'Every week, tailored to your cycle' },
                  { icon: '👥', title: "Coach Access via a dedicated app", desc: 'Direct messaging and form checks' },
                  { icon: '🥗', title: "Cycle-Synced Nutrition guidance", desc: "Personalised guidance for every phase" }
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 + idx * 0.05 }}
                    className="flex gap-4 items-start bg-white rounded-xl p-4 border border-warm-sand-beige/30"
                  >
                    <div className="text-3xl flex-shrink-0">{feature.icon}</div>
                    <div className="flex-1">
                      <p className="font-paragraph font-semibold text-base text-primary-text">{feature.title}</p>
                      <p className="font-paragraph text-sm text-secondary-text">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="flex gap-4 pt-4"
              >
                <button className="bg-primary text-white px-8 py-4 rounded-full font-paragraph font-semibold hover:bg-primary/90 transition text-lg">
                  Start Your Journey
                </button>
                <button
                  onClick={() => setShowChatModal(true)}
                  className="border-2 border-primary text-primary px-8 py-4 rounded-full font-paragraph font-semibold hover:bg-primary/5 transition text-lg"
                >
                  Book a Free Chat
                </button>
              </motion.div>
            </motion.div>

            {/* Right: Hero Image + Side Card (1 column) */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative space-y-4"
            >
              {/* Hero Image */}
              <div className="rounded-2xl overflow-hidden bg-warm-sand-beige/30 aspect-square">
                <Image
                  src="https://static.wixstatic.com/media/93e866_95263f3d8ac746e1a81e9e9674336a9c~mv2.png?originWidth=1152&originHeight=640"
                  alt="Strong woman training with confidence"
                  width={400}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Side Info Card */}
              <div className="bg-white rounded-2xl p-5 border border-warm-sand-beige/30 space-y-4">
                <div className="space-y-2">
                  <p className="font-paragraph text-xs uppercase tracking-wider text-primary font-semibold">Follicle Phase</p>
                  <p className="font-heading text-lg text-primary">Cycle Synced</p>
                  <p className="font-paragraph text-sm text-secondary-text">Your body. Your strength.</p>
                </div>
                
                {/* Cycle Indicators */}
                <div className="space-y-3 pt-2">
                  {[
                    { label: 'Energy', value: 85 },
                    { label: 'Strength', value: 90 },
                    { label: 'Recovery', value: 70 }
                  ].map((indicator, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="font-paragraph text-xs text-secondary-text">{indicator.label}</p>
                        <p className="font-paragraph text-xs font-semibold text-primary">{indicator.value}%</p>
                      </div>
                      <div className="w-full bg-warm-sand-beige/20 rounded-full h-2">
                        <div 
                          className="bg-primary rounded-full h-2 transition-all" 
                          style={{ width: `${indicator.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* SECTION 2: Why This Is Different - Problem/Solution */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 lg:px-8 bg-soft-white">
        <div className="max-w-[100rem] mx-auto">
          {/* Headline - Left Aligned */}
          <motion.div {...fadeInUp} className="mb-12 sm:mb-16 max-w-2xl">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {/* Left Column - Traditional */}
            <motion.div
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.1 }}
              className="bg-white p-6 sm:p-8 rounded-2xl border border-warm-sand-beige/30"
            >
              <div className="mb-6 sm:mb-8">
                <p className="font-paragraph text-xs uppercase tracking-wider text-secondary-text font-semibold mb-2">Traditional Approach</p>
                <h3 className="font-heading text-lg sm:text-xl text-primary">
                  Fixed programming
                </h3>
              </div>
              <ul className="space-y-4">
                {[
                  'Fixed programme',
                  'Same intensity every week',
                  'Workout-first approach',
                  'Limited personal support',
                  'One-size-fits-all progression'
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3 items-start">
                    <div className="flex-shrink-0 mt-1 w-5 h-5 rounded-full border-2 border-warm-sand-beige/40 flex items-center justify-center flex-shrink-0">
                      <span className="text-warm-sand-beige text-xs">−</span>
                    </div>
                    <span className="font-paragraph text-sm sm:text-base text-secondary-text">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Right Column - This Approach (Stronger Visual) */}
            <motion.div
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.2 }}
              className="relative"
            >
              {/* Accent background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-warm-sand-beige/10 rounded-2xl" />
              
              {/* Content */}
              <div className="relative bg-white/80 backdrop-blur-sm p-8 sm:p-10 rounded-2xl border-2 border-primary/20">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
                
                <h3 className="font-heading text-2xl sm:text-3xl text-primary mb-8 relative z-10">
                  This approach
                </h3>
                
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
      <section className="py-12 sm:py-24 px-4 sm:px-6 lg:px-8 bg-soft-white">
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
                  textAccent: 'text-rose-blush'
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
                    className={`relative overflow-hidden rounded-2xl border ${item.borderColor} bg-white p-6 h-full`}
                  >
                    {/* Gradient accent background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.accentColor}`} />
                    
                    {/* Content */}
                    <div className="relative z-10 space-y-3">
                      {/* Phase name with accent */}
                      <div className="space-y-1">
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
                textAccent: 'text-rose-blush'
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
              <motion.div
                key={idx}
                {...fadeInUp}
                transition={{ ...fadeInUp.transition, delay: idx * 0.08 }}
                className={`relative overflow-hidden rounded-2xl border ${item.borderColor} bg-white p-8 sm:p-10 hover:border-primary/20 transition-all duration-300 group`}
              >
                {/* Gradient accent background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative z-10 space-y-4">
                  {/* Phase name with accent */}
                  <div className="space-y-2">
                    <p className={`font-paragraph text-xs font-semibold uppercase tracking-wider ${item.textAccent}`}>
                      {item.phase}
                    </p>
                    <h3 className="font-heading text-2xl sm:text-3xl text-primary leading-tight">
                      {item.tagline}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="font-paragraph text-base text-secondary-text leading-relaxed pt-2">
                    {item.description}
                  </p>

                  {/* Small label */}
                  <div className="pt-4 border-t border-warm-sand-beige/20">
                    <p className="font-paragraph text-xs text-secondary-text font-medium tracking-wide">
                      {item.label}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
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
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-soft-white">
        <div className="max-w-[100rem] mx-auto">
          {/* Headline and Supporting Text */}
          <motion.div {...fadeInUp} className="text-center mb-12 sm:mb-20">
            <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl text-primary leading-tight mb-6">
              Train. Recover. Fuel.
            </h2>
            <p className="font-paragraph text-lg sm:text-xl text-secondary-text max-w-3xl mx-auto leading-relaxed">
              Your training doesn't happen in isolation. We help you understand how movement, recovery and nutrition can work together.
            </p>
          </motion.div>

          {/* Three-Part Flow */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-20">
            {[
              {
                title: 'TRAIN',
                items: ['Strength', 'Mobility', 'Conditioning', 'Progression'],
                accentColor: 'from-primary/10 to-primary/5',
                borderColor: 'border-primary/20',
                textColor: 'text-primary'
              },
              {
                title: 'RECOVER',
                items: ['Sleep', 'Stress', 'Symptoms', 'Recovery'],
                accentColor: 'from-emerald-green/10 to-emerald-green/5',
                borderColor: 'border-emerald-green/20',
                textColor: 'text-emerald-green'
              },
              {
                title: 'FUEL',
                items: ['Protein', 'Fibre', 'Energy', 'Nutrients'],
                accentColor: 'from-gold/10 to-gold/5',
                borderColor: 'border-gold/20',
                textColor: 'text-gold'
              }
            ].map((section, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                transition={{ ...fadeInUp.transition, delay: idx * 0.1 }}
                className={`relative overflow-hidden rounded-2xl border ${section.borderColor} bg-white p-8 sm:p-10 hover:border-primary/30 transition-all duration-300`}
              >
                {/* Gradient accent background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${section.accentColor} opacity-0 hover:opacity-100 transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative z-10 space-y-6">
                  {/* Title */}
                  <h3 className={`font-heading text-3xl sm:text-4xl ${section.textColor} leading-tight`}>
                    {section.title}
                  </h3>

                  {/* Items List */}
                  <ul className="space-y-3">
                    {section.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex gap-3 items-start">
                        <div className={`flex-shrink-0 mt-1 w-5 h-5 rounded-full ${section.textColor} bg-current opacity-20 flex items-center justify-center`} />
                        <span className="font-paragraph text-base text-primary-text">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Four Phase Examples */}
          <motion.div
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.3 }}
            className="mb-12 sm:mb-16"
          >
            <h3 className="font-heading text-3xl sm:text-4xl text-primary text-center mb-8 sm:mb-12">
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
                  className={`relative overflow-hidden rounded-2xl border ${item.borderColor} bg-white p-6 sm:p-8 hover:border-primary/20 transition-all duration-300 group`}
                >
                  {/* Gradient accent background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  
                  {/* Content */}
                  <div className="relative z-10 space-y-3">
                    {/* Phase name with accent */}
                    <p className={`font-paragraph text-xs font-semibold uppercase tracking-wider ${item.textAccent}`}>
                      {item.phase}
                    </p>
                    
                    {/* Tagline */}
                    <h4 className="font-heading text-xl sm:text-2xl text-primary leading-tight">
                      {item.tagline}
                    </h4>

                    {/* Description */}
                    <p className="font-paragraph text-sm sm:text-base text-secondary-text leading-relaxed">
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
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-off-white">
        <div className="max-w-[100rem] mx-auto">
          <motion.div {...fadeInUp} className="mb-12 sm:mb-16">
            <div className="inline-block mb-4">
              <span className="font-paragraph text-xs sm:text-sm uppercase tracking-widest text-primary font-semibold">THE PROGRAM</span>
            </div>
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-primary mb-4 leading-tight">Everything you need.<br />All in one place.</h2>
            <p className="font-paragraph text-base sm:text-lg text-secondary-text max-w-2xl">
              A complete training and nutrition experience – built for women, by a woman who gets it.
            </p>
          </motion.div>

          {/* Features Grid - 2x3 Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 mb-12">
            {[
              {
                icon: Dumbbell,
                title: '3 Training Sessions',
                subtitle: 'Each Week',
                description: 'Personalized strength, conditioning, and mobility work tailored to your cycle phase and energy levels.'
              },
              {
                icon: MessageCircle,
                title: 'Direct Coach',
                subtitle: 'Support',
                description: 'Message anytime. Ask questions. Get form checks. Adjust your plan. Real support, not an algorithm.'
              },
              {
                icon: Calendar,
                title: 'Cycle-Synced',
                subtitle: 'Training',
                description: 'Workouts adapt to your cycle. Customize each phase for better results and how you feel.'
              },
              {
                icon: Heart,
                title: 'For Every Stage',
                subtitle: '',
                description: 'Pre & post partum, perimenopause, or simply want to understand your cycle better – we support you.'
              },
              {
                icon: Zap,
                title: 'Level 1 Nutrition',
                subtitle: 'Guidance',
                description: 'Simple, effective nutrition strategies that work for your body and your life.'
              },
              {
                icon: TrendingUp,
                title: 'All In One',
                subtitle: 'Platform',
                description: 'Workouts, tracking, recipes, check-ins and coaching – all in your pocket.'
              }
            ].map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={idx}
                  {...fadeInUp}
                  transition={{ ...fadeInUp.transition, delay: idx * 0.08 }}
                  className="flex flex-col"
                >
                  <div className="bg-white rounded-2xl p-8 sm:p-10 h-full flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300 border border-white/80">
                    <div className="mb-6">
                      <IconComponent className="w-10 h-10 text-primary" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading text-xl sm:text-2xl text-primary mb-2">
                        {item.title}
                      </h3>
                      {item.subtitle && (
                        <p className="font-paragraph text-sm text-secondary-text mb-4 font-medium">{item.subtitle}</p>
                      )}
                      <p className="font-paragraph text-sm sm:text-base text-secondary-text leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* CTA Button */}
          <motion.div
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.5 }}
            className="flex justify-start"
          >
            <button className="bg-primary text-white px-8 py-3 rounded-full font-paragraph font-semibold hover:bg-primary/90 transition text-sm sm:text-base h-11 sm:h-12 flex items-center justify-center">
              Explore the program
            </button>
          </motion.div>
        </div>
      </section>
      {/* Life-Stage Support */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-off-white">
        <div className="max-w-[100rem] mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-12 sm:mb-16">
            <h2 className="font-heading text-4xl sm:text-5xl text-primary mb-4">Support for Every Life Stage</h2>
            <p className="font-paragraph text-lg text-secondary-text max-w-2xl mx-auto">
              Whether you're navigating postpartum recovery, perimenopause, or simply want to understand your cycle better—we've got you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                title: 'Postpartum Recovery',
                description: 'Gentle, progressive strength training designed for postpartum bodies. We understand pelvic floor health, diastasis recti, and the unique challenges of training while managing a new baby.',
                icon: Heart
              },
              {
                title: 'Perimenopause',
                description: 'Your body is changing. Energy fluctuates. Sleep suffers. We adapt your training to manage symptoms and maintain strength through this transition.',
                icon: Zap
              },
              {
                title: 'Menopause',
                description: 'Strength training becomes even more important. We focus on bone health, metabolic support, and training that feels good in your changing body.',
                icon: Calendar
              }
            ].map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={idx}
                  {...fadeInUp}
                  transition={{ ...fadeInUp.transition, delay: idx * 0.1 }}
                  className="bg-white p-8 rounded-2xl border border-warm-sand-beige/30"
                >
                  <IconComponent className="w-12 h-12 text-primary mb-4" />
                  <h3 className="font-heading text-2xl text-primary mb-3">{item.title}</h3>
                  <p className="font-paragraph text-secondary-text">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
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
                  src="https://static.wixstatic.com/media/93e866_b05395a90da34d39bcad54830cf9d0aa~mv2.png?originWidth=448&originHeight=448"
                  alt="Strength training for women - Fitness program"
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
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-soft-white">
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

          {/* Direct Communication Statement */}
          <motion.div
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.3 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white border-2 border-primary/20 rounded-2xl p-8 sm:p-10 text-center">
              <p className="font-paragraph text-lg sm:text-xl text-primary-text leading-relaxed">
                <span className="font-semibold text-primary">Direct coach communication is part of the programme.</span>
                <br className="hidden sm:block" />
                <br className="hidden sm:block" />
                Message anytime. Ask questions. Get support. You're not training alone.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Social Proof */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-soft-white">
        <div className="max-w-[100rem] mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-12 sm:mb-16">
            <h2 className="font-heading text-4xl sm:text-5xl text-primary mb-4">What Women Are Saying</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
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
            ].map((item, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                transition={{ ...fadeInUp.transition, delay: (idx % 3) * 0.1 }}
                className="bg-white p-8 rounded-2xl border border-warm-sand-beige/30"
              >
                <p className="font-paragraph text-secondary-text mb-6 italic">"{item.quote}"</p>
                <div>
                  <p className="font-paragraph font-semibold text-primary-text">{item.author}</p>
                  <p className="font-paragraph text-sm text-secondary-text">{item.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
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
                  className="w-full px-8 py-6 flex justify-between items-center hover:bg-off-white transition"
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
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-primary text-white">
        <div className="max-w-[100rem] mx-auto text-center">
          <motion.div {...fadeInUp}>
            <h2 className="font-heading text-4xl sm:text-5xl mb-6">Ready to Train With Your Body?</h2>
            <p className="font-paragraph text-lg mb-8 max-w-2xl mx-auto opacity-95">
              Start your training journey today. Get stronger, feel better, and finally understand how your body works.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-primary px-8 py-4 rounded-full font-paragraph font-semibold hover:bg-off-white transition text-base sm:text-lg">
                Start Your Training Journey
              </button>
              <button
                onClick={() => setShowChatModal(true)}
                className="border-2 border-white text-white px-8 py-4 rounded-full font-paragraph font-semibold hover:bg-white/10 transition text-base sm:text-lg"
              >
                Book a Free Chat
              </button>
            </div>
          </motion.div>
        </div>
      </section>
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
