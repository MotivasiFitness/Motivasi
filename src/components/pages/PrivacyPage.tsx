import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Shield, Lock } from 'lucide-react';

export default function PrivacyPage() {
  const sections = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'data-collection', title: 'Data Collection' },
    { id: 'data-usage', title: 'How We Use Your Data' },
    { id: 'legal-basis', title: 'Legal Basis for Processing' },
    { id: 'health-data', title: 'Health & Fitness Data' },
    { id: 'payments', title: 'Payment Information' },
    { id: 'data-sharing', title: 'Data Sharing' },
    { id: 'international-transfers', title: 'International Data Transfers' },
    { id: 'data-retention', title: 'Data Retention' },
    { id: 'user-rights', title: 'Your Rights' },
    { id: 'website-security', title: 'Website Security' },
    { id: 'cookies', title: 'Cookie Policy' },
    { id: 'children-privacy', title: 'Children\'s Privacy' },
    { id: 'policy-changes', title: 'Policy Changes' },
    { id: 'contact', title: 'Contact Information' },
  ];

  return (
    <div className="bg-soft-white">
      {/* Header */}
      <section className="py-16 px-8 lg:px-20 bg-warm-sand-beige">
        <div className="max-w-[100rem] mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-soft-bronze font-paragraph text-base hover:underline mb-8"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-charcoal-black mb-4">
            Privacy & Cookie Policy
          </h1>
          <p className="font-paragraph text-lg text-charcoal-black">
            Last updated: January 2026
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-8 lg:px-20">
        <div className="max-w-[100rem] mx-auto grid lg:grid-cols-4 gap-12">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 bg-soft-white border border-warm-sand-beige rounded-2xl p-6">
              <h3 className="font-heading text-lg font-bold text-charcoal-black mb-6">
                Contents
              </h3>
              <nav className="space-y-3">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block font-paragraph text-sm text-warm-grey hover:text-soft-bronze transition-colors"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-12">
            {/* Introduction */}
            <section id="introduction" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Introduction
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  Welcome to Motivasi ("we," "us," "our," or "Company"). We are committed to protecting your privacy and ensuring you have a positive experience on our website and when using our coaching services.
                </p>
                <p>
                  This Privacy & Cookie Policy explains how we collect, use, disclose, and safeguard your information when you visit our website (www.motivasi.co.uk) and use our services, including online coaching, personal training, and nutrition guidance.
                </p>
                <p>
                  Please read this policy carefully. If you do not agree with our policies and practices, please do not use our services. By accessing and using Motivasi, you acknowledge that you have read, understood, and agree to be bound by all the terms of this Privacy Policy.
                </p>
              </div>
            </section>

            {/* Data Collection */}
            <section id="data-collection" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Data Collection
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                    Information You Provide Directly
                  </h3>
                  <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                    <p>
                      We collect information you voluntarily provide when you:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-2">
                      <li>Create an account or register for our services</li>
                      <li>Complete the PAR-Q health questionnaire</li>
                      <li>Purchase coaching packages or services</li>
                      <li>Contact us via email, phone, or contact forms</li>
                      <li>Subscribe to our newsletter or communications</li>
                      <li>Participate in surveys, testimonials, or feedback forms</li>
                      <li>Upload progress photos or fitness data</li>
                    </ul>
                    <p className="mt-4">
                      This information may include: name, email address, phone number, date of birth, physical address, payment information, health and fitness data, body measurements, progress photos, dietary preferences, exercise history, and any other information you choose to share.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                    Information Collected Automatically
                  </h3>
                  <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                    <p>
                      When you visit our website, we automatically collect certain information:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-2">
                      <li>Device information (type, operating system, browser type)</li>
                      <li>IP address and location data</li>
                      <li>Pages visited and time spent on each page</li>
                      <li>Referral source (how you found us)</li>
                      <li>Cookies and similar tracking technologies</li>
                      <li>Search queries and interaction data</li>
                    </ul>
                    <p className="mt-4">
                      This information is collected through cookies, web beacons, and similar technologies to improve your browsing experience and understand how our website is used.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                    Information from Third Parties
                  </h3>
                  <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                    <p>
                      We may receive information about you from:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-2">
                      <li>Payment processors (for transaction verification)</li>
                      <li>Email service providers</li>
                      <li>Analytics platforms</li>
                      <li>Social media platforms (if you link your account)</li>
                      <li>Referral sources</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Usage */}
            <section id="data-usage" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                How We Use Your Data
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  We use the information we collect for the following purposes:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><span className="font-bold text-charcoal-black">Service Delivery:</span> To provide, maintain, and improve our coaching services, personalised training programs, and nutrition guidance</li>
                  <li><span className="font-bold text-charcoal-black">Account Management:</span> To create and manage your account, process payments, and send service-related communications</li>
                  <li><span className="font-bold text-charcoal-black">Health & Safety:</span> To assess your fitness level, identify any health risks, and ensure your safety during training</li>
                  <li><span className="font-bold text-charcoal-black">Communication:</span> To respond to your inquiries, send newsletters, updates, and promotional materials (with your consent)</li>
                  <li><span className="font-bold text-charcoal-black">Progress Tracking:</span> To monitor your progress, provide feedback, and adjust your training program</li>
                  <li><span className="font-bold text-charcoal-black">Analytics:</span> To understand how our website and services are used, identify trends, and improve user experience</li>
                  <li><span className="font-bold text-charcoal-black">Legal Compliance:</span> To comply with legal obligations, enforce our terms of service, and protect our rights</li>
                  <li><span className="font-bold text-charcoal-black">Marketing:</span> To send marketing communications, promotional offers, and updates (only with your consent)</li>
                  <li><span className="font-bold text-charcoal-black">Testimonials:</span> To feature your success story or testimonial on our website (only with your explicit consent)</li>
                </ul>
              </div>
            </section>

            {/* Legal Basis */}
            <section id="legal-basis" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Legal Basis for Processing
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  Under the UK General Data Protection Regulation (UK GDPR) and Data Protection Act 2018, we process your personal data on the following legal bases:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><span className="font-bold text-charcoal-black">Contract:</span> Processing necessary to perform our coaching services and fulfil your requests</li>
                  <li><span className="font-bold text-charcoal-black">Consent:</span> Where you have explicitly consented to specific processing (e.g., marketing emails, testimonials)</li>
                  <li><span className="font-bold text-charcoal-black">Legal Obligation:</span> Processing required by law (e.g., tax records, health and safety regulations)</li>
                  <li><span className="font-bold text-charcoal-black">Legitimate Interests:</span> Processing necessary for our legitimate business interests (e.g., fraud prevention, website analytics)</li>
                  <li><span className="font-bold text-charcoal-black">Vital Interests:</span> Processing necessary to protect your health and safety</li>
                </ul>
              </div>
            </section>

            {/* Health Data */}
            <section id="health-data" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Health & Fitness Data
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  Health and fitness information you provide (including PAR-Q responses, medical history, body measurements, progress photos, and fitness assessments) is considered "special category data" under UK GDPR.
                </p>
                <p>
                  <span className="font-bold text-charcoal-black">How We Protect It:</span>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>We only collect health data with your explicit consent</li>
                  <li>Health data is stored securely and accessed only by authorised personnel</li>
                  <li>We use health data solely to provide personalised coaching and ensure your safety</li>
                  <li>Health data is never shared with third parties without your explicit consent</li>
                  <li>You can request deletion of health data at any time (subject to legal retention requirements)</li>
                </ul>
                <p className="mt-4">
                  <span className="font-bold text-charcoal-black">Progress Photos:</span> If you upload progress photos, you retain full ownership and control. We will only use them as you direct (e.g., for your personal records, or with your consent, as a testimonial on our website). Progress photos are never shared publicly without your explicit written consent.
                </p>
              </div>
            </section>

            {/* Payments */}
            <section id="payments" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Payment Information
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  When you purchase our coaching services, we collect payment information including:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Card details (card number, expiry date, CVV)</li>
                  <li>Billing address</li>
                  <li>Transaction history</li>
                </ul>
                <p className="mt-4">
                  <span className="font-bold text-charcoal-black">Security:</span> All payment processing is handled by secure, PCI-DSS compliant payment processors. We do not store your full card details on our servers. Payment information is encrypted and transmitted securely.
                </p>
                <p>
                  <span className="font-bold text-charcoal-black">Refunds:</span> If you request a refund, we will process it through your original payment method. We retain transaction records for accounting and fraud prevention purposes.
                </p>
              </div>
            </section>

            {/* Data Sharing */}
            <section id="data-sharing" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Data Sharing
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  We do not sell, trade, or rent your personal information to third parties. However, we may share your data in the following circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><span className="font-bold text-charcoal-black">Service Providers:</span> We share data with trusted third parties who assist us (e.g., payment processors, email providers, hosting providers). These providers are contractually bound to protect your data.</li>
                  <li><span className="font-bold text-charcoal-black">Legal Requirements:</span> We may disclose data if required by law, court order, or government request.</li>
                  <li><span className="font-bold text-charcoal-black">Business Transfers:</span> If Motivasi is acquired or merged, your data may be transferred as part of that transaction.</li>
                  <li><span className="font-bold text-charcoal-black">Your Consent:</span> We may share data with your explicit consent (e.g., if you request we share your progress with another healthcare provider).</li>
                  <li><span className="font-bold text-charcoal-black">Aggregated Data:</span> We may share anonymised, aggregated data for research or analytics purposes.</li>
                </ul>
              </div>
            </section>

            {/* International Transfers */}
            <section id="international-transfers" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                International Data Transfers
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  Motivasi is based in the United Kingdom. Your data is primarily stored and processed within the UK. However, some of our service providers may be located outside the UK/EU.
                </p>
                <p>
                  <span className="font-bold text-charcoal-black">Data Protection:</span> When we transfer data internationally, we ensure appropriate safeguards are in place, including:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Standard Contractual Clauses (SCCs) approved by the UK ICO</li>
                  <li>Adequacy decisions (where applicable)</li>
                  <li>Your explicit consent</li>
                </ul>
                <p className="mt-4">
                  We comply with UK GDPR requirements for international data transfers and ensure your data receives equivalent protection regardless of where it is processed.
                </p>
              </div>
            </section>

            {/* Data Retention */}
            <section id="data-retention" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Data Retention
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  We retain your personal data for as long as necessary to provide our services and fulfil the purposes outlined in this policy. Retention periods vary depending on the type of data:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><span className="font-bold text-charcoal-black">Account Data:</span> Retained while your account is active and for 2 years after account closure (for legal and accounting purposes)</li>
                  <li><span className="font-bold text-charcoal-black">Health Data:</span> Retained for the duration of your coaching relationship plus 7 years (to comply with health and safety regulations)</li>
                  <li><span className="font-bold text-charcoal-black">Payment Records:</span> Retained for 6 years (to comply with tax and accounting regulations)</li>
                  <li><span className="font-bold text-charcoal-black">Marketing Communications:</span> Retained until you unsubscribe</li>
                  <li><span className="font-bold text-charcoal-black">Website Analytics:</span> Retained for up to 26 months</li>
                </ul>
                <p className="mt-4">
                  When data is no longer needed, we securely delete or anonymise it. You can request deletion of your data at any time, subject to legal retention requirements.
                </p>
              </div>
            </section>

            {/* User Rights */}
            <section id="user-rights" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Your Rights
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  Under UK GDPR, you have the following rights regarding your personal data:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><span className="font-bold text-charcoal-black">Right of Access:</span> You can request a copy of the personal data we hold about you</li>
                  <li><span className="font-bold text-charcoal-black">Right to Rectification:</span> You can request correction of inaccurate or incomplete data</li>
                  <li><span className="font-bold text-charcoal-black">Right to Erasure:</span> You can request deletion of your data (subject to legal retention requirements)</li>
                  <li><span className="font-bold text-charcoal-black">Right to Restrict Processing:</span> You can request we limit how we use your data</li>
                  <li><span className="font-bold text-charcoal-black">Right to Data Portability:</span> You can request your data in a portable format</li>
                  <li><span className="font-bold text-charcoal-black">Right to Object:</span> You can object to certain types of processing (e.g., marketing)</li>
                  <li><span className="font-bold text-charcoal-black">Right to Withdraw Consent:</span> You can withdraw consent for processing at any time</li>
                  <li><span className="font-bold text-charcoal-black">Right to Lodge a Complaint:</span> You can file a complaint with the UK Information Commissioner's Office (ICO)</li>
                </ul>
                <p className="mt-4">
                  To exercise any of these rights, please contact us at hello@motivasi.co.uk. We will respond to your request within 30 days.
                </p>
              </div>
            </section>

            {/* Website Security */}
            <section id="website-security" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Website Security
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  We implement comprehensive security measures to protect your personal data:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><span className="font-bold text-charcoal-black">SSL Encryption:</span> Our website uses SSL/TLS encryption to protect data in transit</li>
                  <li><span className="font-bold text-charcoal-black">Secure Storage:</span> Data is stored on secure, password-protected servers</li>
                  <li><span className="font-bold text-charcoal-black">Access Controls:</span> Only authorised personnel have access to your data</li>
                  <li><span className="font-bold text-charcoal-black">Regular Backups:</span> We maintain regular backups to prevent data loss</li>
                  <li><span className="font-bold text-charcoal-black">Security Audits:</span> We conduct regular security assessments and updates</li>
                  <li><span className="font-bold text-charcoal-black">Incident Response:</span> We have procedures in place to respond to data breaches</li>
                </ul>
                <p className="mt-4">
                  While we implement strong security measures, no system is completely secure. We encourage you to use strong passwords and protect your account credentials.
                </p>
              </div>
            </section>

            {/* Cookies */}
            <section id="cookies" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Cookie Policy
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                    What Are Cookies?
                  </h3>
                  <p className="font-paragraph text-base text-warm-grey leading-relaxed">
                    Cookies are small text files stored on your device when you visit our website. They help us remember your preferences, improve your experience, and understand how you use our site.
                  </p>
                </div>

                <div>
                  <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                    Types of Cookies We Use
                  </h3>
                  <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                    <div>
                      <p className="font-bold text-charcoal-black mb-2">Strictly Necessary Cookies</p>
                      <p>
                        These cookies are essential for the website to function properly. They enable basic functions like page navigation and access to secure areas. These cookies cannot be disabled.
                      </p>
                    </div>
                    <div>
                      <p className="font-bold text-charcoal-black mb-2">Analytics Cookies</p>
                      <p>
                        These cookies help us understand how visitors use our website. They collect anonymous data about pages visited, time spent, and user interactions. This helps us improve our website and services.
                      </p>
                    </div>
                    <div>
                      <p className="font-bold text-charcoal-black mb-2">Marketing Cookies</p>
                      <p>
                        These cookies track your activity to show you relevant ads and content. They may be set by us or by third-party advertising partners. You can opt out of marketing cookies.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                    Managing Your Cookie Preferences
                  </h3>
                  <p className="font-paragraph text-base text-warm-grey leading-relaxed">
                    When you first visit our website, you'll see a cookie banner. You can:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-2 font-paragraph text-base text-warm-grey">
                    <li>Accept all cookies</li>
                    <li>Reject non-essential cookies</li>
                    <li>Manage your preferences for each cookie type</li>
                  </ul>
                  <p className="font-paragraph text-base text-warm-grey leading-relaxed mt-4">
                    You can also manage cookies through your browser settings. Most browsers allow you to refuse cookies or alert you when cookies are being sent. Note that disabling cookies may affect website functionality.
                  </p>
                </div>

                <div>
                  <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                    Third-Party Cookies
                  </h3>
                  <p className="font-paragraph text-base text-warm-grey leading-relaxed">
                    Our website may contain links to third-party websites and services. These third parties may set their own cookies. We are not responsible for their cookie practices. Please review their privacy policies for more information.
                  </p>
                </div>
              </div>
            </section>

            {/* Children's Privacy */}
            <section id="children-privacy" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Children's Privacy
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  Our services are not intended for children under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that a child under 18 has provided us with personal information, we will delete such information and terminate the child's account.
                </p>
                <p>
                  If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately at hello@motivasi.co.uk.
                </p>
                <p>
                  For children aged 13-17 who wish to use our services, parental consent is required. Parents/guardians are responsible for supervising their child's use of our services.
                </p>
              </div>
            </section>

            {/* Policy Changes */}
            <section id="policy-changes" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Policy Changes
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  We may update this Privacy & Cookie Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of any material changes by:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Posting the updated policy on our website with a new "Last Updated" date</li>
                  <li>Sending you an email notification (for significant changes)</li>
                  <li>Requesting your consent (if required by law)</li>
                </ul>
                <p className="mt-4">
                  Your continued use of our website and services after changes are posted constitutes your acceptance of the updated policy. We encourage you to review this policy periodically to stay informed about how we protect your data.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section id="contact" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Contact Information
              </h2>
              <div className="space-y-6">
                <p className="font-paragraph text-base text-warm-grey leading-relaxed">
                  If you have questions about this Privacy & Cookie Policy, or if you wish to exercise any of your rights, please contact us:
                </p>

                <div className="bg-warm-sand-beige/30 border border-warm-sand-beige rounded-2xl p-8 space-y-4">
                  <div className="flex gap-4">
                    <Mail className="w-6 h-6 text-soft-bronze flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-heading text-lg font-bold text-charcoal-black mb-2">
                        Email
                      </h3>
                      <a
                        href="mailto:hello@motivasi.co.uk"
                        className="font-paragraph text-soft-bronze hover:underline"
                      >
                        hello@motivasi.co.uk
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Shield className="w-6 h-6 text-soft-bronze flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-heading text-lg font-bold text-charcoal-black mb-2">
                        Data Protection Officer
                      </h3>
                      <p className="font-paragraph text-warm-grey">
                        For data protection inquiries, contact us at hello@motivasi.co.uk
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Lock className="w-6 h-6 text-soft-bronze flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-heading text-lg font-bold text-charcoal-black mb-2">
                        Regulatory Authority
                      </h3>
                      <p className="font-paragraph text-warm-grey mb-2">
                        If you have concerns about our data practices, you can file a complaint with:
                      </p>
                      <p className="font-paragraph text-warm-grey">
                        <span className="font-bold text-charcoal-black">Information Commissioner's Office (ICO)</span><br />
                        Wycliffe House<br />
                        Water Lane<br />
                        Wilmslow<br />
                        Cheshire SK9 5AF<br />
                        <a href="https://www.ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-soft-bronze hover:underline">
                          www.ico.org.uk
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
                  <h3 className="font-heading text-lg font-bold text-charcoal-black mb-4">
                    Data Subject Access Requests
                  </h3>
                  <p className="font-paragraph text-base text-warm-grey leading-relaxed">
                    To request a copy of your personal data, please email hello@motivasi.co.uk with the subject line "Data Subject Access Request." We will respond within 30 days with your information in a portable format.
                  </p>
                </div>
              </div>
            </section>

            {/* Final CTA */}
            <section className="mt-16 pt-12 border-t border-warm-sand-beige">
              <div className="bg-charcoal-black text-soft-white rounded-2xl p-8 md:p-12 text-center">
                <h2 className="font-heading text-3xl font-bold mb-4">
                  Questions About Your Privacy?
                </h2>
                <p className="font-paragraph text-lg text-warm-grey mb-8">
                  We're here to help. Contact us anytime with your privacy concerns or data requests.
                </p>
                <a
                  href="mailto:hello@motivasi.co.uk"
                  className="inline-block bg-soft-bronze text-soft-white px-10 py-4 rounded-lg font-medium text-lg hover:bg-soft-white hover:text-charcoal-black transition-colors"
                >
                  Contact Us
                </a>
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
