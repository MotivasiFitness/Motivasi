import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { BaseCrudService } from '@/integrations';
import { ParQ } from '@/entities';

interface FormData {
  // Client Info
  fullName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  
  // General Health
  heartCondition: boolean | null;
  chestPain: boolean | null;
  dizzinessFainting: boolean | null;
  highBloodPressure: boolean | null;
  diabetes: boolean | null;
  respiratoryCondition: boolean | null;
  exerciseAffectingMedication: boolean | null;
  generalHealthDetails: string;
  
  // Musculoskeletal & Orthopedic
  jointPainOrArthritis: boolean | null;
  pastInjuryOrSurgery: boolean | null;
  lowBackPain: boolean | null;
  osteoporosisOrOsteopenia: boolean | null;
  balanceIssuesOrFalls: boolean | null;
  orthoDetails: string;
  
  // Women-Specific Health
  pregnantOrPossible: boolean | null;
  postpartumWithin12Months: boolean | null;
  cSectionHistory: boolean | null;
  pelvicFloorSymptoms: boolean | null;
  endoOrPCOS: boolean | null;
  irregularPainfulAbsentCycles: boolean | null;
  periOrPostMenopause: boolean | null;
  thyroidOrUnexplainedFatigueSymptoms: boolean | null;
  womensHealthDetails: string;
  
  // Lifestyle & Recovery
  highStress: boolean | null;
  sleepBelow6to7: boolean | null;
  eatingDisorderHistory: boolean | null;
  prolongedSoreness: boolean | null;
  fearAvoidExercise: boolean | null;
  lifestyleDetails: string;
  
  // Medical Clearance
  toldNotToExercise: boolean | null;
  toldNeedMedicalClearance: boolean | null;
  medicalClearanceDetails: string;
  
  // Consent
  declarationAgreed: boolean;
  signatureFullName: string;
  signatureDate: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function WomensPARQForm() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    heartCondition: null,
    chestPain: null,
    dizzinessFainting: null,
    highBloodPressure: null,
    diabetes: null,
    respiratoryCondition: null,
    exerciseAffectingMedication: null,
    generalHealthDetails: '',
    jointPainOrArthritis: null,
    pastInjuryOrSurgery: null,
    lowBackPain: null,
    osteoporosisOrOsteopenia: null,
    balanceIssuesOrFalls: null,
    orthoDetails: '',
    pregnantOrPossible: null,
    postpartumWithin12Months: null,
    cSectionHistory: null,
    pelvicFloorSymptoms: null,
    endoOrPCOS: null,
    irregularPainfulAbsentCycles: null,
    periOrPostMenopause: null,
    thyroidOrUnexplainedFatigueSymptoms: null,
    womensHealthDetails: '',
    highStress: null,
    sleepBelow6to7: null,
    eatingDisorderHistory: null,
    prolongedSoreness: null,
    fearAvoidExercise: null,
    lifestyleDetails: '',
    toldNotToExercise: null,
    toldNeedMedicalClearance: null,
    medicalClearanceDetails: '',
    declarationAgreed: false,
    signatureFullName: '',
    signatureDate: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [warnings, setWarnings] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Check if any question in a section is answered "Yes"
  const hasGeneralHealthYes = [
    formData.heartCondition,
    formData.chestPain,
    formData.dizzinessFainting,
    formData.highBloodPressure,
    formData.diabetes,
    formData.respiratoryCondition,
    formData.exerciseAffectingMedication,
  ].some(val => val === true);

  const hasOrthoYes = [
    formData.jointPainOrArthritis,
    formData.pastInjuryOrSurgery,
    formData.lowBackPain,
    formData.osteoporosisOrOsteopenia,
    formData.balanceIssuesOrFalls,
  ].some(val => val === true);

  const hasWomensHealthYes = [
    formData.pregnantOrPossible,
    formData.postpartumWithin12Months,
    formData.cSectionHistory,
    formData.pelvicFloorSymptoms,
    formData.endoOrPCOS,
    formData.irregularPainfulAbsentCycles,
    formData.periOrPostMenopause,
    formData.thyroidOrUnexplainedFatigueSymptoms,
  ].some(val => val === true);

  const hasLifestyleYes = [
    formData.highStress,
    formData.sleepBelow6to7,
    formData.eatingDisorderHistory,
    formData.prolongedSoreness,
    formData.fearAvoidExercise,
  ].some(val => val === true);

  const hasMedicalClearanceYes = [
    formData.toldNotToExercise,
    formData.toldNeedMedicalClearance,
  ].some(val => val === true);

  // Update warnings when details fields change
  useEffect(() => {
    const newWarnings: FormErrors = {};
    
    if (hasGeneralHealthYes && !formData.generalHealthDetails.trim()) {
      newWarnings.generalHealthDetails = 'Details recommended.';
    }
    if (hasOrthoYes && !formData.orthoDetails.trim()) {
      newWarnings.orthoDetails = 'Details recommended.';
    }
    if (hasWomensHealthYes && !formData.womensHealthDetails.trim()) {
      newWarnings.womensHealthDetails = 'Details recommended.';
    }
    if (hasLifestyleYes && !formData.lifestyleDetails.trim()) {
      newWarnings.lifestyleDetails = 'Details recommended.';
    }
    if (hasMedicalClearanceYes && !formData.medicalClearanceDetails.trim()) {
      newWarnings.medicalClearanceDetails = 'Details recommended.';
    }
    
    setWarnings(newWarnings);
  }, [
    hasGeneralHealthYes,
    hasOrthoYes,
    hasWomensHealthYes,
    hasLifestyleYes,
    hasMedicalClearanceYes,
    formData.generalHealthDetails,
    formData.orthoDetails,
    formData.womensHealthDetails,
    formData.lifestyleDetails,
    formData.medicalClearanceDetails,
  ]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()) ? age - 1 : age;

      if (dob >= today) {
        newErrors.dateOfBirth = 'Date of birth must be in the past';
      } else if (actualAge < 16) {
        newErrors.dateOfBirth = 'You must be at least 16 years old';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.declarationAgreed) {
      newErrors.declarationAgreed = 'You must agree to the declaration';
    }

    if (!formData.signatureFullName.trim()) {
      newErrors.signatureFullName = 'Signature (typed full name) is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Create the PAR-Q submission in CMS with all form data
      const parqData: any = {
        clientName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        email: formData.email,
        phone: formData.phone,
        hasHeartCondition: formData.heartCondition === null ? undefined : formData.heartCondition,
        emergencyContactNumber: formData.phone,
        submissionDateTime: new Date().toISOString(),
        
        // General Health - store null as undefined to distinguish from false
        chestPain: formData.chestPain === null ? undefined : formData.chestPain,
        dizzinessFainting: formData.dizzinessFainting === null ? undefined : formData.dizzinessFainting,
        highBloodPressure: formData.highBloodPressure === null ? undefined : formData.highBloodPressure,
        diabetes: formData.diabetes === null ? undefined : formData.diabetes,
        respiratoryCondition: formData.respiratoryCondition === null ? undefined : formData.respiratoryCondition,
        exerciseAffectingMedication: formData.exerciseAffectingMedication === null ? undefined : formData.exerciseAffectingMedication,
        generalHealthDetails: formData.generalHealthDetails,
        
        // Musculoskeletal & Orthopedic
        jointPainOrArthritis: formData.jointPainOrArthritis === null ? undefined : formData.jointPainOrArthritis,
        pastInjuryOrSurgery: formData.pastInjuryOrSurgery === null ? undefined : formData.pastInjuryOrSurgery,
        lowBackPain: formData.lowBackPain === null ? undefined : formData.lowBackPain,
        osteoporosisOrOsteopenia: formData.osteoporosisOrOsteopenia === null ? undefined : formData.osteoporosisOrOsteopenia,
        balanceIssuesOrFalls: formData.balanceIssuesOrFalls === null ? undefined : formData.balanceIssuesOrFalls,
        orthoDetails: formData.orthoDetails,
        
        // Women-Specific Health
        pregnantOrPossible: formData.pregnantOrPossible === null ? undefined : formData.pregnantOrPossible,
        postpartumWithin12Months: formData.postpartumWithin12Months === null ? undefined : formData.postpartumWithin12Months,
        cSectionHistory: formData.cSectionHistory === null ? undefined : formData.cSectionHistory,
        pelvicFloorSymptoms: formData.pelvicFloorSymptoms === null ? undefined : formData.pelvicFloorSymptoms,
        endoOrPCOS: formData.endoOrPCOS === null ? undefined : formData.endoOrPCOS,
        irregularPainfulAbsentCycles: formData.irregularPainfulAbsentCycles === null ? undefined : formData.irregularPainfulAbsentCycles,
        periOrPostMenopause: formData.periOrPostMenopause === null ? undefined : formData.periOrPostMenopause,
        thyroidOrUnexplainedFatigueSymptoms: formData.thyroidOrUnexplainedFatigueSymptoms === null ? undefined : formData.thyroidOrUnexplainedFatigueSymptoms,
        womensHealthDetails: formData.womensHealthDetails,
        
        // Lifestyle & Recovery
        highStress: formData.highStress === null ? undefined : formData.highStress,
        sleepBelow6to7: formData.sleepBelow6to7 === null ? undefined : formData.sleepBelow6to7,
        eatingDisorderHistory: formData.eatingDisorderHistory === null ? undefined : formData.eatingDisorderHistory,
        prolongedSoreness: formData.prolongedSoreness === null ? undefined : formData.prolongedSoreness,
        fearAvoidExercise: formData.fearAvoidExercise === null ? undefined : formData.fearAvoidExercise,
        lifestyleDetails: formData.lifestyleDetails,
        
        // Medical Clearance
        toldNotToExercise: formData.toldNotToExercise === null ? undefined : formData.toldNotToExercise,
        toldNeedMedicalClearance: formData.toldNeedMedicalClearance === null ? undefined : formData.toldNeedMedicalClearance,
        medicalClearanceDetails: formData.medicalClearanceDetails,
        
        // Consent
        declarationAgreed: formData.declarationAgreed,
        signatureFullName: formData.signatureFullName,
        signatureDate: formData.signatureDate,
      };

      await BaseCrudService.create('ParqSubmission', {
        ...parqData,
        _id: crypto.randomUUID()
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting PAR-Q form:', error);
      setSubmitError(`Failed to submit the form. Please try again. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const renderYesNoQuestion = (
    field: keyof FormData,
    label: string,
    id: string
  ) => {
    const value = formData[field] as boolean | null;
    return (
      <fieldset className="mb-4">
        <legend className="font-paragraph text-base text-charcoal-black mb-2">{label}</legend>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={id}
              checked={value === true}
              onChange={() => handleInputChange(field, true)}
              className="w-4 h-4 text-primary focus:ring-primary"
            />
            <span className="font-paragraph text-sm">Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={id}
              checked={value === false}
              onChange={() => handleInputChange(field, false)}
              className="w-4 h-4 text-primary focus:ring-primary"
            />
            <span className="font-paragraph text-sm">No</span>
          </label>
        </div>
      </fieldset>
    );
  };

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-6">
        <Card className="p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="font-heading text-3xl font-bold text-charcoal-black mb-2">
            Form Submitted Successfully
          </h2>
          <p className="font-paragraph text-base text-warm-grey mb-4">
            Your PAR-Q form has been submitted and saved to the database.
          </p>
          <p className="font-paragraph text-sm text-warm-grey">
            Your trainer will review this information to design a safe and effective exercise program for you.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="mb-8">
        <h1 className="font-heading text-5xl font-bold text-charcoal-black mb-4">
          Women's PAR-Q Health Questionnaire
        </h1>
        <div className="bg-soft-bronze/10 border border-soft-bronze/30 rounded-lg p-4 mb-6">
          <p className="font-paragraph text-sm text-charcoal-black">
            <strong>Privacy Notice:</strong> This form is confidential and used to support safe exercise programming. 
            Please avoid unnecessary medical detail.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Client Details */}
        <Card className="p-6">
          <h2 className="font-heading text-3xl font-bold text-charcoal-black mb-6">
            Client Details
          </h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="font-paragraph text-base text-charcoal-black">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className={errors.fullName ? 'border-destructive' : ''}
                aria-describedby={errors.fullName ? 'fullName-error' : undefined}
              />
              {errors.fullName && (
                <p id="fullName-error" className="text-destructive text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.fullName}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="dateOfBirth" className="font-paragraph text-base text-charcoal-black">
                Date of Birth <span className="text-destructive">*</span>
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className={errors.dateOfBirth ? 'border-destructive' : ''}
                aria-describedby={errors.dateOfBirth ? 'dateOfBirth-error' : undefined}
              />
              {errors.dateOfBirth && (
                <p id="dateOfBirth-error" className="text-destructive text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.dateOfBirth}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="font-paragraph text-base text-charcoal-black">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'border-destructive' : ''}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-destructive text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="phone" className="font-paragraph text-base text-charcoal-black">
                Phone (Optional)
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Section 2: General Health */}
        <Card className="p-6">
          <h2 className="font-heading text-3xl font-bold text-charcoal-black mb-6">
            General Health
          </h2>
          
          <div className="space-y-4">
            {renderYesNoQuestion('heartCondition', 'Do you have a heart condition?', 'heartCondition')}
            {renderYesNoQuestion('chestPain', 'Do you experience chest pain during physical activity?', 'chestPain')}
            {renderYesNoQuestion('dizzinessFainting', 'Do you experience dizziness or fainting?', 'dizzinessFainting')}
            {renderYesNoQuestion('highBloodPressure', 'Do you have high blood pressure?', 'highBloodPressure')}
            {renderYesNoQuestion('diabetes', 'Do you have diabetes?', 'diabetes')}
            {renderYesNoQuestion('respiratoryCondition', 'Do you have any respiratory conditions (e.g., asthma)?', 'respiratoryCondition')}
            {renderYesNoQuestion('exerciseAffectingMedication', 'Are you taking any medication that affects your ability to exercise?', 'exerciseAffectingMedication')}

            {hasGeneralHealthYes && (
              <div>
                <Label htmlFor="generalHealthDetails" className="font-paragraph text-base text-charcoal-black">
                  Please provide details
                </Label>
                <Textarea
                  id="generalHealthDetails"
                  value={formData.generalHealthDetails}
                  onChange={(e) => handleInputChange('generalHealthDetails', e.target.value)}
                  rows={4}
                  className="mt-2"
                  aria-describedby={warnings.generalHealthDetails ? 'generalHealthDetails-warning' : undefined}
                />
                {warnings.generalHealthDetails && (
                  <p id="generalHealthDetails-warning" className="text-soft-bronze text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {warnings.generalHealthDetails}
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Section 3: Musculoskeletal & Orthopedic */}
        <Card className="p-6">
          <h2 className="font-heading text-3xl font-bold text-charcoal-black mb-6">
            Musculoskeletal & Orthopedic
          </h2>
          
          <div className="space-y-4">
            {renderYesNoQuestion('jointPainOrArthritis', 'Do you have joint pain or arthritis?', 'jointPainOrArthritis')}
            {renderYesNoQuestion('pastInjuryOrSurgery', 'Have you had any past injuries or surgeries?', 'pastInjuryOrSurgery')}
            {renderYesNoQuestion('lowBackPain', 'Do you experience low back pain?', 'lowBackPain')}
            {renderYesNoQuestion('osteoporosisOrOsteopenia', 'Do you have osteoporosis or osteopenia?', 'osteoporosisOrOsteopenia')}
            {renderYesNoQuestion('balanceIssuesOrFalls', 'Do you have balance issues or a history of falls?', 'balanceIssuesOrFalls')}

            {hasOrthoYes && (
              <div>
                <Label htmlFor="orthoDetails" className="font-paragraph text-base text-charcoal-black">
                  Please provide details
                </Label>
                <Textarea
                  id="orthoDetails"
                  value={formData.orthoDetails}
                  onChange={(e) => handleInputChange('orthoDetails', e.target.value)}
                  rows={4}
                  className="mt-2"
                  aria-describedby={warnings.orthoDetails ? 'orthoDetails-warning' : undefined}
                />
                {warnings.orthoDetails && (
                  <p id="orthoDetails-warning" className="text-soft-bronze text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {warnings.orthoDetails}
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Section 4: Women-Specific Health */}
        <Card className="p-6">
          <h2 className="font-heading text-3xl font-bold text-charcoal-black mb-6">
            Women-Specific Health
          </h2>
          
          <div className="space-y-4">
            {renderYesNoQuestion('pregnantOrPossible', 'Are you pregnant or possibly pregnant?', 'pregnantOrPossible')}
            {renderYesNoQuestion('postpartumWithin12Months', 'Are you postpartum within the last 12 months?', 'postpartumWithin12Months')}
            {renderYesNoQuestion('cSectionHistory', 'Do you have a history of C-section?', 'cSectionHistory')}
            {renderYesNoQuestion('pelvicFloorSymptoms', 'Do you experience pelvic floor symptoms (e.g., incontinence)?', 'pelvicFloorSymptoms')}
            {renderYesNoQuestion('endoOrPCOS', 'Do you have endometriosis or PCOS?', 'endoOrPCOS')}
            {renderYesNoQuestion('irregularPainfulAbsentCycles', 'Do you have irregular, painful, or absent menstrual cycles?', 'irregularPainfulAbsentCycles')}
            {renderYesNoQuestion('periOrPostMenopause', 'Are you perimenopausal or postmenopausal?', 'periOrPostMenopause')}
            {renderYesNoQuestion('thyroidOrUnexplainedFatigueSymptoms', 'Do you have thyroid issues or unexplained fatigue symptoms?', 'thyroidOrUnexplainedFatigueSymptoms')}

            {hasWomensHealthYes && (
              <div>
                <Label htmlFor="womensHealthDetails" className="font-paragraph text-base text-charcoal-black">
                  Please provide details
                </Label>
                <Textarea
                  id="womensHealthDetails"
                  value={formData.womensHealthDetails}
                  onChange={(e) => handleInputChange('womensHealthDetails', e.target.value)}
                  rows={4}
                  className="mt-2"
                  aria-describedby={warnings.womensHealthDetails ? 'womensHealthDetails-warning' : undefined}
                />
                {warnings.womensHealthDetails && (
                  <p id="womensHealthDetails-warning" className="text-soft-bronze text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {warnings.womensHealthDetails}
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Section 5: Lifestyle & Recovery */}
        <Card className="p-6">
          <h2 className="font-heading text-3xl font-bold text-charcoal-black mb-6">
            Lifestyle & Recovery
          </h2>
          
          <div className="space-y-4">
            {renderYesNoQuestion('highStress', 'Do you experience high levels of stress?', 'highStress')}
            {renderYesNoQuestion('sleepBelow6to7', 'Do you regularly get less than 6-7 hours of sleep?', 'sleepBelow6to7')}
            {renderYesNoQuestion('eatingDisorderHistory', 'Do you have a history of eating disorders?', 'eatingDisorderHistory')}
            {renderYesNoQuestion('prolongedSoreness', 'Do you experience prolonged muscle soreness after exercise?', 'prolongedSoreness')}
            {renderYesNoQuestion('fearAvoidExercise', 'Do you have fear or avoidance of exercise?', 'fearAvoidExercise')}

            {hasLifestyleYes && (
              <div>
                <Label htmlFor="lifestyleDetails" className="font-paragraph text-base text-charcoal-black">
                  Please provide details
                </Label>
                <Textarea
                  id="lifestyleDetails"
                  value={formData.lifestyleDetails}
                  onChange={(e) => handleInputChange('lifestyleDetails', e.target.value)}
                  rows={4}
                  className="mt-2"
                  aria-describedby={warnings.lifestyleDetails ? 'lifestyleDetails-warning' : undefined}
                />
                {warnings.lifestyleDetails && (
                  <p id="lifestyleDetails-warning" className="text-soft-bronze text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {warnings.lifestyleDetails}
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Section 6: Medical Clearance */}
        <Card className="p-6">
          <h2 className="font-heading text-3xl font-bold text-charcoal-black mb-6">
            Medical Clearance
          </h2>
          
          <div className="space-y-4">
            {renderYesNoQuestion('toldNotToExercise', 'Has a doctor told you not to exercise?', 'toldNotToExercise')}
            {renderYesNoQuestion('toldNeedMedicalClearance', 'Has a doctor told you that you need medical clearance before exercising?', 'toldNeedMedicalClearance')}

            {hasMedicalClearanceYes && (
              <div>
                <Label htmlFor="medicalClearanceDetails" className="font-paragraph text-base text-charcoal-black">
                  Please provide details
                </Label>
                <Textarea
                  id="medicalClearanceDetails"
                  value={formData.medicalClearanceDetails}
                  onChange={(e) => handleInputChange('medicalClearanceDetails', e.target.value)}
                  rows={4}
                  className="mt-2"
                  aria-describedby={warnings.medicalClearanceDetails ? 'medicalClearanceDetails-warning' : undefined}
                />
                {warnings.medicalClearanceDetails && (
                  <p id="medicalClearanceDetails-warning" className="text-soft-bronze text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {warnings.medicalClearanceDetails}
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Section 7: Consent */}
        <Card className="p-6">
          <h2 className="font-heading text-3xl font-bold text-charcoal-black mb-6">
            Declaration & Consent
          </h2>
          
          <div className="space-y-6">
            <div className="bg-warm-sand-beige/30 p-4 rounded-lg">
              <p className="font-paragraph text-sm text-charcoal-black">
                I declare that the information provided in this questionnaire is true and accurate to the best of my knowledge. 
                I understand that this information will be used to design a safe and effective exercise program for me. 
                I agree to inform my trainer of any changes to my health status.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="declarationAgreed"
                checked={formData.declarationAgreed}
                onCheckedChange={(checked) => handleInputChange('declarationAgreed', checked === true)}
                aria-describedby={errors.declarationAgreed ? 'declarationAgreed-error' : undefined}
              />
              <Label htmlFor="declarationAgreed" className="font-paragraph text-base text-charcoal-black cursor-pointer">
                I agree to the declaration above <span className="text-destructive">*</span>
              </Label>
            </div>
            {errors.declarationAgreed && (
              <p id="declarationAgreed-error" className="text-destructive text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.declarationAgreed}
              </p>
            )}

            <div>
              <Label htmlFor="signatureFullName" className="font-paragraph text-base text-charcoal-black">
                Signature (Type your full name) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="signatureFullName"
                type="text"
                value={formData.signatureFullName}
                onChange={(e) => handleInputChange('signatureFullName', e.target.value)}
                className={errors.signatureFullName ? 'border-destructive' : ''}
                placeholder="Type your full name"
                aria-describedby={errors.signatureFullName ? 'signatureFullName-error' : undefined}
              />
              {errors.signatureFullName && (
                <p id="signatureFullName-error" className="text-destructive text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.signatureFullName}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="signatureDate" className="font-paragraph text-base text-charcoal-black">
                Date
              </Label>
              <Input
                id="signatureDate"
                type="date"
                value={formData.signatureDate}
                onChange={(e) => handleInputChange('signatureDate', e.target.value)}
                disabled
                className="bg-warm-sand-beige/20"
              />
            </div>
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          {submitError && (
            <div className="w-full mb-4 p-4 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {submitError}
              </p>
            </div>
          )}
          <Button
            type="submit"
            size="lg"
            className="px-12 py-6 text-lg font-paragraph"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Review & Submit'}
          </Button>
        </div>
      </form>
    </div>
  );
}
