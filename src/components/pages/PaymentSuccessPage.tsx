import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Mail } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface LocationState {
  items: Array<{
    id: string;
    title: string;
    price: number;
    currency: string;
  }>;
  total: number;
  email: string;
}

export default function PaymentSuccessPage() {
  const { t } = useLanguage();
  const location = useLocation();
  const state = location.state as LocationState;

  // Fallback if user navigates directly
  if (!state) {
    return (
      <div className="bg-soft-white min-h-screen flex items-center justify-center px-8">
        <div className="text-center max-w-md">
          <h1 className="font-heading text-4xl font-bold text-charcoal-black mb-4">
            Payment Confirmation
          </h1>
          <p className="font-paragraph text-lg text-warm-grey mb-8">
            Thank you for your purchase. Please check your email for confirmation details.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-soft-bronze text-soft-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-charcoal-black transition-colors"
          >
            Back to Home
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-soft-white min-h-screen">
      {/* Success Section */}
      <section className="py-24 px-8 lg:px-20">
        <div className="max-w-4xl mx-auto">
          {/* Success Icon */}
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-charcoal-black mb-4">
              Payment Successful!
            </h1>
            <p className="font-paragraph text-xl text-warm-grey max-w-2xl mx-auto">
              Thank you for your purchase. Your coaching package is now active and we're excited to start your transformation journey.
            </p>
          </div>

          {/* Order Details */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Order Summary */}
            <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
              <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-6">
                Order Summary
              </h2>
              <div className="space-y-4 mb-6 pb-6 border-b border-warm-sand-beige">
                {state.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <p className="font-paragraph text-base text-charcoal-black">
                      {item.title}
                    </p>
                    <p className="font-paragraph font-medium text-charcoal-black">
                      {item.currency}{item.price.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <p className="font-heading text-lg font-bold text-charcoal-black">Total Paid</p>
                <p className="font-heading text-2xl font-bold text-soft-bronze">
                  £{state.total.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-warm-sand-beige/30 border border-warm-sand-beige rounded-2xl p-8">
              <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-6">
                What's Next?
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-soft-bronze text-soft-white flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="font-paragraph font-bold text-charcoal-black mb-1">
                      Check Your Email
                    </h3>
                    <p className="font-paragraph text-sm text-warm-grey">
                      We've sent a confirmation email to <span className="font-medium">{state.email}</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-soft-bronze text-soft-white flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="font-paragraph font-bold text-charcoal-black mb-1">
                      Complete Your Profile
                    </h3>
                    <p className="font-paragraph text-sm text-warm-grey">
                      We'll send you a link to set up your account and access your coaching materials
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-soft-bronze text-soft-white flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="font-paragraph font-bold text-charcoal-black mb-1">
                      Schedule Your First Session
                    </h3>
                    <p className="font-paragraph text-sm text-warm-grey">
                      We'll contact you within 24 hours to schedule your first coaching call
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-charcoal-black text-soft-white rounded-2xl p-8 mb-12">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <Mail className="w-6 h-6 text-soft-bronze flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-heading text-lg font-bold mb-2">Email Support</h3>
                  <a
                    href="mailto:hello@motivasi.co.uk"
                    className="font-paragraph text-warm-grey hover:text-soft-bronze transition-colors"
                  >
                    hello@motivasi.co.uk
                  </a>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-soft-bronze flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-heading text-lg font-bold mb-2">Confirmation Sent</h3>
                  <p className="font-paragraph text-warm-grey">
                    Check your inbox for your order confirmation
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="flex-1 bg-charcoal-black text-soft-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-soft-bronze transition-colors text-center"
            >
              Back to Home
            </Link>
            <Link
              to="/about"
              className="flex-1 border-2 border-charcoal-black text-charcoal-black px-8 py-4 rounded-lg font-medium text-lg hover:bg-warm-sand-beige/30 transition-colors text-center"
            >
              Learn More About Me
            </Link>
          </div>

          {/* FAQ Section */}
          <div className="mt-16 pt-12 border-t border-warm-sand-beige">
            <h2 className="font-heading text-3xl font-bold text-charcoal-black mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-heading text-lg font-bold text-charcoal-black mb-3">
                  When do I get access to my coaching?
                </h3>
                <p className="font-paragraph text-warm-grey">
                  You'll receive an email within 24 hours with instructions to set up your account and access your coaching materials. Your subscription is active immediately after payment.
                </p>
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-charcoal-black mb-3">
                  Can I cancel my subscription?
                </h3>
                <p className="font-paragraph text-warm-grey">
                  Yes, you can cancel anytime with no penalties. Just email us at hello@motivasi.co.uk and we'll process your cancellation within 24 hours.
                </p>
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-charcoal-black mb-3">
                  What if I have questions about my package?
                </h3>
                <p className="font-paragraph text-warm-grey">
                  Our support team is here to help! Email hello@motivasi.co.uk or call +44 (0) 7700 000 000 and we'll get back to you within 24 hours.
                </p>
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-charcoal-black mb-3">
                  Is my payment information secure?
                </h3>
                <p className="font-paragraph text-warm-grey">
                  Yes, all payments are processed securely using industry-standard encryption. We never store your full card details on our servers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
