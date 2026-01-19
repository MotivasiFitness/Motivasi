import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useMember } from '@/integrations';

// ✅ NEW: call server-side web module instead of /_functions/*
import { submitParq } from '@/wix-verticals/backend/parq.web';

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
  medications ब्य?
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
      {description && <p className="font-paragraph text-base text-warm-grey mb-6">{description}</p>}
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

function FormField({ label, name, type = 'text', placeholder, required = false, formData, onChange, children }: FormFieldProps) {
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

function YesNoField({ label, name, required = false, showDetails = false, formData, onChange }: YesNoFieldProps) {
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

      // ✅ NEW: call web module (server-side) instead of HTTP endpoint
      const result = await submitParq({
        clientName: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        memberId: member?._id || undefined,
        answers: {
          ...formData,
          hasRedFlags,
          emailBody, // keeps your formatted version for trainer viewing if you want it
        },
      });

      if (!result?.ok) {
        const msg = result?.error || 'Submission failed. Please try again.';
        setSubmitError(`${msg} If the problem continues, contact us at hello@motivasi.co.uk`);
        return;
      }

      if (!result.id) {
        setSubmitError('Your submission may not have been saved. Please contact us at hello@motivasi.co.uk to confirm.');
        return;
      }

      setIsSubmitted(true);
      setFormData(INITIAL_FORM_DATA);
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      console.error('❌ Form submission error:', error);
      setSubmitError("We couldn't submit your PAR-Q right now. Please try again or contact us at hello@motivasi.co.uk");
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

          {/* Everything below unchanged */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* ... KEEP THE REST OF YOUR FORM EXACTLY AS IT IS ... */}
            {/* (no changes needed below this point) */}

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

      {/* rest of page unchanged */}
    </div>
  );
}
