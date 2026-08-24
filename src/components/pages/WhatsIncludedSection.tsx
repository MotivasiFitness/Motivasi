import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  MessageCircle, 
  RotateCw, 
  Heart, 
  Apple, 
  TrendingUp, 
  CheckCircle2 
} from 'lucide-react';

export default function WhatsIncludedSection() {
  const features = [
    {
      number: '01',
      title: '3 Coached Sessions Every Week',
      description: 'Three structured training sessions delivered through the app, designed to build strength, fitness and consistency.',
      supportingLine: '3 × 60-minute sessions',
      icon: Zap,
      isPrimary: true,
    },
    {
      number: '02',
      title: 'Direct Access to Your Coach',
      description: 'You\'re not left to figure it out alone. Communicate directly with your qualified personal trainer for guidance, accountability and adjustments.',
      icon: MessageCircle,
      isPrimary: true,
    },
    {
      number: '03',
      title: 'Cycle-Responsive Training',
      description: 'Training that uses your cycle and your real-world feedback as a flexible framework for adjusting intensity, recovery and progression.',
      icon: RotateCw,
      isPrimary: true,
    },
    {
      number: '04',
      title: 'Women\'s Life-Stage Support',
      description: 'Designed with women in mind through pre & postnatal, perimenopause and menopause.',
      icon: Heart,
      isPrimary: false,
    },
    {
      number: '05',
      title: 'Nutrition Guidance',
      description: 'Level 4 nutrition guidance to help you understand how food, training and recovery work together.',
      icon: Apple,
      isPrimary: false,
    },
    {
      number: '06',
      title: 'Recovery & Wellbeing Tracking',
      description: 'Track the things that matter — energy, mood, symptoms, sleep and how your body is responding.',
      icon: TrendingUp,
      isPrimary: false,
    },
    {
      number: '07',
      title: 'Progress & Coach Check-Ins',
      description: 'See your progress over time and use regular check-ins to decide what comes next.',
      icon: CheckCircle2,
      isPrimary: false,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <section className="w-full py-16 md:py-24 px-4 md:px-8 bg-soft-white">
      <div className="max-w-[100rem] mx-auto">
        {/* Mobile & Tablet Layout */}
        <div className="md:hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="font-heading text-4xl md:text-5xl text-charcoal-black mb-4">
              What's included.
            </h2>
            <p className="font-paragraph text-lg text-secondary-text leading-relaxed mb-8">
              Everything you need to train, progress and feel supported — all in one place.
            </p>
          </motion.div>

          {/* Mobile Feature List */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-8"
          >
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className={`pb-8 ${
                    index !== features.length - 1 ? 'border-b border-primary-bg/30' : ''
                  } ${feature.isPrimary ? 'opacity-100' : 'opacity-85'}`}
                >
                  <div className="flex gap-4 mb-3">
                    <div className="flex-shrink-0">
                      <IconComponent
                        className={`w-6 h-6 ${
                          feature.isPrimary
                            ? 'text-primary'
                            : 'text-secondary-text'
                        }`}
                        strokeWidth={1.5}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-paragraph font-semibold text-base md:text-lg text-charcoal-black mb-2">
                        {feature.title}
                      </h3>
                      <p className="font-paragraph text-sm md:text-base text-secondary-text leading-relaxed mb-2">
                        {feature.description}
                      </p>
                      {feature.supportingLine && (
                        <p className="font-paragraph text-xs md:text-sm text-secondary-text italic">
                          {feature.supportingLine}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Mobile CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-12 pt-8 border-t border-primary-bg/30"
          >
            <p className="font-paragraph text-center text-sm md:text-base text-secondary-text mb-8 leading-relaxed">
              <span className="block font-semibold text-charcoal-black mb-2">
                Not another workout library.
              </span>
              A coached training system built around women.
            </p>
            <Button
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-paragraph font-semibold"
            >
              Start Your Training Journey
            </Button>
          </motion.div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-warm-sand-beige rounded-3xl p-12 lg:p-16 border border-primary-bg/20 shadow-sm"
          >
            <div className="grid grid-cols-12 gap-12 lg:gap-16">
              {/* Left Column */}
              <div className="col-span-5">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <h2 className="font-heading text-5xl lg:text-6xl text-charcoal-black mb-6 leading-tight">
                    What's included.
                  </h2>
                  <p className="font-paragraph text-lg text-secondary-text leading-relaxed mb-12">
                    Everything you need to train, progress and feel supported — all in one place.
                  </p>

                  {/* Decorative Element */}
                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20"
                  />
                </motion.div>
              </div>

              {/* Right Column - Feature List */}
              <div className="col-span-7">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="space-y-6"
                >
                  {features.map((feature, index) => {
                    const IconComponent = feature.icon;
                    return (
                      <motion.div
                        key={index}
                        variants={itemVariants}
                        className={`pb-6 ${
                          index !== features.length - 1
                            ? 'border-b border-primary-bg/20'
                            : ''
                        } transition-opacity duration-300 ${
                          feature.isPrimary ? 'opacity-100' : 'opacity-75 hover:opacity-100'
                        }`}
                      >
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 pt-1">
                            <IconComponent
                              className={`w-5 h-5 ${
                                feature.isPrimary
                                  ? 'text-primary'
                                  : 'text-secondary-text'
                              }`}
                              strokeWidth={1.5}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-paragraph font-semibold text-base text-charcoal-black mb-1">
                              {feature.title}
                            </h3>
                            <p className="font-paragraph text-sm text-secondary-text leading-relaxed">
                              {feature.description}
                            </p>
                            {feature.supportingLine && (
                              <p className="font-paragraph text-xs text-secondary-text italic mt-1">
                                {feature.supportingLine}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* Desktop CTA Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  viewport={{ once: true }}
                  className="mt-10 pt-8 border-t border-primary-bg/20"
                >
                  <p className="font-paragraph text-center text-sm text-secondary-text mb-6 leading-relaxed">
                    <span className="block font-semibold text-charcoal-black mb-1">
                      Not another workout library.
                    </span>
                    A coached training system built around women.
                  </p>
                  <div className="flex justify-center">
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-paragraph font-semibold px-8"
                    >
                      Start Your Training Journey
                    </Button>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
