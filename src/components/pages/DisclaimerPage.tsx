import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Heart, Shield } from 'lucide-react';

export default function DisclaimerPage() {
  const sections = [
    { id: 'not-medical-advice', title: 'Not Medical Advice' },
    { id: 'results-not-guaranteed', title: 'Results Not Guaranteed' },
    { id: 'exercise-at-own-risk', title: 'Exercise at Your Own Risk' },
    { id: 'health-conditions', title: 'Pre-Existing Health Conditions' },
    { id: 'parq-importance', title: 'PAR-Q Questionnaire' },
    { id: 'liability', title: 'Limitation of Liability' },
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
                    Please read this disclaimer carefully before using Motivasi's services. By accessing our website, purchasing a coaching package, or engaging with our services, you acknowledge that you have read, understood, and agree to be bound by this disclaimer.
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
                  <span className="font-bold text-charcoal-black">Motivasi is NOT a medical service.</span> The coaching, training programmes, nutrition guidance, and advice provided by Motivasi are for fitness and wellness purposes only and do not constitute medical advice, diagnosis, or treatment.
                </p>
                <p>
                  Motivasi is not a substitute for professional medical advice, diagnosis, or treatment. If you have any medical concerns, health conditions, or are taking medications, you should consult with a qualified healthcare professional (such as your GP, doctor, or registered dietitian) before starting any new exercise programme or making significant dietary changes.
                </p>
                <p>
                  The information provided by Motivasi is based on general fitness principles and is not tailored to treat, cure, or prevent any medical condition. Always seek professional medical advice for any health-related concerns.
                </p>
              </div>
            </section>

            {/* Results Not Guaranteed */}
            <section id="results-not-guaranteed" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Results Not Guaranteed
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  <span className="font-bold text-charcoal-black">Results are not guaranteed.</span> While Motivasi provides personalised coaching, training programmes, and nutrition guidance designed to help you achieve your fitness goals, individual results vary significantly based on many factors including:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Your commitment and adherence to the programme</li>
                  <li>Your starting fitness level and health status</li>
                  <li>Your genetics and metabolism</li>
                  <li>Your diet and lifestyle choices outside of coaching</li>
                  <li>Your sleep quality and stress levels</li>
                  <li>Your age, hormonal status, and medical history</li>
                  <li>Consistency in following the prescribed workouts and nutrition guidance</li>
                </ul>
                <p>
                  Testimonials and case studies shown on our website represent individual experiences and are not typical results. Your results may differ. Motivasi makes no guarantees about specific outcomes such as weight loss, muscle gain, strength improvements, or any other fitness-related results.
                </p>
              </div>
            </section>

            {/* Exercise at Your Own Risk */}
            <section id="exercise-at-own-risk" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Exercise at Your Own Risk
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  <span className="font-bold text-charcoal-black">You exercise at your own risk.</span> Physical exercise carries inherent risks, including but not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Muscle soreness and fatigue</li>
                  <li>Strains, sprains, and other injuries</li>
                  <li>Cardiovascular stress</li>
                  <li>In rare cases, serious injury or death</li>
                </ul>
                <p>
                  By engaging in any exercise programme provided by Motivasi, you acknowledge and accept these risks. You assume full responsibility for any injuries or damages that may result from your participation in the coaching programme.
                </p>
                <p>
                  Motivasi is not responsible for any injuries, damages, or adverse effects that result from your use of our services, including but not limited to injuries sustained during workouts, improper exercise form, or failure to follow safety guidelines.
                </p>
                <p>
                  It is your responsibility to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Follow all safety instructions provided</li>
                  <li>Use proper form and technique</li>
                  <li>Stop immediately if you experience pain or discomfort</li>
                  <li>Listen to your body and modify exercises as needed</li>
                  <li>Seek medical attention if you sustain an injury</li>
                </ul>
              </div>
            </section>

            {/* Pre-Existing Health Conditions */}
            <section id="health-conditions" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                Pre-Existing Health Conditions
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  If you have any pre-existing health conditions, injuries, disabilities, or medical concerns, you must consult with a qualified healthcare professional before starting any Motivasi coaching programme.
                </p>
                <p>
                  Conditions that require medical clearance include (but are not limited to):
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Heart disease, high blood pressure, or cardiovascular conditions</li>
                  <li>Diabetes or blood sugar disorders</li>
                  <li>Asthma or respiratory conditions</li>
                  <li>Joint problems, arthritis, or osteoporosis</li>
                  <li>Back or spine issues</li>
                  <li>Pregnancy or postpartum recovery</li>
                  <li>Recent surgery or injury</li>
                  <li>Any condition requiring medication</li>
                </ul>
                <p>
                  While Motivasi specialises in postpartum training and perimenopause coaching, these programmes are still not a substitute for professional medical advice. Always consult with your healthcare provider before beginning any new exercise programme.
                </p>
              </div>
            </section>

            {/* PAR-Q Questionnaire */}
            <section id="parq-importance" className="scroll-mt-20">
              <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-6">
                PAR-Q Questionnaire
              </h2>
              <div className="space-y-4 font-paragraph text-base text-warm-grey leading-relaxed">
                <p>
                  The Physical Activity Readiness Questionnaire (PAR-Q) that you complete before starting coaching is an important health screening tool. It is your responsibility to answer all questions honestly and accurately.
                </p>
                <p>
                  <span className="font-bold text-charcoal-black">Failure to disclose relevant health information may result in:</span>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Inappropriate exercise recommendations</li>
                  <li>Increased risk of injury or adverse health effects</li>
                  <li>Termination of your coaching relationship</li>
                </ul>
                <p>
                  If your health status changes during your coaching programme, you must inform Motivasi immediately. Motivasi reserves the right to modify or terminate your coaching if we believe your health or safety is at risk.
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
                  <li>Any indirect, incidental, or punitive damages</li>
                  <li>Any failure to achieve desired results or outcomes</li>
                  <li>Any technical issues, service interruptions, or data loss</li>
                </ul>
                <p>
                  By using Motivasi's services, you agree to release and hold harmless Motivasi, its owners, employees, and representatives from any and all claims, damages, or liabilities arising from your participation in our coaching programmes.
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
