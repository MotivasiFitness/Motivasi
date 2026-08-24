import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function InstagramLandingPageUpdated() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fadeInUp = {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: 'easeOut' },
    viewport: { once: true, margin: '0px 0px -80px 0px' }
  };

  return (
    <div className="min-h-screen bg-soft-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-soft-white/95 backdrop-blur-md border-b border-warm-sand-beige/20">
        <div className="max-w-[120rem] mx-auto px-6 lg:px-12 py-4 flex justify-between items-center">
          <div className="font-heading text-2xl text-primary font-light tracking-wide">Cycle Synced</div>
          <div className="hidden sm:flex gap-12 text-sm font-paragraph text-primary-text">
            <a href="#why-different" className="hover:text-primary transition">Why Different</a>
            <a href="#included" className="hover:text-primary transition">What's Included</a>
            <a href="#faq" className="hover:text-primary transition">FAQ</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-12 bg-warm-cream">
        <div className="max-w-[120rem] mx-auto">
          {/* Mobile Layout */}
          <div className="lg:hidden space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-heading text-6xl sm:text-7xl text-primary leading-tight mb-8 font-light tracking-tight">
                Train with your body.<br />Not against it.
              </h1>
              <p className="font-paragraph text-lg text-secondary-text leading-relaxed max-w-2xl font-light">
                Personalised online training for women — built around your cycle, your symptoms and your stage of life.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="space-y-6 pt-6"
            >
              {[
                '3 personalised training sessions every week',
                'Direct access to your qualified coach',
                'Cycle-responsive strength training',
                'Nutrition guidance designed for women'
              ].map((benefit, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 mt-1.5 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <p className="font-paragraph text-base text-primary-text leading-relaxed">{benefit}</p>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8 pt-8"
            >
              <button className="w-full bg-primary text-white px-8 py-4 rounded-full font-paragraph font-semibold hover:bg-primary/90 transition text-lg h-14 flex items-center justify-center">
                Start Your Training Journey
              </button>
              <button
                onClick={() => setShowChatModal(true)}
                className="w-full border-2 border-primary text-primary px-8 py-3.5 rounded-full font-paragraph font-semibold hover:bg-primary/5 transition text-lg h-14 flex items-center justify-center"
              >
                Book a Free Chat
              </button>
            </motion.div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:grid grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9 }}
              className="space-y-12"
            >
              <div>
                <h1 className="font-heading text-9xl text-primary leading-tight mb-10 font-light tracking-tight">
                  Train with your body.<br />Not against it.
                </h1>
                <p className="font-paragraph text-xl text-secondary-text leading-relaxed max-w-xl font-light">
                  Personalised online training for women — built around your cycle, your symptoms and your stage of life.
                </p>
              </div>

              <div className="space-y-7 pt-4">
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
                    transition={{ duration: 0.7, delay: 0.1 + idx * 0.05 }}
                    className="flex gap-5 items-start"
                  >
                    <div className="flex-shrink-0 mt-2 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <p className="font-paragraph text-lg text-primary-text leading-relaxed">{benefit}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex gap-6 pt-8"
              >
                <button className="bg-primary text-white px-10 py-4 rounded-full font-paragraph font-semibold hover:bg-primary/90 transition text-lg">
                  Start Your Training Journey
                </button>
                <button
                  onClick={() => setShowChatModal(true)}
                  className="border-2 border-primary text-primary px-10 py-4 rounded-full font-paragraph font-semibold hover:bg-primary/5 transition text-lg"
                >
                  Book a Free Chat
                </button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="relative"
            >
              <div className="rounded-3xl overflow-hidden bg-warm-sand-beige/20 aspect-square">
                <Image
                  src="https://static.wixstatic.com/media/93e866_95263f3d8ac746e1a81e9e9674336a9c~mv2.png?originWidth=1152&originHeight=640"
                  alt="Strong woman training in light-filled environment"
                  width={700}
                  height={700}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Different Section */}
      <section id="why-different" className="py-24 px-6 lg:px-12 bg-soft-white">
        <div className="max-w-[120rem] mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-20">
            <h2 className="font-heading text-6xl lg:text-7xl text-primary mb-8 font-light leading-tight">
              Why This Is Different
            </h2>
            <p className="font-paragraph text-xl text-secondary-text max-w-3xl mx-auto leading-relaxed font-light">
              Most online training treats all women the same. We don't.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12">
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
                className="bg-white p-10 lg:p-12 rounded-2xl border border-warm-sand-beige/30 hover:border-primary/20 transition-all duration-300"
              >
                <h3 className="font-heading text-3xl text-primary mb-5 font-light">{item.title}</h3>
                <p className="font-paragraph text-lg text-secondary-text leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Built for Every Stage */}
      <section className="py-24 px-6 lg:px-12 bg-off-white">
        <div className="max-w-[120rem] mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-20">
            <h2 className="font-heading text-6xl lg:text-7xl text-primary mb-8 font-light leading-tight">
              Built for women<br />through every stage.
            </h2>
            <p className="font-paragraph text-xl text-secondary-text max-w-3xl mx-auto leading-relaxed font-light">
              Your body changes. Your training should be able to change with it.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12">
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
                <div className="relative h-72 overflow-hidden bg-warm-sand-beige/20">
                  <Image
                    src={card.image}
                    alt={card.title}
                    width={600}
                    height={400}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                </div>

                <div className="p-10 lg:p-12">
                  <h3 className="font-heading text-3xl text-primary mb-5 font-light">{card.title}</h3>
                  <p className="font-paragraph text-lg text-secondary-text leading-relaxed">{card.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section id="included" className="py-24 px-6 lg:px-12 bg-soft-white">
        <div className="max-w-[120rem] mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-20">
            <h2 className="font-heading text-6xl lg:text-7xl text-primary mb-8 font-light">What's Included</h2>
            <p className="font-paragraph text-xl text-secondary-text max-w-3xl mx-auto leading-relaxed font-light">
              Everything you need to get stronger, feel better, and understand your body.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 max-w-4xl mx-auto">
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
                className="flex gap-5 items-start"
              >
                <div className="flex-shrink-0 mt-1">
                  <Check className="w-6 h-6 text-primary" />
                </div>
                <p className="font-paragraph text-lg text-primary-text leading-relaxed">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Coach Section */}
      <section className="py-24 px-6 lg:px-12 bg-off-white">
        <div className="max-w-[120rem] mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-20">
            <h2 className="font-heading text-6xl lg:text-7xl text-primary mb-8 font-light">
              There's a real person<br />behind your programme.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.1 }}
            >
              <div className="rounded-3xl overflow-hidden bg-warm-sand-beige/20 aspect-square">
                <Image
                  src="https://static.wixstatic.com/media/93e866_1877ca55f0044548b3d25015011e811a~mv2.png?originWidth=448&originHeight=448"
                  alt="Women's Health Coach"
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            <motion.div
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.2 }}
              className="space-y-10"
            >
              <div className="space-y-4">
                <p className="font-paragraph text-sm font-semibold uppercase tracking-wider text-primary">Your Coach</p>
                <h3 className="font-heading text-4xl text-primary leading-tight font-light">
                  Women's Health Coach
                </h3>
                <p className="font-paragraph text-lg text-secondary-text leading-relaxed">
                  Level 4 Qualified<br />
                  Additional training in nutrition and menopause fitness
                </p>
              </div>

              <div className="space-y-6 border-l-4 border-primary pl-8">
                <p className="font-paragraph text-lg text-secondary-text leading-relaxed">
                  I built this approach because I know what it feels like when your body starts behaving differently and the usual fitness advice stops making sense.
                </p>
                <p className="font-paragraph text-lg text-secondary-text leading-relaxed">
                  My own experience with women's health symptoms led me to look beyond generic training plans and build an approach that listens to the woman, not just the calendar.
                </p>
              </div>

              <div className="bg-primary/5 rounded-2xl p-10 border border-primary/10">
                <p className="font-heading text-3xl text-primary leading-tight mb-5 font-light">
                  My role isn't to tell you that your body should behave a certain way.
                </p>
                <p className="font-paragraph text-lg text-secondary-text leading-relaxed">
                  It's to help you understand it, train it, fuel it and become stronger in it.
                </p>
              </div>

              <button className="inline-flex items-center gap-3 bg-primary text-white px-10 py-4 rounded-full font-paragraph font-semibold hover:bg-primary/90 transition text-lg group">
                Meet Your Coach
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 px-6 lg:px-12 bg-soft-white">
        <div className="max-w-[120rem] mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-20">
            <h2 className="font-heading text-6xl lg:text-7xl text-primary mb-8 font-light">What Women Are Saying</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
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
                className="bg-white p-10 rounded-2xl border border-warm-sand-beige/30"
              >
                <p className="font-paragraph text-lg text-secondary-text mb-8 italic leading-relaxed">"{item.quote}"</p>
                <div>
                  <p className="font-paragraph font-semibold text-primary-text text-lg">{item.author}</p>
                  <p className="font-paragraph text-sm text-secondary-text">{item.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 lg:px-12 bg-off-white">
        <div className="max-w-[120rem] mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-20">
            <h2 className="font-heading text-6xl lg:text-7xl text-primary mb-8 font-light">Questions before you start?</h2>
            <p className="font-paragraph text-xl text-secondary-text max-w-3xl mx-auto leading-relaxed font-light">
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
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                {...fadeInUp}
                transition={{ ...fadeInUp.transition, delay: (idx % 3) * 0.05 }}
                className="bg-white rounded-2xl border border-warm-sand-beige/30 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full px-10 py-7 flex justify-between items-center hover:bg-off-white transition"
                >
                  <h3 className="font-paragraph font-semibold text-primary-text text-left text-lg">{item.q}</h3>
                  <ChevronDown
                    className={`w-5 h-5 text-primary flex-shrink-0 transition-transform ${
                      expandedFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedFaq === idx && (
                  <div className="px-10 pb-7 border-t border-warm-sand-beige/30">
                    <p className="font-paragraph text-secondary-text leading-relaxed text-lg">{item.a}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 lg:px-12 bg-gradient-to-br from-primary/95 via-primary to-primary/90 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="max-w-[120rem] mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-10"
            >
              <h2 className="font-heading text-7xl lg:text-8xl text-white leading-tight font-light">
                Your cycle.<br />Your strength.<br />Your time.
              </h2>

              <p className="font-paragraph text-xl text-white/90 leading-relaxed max-w-lg font-light">
                Stop forcing your body to fit the programme. Start training in a way that listens, adapts and supports you.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 pt-6">
                <button className="bg-white text-primary px-10 py-4 rounded-full font-paragraph font-semibold hover:bg-off-white transition text-lg">
                  Start Your Training Journey
                </button>
                <button
                  onClick={() => setShowChatModal(true)}
                  className="border-2 border-white text-white px-10 py-4 rounded-full font-paragraph font-semibold hover:bg-white/10 transition text-lg"
                >
                  Book a Free Chat
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="rounded-3xl overflow-hidden bg-white/10 backdrop-blur-sm aspect-square shadow-2xl border border-white/20">
                <Image
                  src="https://static.wixstatic.com/media/93e866_95263f3d8ac746e1a81e9e9674336a9c~mv2.png?originWidth=1152&originHeight=640"
                  alt="Confident woman training"
                  width={700}
                  height={700}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal-black text-white py-16 px-6 lg:px-12">
        <div className="max-w-[120rem] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 mb-12">
            <div>
              <h3 className="font-heading text-2xl mb-4 font-light">Cycle Synced</h3>
              <p className="font-paragraph text-sm text-gray-400 leading-relaxed">
                Personalised online training for women. Train with your body, not against it.
              </p>
            </div>
            <div>
              <h4 className="font-paragraph font-semibold mb-6 text-lg">Quick Links</h4>
              <ul className="space-y-3 font-paragraph text-sm text-gray-400">
                <li><a href="#why-different" className="hover:text-white transition">Why Different</a></li>
                <li><a href="#included" className="hover:text-white transition">What's Included</a></li>
                <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-paragraph font-semibold mb-6 text-lg">Contact</h4>
              <p className="font-paragraph text-sm text-gray-400">
                Questions? <button onClick={() => setShowChatModal(true)} className="text-white hover:underline">Book a free chat</button>
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-12">
            <p className="font-paragraph text-sm text-gray-400 text-center">
              © 2024 Cycle Synced. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-10 max-w-md w-full"
          >
            <h3 className="font-heading text-3xl text-primary mb-5 font-light">Book a Free Chat</h3>
            <p className="font-paragraph text-secondary-text mb-8 leading-relaxed">
              Let's talk about your goals and how we can help you train with your body.
            </p>
            <form className="space-y-5">
              <input
                type="text"
                placeholder="Your name"
                className="w-full px-5 py-3 border border-warm-sand-beige/30 rounded-lg font-paragraph focus:outline-none focus:border-primary"
              />
              <input
                type="email"
                placeholder="Your email"
                className="w-full px-5 py-3 border border-warm-sand-beige/30 rounded-lg font-paragraph focus:outline-none focus:border-primary"
              />
              <textarea
                placeholder="Tell us a bit about yourself"
                rows={3}
                className="w-full px-5 py-3 border border-warm-sand-beige/30 rounded-lg font-paragraph focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="w-full bg-primary text-white px-8 py-3 rounded-full font-paragraph font-semibold hover:bg-primary/90 transition text-lg"
              >
                Book My Free Chat
              </button>
            </form>
            <button
              onClick={() => setShowChatModal(false)}
              className="mt-6 w-full text-secondary-text font-paragraph hover:text-primary-text transition"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
