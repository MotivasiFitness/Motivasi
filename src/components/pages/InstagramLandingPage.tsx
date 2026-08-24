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
            <a href="#why-different" className="hover:text-primary transition">Why Different</a>
            <a href="#included" className="hover:text-primary transition">What's Included</a>
            <a href="#faq" className="hover:text-primary transition">FAQ</a>
          </div>
        </div>
      </nav>

      {/* Hero Section - Mobile First */}
      <section className="pt-20 pb-8 sm:pt-32 sm:pb-20 px-4 sm:px-6 lg:px-8 bg-warm-cream">
        <div className="max-w-[100rem] mx-auto">
          {/* Mobile Layout - Stacked Vertically */}
          <div className="lg:hidden space-y-6">
            {/* Headline - IMMEDIATELY VISIBLE */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="font-heading text-4xl sm:text-5xl text-primary leading-tight mb-3">
                Train with your body.<br />Not against it.
              </h1>
              <p className="font-paragraph text-sm sm:text-base text-secondary-text leading-relaxed">
                Personalised online training for women — built around your cycle, your symptoms and your stage of life.
              </p>
            </motion.div>

            {/* Benefits - Compact */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-2"
            >
              {[
                '3 personalised training sessions every week',
                'Direct access to your qualified coach',
                'Cycle-responsive strength training',
                'Nutrition guidance designed for women'
              ].map((benefit, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <div className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <p className="font-paragraph text-xs sm:text-sm text-primary-text">{benefit}</p>
                </div>
              ))}
            </motion.div>

            {/* Life Stage Support - Compact */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <p className="font-paragraph text-xs text-secondary-text">
                <span className="font-semibold text-primary">Support for:</span> Pre & postnatal · Perimenopause · Menopause
              </p>
            </motion.div>

            {/* Primary CTA - FULL WIDTH, 44px+ */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="pt-2"
            >
              <button className="w-full bg-primary text-white px-6 py-3.5 rounded-full font-paragraph font-semibold hover:bg-primary/90 transition text-sm sm:text-base h-11 sm:h-12 flex items-center justify-center">
                Start Your Training Journey
              </button>
            </motion.div>

            {/* Secondary CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <button
                onClick={() => setShowChatModal(true)}
                className="w-full border-2 border-primary text-primary px-6 py-3 rounded-full font-paragraph font-semibold hover:bg-primary/5 transition text-sm sm:text-base h-11 flex items-center justify-center"
              >
                Book a Free Chat
              </button>
            </motion.div>

            {/* Trust Statement */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <p className="font-paragraph text-xs text-secondary-text text-center">
                Training + coaching + nutrition, all in one app.
              </p>
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

          {/* Desktop Layout - Side by Side */}
          <div className="hidden lg:grid grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Headline */}
              <div>
                <h1 className="font-heading text-7xl xl:text-8xl text-primary leading-tight mb-6">
                  Train with your body.<br />Not against it.
                </h1>
                <p className="font-paragraph text-lg text-secondary-text leading-relaxed max-w-lg">
                  Personalised online training for women — built around your cycle, your symptoms and your stage of life.
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-4">
                {[
                  '3 personalised training sessions every week',
                  'Direct access to your qualified coach',
                  'Cycle-responsive strength training',
                  'Nutrition guidance designed for women'
                ].map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 + idx * 0.05 }}
                    className="flex gap-3 items-start"
                  >
                    <div className="flex-shrink-0 mt-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <p className="font-paragraph text-lg text-primary-text">{benefit}</p>
                  </motion.div>
                ))}
              </div>

              {/* Life Stage Support */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <p className="font-paragraph text-base text-secondary-text">
                  <span className="font-semibold text-primary">Support for:</span> Pre & postnatal · Perimenopause · Menopause
                </p>
              </motion.div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="flex gap-4 pt-4"
              >
                <button className="bg-primary text-white px-8 py-4 rounded-full font-paragraph font-semibold hover:bg-primary/90 transition text-lg">
                  Start Your Training Journey
                </button>
                <button
                  onClick={() => setShowChatModal(true)}
                  className="border-2 border-primary text-primary px-8 py-4 rounded-full font-paragraph font-semibold hover:bg-primary/5 transition text-lg"
                >
                  Book a Free Chat
                </button>
              </motion.div>

              {/* Trust Statement */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <p className="font-paragraph text-sm text-secondary-text">
                  Training + coaching + nutrition, all in one app.
                </p>
              </motion.div>
            </motion.div>

            {/* Right: Hero Image + App Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Hero Image */}
              <div className="rounded-3xl overflow-hidden bg-warm-sand-beige/30 aspect-square mb-8">
                <Image
                  src="https://static.wixstatic.com/media/93e866_95263f3d8ac746e1a81e9e9674336a9c~mv2.png?originWidth=1152&originHeight=640"
                  alt="Strong woman training in light-filled environment"
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* App Mockup - Overlapping */}
              <div className="absolute -bottom-12 -right-8 w-72 h-auto">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-8 border-gray-900">
                  {/* Phone Status Bar */}
                  <div className="bg-gray-900 text-white px-4 py-2 text-xs flex justify-between items-center">
                    <span>9:41</span>
                    <div className="flex gap-1">
                      <span>📶</span>
                      <span>🔋</span>
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="bg-gradient-to-b from-primary/10 to-white p-5 space-y-4">
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
        </div>
      </section>

      {/* Differentiation Section - Mobile Optimized */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 lg:px-8 bg-soft-white">
        <div className="max-w-[100rem] mx-auto">
          {/* Headline */}
          <motion.div {...fadeInUp} className="text-center mb-8 sm:mb-12">
            <h2 className="font-heading text-2xl sm:text-4xl lg:text-5xl text-primary leading-tight mb-4 sm:mb-6">
              Your body isn't a problem to solve.<br />Your training should adapt.
            </h2>
            <p className="font-paragraph text-sm sm:text-base text-secondary-text max-w-3xl mx-auto leading-relaxed">
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
              <h3 className="font-heading text-lg sm:text-2xl text-primary mb-6">
                Traditional online training
              </h3>
              <ul className="space-y-3">
                {[
                  'Fixed programme',
                  'Same intensity every week',
                  'Workout-first approach',
                  'Limited personal support',
                  'One-size-fits-all progression'
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3 items-start">
                    <div className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full bg-warm-sand-beige/40 flex items-center justify-center">
                      <span className="text-secondary-text text-xs">−</span>
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

      {/* Why Different */}
      <section id="why-different" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-off-white">
        <div className="max-w-[100rem] mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-12 sm:mb-16">
            <h2 className="font-heading text-4xl sm:text-5xl text-primary mb-4">Why This Is Different</h2>
            <p className="font-paragraph text-lg text-secondary-text max-w-2xl mx-auto">
              Most online training treats all women the same. We don't.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {[
              {
                title: 'Cycle-Responsive Training',
                description: 'Your training adapts to your energy, recovery, and readiness—not a rigid calendar.'
              },
              {
                title: 'Real Human Coaching',
                description: 'Message your coach directly. Get feedback, adjustments, and support whenever you need it.'
              },
              {
                title: 'Symptom-Focused',
                description: 'We respond to how you actually feel, not just theory. Irregular cycles? Perimenopause? We adapt.'
              },
              {
                title: 'Nutrition + Training',
                description: 'Level 4 nutrition guidance integrated with your training plan for complete support.'
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                transition={{ ...fadeInUp.transition, delay: idx * 0.1 }}
                className="bg-white p-8 rounded-2xl border border-warm-sand-beige/30 hover:border-primary/20 transition"
              >
                <h3 className="font-heading text-2xl text-primary mb-3">{item.title}</h3>
                <p className="font-paragraph text-secondary-text">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Built for Women Through Every Stage */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-soft-white">
        <div className="max-w-[100rem] mx-auto">
          {/* Main Headline */}
          <motion.div {...fadeInUp} className="text-center mb-8 sm:mb-12">
            <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl text-primary leading-tight mb-6">
              Built for women<br />through every stage.
            </h2>
            <p className="font-paragraph text-lg sm:text-xl text-secondary-text max-w-3xl mx-auto leading-relaxed">
              Your body changes. Your training should be able to change with it.
            </p>
          </motion.div>

          {/* Four Premium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
            {[
              {
                title: 'Pre & Postpartum',
                description: 'Support your return to movement and strength with training that respects recovery and the demands of motherhood.',
                image: 'https://static.wixstatic.com/media/93e866_1823bf72bef6439194e736878522534e~mv2.png?originWidth=576&originHeight=384'
              },
              {
                title: 'Perimenopause',
                description: 'When energy, recovery, symptoms and cycles become less predictable, your training needs more flexibility — not less.',
                image: 'https://static.wixstatic.com/media/93e866_95263f3d8ac746e1a81e9e9674336a9c~mv2.png?originWidth=1152&originHeight=640'
              },
              {
                title: 'Menopause',
                description: 'Build and maintain strength with training and nutrition guidance designed around your current stage.',
                image: 'https://static.wixstatic.com/media/93e866_1877ca55f0044548b3d25015011e811a~mv2.png?originWidth=448&originHeight=448'
              },
              {
                title: 'Cycle-Synced Training',
                description: 'For women with a predictable cycle, use phase awareness to understand when to build, push, maintain or recover.',
                image: 'https://static.wixstatic.com/media/93e866_bac8b2788ea14bff96e1affde4f0fc30~mv2.png?originWidth=384&originHeight=384'
              }
            ].map((card, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                transition={{ ...fadeInUp.transition, delay: idx * 0.08 }}
                className="group relative overflow-hidden rounded-2xl bg-white border border-warm-sand-beige/30 hover:border-primary/20 transition-all duration-300"
              >
                {/* Image Container */}
                <div className="relative h-64 sm:h-72 overflow-hidden bg-warm-sand-beige/20">
                  <Image
                    src={card.image}
                    alt={card.title}
                    width={600}
                    height={400}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="p-8 sm:p-10">
                  <h3 className="font-heading text-2xl sm:text-3xl text-primary mb-4">
                    {card.title}
                  </h3>
                  <p className="font-paragraph text-base sm:text-lg text-secondary-text leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Closing Statement */}
          <motion.div
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.4 }}
            className="max-w-3xl mx-auto text-center"
          >
            <p className="font-heading text-3xl sm:text-4xl lg:text-5xl text-primary leading-tight">
              You don't need to fit a perfect cycle.<br />
              <span className="text-secondary-text">You need a programme that can meet you where you are.</span>
            </p>
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

      {/* How the App Works */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-off-white">
        <div className="max-w-[100rem] mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-12 sm:mb-16">
            <h2 className="font-heading text-4xl sm:text-5xl text-primary mb-4">How It Works</h2>
            <p className="font-paragraph text-lg text-secondary-text max-w-2xl mx-auto">
              Three coached sessions per week, delivered through our app. Simple, flexible, powerful.
            </p>
          </motion.div>

          <div className="space-y-8 sm:space-y-12">
            {[
              {
                number: '1',
                title: 'Three Coached Sessions Per Week',
                description: 'Strength training, conditioning, and mobility work tailored to your cycle phase and energy levels.',
                image: 'https://static.wixstatic.com/media/93e866_bac8b2788ea14bff96e1affde4f0fc30~mv2.png?originWidth=384&originHeight=384'
              },
              {
                number: '2',
                title: 'Direct Access to Your Coach',
                description: 'Message anytime. Ask questions. Get form checks. Adjust your plan. Real support, not an algorithm.',
                image: 'https://static.wixstatic.com/media/12d367_4f26ccd17f8f4e3a8958306ea08c2332~mv2.png'
              },
              {
                number: '3',
                title: 'Track Progress, Recovery & Wellbeing',
                description: 'Log your workouts, energy levels, sleep, and how you feel. We use this data to keep optimising your plan.',
                image: 'https://static.wixstatic.com/media/93e866_d56acc22de8d4a4c905143ebbc350b6a~mv2.png?originWidth=384&originHeight=384'
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                transition={{ ...fadeInUp.transition, delay: idx * 0.1 }}
                className={`flex flex-col ${idx % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'} gap-8 items-center`}
              >
                <div className="flex-1">
                  <div className="inline-block bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center font-heading text-2xl mb-4">
                    {item.number}
                  </div>
                  <h3 className="font-heading text-3xl text-primary mb-4">{item.title}</h3>
                  <p className="font-paragraph text-lg text-secondary-text">{item.description}</p>
                </div>
                <div className="flex-1">
                  <div className="rounded-2xl overflow-hidden bg-warm-sand-beige/30 aspect-square">
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section id="included" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-soft-white">
        <div className="max-w-[100rem] mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-12 sm:mb-16">
            <h2 className="font-heading text-4xl sm:text-5xl text-primary mb-4">What's Included</h2>
            <p className="font-paragraph text-lg text-secondary-text max-w-2xl mx-auto">
              Everything you need to get stronger, feel better, and understand your body.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {[
              '3 coached training sessions per week',
              'Cycle-synced training adjustments',
              'Direct messaging with your coach',
              'Level 4 nutrition guidance',
              'Progress tracking dashboard',
              'Recovery & wellbeing monitoring',
              'Form check videos',
              'Postpartum-specific programming',
              'Perimenopause & menopause support',
              'Ongoing plan adjustments',
              'Community access',
              'Monthly check-ins'
            ].map((item, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                transition={{ ...fadeInUp.transition, delay: (idx % 6) * 0.05 }}
                className="flex gap-4 items-start"
              >
                <div className="flex-shrink-0 mt-1">
                  <Check className="w-6 h-6 text-emerald-green" />
                </div>
                <p className="font-paragraph text-lg text-primary-text">{item}</p>
              </motion.div>
            ))}
          </div>
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
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-soft-white">
        <div className="max-w-[100rem] mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-12 sm:mb-16">
            <h2 className="font-heading text-4xl sm:text-5xl text-primary mb-4">Training + Nutrition</h2>
            <p className="font-paragraph text-lg text-secondary-text max-w-2xl mx-auto">
              Strength training without nutrition guidance is incomplete. We provide both.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
            <motion.div {...fadeInUp} className="bg-white p-8 sm:p-12 rounded-2xl border border-warm-sand-beige/30">
              <h3 className="font-heading text-3xl text-primary mb-6">Your Training Plan</h3>
              <ul className="space-y-4 font-paragraph text-secondary-text">
                <li className="flex gap-3">
                  <span className="text-primary font-semibold">•</span>
                  <span>Strength-focused programming</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-semibold">•</span>
                  <span>Cycle-synced intensity and volume</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-semibold">•</span>
                  <span>Progressive overload built in</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-semibold">•</span>
                  <span>Recovery weeks planned</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-semibold">•</span>
                  <span>Adjustable based on your feedback</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.1 }}
              className="bg-white p-8 sm:p-12 rounded-2xl border border-warm-sand-beige/30"
            >
              <h3 className="font-heading text-3xl text-primary mb-6">Your Nutrition Guidance</h3>
              <ul className="space-y-4 font-paragraph text-secondary-text">
                <li className="flex gap-3">
                  <span className="text-primary font-semibold">•</span>
                  <span>Level 4 qualified nutrition coach</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-semibold">•</span>
                  <span>Personalised to your goals and preferences</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-semibold">•</span>
                  <span>Cycle-responsive nutrition strategies</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-semibold">•</span>
                  <span>No restrictive dieting</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-semibold">•</span>
                  <span>Sustainable, real-world approach</span>
                </li>
              </ul>
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
                  src="https://static.wixstatic.com/media/93e866_1877ca55f0044548b3d25015011e811a~mv2.png?originWidth=448&originHeight=448"
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

      {/* Coach Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-off-white">
        <div className="max-w-[100rem] mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-12 sm:mb-16">
            <h2 className="font-heading text-4xl sm:text-5xl text-primary mb-4">Meet Your Coach</h2>
            <p className="font-paragraph text-lg text-secondary-text max-w-2xl mx-auto">
              You're not training with an algorithm. You're training with a real person who cares about your progress.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 items-center">
            <motion.div {...fadeInUp}>
              <div className="rounded-2xl overflow-hidden bg-warm-sand-beige/30 aspect-square">
                <Image
                  src="https://static.wixstatic.com/media/93e866_1877ca55f0044548b3d25015011e811a~mv2.png?originWidth=448&originHeight=448"
                  alt="Your coach"
                  width={500}
                  height={500}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            <motion.div
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.1 }}
            >
              <h3 className="font-heading text-3xl text-primary mb-6">Qualified. Experienced. Real.</h3>
              <div className="space-y-6 font-paragraph text-secondary-text">
                <p>
                  Your coach is a Level 3 Personal Trainer with specialisation in women's health and cycle syncing. She's trained hundreds of women and understands the unique challenges you face.
                </p>
                <p>
                  She's not just delivering workouts. She's coaching you. She's learning how your body responds. She's adjusting your plan based on your feedback. She's here when you need support.
                </p>
                <p>
                  Most importantly: she gets it. She trains with her own cycle. She understands postpartum recovery. She knows what perimenopause feels like. She's not just reading from a textbook.
                </p>
              </div>
              <div className="mt-8 pt-8 border-t border-warm-sand-beige/30">
                <p className="font-paragraph text-sm text-secondary-text mb-4">Qualifications:</p>
                <ul className="space-y-2 font-paragraph text-secondary-text">
                  <li>• Level 3 Personal Trainer</li>
                  <li>• Women's Health Specialisation</li>
                  <li>• Cycle Syncing Certification</li>
                  <li>• Level 4 Nutrition Coach</li>
                </ul>
              </div>
            </motion.div>
          </div>
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
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/95 via-primary to-primary/90 relative overflow-hidden">
        {/* Subtle background accent */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full blur-3xl" />
        </div>

        <div className="max-w-[100rem] mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true, margin: '0px 0px -100px 0px' }}
              className="space-y-8"
            >
              {/* Headline */}
              <div className="space-y-4">
                <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl text-white leading-tight">
                  Your cycle.<br />
                  Your strength.<br />
                  Your time.
                </h2>
              </div>

              {/* Supporting Copy */}
              <p className="font-paragraph text-lg sm:text-xl text-white/90 leading-relaxed max-w-lg">
                Stop forcing your body to fit the programme.
                <br />
                <br />
                Start training in a way that listens, adapts and supports you.
              </p>

              {/* Three Benefits */}
              <div className="space-y-4 pt-4">
                {[
                  '3 coached sessions every week',
                  'Direct access to your coach',
                  'Training built around your body'
                ].map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 + idx * 0.05 }}
                    viewport={{ once: true }}
                    className="flex gap-3 items-start"
                  >
                    <div className="flex-shrink-0 mt-1 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center border border-white/40">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <p className="font-paragraph text-base sm:text-lg text-white/95">{benefit}</p>
                  </motion.div>
                ))}
              </div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row gap-4 pt-6"
              >
                <button className="bg-white text-primary px-8 py-4 rounded-full font-paragraph font-semibold hover:bg-off-white transition text-base sm:text-lg shadow-lg hover:shadow-xl">
                  Start Your Training Journey
                </button>
                <button
                  onClick={() => setShowChatModal(true)}
                  className="border-2 border-white text-white px-8 py-4 rounded-full font-paragraph font-semibold hover:bg-white/10 transition text-base sm:text-lg"
                >
                  Book a Free Chat
                </button>
              </motion.div>

              {/* Reassurance */}
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="font-paragraph text-sm text-white/75 italic pt-2"
              >
                Not sure where to start? Talk to your coach before joining.
              </motion.p>
            </motion.div>

            {/* Right: Image */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              viewport={{ once: true, margin: '0px 0px -100px 0px' }}
              className="relative"
            >
              {/* Main Image */}
              <div className="rounded-3xl overflow-hidden bg-white/10 backdrop-blur-sm aspect-square shadow-2xl border border-white/20">
                <Image
                  src="https://static.wixstatic.com/media/93e866_95263f3d8ac746e1a81e9e9674336a9c~mv2.png?originWidth=1152&originHeight=640"
                  alt="Confident woman training with strength and purpose"
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating App Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="absolute -bottom-8 -left-8 w-56 h-auto"
              >
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-6 border-white/20 backdrop-blur-sm">
                  {/* Phone Status Bar */}
                  <div className="bg-gray-900 text-white px-4 py-2 text-xs flex justify-between items-center">
                    <span>9:41</span>
                    <div className="flex gap-1">
                      <span>📶</span>
                      <span>🔋</span>
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="bg-gradient-to-b from-primary/5 to-white p-4 space-y-3">
                    {/* Quick Stats */}
                    <div className="bg-white rounded-xl p-3 border border-warm-sand-beige/30">
                      <p className="font-paragraph text-xs text-secondary-text mb-1">This Week</p>
                      <p className="font-heading text-sm text-primary">3/3 Sessions Done</p>
                    </div>

                    {/* Progress Ring */}
                    <div className="bg-primary/5 rounded-xl p-3 border border-primary/20">
                      <p className="font-paragraph text-xs text-secondary-text mb-2">Cycle Progress</p>
                      <div className="w-full bg-white rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }} />
                      </div>
                    </div>

                    {/* Coach Message */}
                    <div className="bg-primary/10 rounded-xl p-3 border-l-4 border-primary">
                      <p className="font-paragraph text-xs text-primary-text leading-relaxed">
                        "Great week! You're getting stronger. 💪"
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

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
      <footer className="bg-charcoal-black text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[100rem] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-heading text-xl mb-4">Cycle Synced</h3>
              <p className="font-paragraph text-sm text-gray-400">
                Personalised online training for women. Train with your body, not against it.
              </p>
            </div>
            <div>
              <h4 className="font-paragraph font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 font-paragraph text-sm text-gray-400">
                <li><a href="#why-different" className="hover:text-white transition">Why Different</a></li>
                <li><a href="#included" className="hover:text-white transition">What's Included</a></li>
                <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-paragraph font-semibold mb-4">Contact</h4>
              <p className="font-paragraph text-sm text-gray-400">
                Questions? <button onClick={() => setShowChatModal(true)} className="text-white hover:underline">Book a free chat</button>
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <p className="font-paragraph text-sm text-gray-400 text-center">
              © 2024 Cycle Synced. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

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
