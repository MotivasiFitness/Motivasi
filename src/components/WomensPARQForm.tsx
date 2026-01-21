import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { BaseCrudService } from '@/integrations';
import { ParQ } from '@/entities';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useMember } from '@/integrations';

export default function WomensPARQForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { member } = useMember();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    clientName: member?.contact?.firstName && member?.contact?.lastName 
      ? `${member.contact.firstName} ${member.contact.lastName}` 
      : '',
    dateOfBirth: '',
    email: member?.loginEmail || '',
    phone: member?.contact?.phones?.[0] || '',
    emergencyContactNumber: '',
    
    // Section 1: Heart & Circulation
    hasHeartCondition: '',
    chestPain: '',
    toldNotToExercise: '',
    heartDetails: '',
    
    // Section 2: Balance & Neurological
    dizzinessFainting: '',
    balanceIssuesOrFalls: '',
    neurologicalDetails: '',
    
    // Section 3: Metabolic & Medical
    highBloodPressure: '',
    diabetes: '',
    otherMedicalConditions: '',
    metabolicDetails: '',
    
    // Section 4: Respiratory
    respiratoryCondition: '',
    shortnessOfBreath: '',
    respiratoryDetails: '',
    
    // Section 5: Musculoskeletal & Pain
    jointPainOrArthritis: '',
    pastInjuryOrSurgery: '',
    musculoskeletalDetails: '',
    
    // Section 6: Women's Health
    menopauseStatus: 'prefer-not-to-say',
    pelvicFloorSymptoms: '',
    symptomsFluctuate: '',
    womensHealthDetails: '',
    
    // Final confirmation
    declarationAgreed: false,
    signatureFullName: member?.contact?.firstName && member?.contact?.lastName 
      ? `${member.contact.firstName} ${member.contact.lastName}` 
      : '',
    signatureDate: new Date().toISOString().split('T')[0],
  });

  const [currentSection, setCurrentSection] = useState(1);
  const totalSections = 6;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateProgress = () => {
    return (currentSection / totalSections) * 100;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.declarationAgreed) {
      toast({
        title: "Confirmation Required",
        description: "Please confirm that the information provided is accurate.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Determine risk flags
      const requiresReview = 
        formData.hasHeartCondition === 'yes' ||
        formData.chestPain === 'yes' ||
        formData.toldNotToExercise === 'yes' ||
        formData.dizzinessFainting === 'yes' ||
        formData.otherMedicalConditions === 'yes';

      const requiresMedicalClearance = 
        formData.toldNotToExercise === 'yes' ||
        (formData.hasHeartCondition === 'yes' && formData.chestPain === 'yes');

      const submission: Partial<ParQ> = {
        _id: crypto.randomUUID(),
        clientName: formData.clientName,
        dateOfBirth: formData.dateOfBirth,
        email: formData.email,
        phone: formData.phone,
        emergencyContactNumber: formData.emergencyContactNumber,
        
        // Map to existing fields
        hasHeartCondition: formData.hasHeartCondition === 'yes',
        chestPain: formData.chestPain === 'yes',
        toldNotToExercise: formData.toldNotToExercise === 'yes',
        dizzinessFainting: formData.dizzinessFainting === 'yes',
        balanceIssuesOrFalls: formData.balanceIssuesOrFalls === 'yes',
        highBloodPressure: formData.highBloodPressure === 'yes',
        diabetes: formData.diabetes === 'yes',
        respiratoryCondition: formData.respiratoryCondition === 'yes',
        jointPainOrArthritis: formData.jointPainOrArthritis === 'yes',
        pastInjuryOrSurgery: formData.pastInjuryOrSurgery === 'yes',
        pelvicFloorSymptoms: formData.pelvicFloorSymptoms === 'yes',
        periOrPostMenopause: formData.menopauseStatus === 'peri' || formData.menopauseStatus === 'post',
        
        // Store detailed notes
        generalHealthDetails: formData.heartDetails,
        orthoDetails: formData.musculoskeletalDetails,
        womensHealthDetails: formData.womensHealthDetails,
        medicalClearanceDetails: [
          formData.neurologicalDetails,
          formData.metabolicDetails,
          formData.respiratoryDetails
        ].filter(Boolean).join('\n\n'),
        
        declarationAgreed: formData.declarationAgreed,
        signatureFullName: formData.signatureFullName,
        signatureDate: formData.signatureDate,
        submissionDateTime: new Date().toISOString(),
        
        // Risk flags (stored in existing boolean fields)
        toldNeedMedicalClearance: requiresMedicalClearance,
      };

      await BaseCrudService.create('ParqSubmission', submission);

      toast({
        title: "Health Questionnaire Submitted",
        description: "Your information has been submitted securely. Your coach will review it personally.",
      });

      navigate('/portal');
    } catch (error) {
      console.error('Error submitting PAR-Q:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToSection = (section: number) => {
    setCurrentSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-soft-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl font-bold text-charcoal-black mb-2">
            Health & Fitness Questionnaire
          </h1>
          <p className="font-paragraph text-xl text-charcoal-black mb-3">
            Physical Activity Readiness Questionnaire (PAR-Q)
          </p>
          <p className="font-paragraph text-base text-warm-grey mb-6">
            This confidential questionnaire helps us tailor your training safely and effectively.
          </p>
          
          {/* Progress Indicator */}
          <div className="max-w-2xl mx-auto mb-4">
            <div className="flex justify-between text-sm text-warm-grey mb-2">
              <span>Section {currentSection} of {totalSections}</span>
              <span>{Math.round(calculateProgress())}% Complete</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card className="bg-white border-warm-sand-beige">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-charcoal-black">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="clientName">Full Name *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  required
                  className="border-warm-grey"
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  required
                  className="border-warm-grey"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="border-warm-grey"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="border-warm-grey"
                />
              </div>
              <div>
                <Label htmlFor="emergencyContactNumber">Emergency Contact Number *</Label>
                <Input
                  id="emergencyContactNumber"
                  type="tel"
                  value={formData.emergencyContactNumber}
                  onChange={(e) => handleInputChange('emergencyContactNumber', e.target.value)}
                  required
                  className="border-warm-grey"
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 1: Heart & Circulation */}
          <Card className="bg-white border-warm-sand-beige" id="section-1">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-charcoal-black">
                1. Heart & Circulation
              </CardTitle>
              <CardDescription className="text-base">
                These questions help us ensure your training is safe and appropriate. Answer honestly — this does not prevent you from training.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">Have you ever been diagnosed with a heart condition?</Label>
                <RadioGroup value={formData.hasHeartCondition} onValueChange={(value) => handleInputChange('hasHeartCondition', value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="heart-no" />
                    <Label htmlFor="heart-no" className="font-normal cursor-pointer">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="heart-yes" />
                    <Label htmlFor="heart-yes" className="font-normal cursor-pointer">Yes</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Do you experience chest pain or pressure during physical activity?</Label>
                <RadioGroup value={formData.chestPain} onValueChange={(value) => handleInputChange('chestPain', value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="chest-no" />
                    <Label htmlFor="chest-no" className="font-normal cursor-pointer">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="chest-yes" />
                    <Label htmlFor="chest-yes" className="font-normal cursor-pointer">Yes</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Has a doctor ever advised you to avoid exercise?</Label>
                <RadioGroup value={formData.toldNotToExercise} onValueChange={(value) => handleInputChange('toldNotToExercise', value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="advised-no" />
                    <Label htmlFor="advised-no" className="font-normal cursor-pointer">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="advised-yes" />
                    <Label htmlFor="advised-yes" className="font-normal cursor-pointer">Yes</Label>
                  </div>
                </RadioGroup>
              </div>

              <AnimatePresence>
                {(formData.hasHeartCondition === 'yes' || formData.chestPain === 'yes' || formData.toldNotToExercise === 'yes') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Label htmlFor="heartDetails">Please provide details (optional but helpful)</Label>
                    <Textarea
                      id="heartDetails"
                      value={formData.heartDetails}
                      onChange={(e) => handleInputChange('heartDetails', e.target.value)}
                      placeholder="Any additional information that would help your coach..."
                      className="border-warm-grey mt-2"
                      rows={3}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Section 2: Balance & Neurological */}
          <Card className="bg-white border-warm-sand-beige" id="section-2">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-charcoal-black">
                2. Balance & Neurological Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">Do you experience dizziness or fainting?</Label>
                <RadioGroup value={formData.dizzinessFainting} onValueChange={(value) => handleInputChange('dizzinessFainting', value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="dizzy-no" />
                    <Label htmlFor="dizzy-no" className="font-normal cursor-pointer">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="dizzy-yes" />
                    <Label htmlFor="dizzy-yes" className="font-normal cursor-pointer">Yes</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Do you experience unexplained loss of balance?</Label>
                <RadioGroup value={formData.balanceIssuesOrFalls} onValueChange={(value) => handleInputChange('balanceIssuesOrFalls', value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="balance-no" />
                    <Label htmlFor="balance-no" className="font-normal cursor-pointer">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="balance-yes" />
                    <Label htmlFor="balance-yes" className="font-normal cursor-pointer">Yes</Label>
                  </div>
                </RadioGroup>
              </div>

              <AnimatePresence>
                {(formData.dizzinessFainting === 'yes' || formData.balanceIssuesOrFalls === 'yes') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Label htmlFor="neurologicalDetails">Please provide details (optional but helpful)</Label>
                    <Textarea
                      id="neurologicalDetails"
                      value={formData.neurologicalDetails}
                      onChange={(e) => handleInputChange('neurologicalDetails', e.target.value)}
                      placeholder="Any additional information that would help your coach..."
                      className="border-warm-grey mt-2"
                      rows={3}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Section 3: Metabolic & Medical */}
          <Card className="bg-white border-warm-sand-beige" id="section-3">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-charcoal-black">
                3. Metabolic & Medical Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">Do you have high blood pressure?</Label>
                <RadioGroup value={formData.highBloodPressure} onValueChange={(value) => handleInputChange('highBloodPressure', value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="bp-no" />
                    <Label htmlFor="bp-no" className="font-normal cursor-pointer">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="bp-yes" />
                    <Label htmlFor="bp-yes" className="font-normal cursor-pointer">Yes</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Do you have diabetes?</Label>
                <RadioGroup value={formData.diabetes} onValueChange={(value) => handleInputChange('diabetes', value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="diabetes-no" />
                    <Label htmlFor="diabetes-no" className="font-normal cursor-pointer">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="diabetes-yes" />
                    <Label htmlFor="diabetes-yes" className="font-normal cursor-pointer">Yes</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Do you have any other medical conditions we should be aware of?</Label>
                <RadioGroup value={formData.otherMedicalConditions} onValueChange={(value) => handleInputChange('otherMedicalConditions', value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="other-no" />
                    <Label htmlFor="other-no" className="font-normal cursor-pointer">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="other-yes" />
                    <Label htmlFor="other-yes" className="font-normal cursor-pointer">Yes</Label>
                  </div>
                </RadioGroup>
              </div>

              <AnimatePresence>
                {(formData.highBloodPressure === 'yes' || formData.diabetes === 'yes' || formData.otherMedicalConditions === 'yes') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Label htmlFor="metabolicDetails">Please provide details (optional but helpful)</Label>
                    <Textarea
                      id="metabolicDetails"
                      value={formData.metabolicDetails}
                      onChange={(e) => handleInputChange('metabolicDetails', e.target.value)}
                      placeholder="Any additional information that would help your coach..."
                      className="border-warm-grey mt-2"
                      rows={3}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Section 4: Respiratory */}
          <Card className="bg-white border-warm-sand-beige" id="section-4">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-charcoal-black">
                4. Respiratory Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">Do you have asthma or other respiratory conditions?</Label>
                <RadioGroup value={formData.respiratoryCondition} onValueChange={(value) => handleInputChange('respiratoryCondition', value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="resp-no" />
                    <Label htmlFor="resp-no" className="font-normal cursor-pointer">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="resp-yes" />
                    <Label htmlFor="resp-yes" className="font-normal cursor-pointer">Yes</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Do you experience shortness of breath disproportionate to activity?</Label>
                <RadioGroup value={formData.shortnessOfBreath} onValueChange={(value) => handleInputChange('shortnessOfBreath', value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="breath-no" />
                    <Label htmlFor="breath-no" className="font-normal cursor-pointer">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="breath-yes" />
                    <Label htmlFor="breath-yes" className="font-normal cursor-pointer">Yes</Label>
                  </div>
                </RadioGroup>
              </div>

              <AnimatePresence>
                {(formData.respiratoryCondition === 'yes' || formData.shortnessOfBreath === 'yes') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Label htmlFor="respiratoryDetails">Please provide details (optional but helpful)</Label>
                    <Textarea
                      id="respiratoryDetails"
                      value={formData.respiratoryDetails}
                      onChange={(e) => handleInputChange('respiratoryDetails', e.target.value)}
                      placeholder="Any additional information that would help your coach..."
                      className="border-warm-grey mt-2"
                      rows={3}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Section 5: Musculoskeletal & Pain */}
          <Card className="bg-white border-warm-sand-beige" id="section-5">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-charcoal-black">
                5. Musculoskeletal & Pain
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">Do you currently have joint pain, injuries, or chronic pain?</Label>
                <RadioGroup value={formData.jointPainOrArthritis} onValueChange={(value) => handleInputChange('jointPainOrArthritis', value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="joint-no" />
                    <Label htmlFor="joint-no" className="font-normal cursor-pointer">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="joint-yes" />
                    <Label htmlFor="joint-yes" className="font-normal cursor-pointer">Yes</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Have you had surgery in the last 12 months?</Label>
                <RadioGroup value={formData.pastInjuryOrSurgery} onValueChange={(value) => handleInputChange('pastInjuryOrSurgery', value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="surgery-no" />
                    <Label htmlFor="surgery-no" className="font-normal cursor-pointer">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="surgery-yes" />
                    <Label htmlFor="surgery-yes" className="font-normal cursor-pointer">Yes</Label>
                  </div>
                </RadioGroup>
              </div>

              <AnimatePresence>
                {(formData.jointPainOrArthritis === 'yes' || formData.pastInjuryOrSurgery === 'yes') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Label htmlFor="musculoskeletalDetails">Please specify location and severity</Label>
                    <Textarea
                      id="musculoskeletalDetails"
                      value={formData.musculoskeletalDetails}
                      onChange={(e) => handleInputChange('musculoskeletalDetails', e.target.value)}
                      placeholder="E.g., 'Left knee pain, moderate severity' or 'Hip replacement 6 months ago'"
                      className="border-warm-grey mt-2"
                      rows={3}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Section 6: Women's Health */}
          <Card className="bg-white border-warm-sand-beige" id="section-6">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-charcoal-black">
                6. Women's Health
              </CardTitle>
              <CardDescription className="text-base">
                These questions help us adapt training intensity, recovery, and load appropriately.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">Are you currently peri-menopausal or post-menopausal?</Label>
                <RadioGroup value={formData.menopauseStatus} onValueChange={(value) => handleInputChange('menopauseStatus', value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pre" id="meno-pre" />
                    <Label htmlFor="meno-pre" className="font-normal cursor-pointer">Pre-menopausal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="peri" id="meno-peri" />
                    <Label htmlFor="meno-peri" className="font-normal cursor-pointer">Peri-menopausal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="post" id="meno-post" />
                    <Label htmlFor="meno-post" className="font-normal cursor-pointer">Post-menopausal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="prefer-not-to-say" id="meno-prefer" />
                    <Label htmlFor="meno-prefer" className="font-normal cursor-pointer">Prefer not to say</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Do you experience pelvic floor concerns?</Label>
                <RadioGroup value={formData.pelvicFloorSymptoms} onValueChange={(value) => handleInputChange('pelvicFloorSymptoms', value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="pelvic-no" />
                    <Label htmlFor="pelvic-no" className="font-normal cursor-pointer">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="pelvic-yes" />
                    <Label htmlFor="pelvic-yes" className="font-normal cursor-pointer">Yes</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Do symptoms (energy, joint pain, recovery) fluctuate monthly?</Label>
                <RadioGroup value={formData.symptomsFluctuate} onValueChange={(value) => handleInputChange('symptomsFluctuate', value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="fluctuate-no" />
                    <Label htmlFor="fluctuate-no" className="font-normal cursor-pointer">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="fluctuate-yes" />
                    <Label htmlFor="fluctuate-yes" className="font-normal cursor-pointer">Yes</Label>
                  </div>
                </RadioGroup>
              </div>

              <AnimatePresence>
                {(formData.pelvicFloorSymptoms === 'yes' || formData.symptomsFluctuate === 'yes') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Label htmlFor="womensHealthDetails">Please provide details (optional but helpful)</Label>
                    <Textarea
                      id="womensHealthDetails"
                      value={formData.womensHealthDetails}
                      onChange={(e) => handleInputChange('womensHealthDetails', e.target.value)}
                      placeholder="Any additional information that would help your coach..."
                      className="border-warm-grey mt-2"
                      rows={3}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Final Confirmation */}
          <Card className="bg-white border-warm-sand-beige">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-charcoal-black">
                ✓ Final Check
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="declarationAgreed"
                  checked={formData.declarationAgreed}
                  onCheckedChange={(checked) => handleInputChange('declarationAgreed', checked)}
                  required
                  className="mt-1"
                />
                <Label htmlFor="declarationAgreed" className="text-base leading-relaxed cursor-pointer">
                  I confirm that the information provided is accurate to the best of my knowledge and helps my coach support me safely.
                </Label>
              </div>
              <div>
                <Label htmlFor="signatureFullName">Full Name *</Label>
                <Input
                  id="signatureFullName"
                  value={formData.signatureFullName}
                  onChange={(e) => handleInputChange('signatureFullName', e.target.value)}
                  required
                  className="border-warm-grey"
                />
              </div>
              <div>
                <Label htmlFor="signatureDate">Date *</Label>
                <Input
                  id="signatureDate"
                  type="date"
                  value={formData.signatureDate}
                  onChange={(e) => handleInputChange('signatureDate', e.target.value)}
                  required
                  className="border-warm-grey"
                  readOnly
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-12 py-6 text-lg bg-soft-bronze hover:bg-soft-bronze/90"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Health Questionnaire'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
