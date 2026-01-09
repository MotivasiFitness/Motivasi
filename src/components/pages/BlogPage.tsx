import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Users, CheckCircle, ArrowRight, Mail, Phone } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function FaceToFaceTrainingPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setFormData({ name: '', email: '', phone: '', message: '' });
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <div className="bg-soft-white">
      {/* Hero Section */}
      <section className="py-24 px-8 lg:px-20 bg-warm-sand-beige">
        <div className="max-w-[100rem] mx-auto text-center">
          <h1 className="font-heading text-6xl font-bold text-charcoal-black mb-6">
            Face-to-Face Personal Training
          </h1>
          <p className="font-paragraph text-xl text-charcoal-black max-w-3xl mx-auto">
            Personalised one-on-one coaching in a supportive environment. Transform your strength and confidence with direct guidance from a certified trainer.
          </p>
        </div>
      </section>

      {/* Training Options Section */}
      <section className="py-24 px-8 lg:px-20">
        <div className="max-w-[100rem] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-5xl font-bold text-charcoal-black mb-6">
              Training Options
            </h2>
            <p className="font-paragraph text-xl text-charcoal-black max-w-3xl mx-auto">
              Choose the package that fits your goals and schedule.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Single Session",
                price: "£60",
                duration: "60 minutes",
                description: "Perfect for trying out personal training or a one-off boost.",
                features: [
                  "Full body assessment",
                  "Customised workout",
                  "Form correction & guidance",
                  "Nutrition tips"
                ]
              },
              {
                title: "4-Week Package",
                price: "£200",
                duration: "4 sessions",
                description: "Build momentum with weekly sessions over a month.",
                features: [
                  "Weekly progressive training",
                  "Nutrition plan included",
                  "Form analysis & adjustments",
                  "Weekly check-ins",
                  "Priority scheduling"
                ],
                featured: true
              },
              {
                title: "12-Week Transformation",
                price: "£500",
                duration: "12 sessions",
                description: "Complete transformation programme with comprehensive support.",
                features: [
                  "Weekly personalised sessions",
                  "Custom nutrition guidance",
                  "Progress tracking & photos",
                  "Bi-weekly strategy calls",
                  "Flexible scheduling",
                  "Lifetime form video access"
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
                    Most Popular
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
                  className={`w-full py-3 rounded-lg font-medium text-lg transition-all duration-300 ${
                    package_.featured
                      ? 'bg-soft-bronze text-soft-white hover:bg-soft-white hover:text-charcoal-black'
                      : 'bg-charcoal-black text-soft-white hover:bg-soft-bronze'
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Face-to-Face Section */}
      <section className="py-24 px-8 lg:px-20 bg-warm-sand-beige/30">
        <div className="max-w-[100rem] mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-heading text-5xl font-bold text-charcoal-black mb-8">
                Why Choose Face-to-Face Training?
              </h2>
              <div className="space-y-6">
                {[
                  {
                    icon: <Users size={24} />,
                    title: "Real-Time Feedback",
                    desc: "Immediate form corrections and adjustments to maximise results and prevent injury."
                  },
                  {
                    icon: <Clock size={24} />,
                    title: "Accountability & Motivation",
                    desc: "Direct support and encouragement to keep you committed to your goals."
                  },
                  {
                    icon: <MapPin size={24} />,
                    title: "Flexible Locations",
                    desc: "Train at your preferred location—home, gym, or outdoor space."
                  },
                  {
                    icon: <CheckCircle size={24} />,
                    title: "Personalised Progression",
                    desc: "Your trainer adapts your programme based on real-time performance and feedback."
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
                  src="https://static.wixstatic.com/media/93e866_0f87c0e4fd364ec19d67523c7472a283~mv2.png?originWidth=576&originHeight=768"
                  alt="Personal training session"
                  className="w-full h-full object-cover"
                  width={600}
                />
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
                Get in Touch
              </h2>
              <p className="font-paragraph text-lg text-warm-grey mb-12">
                Ready to start your face-to-face training journey? Reach out to discuss your goals and find the perfect package for you.
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
                    <a href="mailto:hello@motivasi.com" className="font-paragraph text-warm-grey hover:text-soft-bronze transition-colors">
                      hello@motivasi.com
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-soft-bronze flex items-center justify-center flex-shrink-0">
                    <Phone size={20} className="text-soft-white" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-soft-white mb-1">
                      Phone
                    </h3>
                    <a href="tel:+447700000000" className="font-paragraph text-warm-grey hover:text-soft-bronze transition-colors">
                      +44 (0) 7700 000 000
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-soft-bronze flex items-center justify-center flex-shrink-0">
                    <MapPin size={20} className="text-soft-white" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-soft-white mb-1">
                      Location
                    </h3>
                    <p className="font-paragraph text-warm-grey">
                      Available for sessions across London and surrounding areas
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-soft-white rounded-2xl p-8 md:p-12">
              <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-6">
                Send a Message
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                    Full Name
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
                    Email Address
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
                  <label htmlFor="phone" className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                    placeholder="+44 (0) 7700 000 000"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                    Message
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

                <button
                  type="submit"
                  className="w-full bg-charcoal-black text-soft-white py-3 rounded-lg font-medium text-lg hover:bg-soft-bronze transition-colors duration-300"
                >
                  {isSubmitted ? 'Message Sent! 🎉' : 'Send Message'}
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
            Ready to Transform?
          </h2>
          <p className="font-paragraph text-lg text-soft-white mb-8">
            Start your face-to-face training journey today. Limited spaces available for new clients.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-soft-white text-soft-bronze px-8 py-4 rounded-lg font-medium text-lg hover:bg-opacity-90 transition-colors">
              Book a Consultation
            </button>
            <Link
              to="/"
              className="border-2 border-soft-white text-soft-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2"
            >
              Back to Home
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
