import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Download, AlertCircle } from 'lucide-react';
import PrivacyControls from '@/components/PrivacyControls';

export default function DataPrivacyPage() {
  return (
    <div className="bg-soft-white">
      {/* Header */}
      <section className="py-16 px-8 lg:px-20 bg-warm-sand-beige">
        <div className="max-w-[100rem] mx-auto">
          <Link
            to="/portal"
            className="inline-flex items-center gap-2 text-soft-bronze font-paragraph text-base hover:underline mb-8"
          >
            <ArrowLeft size={20} />
            Back to Portal
          </Link>
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-charcoal-black mb-4">
            Data Privacy & Controls
          </h1>
          <p className="font-paragraph text-lg text-charcoal-black">
            Manage your personal data and privacy settings with full transparency and control.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-8 lg:px-20">
        <div className="max-w-[100rem] mx-auto">
          <PrivacyControls />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-8 lg:px-20 bg-warm-sand-beige/20">
        <div className="max-w-[100rem] mx-auto">
          <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-12">
            Frequently Asked Questions
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Shield,
                title: 'How is my data protected?',
                description: 'We use industry-standard SSL encryption, secure servers, and regular security audits. Only authorised personnel have access to your data. We comply with UK GDPR and international data protection standards.',
              },
              {
                icon: Lock,
                title: 'Who can see my health data?',
                description: 'Your health and fitness data is only accessible to your assigned coaches and trainers. We never share this data with third parties without your explicit consent. You can change visibility settings anytime.',
              },
              {
                icon: Eye,
                title: 'Can I control what data is collected?',
                description: 'Yes. You can manage cookie preferences, opt out of analytics, and control whether your progress photos are used in testimonials. Some data collection is essential for service delivery.',
              },
              {
                icon: Download,
                title: 'How do I download my data?',
                description: 'You can request a download of all your personal data in a portable format. This includes your profile, health data, progress records, and communications. We will prepare this within 24 hours.',
              },
              {
                icon: AlertCircle,
                title: 'What happens if I delete my account?',
                description: 'Your account and all associated data will be permanently deleted within 30 days. Some data may be retained for legal or accounting purposes as required by law.',
              },
              {
                icon: Shield,
                title: 'How long is my data retained?',
                description: 'Retention periods vary: account data for 2 years after closure, health data for 7 years, payment records for 6 years. You can request deletion anytime, subject to legal requirements.',
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <Icon className="w-6 h-6 text-soft-bronze flex-shrink-0 mt-1" />
                    <h3 className="font-heading text-xl font-bold text-charcoal-black">
                      {item.title}
                    </h3>
                  </div>
                  <p className="font-paragraph text-base text-warm-grey leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Data Rights Section */}
      <section className="py-16 px-8 lg:px-20">
        <div className="max-w-[100rem] mx-auto">
          <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-12">
            Your Data Protection Rights
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: 'Right to Access',
                description: 'You have the right to request and receive a copy of all personal data we hold about you.',
                action: 'Request Data Access',
              },
              {
                title: 'Right to Rectification',
                description: 'You can request correction of any inaccurate or incomplete personal data.',
                action: 'Update Information',
              },
              {
                title: 'Right to Erasure',
                description: 'You can request deletion of your personal data (subject to legal retention requirements).',
                action: 'Request Deletion',
              },
              {
                title: 'Right to Data Portability',
                description: 'You can request your data in a portable, machine-readable format to transfer to another service.',
                action: 'Download Data',
              },
              {
                title: 'Right to Object',
                description: 'You can object to certain types of processing, including marketing communications and profiling.',
                action: 'Manage Preferences',
              },
              {
                title: 'Right to Withdraw Consent',
                description: 'You can withdraw consent for any processing at any time without affecting the lawfulness of prior processing.',
                action: 'Change Settings',
              },
            ].map((right, idx) => (
              <div key={idx} className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
                <h3 className="font-heading text-xl font-bold text-charcoal-black mb-3">
                  {right.title}
                </h3>
                <p className="font-paragraph text-base text-warm-grey leading-relaxed mb-6">
                  {right.description}
                </p>
                <button className="text-soft-bronze font-medium hover:underline transition-colors">
                  {right.action} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-8 lg:px-20 bg-charcoal-black text-soft-white">
        <div className="max-w-[100rem] mx-auto text-center">
          <h2 className="font-heading text-4xl font-bold mb-6">
            Questions About Your Privacy?
          </h2>
          <p className="font-paragraph text-lg text-warm-grey mb-8 max-w-2xl mx-auto">
            We're committed to transparency and protecting your data. Contact us anytime with privacy concerns or data requests.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:hello@motivasi.co.uk"
              className="inline-block bg-soft-bronze text-charcoal-black px-10 py-4 rounded-lg font-medium text-lg hover:bg-soft-white transition-colors"
            >
              Contact Us
            </a>
            <Link
              to="/privacy"
              className="inline-block border border-soft-bronze text-soft-bronze px-10 py-4 rounded-lg font-medium text-lg hover:bg-soft-bronze/10 transition-colors"
            >
              View Full Privacy Policy
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
