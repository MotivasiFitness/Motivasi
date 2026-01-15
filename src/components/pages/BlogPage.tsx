import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Users, CheckCircle, ArrowRight, Mail, AlertCircle } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useLanguage } from '@/i18n/LanguageContext';
import { BaseCrudService } from '@/integrations';
import { sendContactFormNotification } from '@/lib/email-service';

export default function FaceToFaceTrainingPage() {
  const { t } = useLanguage();
  const contactFormRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    healthDataConsent: false,
    marketingConsent: false
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const scrollToForm = () => {
    contactFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Save form submission to CMS
      await BaseCrudService.create('contactformsubmissions', {
        _id: crypto.randomUUID(),
        fullName: formData.name,
        email: formData.email,
        message: formData.message,
        healthDataConsent: formData.healthDataConsent,
        marketingConsent: formData.marketingConsent,
        submittedAt: new Date().toISOString(),
        source: 'Face-to-Face Training Page'
      });

      // Send email notification
      await sendContactFormNotification(
        formData.name,
        formData.email,
        formData.message,
        formData.healthDataConsent,
        formData.marketingConsent,
        'Face-to-Face Training Page'
      );

      setIsSubmitted(true);
      setFormData({ name: '', email: '', message: '', healthDataConsent: false, marketingConsent: false });
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      setSubmitError('An error occurred. Please contact us directly at hello@motivasi.co.uk');
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-soft-white">
      {/* Hero Section */}
      <section className="py-24 px-8 lg:px-20 bg-warm-sand-beige">
        <div className="max-w-[100rem] mx-auto text-center">
          <h1 className="font-heading text-6xl font-bold text-charcoal-black mb-6">
            {t.blog.faceToFacePersonalTraining}
          </h1>
          <p className="font-paragraph text-xl text-charcoal-black max-w-3xl mx-auto">
            {t.blog.personalisedOneOnOne}
          </p>
        </div>
      </section>
      {/* Training Options Section */}
      <section className="py-24 px-8 lg:px-20">
        <div className="max-w-[100rem] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-5xl font-bold text-charcoal-black mb-6">
              {t.blog.trainingOptions}
            </h2>
            <p className="font-paragraph text-xl text-charcoal-black max-w-3xl mx-auto">
              {t.blog.choosePackage}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: t.blog.eightWeekPackage,
                price: "£640",
                duration: t.blog.sixteenSessions,
                description: t.blog.buildMomentum,
                features: [
                  t.blog.progressiveTraining,
                  t.blog.nutritionGuidance,
                  t.blog.formAnalysisAdjustments,
                  t.blog.priorityScheduling
                ],
                featured: true
              },
              {
                title: t.blog.twelveWeekTransformation,
                price: "£960",
                duration: t.blog.twentyFourSessions,
                description: t.blog.completeTransformation,
                features: [
                  t.blog.personalisedTrainingSessions,
                  t.blog.nutritionGuidance,
                  t.blog.progressTracking,
                  t.blog.flexibleScheduling
                ]
              }
            ].map((package_, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-8 transition-all duration-300 ${
                  package_.featured
                    ? 'bg-charcoal-black text-soft-white border-2 border-soft-bronze shadow-xl'
                    : 'bg-soft-white border border-warm-sand-beige hover:border-soft-bronze'
                }`}
              >
                {package_.featured && (
                  <div className="inline-block bg-soft-bronze text-soft-white px-4 py-1 rounded-full text-sm font-medium mb-4">
                    {t.blog.mostPopular}
                  </div>
                )}
                <h3 className={`font-heading text-3xl font-bold mb-2 ${package_.featured ? 'text-soft-white' : 'text-charcoal-black'}`}>
                  {package_.title}
                </h3>
                <div className={`flex items-baseline gap-2 mb-2 ${package_.featured ? 'text-soft-bronze' : 'text-soft-bronze'}`}>
                  <span className="font-heading text-4xl font-bold">{package_.price}</span>
                  <span className={package_.featured ? 'text-warm-grey' : 'text-warm-grey'}>
                    {package_.duration}
                  </span>
                </div>
                <p className={`font-paragraph mb-8 ${package_.featured ? 'text-warm-grey' : 'text-charcoal-black'}`}>
                  {package_.description}
                </p>
                <ul className="space-y-4 mb-8">
                  {package_.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle size={20} className={`flex-shrink-0 mt-0.5 ${package_.featured ? 'text-soft-bronze' : 'text-soft-bronze'}`} />
                      <span className={`font-paragraph ${package_.featured ? 'text-soft-white/90' : 'text-charcoal-black'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={scrollToForm}
                  className={`w-full py-3 rounded-lg font-medium text-lg transition-all duration-300 ${
                    package_.featured
                      ? 'bg-soft-bronze text-soft-white hover:bg-soft-white hover:text-charcoal-black'
                      : 'bg-charcoal-black text-soft-white hover:bg-soft-bronze'
                  }`}
                >
                  {t.blog.getStarted}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* UK-Based Service Notice */}
      <section className="py-12 px-8 lg:px-20 bg-soft-bronze">
        <div className="max-w-[100rem] mx-auto">
          <div className="text-center">
            <p className="font-paragraph text-lg font-medium text-soft-white">
              ✓ <span className="font-bold">UK-Based Service Only</span> - Face-to-face training is available exclusively in the United Kingdom. For online coaching available worldwide, please visit our packages page.
            </p>
          </div>
        </div>
      </section>
      {/* Locations Section */}
      <section className="py-24 px-8 lg:px-20 bg-charcoal-black">
        <div className="max-w-[100rem] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-5xl font-bold text-soft-white mb-6">
              {t.blog.serviceAreas}
            </h2>
            <p className="font-paragraph text-xl text-warm-grey max-w-3xl mx-auto">
              {t.blog.providesFaceToFace}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {['Harpenden', 'Berkhamsted', 'Redbourn', 'Tring', 'Wheathampstead', 'St Albans'].map((location) => (
              <div
                key={location}
                className="bg-soft-white/10 border border-soft-bronze/30 rounded-xl p-6 text-center hover:bg-soft-bronze/10 transition-colors duration-300"
              >
                <MapPin className="w-8 h-8 text-soft-bronze mx-auto mb-3" />
                <h3 className="font-heading text-xl font-bold text-soft-white">
                  {location}
                </h3>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="font-paragraph text-lg text-warm-grey max-w-2xl mx-auto">
              {t.blog.cantFindLocation}
            </p>
          </div>
        </div>
      </section>
      {/* Why Face-to-Face Section */}
      <section className="py-24 px-8 lg:px-20 bg-warm-sand-beige/30">
        <div className="max-w-[100rem] mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-heading text-5xl font-bold text-charcoal-black mb-8">
                {t.blog.whyChooseFaceToFace}
              </h2>
              <div className="space-y-6">
                {[
                  {
                    icon: <Users size={24} />,
                    title: t.blog.realTimeFeedback,
                    desc: t.blog.realTimeFeedbackDesc
                  },
                  {
                    icon: <Clock size={24} />,
                    title: t.blog.accountabilityMotivation,
                    desc: t.blog.accountabilityMotivationDesc
                  },
                  {
                    icon: <MapPin size={24} />,
                    title: t.blog.flexibleLocations,
                    desc: t.blog.flexibleLocationsDesc
                  },
                  {
                    icon: <CheckCircle size={24} />,
                    title: t.blog.personalisedProgression,
                    desc: t.blog.personalisedProgressionDesc
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-soft-bronze flex items-center justify-center flex-shrink-0 text-soft-white">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-bold text-charcoal-black mb-2">
                        {item.title}
                      </h3>
                      <p className="font-paragraph text-charcoal-black/70">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square w-full rounded-2xl overflow-hidden">
                <Image
                  src="https://static.wixstatic.com/media/93e866_befb471af6704f8eacfde13d90bf0e65~mv2.png"
                  className="w-full h-full object-cover"
                  width={600}
                  originWidth={611}
                  originHeight={623}
                  focalPointX={75.20458265139116}
                  focalPointY={27.72873194221509} />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Contact Section */}
      <section className="py-24 px-8 lg:px-20 bg-charcoal-black">
        <div className="max-w-[100rem] mx-auto">
          <div className="grid md:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div>
              <h2 className="font-heading text-5xl font-bold text-soft-white mb-8">
                {t.blog.getInTouch}
              </h2>
              <p className="font-paragraph text-lg text-warm-grey mb-12">
                {t.blog.readyToStart}
              </p>

              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-soft-bronze flex items-center justify-center flex-shrink-0">
                    <Mail size={20} className="text-soft-white" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-soft-white mb-1">
                      Email
                    </h3>
                    <a href="mailto:hello@motivasi.co.uk" className="font-paragraph text-warm-grey hover:text-soft-bronze transition-colors">
                      hello@motivasi.co.uk
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-soft-bronze flex items-center justify-center flex-shrink-0">
                    <MapPin size={20} className="text-soft-white" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-soft-white mb-1">
                      Locations
                    </h3>
                    <p className="font-paragraph text-warm-grey">
                      Harpenden, Berkhamsted, Redbourn, Tring, Wheathampstead, St Albans
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div ref={contactFormRef} className="bg-soft-white rounded-2xl p-8 md:p-12">
              <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-6">
                {t.blog.sendMessage}
              </h3>
              {isSubmitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
                  <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-paragraph text-sm text-green-800">
                      Thank you! Your message has been sent successfully. We'll get back to you within 24 hours.
                    </p>
                  </div>
                </div>
              )}
              {submitError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-paragraph text-sm text-red-800">
                      {submitError}
                    </p>
                  </div>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                    {t.blog.fullName}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                    {t.blog.emailAddress}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                    {t.blog.message}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph resize-none"
                    placeholder="Tell me about your fitness goals..."
                  />
                </div>

                {/* Privacy Notice */}
                <div className="bg-warm-sand-beige/30 border border-warm-sand-beige rounded-lg p-4">
                  <p className="font-paragraph text-xs text-charcoal-black leading-relaxed">
                    By submitting this form, you acknowledge that your personal data will be used to respond to your enquiry, manage bookings, and provide personal training services in accordance with our <Link to="/privacy" className="text-soft-bronze hover:underline">Privacy & Cookie Policy</Link>.
                  </p>
                </div>

                {/* Consent Checkboxes */}
                <div className="space-y-4">
                  {/* Health Data Consent - Required */}
                  <div className="flex items-start gap-3 p-3 bg-soft-white border border-warm-sand-beige rounded-lg">
                    <input
                      type="checkbox"
                      id="healthDataConsent"
                      name="healthDataConsent"
                      checked={formData.healthDataConsent}
                      onChange={handleInputChange}
                      required
                      className="w-4 h-4 accent-soft-bronze mt-0.5 flex-shrink-0 cursor-pointer"
                    />
                    <label htmlFor="healthDataConsent" className="font-paragraph text-xs text-charcoal-black cursor-pointer flex-1">
                      <span className="text-soft-bronze font-bold">*</span> I consent to Motivasi collecting and processing my health and fitness information for the purpose of delivering a personalised training programme, in accordance with the <Link to="/privacy" className="text-soft-bronze hover:underline">Privacy & Cookie Policy</Link>.
                    </label>
                  </div>

                  {/* Marketing Consent - Optional */}
                  <div className="flex items-start gap-3 p-3 bg-soft-white border border-warm-sand-beige rounded-lg">
                    <input
                      type="checkbox"
                      id="marketingConsent"
                      name="marketingConsent"
                      checked={formData.marketingConsent}
                      onChange={handleInputChange}
                      className="w-4 h-4 accent-soft-bronze mt-0.5 flex-shrink-0 cursor-pointer"
                    />
                    <label htmlFor="marketingConsent" className="font-paragraph text-xs text-charcoal-black cursor-pointer flex-1">
                      I would like to receive updates, offers, and marketing communications from Motivasi. I understand I can unsubscribe at any time.
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-charcoal-black text-soft-white py-3 rounded-lg font-medium text-lg hover:bg-soft-bronze transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? t.blog.sending : t.blog.sendBtn}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      {/* Final CTA Section */}
      <section className="py-24 px-8 lg:px-20 bg-soft-bronze">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-5xl font-bold text-soft-white mb-6">
            {t.blog.readyToTransform}
          </h2>
          <p className="font-paragraph text-lg text-soft-white mb-8">
            {t.blog.startYourJourney}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={scrollToForm}
              className="bg-soft-white text-soft-bronze px-8 py-4 rounded-lg font-medium text-lg hover:bg-opacity-90 transition-colors"
            >
              {t.blog.bookConsultation}
            </button>
            <Link
              to="/"
              className="border-2 border-soft-white text-soft-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2"
            >
              {t.blog.backToHome}
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
