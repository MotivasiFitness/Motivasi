import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

export default function ParQPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    // Basic Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    
    // Medical Clearance
    medicalConditions: '',
    medicalConditionsDetails: '',
    medications: '',
    medicationsDetails: '',
    surgery: '',
    surgeryDetails: '',
    familyHistory: '',
    familyHistoryDetails: '',
    
    // Injury & Pain History
    currentPain: '',
    currentPainDetails: '',
    pastInjuries: '',
    pastInjuriesDetails: '',
    
    // Exercise Experience & Ability
    exerciseFrequency: '',
    exerciseTypes: '',
    fitnessLevel: '',
    
    // Lifestyle & Recovery
    sleepHours: '',
    stressLevel: '',
    workType: '',
    
    // Female-Specific Considerations
    menstrualCycle: '',
    menopauseStatus: '',
    pregnancyStatus: '',
    
    // Goals & Confidence
    primaryGoal: '',
    secondaryGoals: '',
    confidence: '',
    additionalInfo: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Format the form data into a readable email body
      const emailBody = `
Women's Personal Training PAR-Q & Health Questionnaire Submission

=== BASIC INFORMATION ===
Name: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
Phone: ${formData.phone}
Date of Birth: ${formData.dateOfBirth}

=== MEDICAL CLEARANCE ===
Medical Conditions: ${formData.medicalConditions}
${formData.medicalConditions === 'yes' ? `Details: ${formData.medicalConditionsDetails}` : ''}

Current Medications: ${formData.medications}
${formData.medications === 'yes' ? `Details: ${formData.medicationsDetails}` : ''}

Previous Surgery: ${formData.surgery}
${formData.surgery === 'yes' ? `Details: ${formData.surgeryDetails}` : ''}

Family History of Heart Disease: ${formData.familyHistory}
${formData.familyHistory === 'yes' ? `Details: ${formData.familyHistoryDetails}` : ''}

=== INJURY & PAIN HISTORY ===
Current Pain/Discomfort: ${formData.currentPain}
${formData.currentPain === 'yes' ? `Details: ${formData.currentPainDetails}` : ''}

Past Injuries: ${formData.pastInjuries}
${formData.pastInjuries === 'yes' ? `Details: ${formData.pastInjuriesDetails}` : ''}

=== EXERCISE EXPERIENCE & ABILITY ===
Exercise Frequency: ${formData.exerciseFrequency}
Types of Exercise: ${formData.exerciseTypes}
Fitness Level: ${formData.fitnessLevel}

=== LIFESTYLE & RECOVERY ===
Average Sleep Hours: ${formData.sleepHours}
Stress Level: ${formData.stressLevel}
Work Type: ${formData.workType}

=== FEMALE-SPECIFIC CONSIDERATIONS ===
Menstrual Cycle Status: ${formData.menstrualCycle}
Menopause Status: ${formData.menopauseStatus}
Pregnancy Status: ${formData.pregnancyStatus}

=== GOALS & CONFIDENCE ===
Primary Goal: ${formData.primaryGoal}
Secondary Goals: ${formData.secondaryGoals}
Confidence Level: ${formData.confidence}
Additional Information: ${formData.additionalInfo}
      `;

      // Send email using Formspree (free service for form submissions)
      const response = await fetch('https://formspree.io/f/xyzpqrst', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          message: emailBody,
          _subject: `PAR-Q Questionnaire from ${formData.firstName} ${formData.lastName}`,
          _replyto: formData.email
        })
      });

      if (response.ok) {
        setIsSubmitted(true);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          dateOfBirth: '',
          medicalConditions: '',
          medicalConditionsDetails: '',
          medications: '',
          medicationsDetails: '',
          surgery: '',
          surgeryDetails: '',
          familyHistory: '',
          familyHistoryDetails: '',
          currentPain: '',
          currentPainDetails: '',
          pastInjuries: '',
          pastInjuriesDetails: '',
          exerciseFrequency: '',
          exerciseTypes: '',
          fitnessLevel: '',
          sleepHours: '',
          stressLevel: '',
          workType: '',
          menstrualCycle: '',
          menopauseStatus: '',
          pregnancyStatus: '',
          primaryGoal: '',
          secondaryGoals: '',
          confidence: '',
          additionalInfo: ''
        });
        setTimeout(() => setIsSubmitted(false), 5000);
      } else {
        setSubmitError('Failed to submit form. Please try again or contact us directly at hello@motivasi.co.uk');
      }
    } catch (error) {
      setSubmitError('An error occurred while submitting the form. Please contact us directly at hello@motivasi.co.uk');
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const FormSection = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => (
    <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8 md:p-10">
      <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-2">
        {title}
      </h3>
      {description && (
        <p className="font-paragraph text-base text-warm-grey mb-6">
          {description}
        </p>
      )}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );

  const FormField = ({ label, name, type = 'text', placeholder, required = false, children }: any) => (
    <div>
      <label htmlFor={name} className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
        {label} {required && <span className="text-soft-bronze">*</span>}
      </label>
      {children || (
        <input
          type={type}
          id={name}
          name={name}
          value={formData[name as keyof typeof formData]}
          onChange={handleInputChange}
          placeholder={placeholder}
          required={required}
          className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
        />
      )}
    </div>
  );

  const YesNoField = ({ label, name, required = false, showDetails = false }: any) => (
    <div>
      <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-3">
        {label} {required && <span className="text-soft-bronze">*</span>}
      </label>
      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            value="no"
            checked={formData[name as keyof typeof formData] === 'no'}
            onChange={handleInputChange}
            className="w-4 h-4 accent-soft-bronze"
          />
          <span className="font-paragraph text-base text-charcoal-black">No</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            value="yes"
            checked={formData[name as keyof typeof formData] === 'yes'}
            onChange={handleInputChange}
            className="w-4 h-4 accent-soft-bronze"
          />
          <span className="font-paragraph text-base text-charcoal-black">Yes</span>
        </label>
      </div>
      {showDetails && formData[name as keyof typeof formData] === 'yes' && (
        <textarea
          name={`${name}Details`}
          value={formData[`${name}Details` as keyof typeof formData]}
          onChange={handleInputChange}
          placeholder="Please provide details..."
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
        />
      )}
    </div>
  );

  return (
    <div className="bg-soft-white">
      {/* Hero Section */}
      <section className="py-20 px-8 lg:px-20 bg-warm-sand-beige">
        <div className="max-w-[100rem] mx-auto text-center">
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-charcoal-black mb-6">
            {t.parq.parqTitle}
          </h1>
          <p className="font-paragraph text-lg text-charcoal-black max-w-3xl mx-auto">
            {t.parq.parqSubtitle}
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-24 px-8 lg:px-20">
        <div className="max-w-4xl mx-auto">
          {isSubmitted && (
            <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-2xl flex gap-4">
              <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-heading text-lg font-bold text-green-900 mb-1">
                  Thank You!
                </h3>
                <p className="font-paragraph text-green-800">
                  Your questionnaire has been submitted successfully. We'll review your responses and contact you shortly to discuss your personalised training programme.
                </p>
              </div>
            </div>
          )}

          {submitError && (
            <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-2xl flex gap-4">
              <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-heading text-lg font-bold text-red-900 mb-1">
                  Submission Error
                </h3>
                <p className="font-paragraph text-red-800">
                  {submitError}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <FormSection title="Basic Information" description="Let's start with your contact details.">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField label="First Name" name="firstName" placeholder="Jane" required />
                <FormField label="Last Name" name="lastName" placeholder="Smith" required />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <FormField label="Email Address" name="email" type="email" placeholder="jane@example.com" required />
                <FormField label="Phone Number" name="phone" type="tel" placeholder="+44 (0) 7700 000 000" />
              </div>
              <FormField label="Date of Birth" name="dateOfBirth" type="date" required />
            </FormSection>

            {/* Medical Clearance */}
            <FormSection 
              title="Medical Clearance" 
              description="Please answer the following questions honestly. Your responses help us ensure your safety."
            >
              <YesNoField 
                label="Do you have any diagnosed medical conditions (e.g., heart disease, diabetes, asthma)?" 
                name="medicalConditions"
                showDetails={true}
                required
              />
              <YesNoField 
                label="Are you currently taking any medications?" 
                name="medications"
                showDetails={true}
              />
              <YesNoField 
                label="Have you had any surgeries in the past 12 months?" 
                name="surgery"
                showDetails={true}
              />
              <YesNoField 
                label="Do you have a family history of heart disease, stroke, or diabetes?" 
                name="familyHistory"
                showDetails={true}
              />
            </FormSection>

            {/* Injury & Pain History */}
            <FormSection 
              title="Injury & Pain History" 
              description="Tell us about any current or past injuries that might affect your training."
            >
              <YesNoField 
                label="Do you currently experience any pain or discomfort?" 
                name="currentPain"
                showDetails={true}
              />
              <YesNoField 
                label="Have you had any significant injuries in the past?" 
                name="pastInjuries"
                showDetails={true}
              />
            </FormSection>

            {/* Exercise Experience & Ability */}
            <FormSection 
              title="Exercise Experience & Ability" 
              description="Help us understand your fitness background."
            >
              <FormField label="How often do you currently exercise?" name="exerciseFrequency">
                <select
                  name="exerciseFrequency"
                  value={formData.exerciseFrequency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                  required
                >
                  <option value="">Select an option</option>
                  <option value="never">Never / Sedentary</option>
                  <option value="rarely">Rarely (less than once a month)</option>
                  <option value="sometimes">Sometimes (1-2 times per month)</option>
                  <option value="regular">Regular (1-3 times per week)</option>
                  <option value="frequent">Frequent (4+ times per week)</option>
                </select>
              </FormField>
              <FormField 
                label="What types of exercise do you currently do?" 
                name="exerciseTypes" 
                placeholder="e.g., Walking, yoga, gym workouts, sports..."
              />
              <FormField label="How would you rate your current fitness level?" name="fitnessLevel">
                <select
                  name="fitnessLevel"
                  value={formData.fitnessLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                  required
                >
                  <option value="">Select an option</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </FormField>
            </FormSection>

            {/* Lifestyle & Recovery */}
            <FormSection 
              title="Lifestyle & Recovery" 
              description="Understanding your lifestyle helps us create a sustainable program."
            >
              <FormField label="How many hours of sleep do you typically get per night?" name="sleepHours">
                <select
                  name="sleepHours"
                  value={formData.sleepHours}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                >
                  <option value="">Select an option</option>
                  <option value="less-than-5">Less than 5 hours</option>
                  <option value="5-6">5-6 hours</option>
                  <option value="6-7">6-7 hours</option>
                  <option value="7-8">7-8 hours</option>
                  <option value="more-than-8">More than 8 hours</option>
                </select>
              </FormField>
              <FormField label="How would you rate your current stress level?" name="stressLevel">
                <select
                  name="stressLevel"
                  value={formData.stressLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                >
                  <option value="">Select an option</option>
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                  <option value="very-high">Very High</option>
                </select>
              </FormField>
              <FormField label="What is your primary work type?" name="workType">
                <select
                  name="workType"
                  value={formData.workType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                >
                  <option value="">Select an option</option>
                  <option value="sedentary">Sedentary (desk-based)</option>
                  <option value="light">Light activity</option>
                  <option value="moderate">Moderate activity</option>
                  <option value="heavy">Heavy physical work</option>
                </select>
              </FormField>
            </FormSection>

            {/* Female-Specific Considerations */}
            <FormSection 
              title="Female-Specific Considerations" 
              description="Optional but helpful information to personalise your programme."
            >
              <FormField label="Menstrual Cycle Status" name="menstrualCycle">
                <select
                  name="menstrualCycle"
                  value={formData.menstrualCycle}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                >
                  <option value="">Select an option</option>
                  <option value="regular">Regular cycles</option>
                  <option value="irregular">Irregular cycles</option>
                  <option value="pcos">PCOS</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </FormField>
              <FormField label="Menopause Status" name="menopauseStatus">
                <select
                  name="menopauseStatus"
                  value={formData.menopauseStatus}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                >
                  <option value="">Select an option</option>
                  <option value="pre-menopause">Pre-menopause</option>
                  <option value="peri-menopause">Peri-menopause</option>
                  <option value="post-menopause">Post-menopause</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </FormField>
              <FormField label="Pregnancy Status" name="pregnancyStatus">
                <select
                  name="pregnancyStatus"
                  value={formData.pregnancyStatus}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                >
                  <option value="">Select an option</option>
                  <option value="not-pregnant">Not pregnant</option>
                  <option value="pregnant">Currently pregnant</option>
                  <option value="postpartum">Postpartum (within 12 months)</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </FormField>
            </FormSection>

            {/* Goals & Confidence */}
            <FormSection 
              title="Goals & Confidence" 
              description="Tell us about your fitness goals and what you hope to achieve."
            >
              <FormField 
                label="What is your primary fitness goal?" 
                name="primaryGoal" 
                placeholder="e.g., Lose fat, build strength, improve energy levels..."
                required
              />
              <FormField 
                label="Any secondary goals?" 
                name="secondaryGoals" 
                placeholder="e.g., Better posture, increased flexibility..."
              />
              <FormField label="How confident are you about achieving your goals?" name="confidence">
                <select
                  name="confidence"
                  value={formData.confidence}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                  required
                >
                  <option value="">Select an option</option>
                  <option value="not-confident">Not confident</option>
                  <option value="somewhat-confident">Somewhat confident</option>
                  <option value="confident">Confident</option>
                  <option value="very-confident">Very confident</option>
                </select>
              </FormField>
              <FormField 
                label="Any additional information you'd like to share?" 
                name="additionalInfo"
                placeholder="Tell us anything else we should know..."
              >
                <textarea
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  placeholder="Tell us anything else we should know..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph resize-none"
                />
              </FormField>
            </FormSection>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-charcoal-black text-soft-white px-10 py-4 rounded-lg font-medium text-lg hover:bg-soft-bronze transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Questionnaire'}
                {!isSubmitting && <ArrowRight size={20} />}
              </button>
              <Link
                to="/"
                className="border-2 border-charcoal-black text-charcoal-black px-10 py-4 rounded-lg font-medium text-lg hover:bg-warm-sand-beige/30 transition-colors text-center"
              >
                Back to Home
              </Link>
            </div>
          </form>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-24 px-8 lg:px-20 bg-warm-sand-beige/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-8 text-center">
            Why We Ask These Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-soft-white rounded-2xl p-8 border border-warm-sand-beige">
              <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                Your Safety
              </h3>
              <p className="font-paragraph text-base text-warm-grey">
                Understanding your medical history helps us identify any contraindications and ensure your training program is safe and appropriate for your current health status.
              </p>
            </div>
            <div className="bg-soft-white rounded-2xl p-8 border border-warm-sand-beige">
              <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                Personalisation
              </h3>
              <p className="font-paragraph text-base text-warm-grey">
                Your responses help us create a truly personalised programme that accounts for your unique circumstances, goals, and any special considerations.
              </p>
            </div>
            <div className="bg-soft-white rounded-2xl p-8 border border-warm-sand-beige">
              <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                Better Results
              </h3>
              <p className="font-paragraph text-base text-warm-grey">
                The more we know about your lifestyle, stress levels, and recovery habits, the better we can optimise your training for maximum results.
              </p>
            </div>
            <div className="bg-soft-white rounded-2xl p-8 border border-warm-sand-beige">
              <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                Accountability
              </h3>
              <p className="font-paragraph text-base text-warm-grey">
                This questionnaire is part of our commitment to professional standards and ensuring we're the right fit for your needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-8 lg:px-20 bg-charcoal-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-5xl font-bold text-soft-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="font-paragraph text-lg text-warm-grey mb-8">
            Complete this questionnaire and we'll be in touch within 24 hours to discuss your personalised training programme.
          </p>
          <Link
            to="/store"
            className="inline-flex items-center gap-2 bg-soft-bronze text-soft-white px-10 py-4 rounded-lg font-medium text-lg hover:bg-soft-white hover:text-charcoal-black transition-colors"
          >
            View Our Packages
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
