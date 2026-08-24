import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Check, MessageCircle, Calendar, Zap, Heart } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function InstagramLandingPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
    viewport: { once: true, margin: '0px 0px -100px 0px' }
  };

  return (
    <div className="min-h-screen bg-soft-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-soft-white/95 backdrop-blur-sm border-b border-warm-sand-beige/20">
        <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="font-heading text-2xl text-primary font-semibold">Cycle Synced</div>
          <div className="hidden sm:flex gap-8 text-sm font-paragraph text-primary-text">
            <a href="#why-different" className="hover:text-primary transition">Why Different</a>
            <a href="#included" className="hover:text-primary transition">What's Included</a>
            <a href="#faq" className="hover:text-primary transition">FAQ</a>
          </div>
        </div>
      </nav>

      {/* Premium App Experience Showcase */}
      <section className="pt-24 pb-12 sm:pt-32 sm:pb-20 px-4 sm:px-6 lg:px-8 bg-warm-cream">
        <div className="max-w-[100rem] mx-auto">
          {/* Headline */}
          <motion.div {...fadeInUp} className="text-center mb-12 sm:mb-20">
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl text-primary leading-tight mb-6">
              Your programme lives in one place.
            </h1>
            <p className="font-paragraph text-lg sm:text-xl text-secondary-text max-w-3xl mx-auto leading-relaxed">
              Your workouts, progress, check-ins, nutrition guidance and coach support — all from your phone.
            </p>
          </motion.div>

          {/* Mobile Layout - Stacked */}
          <div className="lg:hidden space-y-12">
            {/* Phone Mockup */}
            <motion.div
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.1 }}
              className="flex justify-center"
            >
              <div className="w-72 h-auto">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-8 border-gray-900">
                  {/* Status Bar */}
                  <div className="bg-gray-900 text-white px-4 py-2 text-xs flex justify-between items-center">
                    <span>9:41</span>
                    <div className="flex gap-1">
                      <span>📶</span>
                      <span>🔋</span>
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="bg-gradient-to-b from-warm-cream to-soft-white p-5 space-y-4 max-h-96 overflow-y-auto">
                    {/* TODAY Header */}
                    <div className="text-center pb-2">
                      <p className="font-heading text-sm text-primary font-semibold">TODAY</p>
                    </div>

                    {/* Cycle Phase */}
                    <div className="bg-white rounded-2xl p-4 border border-warm-sand-beige/30 text-center">
                      <p className="font-paragraph text-xs text-secondary-text mb-1">Follicular Phase</p>
                      <p className="font-heading text-base text-primary">Day 8</p>
                    </div>

                    {/* Today's Session */}
                    <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
                      <p className="font-paragraph text-xs text-secondary-text mb-2">Today's Session</p>
                      <p className="font-heading text-lg text-primary mb-1">Lower Body Strength</p>
                      <p className="font-paragraph text-xs text-secondary-text mb-3">Duration: 52 min</p>
                      <p className="font-paragraph text-xs text-primary-text mb-3">
                        <span className="font-semibold">Training focus:</span> Strength · Glutes · Core
                      </p>
                      <button className="w-full bg-primary text-white py-2 rounded-lg font-paragraph text-xs font-semibold hover:bg-primary/90 transition">
                        Start Workout
                      </button>
                    </div>

                    {/* How are you feeling */}
                    <div className="bg-white rounded-2xl p-4 border border-warm-sand-beige/30">
                      <p className="font-paragraph text-xs text-secondary-text mb-3 text-center">How are you feeling?</p>
                      <div className="flex gap-2 justify-between">
                        <button className="flex-1 py-2 rounded-lg hover:bg-warm-sand-beige/20 transition text-xl">😴</button>
                        <button className="flex-1 py-2 rounded-lg hover:bg-warm-sand-beige/20 transition text-xl">😐</button>
                        <button className="flex-1 py-2 rounded-lg hover:bg-warm-sand-beige/20 transition text-xl">💪</button>
                        <button className="flex-1 py-2 rounded-lg hover:bg-warm-sand-beige/20 transition text-xl">🔥</button>
                        <button className="flex-1 py-2 rounded-lg hover:bg-warm-sand-beige/20 transition text-xl">😊</button>
                      </div>
                    </div>

                    {/* Today's Focus */}
                    <div className="bg-white rounded-2xl p-4 border border-warm-sand-beige/30">
                      <p className="font-paragraph text-xs text-secondary-text mb-3 font-semibold">Today's Focus</p>
                      <ul className="space-y-2">
                        <li className="flex gap-2 items-start">
                          <span className="text-primary font-bold text-sm">•</span>
                          <span className="font-paragraph text-xs text-primary-text">Build strength</span>
                        </li>
                        <li className="flex gap-2 items-start">
                          <span className="text-primary font-bold text-sm">•</span>
                          <span className="font-paragraph text-xs text-primary-text">Fuel your body</span>
                        </li>
                        <li className="flex gap-2 items-start">
                          <span className="text-primary font-bold text-sm">•</span>
                          <span className="font-paragraph text-xs text-primary-text">Stay consistent</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feature Blocks */}
            <div className="space-y-6">
              {[
                {
                  number: '01',
                  title: 'Your workouts',
                  description: 'Personalised training delivered through the app.'
                },
                {
                  number: '02',
                  title: 'Your check-ins',
                  description: 'Track energy, mood, symptoms, recovery and sleep.'
                },
                {
                  number: '03',
                  title: 'Your coach',
                  description: 'Message your qualified trainer directly.'
                },
                {
                  number: '04',
                  title: 'Your progress',
                  description: 'See how your training and wellbeing evolve over time.'
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  {...fadeInUp}
                  transition={{ ...fadeInUp.transition, delay: 0.2 + idx * 0.05 }}
                  className="bg-white p-6 rounded-2xl border border-warm-sand-beige/30"
                >
                  <p className="font-heading text-2xl text-primary mb-2">{item.number}</p>
                  <h3 className="font-heading text-xl text-primary mb-2">{item.title}</h3>
                  <p className="font-paragraph text-secondary-text text-sm">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Desktop Layout - Side by Side */}
          <div className="hidden lg:grid grid-cols-2 gap-16 items-center">
            {/* Left: Phone Mockup */}
            <motion.div
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.1 }}
              className="flex justify-center"
            >
              <div className="w-80 h-auto">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-8 border-gray-900">
                  {/* Status Bar */}
                  <div className="bg-gray-900 text-white px-4 py-2 text-xs flex justify-between items-center">
                    <span>9:41</span>
                    <div className="flex gap-1">
                      <span>📶</span>
                      <span>🔋</span>
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="bg-gradient-to-b from-warm-cream to-soft-white p-6 space-y-5 max-h-[600px] overflow-y-auto">
                    {/* TODAY Header */}
                    <div className="text-center pb-2">
                      <p className="font-heading text-sm text-primary font-semibold tracking-wider">TODAY</p>
                    </div>

                    {/* Cycle Phase */}
                    <div className="bg-white rounded-2xl p-5 border border-warm-sand-beige/30 text-center">
                      <p className="font-paragraph text-xs text-secondary-text mb-2">Follicular Phase</p>
                      <p className="font-heading text-xl text-primary font-semibold">Day 8</p>
                    </div>

                    {/* Today's Session */}
                    <div className="bg-primary/5 rounded-2xl p-5 border border-primary/20">
                      <p className="font-paragraph text-xs text-secondary-text mb-2 font-semibold">Today's Session</p>
                      <p className="font-heading text-lg text-primary mb-2 font-semibold">Lower Body Strength</p>
                      <p className="font-paragraph text-sm text-secondary-text mb-4">
                        <span className="font-semibold">Duration:</span> 52 min
                      </p>
                      <p className="font-paragraph text-sm text-primary-text mb-4">
                        <span className="font-semibold">Training focus:</span> Strength · Glutes · Core
                      </p>
                      <button className="w-full bg-primary text-white py-3 rounded-lg font-paragraph text-sm font-semibold hover:bg-primary/90 transition">
                        Start Workout
                      </button>
                    </div>

                    {/* How are you feeling */}
                    <div className="bg-white rounded-2xl p-5 border border-warm-sand-beige/30">
                      <p className="font-paragraph text-xs text-secondary-text mb-4 text-center font-semibold">How are you feeling?</p>
                      <div className="flex gap-2 justify-between">
                        <button className="flex-1 py-3 rounded-lg hover:bg-warm-sand-beige/20 transition text-2xl">😴</button>
                        <button className="flex-1 py-3 rounded-lg hover:bg-warm-sand-beige/20 transition text-2xl">😐</button>
                        <button className="flex-1 py-3 rounded-lg hover:bg-warm-sand-beige/20 transition text-2xl">💪</button>
                        <button className="flex-1 py-3 rounded-lg hover:bg-warm-sand-beige/20 transition text-2xl">🔥</button>
                        <button className="flex-1 py-3 rounded-lg hover:bg-warm-sand-beige/20 transition text-2xl">😊</button>
                      </div>
                    </div>

                    {/* Today's Focus */}
                    <div className="bg-white rounded-2xl p-5 border border-warm-sand-beige/30">
                      <p className="font-paragraph text-xs text-secondary-text mb-4 font-semibold">Today's Focus</p>
                      <ul className="space-y-3">
                        <li className="flex gap-3 items-start">
                          <span className="text-primary font-bold text-base flex-shrink-0">•</span>
                          <span className="font-paragraph text-sm text-primary-text">Build strength</span>
                        </li>
                        <li className="flex gap-3 items-start">
                          <span className="text-primary font-bold text-base flex-shrink-0">•</span>
                          <span className="font-paragraph text-sm text-primary-text">Fuel your body</span>
                        </li>
                        <li className="flex gap-3 items-start">
                          <span className="text-primary font-bold text-base flex-shrink-0">•</span>
                          <span className="font-paragraph text-sm text-primary-text">Stay consistent</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Feature Blocks */}
            <motion.div
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.2 }}
              className="space-y-6"
            >
              {[
                {
                  number: '01',
                  title: 'Your workouts',
                  description: 'Personalised training delivered through the app.'
                },
                {
                  number: '02',
                  title: 'Your check-ins',
                  description: 'Track energy, mood, symptoms, recovery and sleep.'
                },
                {
                  number: '03',
                  title: 'Your coach',
                  description: 'Message your qualified trainer directly.'
                },
                {
                  number: '04',
                  title: 'Your progress',
                  description: 'See how your training and wellbeing evolve over time.'
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  {...fadeInUp}
                  transition={{ ...fadeInUp.transition, delay: 0.3 + idx * 0.08 }}
                  className="bg-white p-8 rounded-2xl border border-warm-sand-beige/30 hover:border-primary/20 transition"
                >
                  <p className="font-heading text-3xl text-primary mb-3 font-semibold">{item.number}</p>
                  <h3 className="font-heading text-2xl text-primary mb-3">{item.title}</h3>
                  <p className="font-paragraph text-secondary-text text-base leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
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
