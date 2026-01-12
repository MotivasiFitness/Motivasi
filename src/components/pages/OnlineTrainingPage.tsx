import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, ChevronDown, Video, Users, Clock, Zap, Heart, Smartphone, AlertCircle } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useLanguage } from '@/i18n/LanguageContext';

export default function OnlineTrainingPage() {
  const { t } = useLanguage();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const contactFormRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    contactFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-soft-white">
      {/* Hero Section */}
      <section className="py-24 px-8 lg:px-20 bg-warm-sand-beige">
        <div className="max-w-[100rem] mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block py-1 px-3 border border-soft-bronze rounded-full text-soft-bronze text-sm tracking-widest uppercase font-medium mb-6">
                Online Coaching
              </span>
              <h1 className="font-heading text-6xl font-bold text-charcoal-black mb-6">
                Transform From Home
              </h1>
              <p className="font-paragraph text-xl text-charcoal-black mb-6 leading-relaxed">
                Get personalised coaching, expert guidance, and real results—all from the comfort of your home. No gym required. No excuses needed.
              </p>
              <p className="font-paragraph text-lg text-warm-grey mb-8 leading-relaxed">
                Whether you're postpartum, navigating perimenopause, a complete beginner, or juggling a busy schedule—I've got a program designed for you.
              </p>
              <button
                onClick={scrollToForm}
                className="inline-flex items-center gap-2 bg-charcoal-black text-soft-white px-10 py-5 rounded-full font-medium text-lg hover:bg-soft-bronze transition-colors"
              >
                Get Started <ArrowRight size={20} />
              </button>
            </div>

            <div className="relative">
              <div className="aspect-square w-full max-w-lg mx-auto rounded-2xl overflow-hidden">
                <Image
                  src="https://static.wixstatic.com/media/93e866_84be481776af4fc3964a571dc2e19db0~mv2.jpg"
                  className="w-full h-full object-cover"
                  width={600}
                  originWidth={480}
                  originHeight={640} />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* What's Included Section */}
      <section className="py-24 px-8 lg:px-20">
        <div className="max-w-[100rem] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-5xl font-bold text-charcoal-black mb-6">
              What's Included in Your Package
            </h2>
            <p className="font-paragraph text-xl text-charcoal-black max-w-3xl mx-auto">
              Everything you need to succeed, delivered digitally and personalised to your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: <Video size={32} />,
                title: "Personalised Video Training",
                desc: "Custom-recorded workout videos tailored to your fitness level, goals, and available equipment. Watch anytime, anywhere."
              },
              {
                icon: <Users size={32} />,
                title: "Weekly Check-In Calls",
                desc: "One-on-one video calls to review your progress, adjust your program, answer questions, and keep you accountable."
              },
              {
                icon: <Smartphone size={32} />,
                title: "Private Coaching Platform",
                desc: "Access your workouts, nutrition guidance, progress tracking, and direct messaging with me in one secure coaching platform."
              },
              {
                icon: <Heart size={32} />,
                title: "Nutrition Guidance",
                desc: "Personalised nutrition advice tailored to your goals, lifestyle, and any special considerations (postpartum, perimenopause, etc.)."
              },
              {
                icon: <Clock size={32} />,
                title: "Flexible Scheduling",
                desc: "Train on your schedule. Workouts range from 30-60 minutes, so you can fit fitness into your busy life."
              },
              {
                icon: <Zap size={32} />,
                title: "Real-Time Support",
                desc: "Message me anytime with questions, form checks, or motivation. I respond within 24 hours."
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8 hover:border-soft-bronze transition-colors"
              >
                <div className="w-16 h-16 bg-soft-bronze/10 rounded-xl flex items-center justify-center mb-6 text-soft-bronze">
                  {feature.icon}
                </div>
                <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-3">
                  {feature.title}
                </h3>
                <p className="font-paragraph text-base text-warm-grey">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* How It Works Section */}
      <section className="py-24 px-8 lg:px-20 bg-charcoal-black">
        <div className="max-w-[100rem] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-5xl font-bold text-soft-white mb-4">
              How It Works
            </h2>

            <p className="font-paragraph text-xl text-warm-grey max-w-3xl mx-auto">
              A simple, proven process to get you results.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Complete the PAR-Q Questionnaire",
                desc: "Fill out our health questionnaire to ensure we understand your medical history, fitness level, and any special considerations."
              },
              {
                step: "2",
                title: "Book a Free 15-Minute Consultation Call",
                desc: "Schedule a brief call with us to discuss your goals, answer any questions, and confirm we're the right fit for your needs."
              },
              {
                step: "3",
                title: "Choose Your Coaching Plan & Complete Onboarding",
                desc: "Select the plan that works for you (Starter, Signature, or VIP) and complete your account setup to access the coaching platform."
              },
              {
                step: "4",
                title: "Start Your Personalised Online Coaching Programme",
                desc: "Begin your custom workouts, nutrition guidance, and weekly check-ins. Train on your schedule and achieve real results."
              }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="bg-soft-white/10 border border-soft-bronze/30 rounded-2xl p-8 text-center h-full flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 bg-soft-bronze text-soft-white rounded-full flex items-center justify-center font-heading text-xl font-bold mx-auto mb-6">
                      {item.step}
                    </div>
                    <h3 className="font-heading text-xl font-bold text-soft-white mb-4">
                      {item.title}
                    </h3>
                    <p className="font-paragraph text-warm-grey">
                      {item.desc}
                    </p>
                  </div>
                </div>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="text-soft-bronze" size={24} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-24 px-8 lg:px-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-5xl font-bold text-charcoal-black mb-6">
              Your Questions Answered
            </h2>
            <p className="font-paragraph text-xl text-charcoal-black">
              Everything you need to know about online coaching.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "Is online coaching suitable for postpartum recovery?",
                answer: "Absolutely! Online coaching is ideal for postpartum women. I specialise in postpartum training and can modify workouts based on your recovery stage. Whether you're 6 weeks, 6 months, or 2 years postpartum, I'll create a safe, effective program that respects your body's healing journey. We'll focus on rebuilding core strength, managing diastasis recti if needed, and gradually returning to more intense training. Plus, you can train from home while managing your baby's schedule."
              },
              {
                question: "Is this suitable for perimenopause?",
                answer: "Yes, completely! Perimenopause brings unique challenges—hormonal fluctuations, energy changes, sleep disruption, and changing body composition. My online programs are specifically designed to address these. I'll adjust your training intensity based on your cycle, incorporate strength work to maintain bone density, and provide nutrition guidance that supports hormonal health. You'll have flexibility to modify workouts on days when you're not feeling your best."
              },
              {
                question: "Do I need gym equipment?",
                answer: "No! Online coaching works with what you have. Most workouts use bodyweight, resistance bands, or household items (water bottles, stairs, etc.). If you want to invest in equipment, I recommend dumbbells or kettlebells, but they're optional. I'll provide equipment alternatives for every exercise, so you're never stuck. Your home is your gym."
              },
              {
                question: "What if I'm a complete beginner?",
                answer: "Perfect! I work with beginners all the time. Your program will start at your level and progress gradually. Every exercise comes with modifications, form cues, and video demonstrations. During our weekly check-ins, I'll ensure you're doing movements correctly and feeling confident. There's no judgment, only support. You'll be amazed at what your body can do."
              },
              {
                question: "What's the difference between online and in-person coaching?",
                answer: "Both are highly effective! In-person training offers real-time form correction and hands-on adjustments. Online coaching offers flexibility, privacy, and the ability to train on your schedule. With online, you get recorded videos you can watch repeatedly, messaging support 24/7, and the ability to pause/rewind. Many clients prefer online because they can train in their comfort zone, fit it around their schedule, and access their coach anytime. The results are equally impressive."
              },
              {
                question: "How long are the programs?",
                answer: "Programs are flexible and tailored to your goals. Most clients start with a 12-week transformation program, which gives enough time to see significant changes and build sustainable habits. However, I also offer 8-week programs for those wanting a shorter commitment, or ongoing monthly coaching for long-term support. Each week includes 3-4 workouts (20-60 minutes each), nutrition guidance, and weekly check-ins. You can extend or adjust anytime."
              },
              {
                question: "What if I'm really busy?",
                answer: "Online coaching is designed for busy women! Workouts are flexible—you can do them early morning, during lunch, or late evening. I offer 20-30 minute express workouts for hectic weeks, plus longer sessions when you have more time. Your nutrition guidance is practical and realistic (no complicated meal prep). Weekly check-ins can be scheduled around your availability. The key is consistency, not perfection. Even 20 minutes, 3x per week, creates real results."
              },
              {
                question: "How do I get started?",
                answer: "It's simple! First, complete the PAR-Q questionnaire to tell me about your health and goals. Then, we'll schedule a free 15-minute consultation call to discuss your needs and answer any questions. If it's a good fit, you'll join the program and get access to your personalised coaching app. Your first week includes your custom program setup and our initial check-in call. You can start within days!"
              }
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-soft-white border border-warm-sand-beige rounded-2xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full px-8 py-6 flex items-center justify-between hover:bg-warm-sand-beige/30 transition-colors"
                >
                  <h3 className="font-heading text-lg font-bold text-charcoal-black text-left">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    size={24}
                    className={`text-soft-bronze flex-shrink-0 transition-transform duration-300 ${
                      expandedFaq === idx ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedFaq === idx && (
                  <div className="px-8 pb-6 border-t border-warm-sand-beige">
                    <p className="font-paragraph text-base text-warm-grey leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Pricing Section */}
      <section className="py-24 px-8 lg:px-20 bg-warm-sand-beige/30">
        <div className="max-w-[100rem] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-5xl font-bold text-charcoal-black mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="font-paragraph text-xl text-charcoal-black max-w-3xl mx-auto">
              Choose the plan that works for you. All include personalised coaching and support.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "£99",
                period: "/ month",
                desc: "Perfect for trying online coaching",
                features: [
                  "2 custom workouts per week",
                  "Bi-weekly check-in calls",
                  "Nutrition guidance",
                  "Platform access",
                  "Email support"
                ],
                cta: "Get Started"
              },
              {
                name: "Signature",
                price: "£150",
                period: "/ month",
                desc: "Our most popular program",
                features: [
                  "4 custom workouts per week",
                  "Weekly check-in calls",
                  "Detailed nutrition guidance",
                  "Platform access",
                  "Priority support",
                  "Form video reviews"
                ],
                cta: "Get Started",
                featured: true
              },
              {
                name: "VIP",
                price: "£250",
                period: "/ month",
                desc: "Maximum support & results",
                features: [
                  "5-6 custom workouts per week",
                  "Twice-weekly check-in calls",
                  "Meal planning & recipes",
                  "Platform access",
                  "24/7 priority support",
                  "Form video reviews",
                  "Accountability texts"
                ],
                cta: "Get Started"
              }
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-8 transition-all duration-300 ${
                  plan.featured
                    ? 'bg-charcoal-black text-soft-white border-2 border-soft-bronze shadow-xl'
                    : 'bg-soft-white border border-warm-sand-beige hover:border-soft-bronze'
                }`}
              >
                {plan.featured && (
                  <div className="inline-block bg-soft-bronze text-soft-white px-4 py-1 rounded-full text-sm font-medium mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className={`font-heading text-3xl font-bold mb-2 ${plan.featured ? 'text-soft-white' : 'text-charcoal-black'}`}>
                  {plan.name}
                </h3>
                <p className={`font-paragraph text-sm mb-6 ${plan.featured ? 'text-warm-grey' : 'text-warm-grey'}`}>
                  {plan.desc}
                </p>
                <div className={`flex items-baseline gap-2 mb-8 ${plan.featured ? 'text-soft-bronze' : 'text-soft-bronze'}`}>
                  <span className="font-heading text-5xl font-bold">{plan.price}</span>
                  <span className={plan.featured ? 'text-warm-grey' : 'text-warm-grey'}>
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle size={20} className={`flex-shrink-0 mt-0.5 ${plan.featured ? 'text-soft-bronze' : 'text-soft-bronze'}`} />
                      <span className={`font-paragraph ${plan.featured ? 'text-soft-white/90' : 'text-charcoal-black'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={scrollToForm}
                  className={`w-full py-3 rounded-lg font-medium text-lg transition-all duration-300 ${
                    plan.featured
                      ? 'bg-soft-bronze text-soft-white hover:bg-soft-white hover:text-charcoal-black'
                      : 'bg-charcoal-black text-soft-white hover:bg-soft-bronze'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-soft-bronze/10 border border-soft-bronze/30 rounded-2xl text-center">
            <p className="font-paragraph text-base text-charcoal-black">
              <span className="font-bold">All plans include:</span> 30-minute initial consultation, personalised program design, and 7-day money-back guarantee
            </p>
          </div>
        </div>
      </section>
      {/* Why Women Choose Motivasi Section */}
      <section className="py-24 px-8 lg:px-20 bg-soft-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-5xl font-bold text-charcoal-black mb-4">
              Why Women Choose Motivasi
            </h2>
            <p className="font-paragraph text-xl text-warm-grey max-w-3xl mx-auto">
              Choosing the right coach matters — especially when your time, energy, and health are important.
            </p>
          </div>

          <div className="bg-warm-sand-beige/20 border border-warm-sand-beige rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-soft-bronze flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-soft-white font-heading font-bold text-sm">✓</span>
                </div>
                <p className="font-paragraph text-base text-charcoal-black leading-relaxed">
                  Coaching designed by a mum who understands the realities of busy life
                </p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-soft-bronze flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-soft-white font-heading font-bold text-sm">✓</span>
                </div>
                <p className="font-paragraph text-base text-charcoal-black leading-relaxed">
                  Specialist support for pre-/postnatal training and women's health
                </p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-soft-bronze flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-soft-white font-heading font-bold text-sm">✓</span>
                </div>
                <p className="font-paragraph text-base text-charcoal-black leading-relaxed">
                  Realistic programmes that work around family, work, and energy levels
                </p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-soft-bronze flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-soft-white font-heading font-bold text-sm">✓</span>
                </div>
                <p className="font-paragraph text-base text-charcoal-black leading-relaxed">
                  A focus on sustainable fat loss, strength, and confidence — not extremes
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Testimonial Section */}
      <section className="py-24 px-8 lg:px-20 bg-warm-sand-beige">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-5xl font-bold text-charcoal-black mb-8">
            Real Results From Real Women
          </h2>
          <div className="bg-soft-white rounded-2xl p-12 border border-warm-sand-beige">
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-soft-bronze text-2xl">★</span>
              ))}
            </div>
            <p className="font-paragraph text-xl text-charcoal-black mb-6 leading-relaxed italic">
              "I was sceptical about online coaching, but it's been a game-changer. I can train at 6am before the kids wake up, and the flexibility is perfect for my busy life. Plus, having weekly check-ins keeps me accountable. I've never felt stronger."
            </p>
            <p className="font-heading text-lg font-bold text-charcoal-black">
              Sarah, 38 • Postpartum Coach Client
            </p>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-24 px-8 lg:px-20 bg-charcoal-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-5xl font-bold text-soft-white mb-6">
            Ready to Transform From Home?
          </h2>
          <p className="font-paragraph text-lg text-warm-grey mb-8">
            Start your online coaching journey today. No gym. No excuses. Just real results.
          </p>
          <button
            onClick={scrollToForm}
            className="inline-flex items-center gap-2 bg-soft-bronze text-soft-white px-10 py-5 rounded-full font-medium text-lg hover:bg-soft-white hover:text-charcoal-black transition-colors"
          >
            Get Started Now <ArrowRight size={20} />
          </button>
        </div>
      </section>
      {/* Contact Form Section */}
      <section ref={contactFormRef} className="py-24 px-8 lg:px-20 bg-soft-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-4">
              Let's Get Started
            </h2>
            <p className="font-paragraph text-lg text-warm-grey">
              Fill out the form below and I'll be in touch within 24 hours to discuss your personalised coaching plan.
            </p>
          </div>

          <div className="bg-warm-sand-beige/30 border border-warm-sand-beige rounded-2xl p-8 md:p-12">
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-6 bg-soft-white rounded-xl border border-warm-sand-beige">
                <AlertCircle className="text-soft-bronze flex-shrink-0 mt-1" size={20} />
                <div>
                  <h3 className="font-heading text-lg font-bold text-charcoal-black mb-2">
                    Next Steps
                  </h3>
                  <ol className="font-paragraph text-base text-warm-grey space-y-2">
                    <li><span className="font-bold">1.</span> Complete the PAR-Q questionnaire on our <Link to="/parq" className="text-soft-bronze hover:underline">health form page</Link></li>
                    <li><span className="font-bold">2.</span> Schedule your free 15-minute consultation call</li>
                    <li><span className="font-bold">3.</span> Start your personalised online coaching program</li>
                  </ol>
                </div>
              </div>

              <Link
                to="/parq"
                className="block w-full bg-charcoal-black text-soft-white text-center py-4 rounded-lg font-medium text-lg hover:bg-soft-bronze transition-colors"
              >
                Complete Health Questionnaire
              </Link>

              <div className="text-center pt-6 border-t border-warm-sand-beige">
                <p className="font-paragraph text-base text-warm-grey mb-4">
                  Or reach out directly:
                </p>
                <a
                  href="mailto:hello@motivasi.co.uk"
                  className="text-soft-bronze font-medium hover:underline"
                >
                  hello@motivasi.co.uk
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Comparison Section */}
      <section className="py-24 px-8 lg:px-20 bg-warm-sand-beige/30">
        <div className="max-w-[100rem] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-5xl font-bold text-charcoal-black mb-6">
              Online vs In-Person Coaching
            </h2>
            <p className="font-paragraph text-xl text-charcoal-black">
              Both work — but one is designed for busy women.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-warm-sand-beige">
                  <th className="text-left py-4 px-6 font-heading text-lg font-bold text-charcoal-black">Feature</th>
                  <th className="text-center py-4 px-6 font-heading text-lg font-bold text-charcoal-black bg-soft-bronze/5">Online</th>
                  <th className="text-center py-4 px-6 font-heading text-lg font-bold text-charcoal-black">In-Person</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Flexibility", online: "✔ Train anytime, anywhere", inPerson: "✗ Fixed schedule" },
                  { feature: "Cost", online: "✔ More affordable", inPerson: "✗ Higher cost" },
                  { feature: "Privacy", online: "✔ Train at home", inPerson: "✗ Gym environment" },
                  { feature: "Real-time form correction", online: "✔ Video reviews", inPerson: "✔ Hands-on" },
                  { feature: "Recorded workouts", online: "✔ Watch anytime", inPerson: "✗ Not available" },
                  { feature: "24/7 messaging support", online: "✔ Always available", inPerson: "✗ Limited" },
                  { feature: "Hands-on adjustments", online: "✗ Not possible", inPerson: "✔ Yes" },
                  { feature: "Travel required", online: "✔ None", inPerson: "✗ Yes" }
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-warm-sand-beige hover:bg-soft-white/50 transition-colors">
                    <td className="py-4 px-6 font-paragraph font-medium text-charcoal-black">{row.feature}</td>
                    <td className="py-4 px-6 text-center font-paragraph text-warm-grey bg-soft-bronze/5">{row.online}</td>
                    <td className="py-4 px-6 text-center font-paragraph text-warm-grey">{row.inPerson}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Decision Prompt */}
          <div className="mt-16 bg-soft-white border border-warm-sand-beige rounded-2xl p-8 md:p-12">
            <p className="font-paragraph text-lg text-charcoal-black leading-relaxed mb-8">
              Not sure which option is right for you? If your schedule changes week to week, online coaching gives you expert support without the pressure of fixed appointments. Most of my clients choose online coaching for flexibility, accountability, and long-term results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/online-training"
                className="flex-1 bg-charcoal-black text-soft-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-soft-bronze transition-colors text-center"
              >
                View Online Coaching Options
              </Link>
              <Link
                to="/blog"
                className="flex-1 border-2 border-charcoal-black text-charcoal-black px-8 py-4 rounded-lg font-medium text-lg hover:bg-warm-sand-beige/30 transition-colors text-center"
              >
                Book In-Person Training
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
