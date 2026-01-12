import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Shield, AlertCircle } from 'lucide-react';

export default function TermsPage() {
  const sections = [
    { id: 'about-motivasi', title: 'About Motivasi' },
    { id: 'eligibility', title: 'Eligibility' },
    { id: 'services', title: 'Services' },
    { id: 'health-safety', title: 'Health & Safety' },
    { id: 'client-responsibilities', title: 'Client Responsibilities' },
    { id: 'bookings-payments', title: 'Bookings & Payments' },
    { id: 'refund-policy-online', title: 'Refund Policy - Online Training' },
    { id: 'refund-policy-face-to-face', title: 'Refund Policy - Face-to-Face Coaching' },
    { id: 'packages-expiry', title: 'Packages & Expiry' },
    { id: 'online-training-technology', title: 'Online Training & Technology' },
    { id: 'results-disclaimer', title: 'Results Disclaimer' },
    { id: 'intellectual-property', title: 'Intellectual Property' },
    { id: 'acceptable-use', title: 'Acceptable Use' },
    { id: 'privacy-data-protection', title: 'Privacy & Data Protection' },
    { id: 'limitation-liability', title: 'Limitation of Liability' },
    { id: 'indemnity', title: 'Indemnity' },
    { id: 'termination', title: 'Termination' },
    { id: 'governing-law', title: 'Governing Law & Jurisdiction' },
    { id: 'changes-terms', title: 'Changes to These Terms' },
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
            Terms & Conditions
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
            <div className="sticky top-32 bg-warm-sand-beige/20 border border-warm-sand-beige rounded-2xl p-6">
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
            {/* About Motivasi */}
            <section id="about-motivasi" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                About Motivasi
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  Motivasi is a personal training and coaching business based in the United Kingdom, specialising in online coaching, face-to-face personal training, and nutrition guidance for women. These Terms & Conditions ("Terms") govern your use of our services, website, and all related platforms.
                </p>
                <p>
                  By accessing our website, purchasing our services, or engaging with Motivasi in any way, you agree to be bound by these Terms. If you do not agree with any part of these Terms, you must not use our services.
                </p>
              </div>
            </section>

            {/* Eligibility */}
            <section id="eligibility" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Eligibility
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  To use Motivasi's services, you must:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Be at least 18 years of age</li>
                  <li>Be in good physical and mental health (or have medical clearance if you have any health conditions)</li>
                  <li>Complete the PAR-Q (Physical Activity Readiness Questionnaire) health form honestly and accurately</li>
                  <li>Have the legal capacity to enter into a binding agreement</li>
                  <li>Not be prohibited by law from using our services</li>
                </ul>
                <p className="mt-4">
                  If you are under 18, you may only use our services with parental or guardian consent and supervision. Parents/guardians are responsible for ensuring the minor's safe use of our services.
                </p>
              </div>
            </section>

            {/* Services */}
            <section id="services" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Services
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                    Types of Services
                  </h3>
                  <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                    <p>
                      Motivasi provides the following services:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-2">
                      <li><span className="font-bold text-charcoal-black">Online Coaching:</span> Personalised training programs delivered via video, online platform, and digital communication</li>
                      <li><span className="font-bold text-charcoal-black">Face-to-Face Personal Training:</span> In-person training sessions at agreed locations in the UK</li>
                      <li><span className="font-bold text-charcoal-black">Nutrition Guidance:</span> Personalised nutrition advice and meal planning support</li>
                      <li><span className="font-bold text-charcoal-black">Consultation & Assessment:</span> Initial health assessments, goal-setting, and progress reviews</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                    Service Delivery
                  </h3>
                  <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                    <p>
                      Services are provided on a subscription or package basis. The specific services included in your package will be detailed in your purchase confirmation and coaching agreement. All services are provided on an "as-is" basis, and Motivasi reserves the right to modify or discontinue services with reasonable notice.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Health & Safety */}
            <section id="health-safety" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Health & Safety
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                    Medical Clearance
                  </h3>
                  <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                    <p>
                      You are responsible for obtaining medical clearance from your GP or healthcare provider before starting any exercise programme, especially if you:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-2">
                      <li>Have any diagnosed medical conditions</li>
                      <li>Are taking medications that may affect exercise</li>
                      <li>Have a family history of heart disease or stroke</li>
                      <li>Are pregnant or postpartum</li>
                      <li>Have had recent surgery</li>
                      <li>Are over 40 and have been sedentary</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                    Risk Acknowledgement
                  </h3>
                  <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                    <p>
                      You acknowledge that exercise carries inherent risks, including but not limited to muscle soreness, strains, sprains, and in rare cases, serious injury or death. By engaging with Motivasi's services, you assume all risks associated with physical activity and agree that Motivasi is not responsible for any injuries or health complications that may arise.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                    Disclaimer
                  </h3>
                  <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                    <p>
                      Please read our <Link to="/disclaimer" className="text-soft-bronze hover:underline">Disclaimer</Link> carefully. It contains important information about the limitations of our services, assumption of risk, and your responsibilities. By using Motivasi's services, you acknowledge that you have read and understood the Disclaimer.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Client Responsibilities */}
            <section id="client-responsibilities" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Client Responsibilities
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  As a client, you agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Provide accurate and complete information on the PAR-Q questionnaire and any health forms</li>
                  <li>Disclose any changes to your health status or medications during your coaching relationship</li>
                  <li>Follow all safety instructions provided by your coach</li>
                  <li>Use proper form and technique during exercises, and ask for modifications if needed</li>
                  <li>Stop exercising immediately if you experience pain or discomfort</li>
                  <li>Maintain a safe training environment (for home workouts)</li>
                  <li>Use appropriate equipment and footwear</li>
                  <li>Respect the intellectual property rights of Motivasi</li>
                  <li>Not share your login credentials or coaching materials with others</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </div>
            </section>

            {/* Bookings & Payments */}
            <section id="bookings-payments" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Bookings & Payments
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                    Payment Terms
                  </h3>
                  <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                    <p>
                      Payment is due in full at the time of booking, unless otherwise agreed in writing. We accept all major credit cards and debit cards. All payments are processed securely through our payment processor.
                    </p>
                    <p>
                      Subscription-based services (monthly coaching) will be charged on the same date each month. You are responsible for ensuring your payment method remains valid and up-to-date.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                    Booking Confirmation
                  </h3>
                  <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                    <p>
                      Once payment is received, you will receive a booking confirmation email with details of your package, access instructions, and next steps. Please check your email (including spam folder) for this confirmation.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                    Late Payments
                  </h3>
                  <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                    <p>
                      If payment fails or is declined, we will attempt to process it again. If payment cannot be processed after multiple attempts, your access to services may be suspended until payment is received. Late payments may incur additional fees as permitted by law.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Refund Policy - Online Training */}
            <section id="refund-policy-online" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Refund Policy - Online Training
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                    7-Day Money-Back Guarantee
                  </h3>
                  <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                    <p>
                      We offer a 7-day money-back guarantee for all online coaching packages. If you are not satisfied with your purchase within 7 days of your initial payment, you can request a full refund, no questions asked.
                    </p>
                    <p>
                      To request a refund, email hello@motivasi.co.uk with your order details and reason for the refund. We will process your refund within 5-7 business days.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                    Refunds After 7 Days
                  </h3>
                  <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                    <p>
                      After the initial 7-day period, refunds are not available. However, you may cancel your subscription at any time, and you will not be charged for future months. Your access will be terminated at the end of your current billing cycle.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                    Cancellation
                  </h3>
                  <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                    <p>
                      To cancel your subscription, email hello@motivasi.co.uk with your request. Cancellations must be requested at least 7 days before your next billing date to avoid being charged for the next month. Once cancelled, you will lose access to all coaching materials and support.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Refund Policy - Face-to-Face Coaching */}
            <section id="refund-policy-face-to-face" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Refund Policy - Face-to-Face Coaching
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                    Cancellation by Client
                  </h3>
                  <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                    <p>
                      If you need to cancel a face-to-face training session, you must provide at least 48 hours notice. Cancellations made with less than 48 hours notice will be charged in full.
                    </p>
                    <p>
                      If you cancel with 48 hours or more notice, the session can be rescheduled to another date at no additional cost. If you do not reschedule within 30 days, the session credit will be forfeited.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                    Cancellation by Motivasi
                  </h3>
                  <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                    <p>
                      Motivasi reserves the right to cancel or reschedule sessions due to illness, emergency, or other unforeseen circumstances. In such cases, we will provide as much notice as possible and offer to reschedule at a mutually convenient time.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                    Package Refunds
                  </h3>
                  <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                    <p>
                      Face-to-face coaching packages are non-refundable after purchase. However, unused sessions can be transferred to another person or rescheduled, subject to availability. Sessions must be used within the timeframe specified in your package agreement.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Packages & Expiry */}
            <section id="packages-expiry" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Packages & Expiry
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  All coaching packages have an expiry date specified at the time of purchase. Sessions must be completed by the expiry date. Unused sessions after the expiry date will be forfeited and cannot be refunded or transferred.
                </p>
                <p>
                  Extensions may be available upon request and at Motivasi's discretion. Extensions must be requested before the expiry date and may incur additional fees.
                </p>
                <p>
                  For online coaching subscriptions, your subscription will automatically renew each month unless you cancel. You will be charged on the same date each month.
                </p>
              </div>
            </section>

            {/* Online Training & Technology */}
            <section id="online-training-technology" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Online Training & Technology
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                    Technical Requirements
                  </h3>
                  <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                    <p>
                      Online coaching requires a stable internet connection and a device capable of video streaming (computer, tablet, or smartphone). You are responsible for ensuring your equipment and internet connection meet these requirements.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                    Technical Issues
                  </h3>
                  <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                    <p>
                      Motivasi is not responsible for technical issues beyond our control, including internet outages, server downtime, or issues with third-party platforms. If a coaching session is interrupted due to technical issues, we will reschedule at no additional cost.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                    Platform Access
                  </h3>
                  <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                    <p>
                      Your access to the coaching platform is personal and non-transferable. You may not share your login credentials with others. Sharing access violates these Terms and may result in immediate termination of your account.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                    Recording & Privacy
                  </h3>
                  <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                    <p>
                      You may not record or screenshot coaching sessions, videos, or materials without explicit written permission from Motivasi. Recording and sharing materials without permission violates copyright law and these Terms.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Results Disclaimer */}
            <section id="results-disclaimer" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Results Disclaimer
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  <span className="font-bold text-charcoal-black">IMPORTANT:</span> Results vary from person to person and depend on many factors, including genetics, diet, sleep, stress levels, consistency, and overall lifestyle. Motivasi does not guarantee any specific results, weight loss, muscle gain, or other fitness outcomes.
                </p>
                <p>
                  Testimonials and before/after photos on our website represent individual results and are not typical or guaranteed. Your results may differ. Motivasi is not responsible for any failure to achieve desired results.
                </p>
                <p>
                  Coaching is a partnership between you and your coach. Your commitment, consistency, and adherence to the programme are essential for achieving results. Motivasi provides guidance, support, and expertise, but ultimate responsibility for your health and fitness outcomes rests with you.
                </p>
              </div>
            </section>

            {/* Intellectual Property */}
            <section id="intellectual-property" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Intellectual Property
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  All content provided by Motivasi, including training videos, nutrition guides, workout plans, coaching materials, and website content, is the intellectual property of Motivasi and protected by copyright law.
                </p>
                <p>
                  You are granted a limited, personal, non-exclusive license to access and use these materials for your own fitness purposes only. You may not:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Reproduce, distribute, or share materials with others</li>
                  <li>Sell, rent, or lease materials</li>
                  <li>Modify or create derivative works</li>
                  <li>Use materials for commercial purposes</li>
                  <li>Remove copyright notices or proprietary markings</li>
                </ul>
                <p className="mt-4">
                  Unauthorised use of Motivasi's intellectual property may result in legal action and termination of your account.
                </p>
              </div>
            </section>

            {/* Acceptable Use */}
            <section id="acceptable-use" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Acceptable Use
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  You agree not to use Motivasi's services or website for any unlawful or prohibited purpose, including:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Harassing, threatening, or abusing others</li>
                  <li>Posting offensive, defamatory, or discriminatory content</li>
                  <li>Attempting to gain unauthorised access to systems or accounts</li>
                  <li>Distributing malware, viruses, or harmful code</li>
                  <li>Spamming or sending unsolicited messages</li>
                  <li>Impersonating others or misrepresenting your identity</li>
                  <li>Violating any applicable laws or regulations</li>
                </ul>
                <p className="mt-4">
                  Violation of these acceptable use policies may result in immediate termination of your account and legal action.
                </p>
              </div>
            </section>

            {/* Privacy & Data Protection */}
            <section id="privacy-data-protection" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Privacy & Data Protection
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  Your privacy is important to us. Please refer to our <Link to="/privacy" className="text-soft-bronze hover:underline">Privacy & Cookie Policy</Link> for detailed information about how we collect, use, and protect your personal data.
                </p>
                <p>
                  By using Motivasi's services, you consent to the collection and use of your personal information as described in our Privacy Policy.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section id="limitation-liability" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Limitation of Liability
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  <span className="font-bold text-charcoal-black">TO THE FULLEST EXTENT PERMITTED BY LAW:</span>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Motivasi is not liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services</li>
                  <li>Motivasi is not liable for any injuries, health complications, or other harm resulting from exercise or fitness activities</li>
                  <li>Motivasi is not liable for any loss of data, business interruption, or other losses</li>
                  <li>Motivasi's total liability for any claim shall not exceed the amount you paid for the service in question</li>
                </ul>
                <p className="mt-4">
                  Some jurisdictions do not allow the exclusion of certain liabilities, so some of the above limitations may not apply to you.
                </p>
              </div>
            </section>

            {/* Indemnity */}
            <section id="indemnity" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Indemnity
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  You agree to indemnify, defend, and hold harmless Motivasi, its owners, employees, and agents from any claims, damages, losses, or expenses (including legal fees) arising from:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Your use of our services</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any applicable laws</li>
                  <li>Your infringement of third-party rights</li>
                  <li>Any injuries or harm resulting from your exercise activities</li>
                </ul>
              </div>
            </section>

            {/* Termination */}
            <section id="termination" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Termination
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                    Termination by You
                  </h3>
                  <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                    <p>
                      You may terminate your coaching relationship at any time by emailing hello@motivasi.co.uk. For subscription-based services, cancellation must be requested at least 7 days before your next billing date to avoid being charged.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                    Termination by Motivasi
                  </h3>
                  <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                    <p>
                      Motivasi reserves the right to terminate your account or services immediately if you:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-2">
                      <li>Violate these Terms or any applicable laws</li>
                      <li>Engage in harassment, abuse, or threatening behaviour</li>
                      <li>Fail to pay for services</li>
                      <li>Provide false or misleading health information</li>
                      <li>Share your account credentials with others</li>
                      <li>Infringe on intellectual property rights</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                    Effect of Termination
                  </h3>
                  <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                    <p>
                      Upon termination, your access to all coaching materials and services will be immediately revoked. No refunds will be issued for unused services, except as required by law or as specified in our refund policy.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Governing Law & Jurisdiction */}
            <section id="governing-law" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Governing Law & Jurisdiction
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  These Terms are governed by and construed in accordance with the laws of England and Wales, without regard to its conflict of law principles.
                </p>
                <p>
                  You agree to submit to the exclusive jurisdiction of the courts of England and Wales for any disputes arising from these Terms or your use of Motivasi's services.
                </p>
              </div>
            </section>

            {/* Changes to These Terms */}
            <section id="changes-terms" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Changes to These Terms
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  Motivasi reserves the right to modify these Terms at any time. Changes will be effective immediately upon posting to our website. Your continued use of our services after changes are posted constitutes your acceptance of the updated Terms.
                </p>
                <p>
                  We encourage you to review these Terms periodically to stay informed of any changes. If you do not agree with any changes, you must discontinue use of our services.
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
                  If you have questions about these Terms & Conditions, or if you wish to exercise any of your rights, please contact us:
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
                        Business Address
                      </h3>
                      <p className="font-paragraph text-warm-grey">
                        Motivasi<br />
                        United Kingdom
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
                  <h3 className="font-heading text-lg font-bold text-charcoal-black mb-4">
                    Dispute Resolution
                  </h3>
                  <p className="font-paragraph text-base text-warm-grey leading-relaxed">
                    If you have a dispute with Motivasi, please contact us first at hello@motivasi.co.uk to attempt to resolve the matter informally. If we cannot resolve the dispute within 30 days, either party may pursue legal action in accordance with the Governing Law & Jurisdiction section above.
                  </p>
                </div>
              </div>
            </section>

            {/* Final Notice */}
            <section className="mt-16 pt-12 border-t border-warm-sand-beige">
              <div className="bg-charcoal-black text-soft-white rounded-2xl p-8 md:p-12">
                <div className="flex gap-4">
                  <AlertCircle className="w-8 h-8 text-soft-bronze flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="font-heading text-2xl font-bold mb-4">
                      Important Notice
                    </h2>
                    <p className="font-paragraph text-lg text-warm-grey leading-relaxed">
                      These Terms & Conditions constitute the entire agreement between you and Motivasi regarding your use of our services. If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
