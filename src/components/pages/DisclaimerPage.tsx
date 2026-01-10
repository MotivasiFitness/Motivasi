import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Heart, Shield } from 'lucide-react';

export default function DisclaimerPage() {
  const sections = [
    { id: 'not-medical-advice', title: 'Not Medical Advice' },
    { id: 'health-fitness-participation', title: 'Health & Fitness Participation' },
    { id: 'results-disclaimer', title: 'Results Disclaimer' },
    { id: 'online-training', title: 'Online Training & Digital Content' },
    { id: 'liability', title: 'Limitation of Liability' },
    { id: 'no-professional-relationship', title: 'No Professional Relationship Beyond Training' },
    { id: 'external-links', title: 'External Links' },
    { id: 'assumption-responsibility', title: 'Assumption of Responsibility' },
    { id: 'relationship-legal-documents', title: 'Relationship to Other Legal Documents' },
    { id: 'changes-disclaimer', title: 'Changes to This Disclaimer' },
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
            Disclaimer
          </h1>
          <p className="font-paragraph text-lg text-charcoal-black">
            Important information about our services and your responsibilities
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
            <section className="scroll-mt-20">
              <div className="bg-soft-bronze/10 border border-soft-bronze/30 rounded-2xl p-8 flex gap-4">
                <AlertTriangle className="w-6 h-6 text-soft-bronze flex-shrink-0 mt-1" />
                <div>
                  <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-3">
                    Important Disclaimer
                  </h2>
                  <p className="font-paragraph text-base text-charcoal-black leading-relaxed">
                    Please read this disclaimer carefully before using Motivasi's services. By accessing our website, purchasing a coaching package, or engaging with our services, you acknowledge that you have read, understood, and agree to be bound by this disclaimer. This disclaimer applies to all services offered by Motivasi, including online coaching, face-to-face training, nutrition guidance, and digital content.
                  </p>
                </div>
              </div>
            </section>

            {/* Not Medical Advice */}
            <section id="not-medical-advice" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Not Medical Advice
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  <span className="font-bold text-charcoal-black">Motivasi is NOT a medical service, healthcare provider, or substitute for professional medical advice.</span> The coaching, training programmes, nutrition guidance, and advice provided by Motivasi are for fitness and wellness purposes only and do not constitute medical advice, diagnosis, treatment, or prevention of any disease or medical condition.
                </p>
                <p>
                  Motivasi is not a substitute for professional medical advice, diagnosis, or treatment from a qualified healthcare professional. If you have any medical concerns, health conditions, are pregnant, postpartum, or are taking medications, you should consult with a qualified healthcare professional (such as your GP, doctor, registered dietitian, or physiotherapist) before starting any new exercise programme or making significant dietary changes.
                </p>
                <p>
                  The information provided by Motivasi is based on general fitness and wellness principles and is not tailored to diagnose, treat, cure, or prevent any medical condition. Always seek professional medical advice for any health-related concerns, symptoms, or conditions.
                </p>
              </div>
            </section>

            {/* Health & Fitness Participation */}
            <section id="health-fitness-participation" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Health & Fitness Participation
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  <span className="font-bold text-charcoal-black">Physical exercise carries inherent risks.</span> By participating in any fitness programme provided by Motivasi, you acknowledge and accept these risks, which include but are not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Muscle soreness, fatigue, and strain</li>
                  <li>Sprains, strains, and other musculoskeletal injuries</li>
                  <li>Cardiovascular stress and exertion</li>
                  <li>Dizziness, nausea, or fainting</li>
                  <li>In rare cases, serious injury or death</li>
                </ul>
                <p>
                  You assume full responsibility for any injuries, damages, or adverse effects that may result from your participation in any Motivasi coaching programme. It is your responsibility to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Follow all safety instructions and guidelines provided</li>
                  <li>Use proper form and technique during exercises</li>
                  <li>Stop immediately if you experience pain, discomfort, or unusual symptoms</li>
                  <li>Listen to your body and modify or skip exercises as needed</li>
                  <li>Seek immediate medical attention if you sustain an injury or experience a medical emergency</li>
                  <li>Ensure your training environment is safe and free from hazards</li>
                  <li>Use appropriate equipment and clothing for your workouts</li>
                </ul>
                <p>
                  If you have any pre-existing health conditions, injuries, disabilities, or medical concerns, you must consult with a qualified healthcare professional before starting any Motivasi coaching programme. This includes (but is not limited to): cardiovascular conditions, diabetes, respiratory conditions, joint problems, back or spine issues, pregnancy, postpartum recovery, recent surgery, or any condition requiring medication.
                </p>
              </div>
            </section>

            {/* Results Disclaimer */}
            <section id="results-disclaimer" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Results Disclaimer
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  <span className="font-bold text-charcoal-black">Results are not guaranteed.</span> While Motivasi provides personalised coaching, training programmes, and nutrition guidance designed to help you achieve your fitness goals, individual results vary significantly based on many factors beyond Motivasi's control, including:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Your commitment and adherence to the programme</li>
                  <li>Your starting fitness level and health status</li>
                  <li>Your genetics and metabolism</li>
                  <li>Your diet and lifestyle choices outside of coaching</li>
                  <li>Your sleep quality and stress levels</li>
                  <li>Your age, hormonal status, and medical history</li>
                  <li>Consistency in following the prescribed workouts and nutrition guidance</li>
                  <li>Your ability to recover between sessions</li>
                  <li>Environmental factors and access to equipment</li>
                </ul>
                <p>
                  Testimonials and case studies shown on our website represent individual experiences and are not typical results. Your results may differ significantly. Motivasi makes no guarantees about specific outcomes such as weight loss, muscle gain, strength improvements, improved energy levels, or any other fitness-related results.
                </p>
                <p>
                  Before and after photos, testimonials, and success stories are provided for illustrative purposes only and do not guarantee similar results for you. Individual results depend on your unique circumstances, effort, and consistency.
                </p>
              </div>
            </section>

            {/* Online Training & Digital Content */}
            <section id="online-training" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Online Training & Digital Content
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  <span className="font-bold text-charcoal-black">Online training has unique considerations.</span> By participating in online coaching, you acknowledge:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>You are responsible for ensuring your training environment is safe and free from hazards</li>
                  <li>You have appropriate space and equipment for your workouts</li>
                  <li>You are responsible for your own form and technique—Motivasi cannot provide real-time physical corrections</li>
                  <li>Video reviews of your form are provided for educational purposes only and do not replace in-person assessment</li>
                  <li>Technical issues, internet connectivity problems, or platform outages are not Motivasi's responsibility</li>
                  <li>You are responsible for maintaining the confidentiality of your login credentials and account access</li>
                </ul>
                <p>
                  Digital content (videos, guides, nutrition plans, etc.) is provided for educational purposes only. While we strive for accuracy, we do not warrant that all information is complete, accurate, or suitable for your individual circumstances. Always consult with a healthcare professional before making significant changes to your diet or exercise routine based on our digital content.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section id="liability" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Limitation of Liability
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  <span className="font-bold text-charcoal-black">To the fullest extent permitted by law, Motivasi is not liable for:</span>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Any injuries, damages, or adverse effects resulting from your use of our services</li>
                  <li>Any loss of income, profits, or other consequential damages</li>
                  <li>Any indirect, incidental, special, or punitive damages</li>
                  <li>Any failure to achieve desired results or outcomes</li>
                  <li>Any technical issues, service interruptions, data loss, or platform unavailability</li>
                  <li>Any third-party content, links, or services accessed through our website or platform</li>
                  <li>Any claims arising from your misuse of our services or failure to follow instructions</li>
                </ul>
                <p>
                  By using Motivasi's services, you agree to release and hold harmless Motivasi, its owners, employees, contractors, and representatives from any and all claims, damages, or liabilities arising from your participation in our coaching programmes, use of our digital content, or any other interaction with Motivasi.
                </p>
              </div>
            </section>

            {/* No Professional Relationship Beyond Training */}
            <section id="no-professional-relationship" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                No Professional Relationship Beyond Training
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  <span className="font-bold text-charcoal-black">Motivasi provides fitness coaching only.</span> The relationship between you and Motivasi is limited to the provision of fitness coaching and training services. This relationship does NOT extend to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Medical advice or healthcare services</li>
                  <li>Mental health counselling or psychological support</li>
                  <li>Nutritional therapy or medical nutrition therapy (unless provided by a registered dietitian)</li>
                  <li>Physical therapy or rehabilitation services</li>
                  <li>Legal or financial advice</li>
                  <li>Any professional services beyond fitness coaching</li>
                </ul>
                <p>
                  If you require services beyond fitness coaching (such as medical advice, mental health support, or nutritional therapy), you must seek appropriate qualified professionals. Motivasi is not responsible for any outcomes resulting from your failure to seek appropriate professional services.
                </p>
              </div>
            </section>

            {/* External Links */}
            <section id="external-links" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                External Links
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  Our website and digital platforms may contain links to external websites and resources. Motivasi is not responsible for the content, accuracy, or practices of external websites. Your use of external websites is governed by their own terms and conditions and privacy policies.
                </p>
                <p>
                  We do not endorse or warrant any external websites, products, or services linked from our site. If you choose to access external links, you do so at your own risk and are responsible for reviewing their terms and conditions.
                </p>
              </div>
            </section>

            {/* Assumption of Responsibility */}
            <section id="assumption-responsibility" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Assumption of Responsibility
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  <span className="font-bold text-charcoal-black">You assume full responsibility for your participation in Motivasi's services.</span> This includes:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Obtaining medical clearance from a healthcare professional before starting any exercise programme</li>
                  <li>Answering all health screening questions (PAR-Q) honestly and accurately</li>
                  <li>Disclosing all relevant health conditions, medications, and concerns</li>
                  <li>Informing Motivasi immediately if your health status changes</li>
                  <li>Following all safety instructions and guidelines provided</li>
                  <li>Using proper form and technique during exercises</li>
                  <li>Stopping exercise immediately if you experience pain or discomfort</li>
                  <li>Seeking medical attention for any injuries or health concerns</li>
                  <li>Maintaining a safe training environment</li>
                  <li>Using appropriate equipment and clothing</li>
                </ul>
                <p>
                  Failure to assume these responsibilities may result in injury or adverse health effects, for which Motivasi is not responsible.
                </p>
              </div>
            </section>

            {/* Relationship to Other Legal Documents */}
            <section id="relationship-legal-documents" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Relationship to Other Legal Documents
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  This disclaimer works in conjunction with our <Link to="/terms" className="text-soft-bronze hover:underline">Terms & Conditions</Link> and <Link to="/privacy" className="text-soft-bronze hover:underline">Privacy & Cookie Policy</Link>. In the event of any conflict between this disclaimer and other legal documents, the most protective provision for the user shall apply.
                </p>
                <p>
                  All three documents should be read together to understand your rights and responsibilities when using Motivasi's services. If you have questions about how these documents interact, please contact us at hello@motivasi.co.uk.
                </p>
              </div>
            </section>

            {/* Changes to This Disclaimer */}
            <section id="changes-disclaimer" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Changes to This Disclaimer
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  Motivasi reserves the right to update, modify, or change this disclaimer at any time without prior notice. Changes will be effective immediately upon posting to our website. Your continued use of Motivasi's services following any changes constitutes your acceptance of the updated disclaimer.
                </p>
                <p>
                  We recommend reviewing this disclaimer periodically to stay informed of any updates. The date of the last update will be displayed at the bottom of this page.
                </p>
                <p className="text-sm text-warm-grey/70 italic">
                  Last updated: January 2026
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section id="contact" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Questions About This Disclaimer?
              </h2>
              <div className="space-y-6">
                <p className="font-paragraph text-base text-warm-grey leading-relaxed">
                  If you have any questions about this disclaimer or our services, please contact us:
                </p>

                <div className="bg-warm-sand-beige/30 border border-warm-sand-beige rounded-2xl p-8 space-y-4">
                  <div className="flex gap-4">
                    <Heart className="w-6 h-6 text-soft-bronze flex-shrink-0 mt-1" />
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
                        Insurance
                      </h3>
                      <p className="font-paragraph text-warm-grey">
                        Motivasi holds appropriate professional and public liability insurance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Final CTA */}
            <section className="mt-16 pt-12 border-t border-warm-sand-beige">
              <div className="bg-charcoal-black text-soft-white rounded-2xl p-8 md:p-12 text-center">
                <h2 className="font-heading text-3xl font-bold mb-4">
                  Ready to Get Started?
                </h2>
                <p className="font-paragraph text-lg text-warm-grey mb-8">
                  By proceeding with Motivasi, you acknowledge that you have read and understood this disclaimer.
                </p>
                <Link
                  to="/store"
                  className="inline-block bg-soft-bronze text-soft-white px-10 py-4 rounded-lg font-medium text-lg hover:bg-soft-white hover:text-charcoal-black transition-colors"
                >
                  View Our Packages
                </Link>
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
