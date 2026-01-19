import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useMember } from '@/integrations';

type ParQFormData = {
  // Basic Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;

  // Medical Clearance
  medicalConditions: string;
  medicalConditionsDetails: string;
  medications: string;
  medicationsDetails: string;
  surgery: string;
  surgeryDetails: string;
  familyHistory: string;
  familyHistoryDetails: string;
  redFlagSymptoms: string[];

  // Injury & Pain History
  currentPain: string;
  currentPainDetails: string;
  pastInjuries: string;
  pastInjuriesDetails: string;

  // Exercise Experience & Ability
  exerciseFrequency: string;
  exerciseTypes: string;
  fitnessLevel: string;

  // Lifestyle & Recovery
  sleepHours: string;
  stressLevel: string;
  workType: string;

  // Female-Specific Considerations
  menstrualCycle: string;
  menopauseStatus: string;
  pregnancyStatus: string;

  // Goals & Confidence
  primaryGoal: string;
  secondaryGoals: string;
  confidence: string;
  additionalInfo: string;

  // Consent & Declarations
  healthDataConsent: boolean;
  marketingConsent: boolean;
  physicalActivityReadiness: boolean;
  informedConsent: boolean;
  fullName: string;
};

const INITIAL_FORM_DATA: ParQFormData = {
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
  redFlagSymptoms: [],

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
  additionalInfo: '',

  healthDataConsent: false,
  marketingConsent: false,
  physicalActivityReadiness: false,
  informedConsent: false,
  fullName: '',
};

type FormSectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8 md:p-10">
      <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-2">{title}</h3>
      {description && (
        <p className="font-paragraph text-base text-warm-grey mb-6">{description}</p>
      )}
      <div className="space-y-6">{children}</div>
    </div>
  );
}

type FormFieldProps = {
  label: string;
  name: keyof ParQFormData;
  type?: string;
  placeholder?: string;
  required?: boolean;
  formData: ParQFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  children?: React.ReactNode;
};

function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  formData,
  onChange,
  children,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={String(name)} className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
        {label} {required && <span className="text-soft-bronze">*</span>}
      </label>

      {children || (
        <input
          type={type}
          id={String(name)}
          name={String(name)}
          value={(formData[name] as unknown as string) || ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
        />
      )}
    </div>
  );
}

type YesNoFieldProps = {
  label: string;
  name: keyof ParQFormData;
  required?: boolean;
  showDetails?: boolean;
  formData: ParQFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
};

function YesNoField({
  label,
  name,
  required = false,
  showDetails = false,
  formData,
  onChange,
}: YesNoFieldProps) {
  const detailsKey = `${String(name)}Details` as keyof ParQFormData;

  return (
    <div>
      <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-3">
        {label} {required && <span className="text-soft-bronze">*</span>}
      </label>

      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={String(name)}
            value="no"
            checked={formData[name] === 'no'}
            onChange={onChange}
            className="w-4 h-4 accent-soft-bronze"
          />
          <span className="font-paragraph text-base text-charcoal-black">No</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={String(name)}
            value="yes"
            checked={formData[name] === 'yes'}
            onChange={onChange}
            className="w-4 h-4 accent-soft-bronze"
          />
          <span className="font-paragraph text-base text-charcoal-black">Yes</span>
        </label>
      </div>

      {showDetails && formData[name] === 'yes' && (
        <textarea
          name={String(detailsKey)}
          value={(formData[detailsKey] as unknown as string) || ''}
          onChange={onChange}
          placeholder="Please provide details..."
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
        />
      )}
    </div>
  );
}

export default function ParQPage() {
  const { t } = useLanguage();
  const { member } = useMember();

  const [formData, setFormData] = useState<ParQFormData>(INITIAL_FORM_DATA);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;

      if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;

        if (name === 'redFlagSymptoms') {
          setFormData((prev) => {
            const symptoms = checked
              ? [...prev.redFlagSymptoms, value]
              : prev.redFlagSymptoms.filter((s) => s !== value);
            return { ...prev, redFlagSymptoms: symptoms };
          });
        } else {
          setFormData((prev) => ({
            ...prev,
            [name]: checked,
          }));
        }
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    if (!formData.healthDataConsent) {
      setSubmitError('You must consent to health data processing to proceed.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.physicalActivityReadiness) {
      setSubmitError('You must confirm the Physical Activity Readiness Declaration to proceed.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.informedConsent) {
      setSubmitError('You must accept the Informed Consent to proceed.');
      setIsSubmitting(false);
      return;
    }

    try {
      const hasRedFlags =
        formData.redFlagSymptoms.length > 0 && !formData.redFlagSymptoms.includes('none');

      const emailBody = `
Women's Personal Training PAR-Q & Health Questionnaire Submission
${hasRedFlags ? '\n⚠️ RED FLAG SYMPTOMS REPORTED - MEDICAL CLEARANCE REQUIRED' : ''}

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

Red Flag Symptoms During Exercise: ${
        formData.redFlagSymptoms.length > 0 ? formData.redFlagSymptoms.join(', ') : 'None reported'
      }

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
Pregnancy / Postnatal Status: ${formData.pregnancyStatus}

=== GOALS & CONFIDENCE ===
Primary Goal: ${formData.primaryGoal}
Secondary Goals: ${formData.secondaryGoals}
Confidence Level: ${formData.confidence}
Additional Information: ${formData.additionalInfo}

=== DIGITAL SIGNATURE ===
Full Name: ${formData.fullName}
Submission Date/Time: ${new Date().toLocaleString('en-GB')}
      `;

      // Call HTTP Function endpoint (proper JSON response)
      console.log('📤 PAR-Q Submit - Calling HTTP Function');

      const payload = {
        // Core fields (match your CMS)
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth, // YYYY-MM-DD

        // Map to your existing CMS booleans if you have them
        hasHeartCondition: formData.medicalConditions === 'yes',
        currentlyTakingMedication: formData.medications === 'yes',

        // Include member ID if user is logged in
        memberId: member?._id || undefined,

        // Medical risk indicators for flagsYes calculation
        medicalConditions: formData.medicalConditions,
        medications: formData.medications,
        surgery: formData.surgery,
        familyHistory: formData.familyHistory,
        currentPain: formData.currentPain,
        pastInjuries: formData.pastInjuries,
        redFlagSymptoms: formData.redFlagSymptoms,

        // Store the entire submission (best for automations + audit trail)
        formData: emailBody,
      };

      const response = await fetch('/_functions/parq-submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📥 PAR-Q Submit - Response status:', response.status);

      // Parse JSON response
      let result;
      try {
        result = await response.json();
        console.log('📥 PAR-Q Submit - Result:', result);
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', parseError);
        setSubmitError('Unable to submit your PAR-Q. Please try again or contact us at hello@motivasi.co.uk');
        return;
      }

      // Check for success using the HTTP function's response format
      // HTTP function returns: { ok: true, id: '...' } or { ok: false, code: '...', error: '...' }
      if (!result.ok) {
        console.error('❌ PAR-Q Submit - Backend returned error');
        console.error('Result:', result);
        
        const errorMessage = result.error || 'Submission failed';
        console.error(`❌ Error: ${errorMessage}`);
        
        // User-friendly error message
        setSubmitError(`Unable to submit your PAR-Q: ${errorMessage}. Please try again or contact us at hello@motivasi.co.uk`);
        return;
      }

      // Verify we have a submission ID
      if (!result.id) {
        console.error('❌ PAR-Q Submit - Success but no submission ID returned');
        console.error('Result:', result);
        setSubmitError('Your submission may not have been saved. Please contact us at hello@motivasi.co.uk to confirm.');
        return;
      }

      // SUCCESS - All checks passed
      console.log('✅ PAR-Q submitted successfully!');
      console.log('✅ Submission ID:', result.id);

      setIsSubmitted(true);
      setFormData(INITIAL_FORM_DATA);
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      console.error('❌ Form submission error:', error);
      setSubmitError('An error occurred while submitting the form. Please contact us directly at hello@motivasi.co.uk');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  Thank You for Completing Your PAR-Q
                </h3>
                <p className="font-paragraph text-green-800">
                  We'll review your responses and be in touch within 24 hours. If medical clearance is required, we'll let you know next steps before training begins.
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
                <p className="font-paragraph text-red-800">{submitError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <FormSection title="Basic Information" description="Let's start with your contact details.">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField label="First Name" name="firstName" placeholder="Jane" required formData={formData} onChange={handleInputChange} />
                <FormField label="Last Name" name="lastName" placeholder="Smith" required formData={formData} onChange={handleInputChange} />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <FormField label="Email Address" name="email" type="email" placeholder="jane@example.com" required formData={formData} onChange={handleInputChange} />
                <FormField label="Phone Number" name="phone" type="tel" placeholder="+44 (0) 7700 000 000" formData={formData} onChange={handleInputChange} />
              </div>
              <FormField label="Date of Birth" name="dateOfBirth" type="date" required formData={formData} onChange={handleInputChange} />
            </FormSection>

            {/* Medical Clearance */}
            <FormSection
              title="Medical Clearance"
              description="Please answer the following questions honestly. Your responses help us ensure your safety."
            >
              <YesNoField label="Do you have any diagnosed medical conditions (e.g., heart disease, diabetes, asthma)?" name="medicalConditions" showDetails required formData={formData} onChange={handleInputChange} />
              <YesNoField label="Are you currently taking any medications?" name="medications" showDetails formData={formData} onChange={handleInputChange} />
              <YesNoField label="Have you had any surgeries in the past 12 months?" name="surgery" showDetails formData={formData} onChange={handleInputChange} />
              <YesNoField label="Do you have a family history of heart disease, stroke, or diabetes?" name="familyHistory" showDetails formData={formData} onChange={handleInputChange} />

              {/* Red Flag Symptoms */}
              <div className="border-t border-warm-sand-beige pt-6">
                <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-3">
                  Have you ever experienced any of the following during or after exercise? (Select all that apply)
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'chest-pain', label: 'Chest pain or pressure' },
                    { value: 'dizziness', label: 'Dizziness or fainting' },
                    { value: 'shortness-of-breath', label: 'Shortness of breath beyond normal exertion' },
                    { value: 'palpitations', label: 'Heart palpitations' },
                    { value: 'none', label: 'None of the above' },
                  ].map((symptom) => (
                    <label key={symptom.value} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="redFlagSymptoms"
                        value={symptom.value}
                        checked={formData.redFlagSymptoms.includes(symptom.value)}
                        onChange={handleInputChange}
                        className="w-4 h-4 accent-soft-bronze rounded"
                      />
                      <span className="font-paragraph text-base text-charcoal-black">{symptom.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </FormSection>

            {/* Important - Medical Clearance Trigger */}
            <div className="bg-soft-bronze/10 border border-soft-bronze/30 rounded-2xl p-8">
              <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">Important – Medical Clearance</h3>
              <p className="font-paragraph text-base text-charcoal-black leading-relaxed">
                If you answer "Yes" to any of the medical or injury questions above, you may be required to obtain written medical clearance from a GP or qualified healthcare professional before starting your personal training programme. Motivasi reserves the right to delay or modify training until appropriate clearance is received, to ensure your safety.
              </p>
            </div>

            {/* Injury & Pain History */}
            <FormSection title="Injury & Pain History" description="Tell us about any current or past injuries that might affect your training.">
              <YesNoField label="Do you currently experience any pain or discomfort?" name="currentPain" showDetails formData={formData} onChange={handleInputChange} />
              <YesNoField label="Have you had any significant injuries in the past?" name="pastInjuries" showDetails formData={formData} onChange={handleInputChange} />
            </FormSection>

            {/* Exercise Experience & Ability */}
            <FormSection title="Exercise Experience & Ability" description="Help us understand your fitness background.">
              <FormField label="How often do you currently exercise?" name="exerciseFrequency" formData={formData} onChange={handleInputChange}>
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
                formData={formData}
                onChange={handleInputChange}
              />

              <FormField label="How would you rate your current fitness level?" name="fitnessLevel" formData={formData} onChange={handleInputChange}>
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
            <FormSection title="Lifestyle & Recovery" description="Understanding your lifestyle helps us create a sustainable program.">
              <FormField label="How many hours of sleep do you typically get per night?" name="sleepHours" formData={formData} onChange={handleInputChange}>
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

              <FormField label="How would you rate your current stress level?" name="stressLevel" formData={formData} onChange={handleInputChange}>
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

              <FormField label="What is your primary work type?" name="workType" formData={formData} onChange={handleInputChange}>
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
            <FormSection title="Female-Specific Considerations" description="Optional but helpful information to personalise your programme.">
              <FormField label="Menstrual Cycle Status" name="menstrualCycle" formData={formData} onChange={handleInputChange}>
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

              <FormField label="Menopause Status" name="menopauseStatus" formData={formData} onChange={handleInputChange}>
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

              <FormField label="Pregnancy Status" name="pregnancyStatus" formData={formData} onChange={handleInputChange}>
                <select
                  name="pregnancyStatus"
                  value={formData.pregnancyStatus}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                >
                  <option value="">Select an option</option>
                  <option value="not-pregnant">Not pregnant</option>
                  <option value="pregnant">Currently pregnant</option>
                  <option value="postnatal">Postnatal (within the last 12 months)</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </FormField>

              <p className="font-paragraph text-sm text-warm-grey italic">
                If you are currently pregnant or postnatal, training will be adapted accordingly and may require medical clearance depending on your circumstances.
              </p>
            </FormSection>

            {/* Goals & Confidence */}
            <FormSection title="Goals & Confidence" description="Tell us about your fitness goals and what you hope to achieve.">
              <FormField
                label="What is your primary fitness goal?"
                name="primaryGoal"
                placeholder="e.g., Lose fat, build strength, improve energy levels..."
                required
                formData={formData}
                onChange={handleInputChange}
              />
              <FormField
                label="Any secondary goals?"
                name="secondaryGoals"
                placeholder="e.g., Better posture, increased flexibility..."
                formData={formData}
                onChange={handleInputChange}
              />
              <FormField label="How confident are you about achieving your goals?" name="confidence" required formData={formData} onChange={handleInputChange}>
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

              <FormField label="Any additional information you'd like to share?" name="additionalInfo" formData={formData} onChange={handleInputChange}>
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

            {/* Privacy Notice */}
            <div className="bg-warm-sand-beige/30 border border-warm-sand-beige rounded-2xl p-8">
              <p className="font-paragraph text-sm text-charcoal-black leading-relaxed">
                By submitting this form, you acknowledge that your personal data will be used to respond to your enquiry, manage bookings, and provide personal training services in accordance with our{' '}
                <Link to="/privacy" className="text-soft-bronze hover:underline">
                  Privacy & Cookie Policy
                </Link>
                .
              </p>
            </div>

            {/* Physical Activity Readiness Declaration */}
            <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8 md:p-10">
              <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">Physical Activity Readiness Declaration</h3>
              <p className="font-paragraph text-base text-charcoal-black leading-relaxed mb-6">
                I confirm that the information I have provided in this questionnaire is complete and accurate to the best of my knowledge. I understand that participating in physical exercise involves some inherent risk, and I agree to inform my trainer immediately of any changes to my health, medical condition, or pregnancy status during my training programme.
              </p>
            </div>

            {/* Professional Scope Disclaimer */}
            <div className="bg-soft-bronze/10 border border-soft-bronze/30 rounded-2xl p-8">
              <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">Important Notice</h3>
              <p className="font-paragraph text-base text-charcoal-black leading-relaxed">
                Motivasi provides fitness coaching and personal training services only. We do not diagnose medical conditions or provide medical advice. Any guidance provided is for general fitness purposes and should not replace advice from a qualified healthcare professional.
              </p>
            </div>

            {/* Consent Checkboxes */}
            <FormSection title="Consent & Preferences">
              <div className="space-y-6">
                <div className="flex items-start gap-3 p-4 bg-soft-white border border-warm-sand-beige rounded-lg">
                  <input
                    type="checkbox"
                    id="healthDataConsent"
                    name="healthDataConsent"
                    checked={formData.healthDataConsent}
                    onChange={handleInputChange}
                    required
                    className="w-5 h-5 accent-soft-bronze mt-0.5 flex-shrink-0 cursor-pointer"
                  />
                  <label htmlFor="healthDataConsent" className="font-paragraph text-sm text-charcoal-black cursor-pointer flex-1">
                    <span className="text-soft-bronze font-bold">*</span> <span className="font-bold">Consent & Data Use:</span> I consent to Motivasi collecting and processing my health and fitness information for the purpose of delivering a personalised training programme. I understand that this information will be handled confidentially and in accordance with the{' '}
                    <Link to="/privacy" className="text-soft-bronze hover:underline">
                      Privacy & Cookie Policy
                    </Link>{' '}
                    and applicable data protection laws.
                  </label>
                </div>

                <div className="flex items-start gap-3 p-4 bg-soft-white border border-warm-sand-beige rounded-lg">
                  <input
                    type="checkbox"
                    id="physicalActivityReadiness"
                    name="physicalActivityReadiness"
                    checked={formData.physicalActivityReadiness}
                    onChange={handleInputChange}
                    required
                    className="w-5 h-5 accent-soft-bronze mt-0.5 flex-shrink-0 cursor-pointer"
                  />
                  <label htmlFor="physicalActivityReadiness" className="font-paragraph text-sm text-charcoal-black cursor-pointer flex-1">
                    <span className="text-soft-bronze font-bold">*</span> I confirm that the information I have provided in this questionnaire is complete and accurate to the best of my knowledge. I understand that participating in physical exercise involves some inherent risk, and I agree to inform my trainer immediately of any changes to my health, medical condition, or pregnancy status during my training programme.
                  </label>
                </div>

                <div className="flex items-start gap-3 p-4 bg-soft-white border border-warm-sand-beige rounded-lg">
                  <input
                    type="checkbox"
                    id="informedConsent"
                    name="informedConsent"
                    checked={formData.informedConsent}
                    onChange={handleInputChange}
                    required
                    className="w-5 h-5 accent-soft-bronze mt-0.5 flex-shrink-0 cursor-pointer"
                  />
                  <label htmlFor="informedConsent" className="font-paragraph text-sm text-charcoal-black cursor-pointer flex-1">
                    <span className="text-soft-bronze font-bold">*</span> I understand that personal training involves physical activity and accept responsibility for participating within my own limits. I agree to follow my trainer's instructions and to stop exercising if I experience pain, dizziness, or discomfort.
                  </label>
                </div>

                <div className="flex items-start gap-3 p-4 bg-soft-white border border-warm-sand-beige rounded-lg">
                  <input
                    type="checkbox"
                    id="marketingConsent"
                    name="marketingConsent"
                    checked={formData.marketingConsent}
                    onChange={handleInputChange}
                    className="w-5 h-5 accent-soft-bronze mt-0.5 flex-shrink-0 cursor-pointer"
                  />
                  <label htmlFor="marketingConsent" className="font-paragraph text-sm text-charcoal-black cursor-pointer flex-1">
                    I would like to receive updates, offers, and marketing communications from Motivasi. I understand I can unsubscribe at any time.
                  </label>
                </div>

                <div className="border-t border-warm-sand-beige pt-6">
                  <label htmlFor="fullName" className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                    Full Name (Digital Signature) <span className="text-soft-bronze">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                  />
                  <p className="font-paragraph text-xs text-warm-grey mt-2">
                    By entering your name, you are digitally signing this questionnaire. Date and time will be automatically recorded upon submission.
                  </p>
                </div>
              </div>
            </FormSection>

            {/* Reassurance Block */}
            <div className="bg-warm-sand-beige/20 border border-warm-sand-beige rounded-2xl p-8 md:p-12">
              <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-8 text-center">You're in the Right Place If…</h3>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {[
                  "You're a busy woman or mum who wants realistic support",
                  "You want to feel stronger and healthier without extreme diets",
                  "You value guidance from someone who truly understands women's bodies",
                ].map((txt) => (
                  <div key={txt} className="flex gap-4 items-start">
                    <div className="w-6 h-6 rounded-full bg-soft-bronze flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-soft-white font-heading font-bold text-sm">✓</span>
                    </div>
                    <p className="font-paragraph text-base text-charcoal-black leading-relaxed">{txt}</p>
                  </div>
                ))}
              </div>
              <p className="font-paragraph text-base text-charcoal-black italic text-center">
                This is about progress — not perfection.
              </p>
            </div>

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
          <h2 className="font-heading text-4xl font-bold text-charcoal-black mb-8 text-center">Why We Ask These Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: 'Your Safety',
                body: 'Understanding your medical history helps us identify any contraindications and ensure your training program is safe and appropriate for your current health status.',
              },
              {
                title: 'Personalisation',
                body: 'Your responses help us create a truly personalised programme that accounts for your unique circumstances, goals, and any special considerations.',
              },
              {
                title: 'Better Results',
                body: 'The more we know about your lifestyle, stress levels, and recovery habits, the better we can optimise your training for maximum results.',
              },
              {
                title: 'Accountability',
                body: "This questionnaire is part of our commitment to professional standards and ensuring we're the right fit for your needs.",
              },
            ].map((card) => (
              <div key={card.title} className="bg-soft-white rounded-2xl p-8 border border-warm-sand-beige">
                <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">{card.title}</h3>
                <p className="font-paragraph text-base text-warm-grey">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-8 lg:px-20 bg-charcoal-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-5xl font-bold text-soft-white mb-6">Ready to Get Started?</h2>
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
