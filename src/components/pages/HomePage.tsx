// HPI 1.6-G
import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Star, Activity, Heart, Zap, ShieldCheck } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { BaseCrudService } from '@/integrations';
import { ClientTestimonials } from '@/entities';

// --- Utility Components ---

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  width?: "fit-content" | "100%";
};

const Reveal: React.FC<RevealProps> = ({ children, className = "", delay = 0.25, width = "fit-content" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-75px" });
  const mainControls = useAnimation();
  const slideControls = useAnimation();

  useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
      slideControls.start("visible");
    }
  }, [isInView, mainControls, slideControls]);

  return (
    <div ref={ref} style={{ position: "relative", width, overflow: "hidden" }} className={className}>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 75 },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate={mainControls}
        transition={{ duration: 0.8, delay: delay, ease: [0.25, 0.25, 0.25, 0.75] }}
      >
        {children}
      </motion.div>
    </div>
  );
};

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

import { useAnimation } from 'framer-motion';

// --- Main Component ---

export default function HomePage() {
  // --- Data Fidelity Protocol: Identify, Canonize, Preserve ---
  const [testimonials, setTestimonials] = useState<ClientTestimonials[]>([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { items } = await BaseCrudService.getAll<ClientTestimonials>('clienttestimonials');
      setTestimonials(items.filter(t => t.featuredOnHomepage));
    };
    fetchTestimonials();
  }, []);

  // --- Scroll Progress for Parallax ---
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="bg-soft-white min-h-screen w-full overflow-clip font-paragraph text-charcoal-black selection:bg-soft-bronze selection:text-soft-white">
      
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-soft-bronze origin-left z-50"
        style={{ scaleX }}
      />

      {/* --- Hero Section --- */}
      <section className="relative min-h-screen w-full flex flex-col lg:flex-row overflow-hidden">
        {/* Left Content */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-20 py-20 lg:py-0 z-10 bg-soft-white">
          <div className="max-w-2xl">
            <AnimatedElement className="mb-6">
              <span className="inline-block py-1 px-3 border border-soft-bronze rounded-full text-soft-bronze text-sm tracking-widest uppercase font-medium">
                Motivasi - Online Coaching for Women 35+
              </span>
            </AnimatedElement>
            
            <div className="relative z-20">
              <h1 className="font-heading text-6xl md:text-7xl lg:text-8xl font-bold text-charcoal-black leading-[0.9] mb-8 tracking-tight">
                <span className="block overflow-hidden">
                  <motion.span 
                    initial={{ y: "100%" }} 
                    animate={{ y: 0 }} 
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="block"
                  >
                    Sculpt Your
                  </motion.span>
                </span>
                <span className="block overflow-hidden text-soft-bronze">
                  <motion.span 
                    initial={{ y: "100%" }} 
                    animate={{ y: 0 }} 
                    transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="block"
                  >
                    Strength.
                  </motion.span>
                </span>
              </h1>
            </div>

            <AnimatedElement className="mb-10 delay-300">
              <p className="text-xl md:text-2xl text-warm-grey leading-relaxed max-w-lg">
                I help busy women achieve fat loss and strength without extreme diets, intimidation, or hours in the gym.
              </p>
            </AnimatedElement>

            <AnimatedElement className="flex flex-wrap gap-4 delay-500">
              <Link
                to="/store"
                className="group relative overflow-hidden bg-charcoal-black text-soft-white px-10 py-5 rounded-full font-medium text-lg transition-all hover:shadow-xl hover:shadow-soft-bronze/20"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Your Journey <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-soft-bronze transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-out" />
              </Link>
              <Link
                to="/about"
                className="group flex items-center gap-2 px-10 py-5 rounded-full border border-charcoal-black/20 text-charcoal-black font-medium text-lg hover:bg-warm-sand-beige/30 transition-colors"
              >
                My Philosophy
              </Link>
            </AnimatedElement>
          </div>
        </div>

        {/* Right Image - Parallax */}
        <div className="w-full lg:w-1/2 h-[60vh] lg:h-auto relative overflow-hidden">
          <motion.div 
            className="absolute inset-0 w-full h-[120%]"
            style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]) }}
          >
            <Image
              src="https://static.wixstatic.com/media/93e866_0c32b146b6f94ee985fbf7c231d824b1~mv2.png?originWidth=1152&originHeight=640"
              alt="Woman performing a confident strength training movement"
              className="w-full h-full object-cover"
              width={1200}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-soft-white/20 to-transparent lg:from-soft-white lg:via-transparent" />
          </motion.div>
        </div>
      </section>

      {/* --- Marquee Section --- */}
      <div className="py-8 bg-charcoal-black overflow-hidden whitespace-nowrap border-y border-soft-bronze/20">
        <motion.div 
          className="flex gap-16 items-center"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
        >
          {[...Array(4)].map((_, i) => (
            <React.Fragment key={i}>
              <span className="text-4xl md:text-5xl font-heading text-soft-white/90">Strength</span>
              <span className="text-2xl text-soft-bronze">✦</span>
              <span className="text-4xl md:text-5xl font-heading text-soft-white/90">Confidence</span>
              <span className="text-2xl text-soft-bronze">✦</span>
              <span className="text-4xl md:text-5xl font-heading text-soft-white/90">Balance</span>
              <span className="text-2xl text-soft-bronze">✦</span>
              <span className="text-4xl md:text-5xl font-heading text-soft-white/90">Nutrition</span>
              <span className="text-2xl text-soft-bronze">✦</span>
            </React.Fragment>
          ))}
        </motion.div>
      </div>

      {/* --- The Philosophy (Text Heavy / Editorial) --- */}
      <section className="py-32 px-8 lg:px-20 bg-warm-sand-beige/30">
        <div className="max-w-[100rem] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-5 relative">
            <div className="sticky top-32">
              <AnimatedElement>
                <h2 className="font-heading text-5xl md:text-6xl font-bold text-charcoal-black mb-8 leading-tight">
                  The Transformation <br/>
                  <span className="text-soft-bronze italic">You Deserve.</span>
                </h2>
              </AnimatedElement>
              <AnimatedElement className="delay-200">
                <div className="w-24 h-1 bg-soft-bronze mb-8" />
                <p className="text-lg text-warm-grey mb-6">
                  You've tried the crash diets. You've done the endless cardio. It's time for a sustainable approach that honours your body and your busy life.
                </p>
                <Link to="/about" className="text-charcoal-black font-medium border-b border-soft-bronze pb-1 hover:text-soft-bronze transition-colors inline-flex items-center gap-2">
                  Read full bio <ArrowRight size={16} />
                </Link>
              </AnimatedElement>
            </div>
          </div>

          <div className="lg:col-span-7 grid gap-12">
            {[
              {
                icon: <ShieldCheck className="w-8 h-8 text-soft-white" />,
                title: "No Extreme Diets",
                desc: "Sustainable nutrition strategies that fit your busy lifestyle without deprivation. We focus on fueling your body, not starving it."
              },
              {
                icon: <Zap className="w-8 h-8 text-soft-white" />,
                title: "Build Real Strength",
                desc: "Progressive training programs designed to build confidence and capability. Feel stronger carrying groceries, playing with kids, and living life."
              },
              {
                icon: <Activity className="w-8 h-8 text-soft-white" />,
                title: "Sustainable Results",
                desc: "We build habits that last a lifetime. This isn't a 6-week fix; it's a blueprint for a healthier, stronger future you."
              }
            ].map((item, idx) => (
              <AnimatedElement key={idx} className="group bg-soft-white p-10 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 border border-warm-sand-beige/50">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-16 h-16 rounded-2xl bg-charcoal-black flex items-center justify-center flex-shrink-0 group-hover:bg-soft-bronze transition-colors duration-500">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-heading text-3xl font-bold text-charcoal-black mb-3 group-hover:text-soft-bronze transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-warm-grey text-lg leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </AnimatedElement>
            ))}
          </div>
        </div>
      </section>

      {/* --- Visual Breather (Parallax) --- */}
      <section className="relative h-[80vh] w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://static.wixstatic.com/media/93e866_fbf7abc4f3c0487f9fd5df715654d232~mv2.png?originWidth=1600&originHeight=768"
            alt="Serene training environment"
            className="w-full h-full object-cover"
            width={1600}
          />
          <div className="absolute inset-0 bg-charcoal-black/40" />
        </div>
        <div className="relative z-10 text-center max-w-4xl px-8">
          <AnimatedElement>
            <h2 className="font-heading text-5xl md:text-7xl text-soft-white font-bold mb-8 leading-tight">
              "Strength is not just physical.<br/>It's a state of mind."
            </h2>
            <p className="font-paragraph text-xl md:text-2xl text-warm-grey">
              Head Coach Natalie
            </p>
          </AnimatedElement>
        </div>
      </section>

      {/* --- Sticky Signature Offer Section --- */}
      <section className="relative bg-soft-white py-32 px-8 lg:px-20">
        <div className="max-w-[100rem] mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
            
            {/* Left: Scrollable Details */}
            <div className="w-full lg:w-1/2 space-y-24">
              <div>
                <AnimatedElement>
                  <span className="text-soft-bronze font-medium tracking-widest uppercase mb-4 block">The Signature Package</span>
                  <h2 className="font-heading text-5xl md:text-6xl font-bold text-charcoal-black mb-8">
                    Everything You Need to Succeed
                  </h2>
                  <p className="text-xl text-warm-grey leading-relaxed">
                    My signature online coaching package is designed specifically for the busy woman. No guesswork, just a clear path to your goals.
                  </p>
                </AnimatedElement>
              </div>

              <div className="space-y-16">
                {[
                  {
                    title: "4 Personalised Programs",
                    desc: "Tailored strength training plans that evolve with you. Whether you train at home or the gym, your program fits your schedule.",
                    image: "https://static.wixstatic.com/media/93e866_7d48abe991484564b3dbdd6baf6b5d8a~mv2.png?originWidth=768&originHeight=448"
                  },
                  {
                    title: "Weekly Check-ins",
                    desc: "We review your progress every single week. I'll adjust your plan, answer questions, and keep you accountable.",
                    image: "https://static.wixstatic.com/media/93e866_cabe766402e14ec98f048ee9b1a0a4eb~mv2.png?originWidth=768&originHeight=448"
                  },
                  {
                    title: "Nutrition Guidance",
                    desc: "No meal plans that leave you hungry. Learn how to fuel your body with sustainable eating strategies that include the foods you love.",
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
                    <p className="text-lg text-warm-grey leading-relaxed">{feature.desc}</p>
                  </AnimatedElement>
                ))}
              </div>
            </div>

            {/* Right: Sticky Pricing Card */}
            <div className="w-full lg:w-1/2 relative">
              <div className="sticky top-32">
                <div className="bg-charcoal-black text-soft-white p-10 md:p-14 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                  {/* Decorative background element */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-soft-bronze/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  
                  <div className="relative z-10">
                    <h3 className="font-heading text-4xl font-bold mb-2">Monthly Coaching</h3>
                    <p className="text-warm-grey mb-10">Cancel anytime. No hidden fees.</p>
                    
                    <div className="flex items-baseline gap-2 mb-10">
                      <span className="font-heading text-7xl font-bold text-soft-bronze">£150</span>
                      <span className="text-xl text-warm-grey">/ month</span>
                    </div>

                    <div className="space-y-4 mb-12">
                      {[
                        "Custom Training App Access",
                        "Form Analysis & Feedback",
                        "Habit Tracking & Lifestyle Coaching",
                        "Priority Support via WhatsApp",
                        "Monthly Strategy Calls"
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="w-6 h-6 rounded-full bg-soft-bronze/20 flex items-center justify-center flex-shrink-0">
                            <CheckCircle size={14} className="text-soft-bronze" />
                          </div>
                          <span className="text-lg text-soft-white/90">{item}</span>
                        </div>
                      ))}
                    </div>

                    <Link
                      to="/store"
                      className="block w-full bg-soft-bronze text-soft-white text-center py-5 rounded-xl font-medium text-lg hover:bg-soft-white hover:text-charcoal-black transition-all duration-300"
                    >
                      Secure Your Spot
                    </Link>
                    <p className="text-center text-sm text-warm-grey mt-4">Limited spaces available for new clients.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- Testimonials (Horizontal Scroll) --- */}
      {testimonials.length > 0 && (
        <section className="py-32 bg-warm-sand-beige overflow-hidden">
          <div className="px-8 lg:px-20 mb-16 flex flex-col md:flex-row justify-between items-end gap-8 max-w-[100rem] mx-auto">
            <div className="max-w-2xl">
              <AnimatedElement>
                <h2 className="font-heading text-5xl md:text-6xl font-bold text-charcoal-black mb-6">
                  Real Women.<br/>Real Results.
                </h2>
                <p className="text-xl text-charcoal-black/70">
                  Join a community of women redefining what strong looks and feels like.
                </p>
              </AnimatedElement>
            </div>
            <div className="hidden md:flex gap-4">
              {/* Visual decoration for scroll hint */}
              <div className="flex items-center gap-2 text-charcoal-black/50 text-sm uppercase tracking-widest">
                Scroll to explore <ArrowRight size={16} />
              </div>
            </div>
          </div>

          {/* Scroll Container */}
          <div className="flex overflow-x-auto snap-x snap-mandatory pb-12 px-8 lg:px-20 gap-8 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial._id} 
                className="snap-center flex-shrink-0 w-[85vw] md:w-[600px] bg-soft-white rounded-3xl p-8 md:p-12 shadow-sm relative group hover:shadow-xl transition-all duration-500"
              >
                <div className="absolute top-12 right-12 text-soft-bronze opacity-20">
                  <Star size={48} fill="currentColor" />
                </div>
                
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="flex gap-1 mb-8">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className="text-soft-bronze" fill="currentColor" />
                      ))}
                    </div>
                    <p className="font-heading text-2xl md:text-3xl text-charcoal-black leading-snug mb-8">
                      "{testimonial.testimonialText}"
                    </p>
                  </div>

                  <div className="flex items-center gap-6 pt-8 border-t border-warm-sand-beige">
                    {testimonial.transformationImage ? (
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-soft-white shadow-md">
                        <Image
                          src={testimonial.transformationImage}
                          alt={testimonial.clientName || "Client"}
                          className="w-full h-full object-cover"
                          width={100}
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-warm-sand-beige flex items-center justify-center text-charcoal-black font-bold text-xl">
                        {testimonial.clientName?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-lg text-charcoal-black">{testimonial.clientName}</h4>
                      <div className="flex flex-col sm:flex-row sm:gap-3 text-sm text-warm-grey">
                        {testimonial.clientAgeRange && <span>{testimonial.clientAgeRange}</span>}
                        {testimonial.keyAchievement && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <span className="text-soft-bronze font-medium">{testimonial.keyAchievement}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* Spacer for end of scroll */}
            <div className="w-8 flex-shrink-0" />
          </div>
        </section>
      )}

      {/* --- Final CTA --- */}
      <section className="relative py-32 px-8 lg:px-20 bg-charcoal-black overflow-hidden">
        <div className="absolute inset-0 opacity-20">
           <Image
              src="https://static.wixstatic.com/media/93e866_2d4f518df7c941ac89afe5c8f996af14~mv2.png?originWidth=1600&originHeight=768"
              alt="Texture"
              className="w-full h-full object-cover grayscale"
              width={1600}
            />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <AnimatedElement>
            <h2 className="font-heading text-6xl md:text-8xl font-bold text-soft-white mb-10 tracking-tight">
              Ready to feel <span className="text-soft-bronze">stronger?</span>
            </h2>
            <p className="text-xl md:text-2xl text-warm-grey mb-12 max-w-2xl mx-auto leading-relaxed">
              Your future self is waiting. Start your transformation today with a program built around your life.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                to="/store"
                className="w-full sm:w-auto bg-soft-bronze text-soft-white px-12 py-6 rounded-full font-medium text-xl hover:bg-soft-white hover:text-charcoal-black transition-all duration-300 shadow-lg shadow-soft-bronze/20"
              >
                Book Your Package (£150/mo)
              </Link>
              <Link
                to="/about"
                className="w-full sm:w-auto px-12 py-6 rounded-full border border-warm-grey/30 text-soft-white font-medium text-xl hover:bg-white/5 transition-colors"
              >
                Learn More About Me
              </Link>
            </div>
          </AnimatedElement>
        </div>
      </section>
    </div>
  );
}