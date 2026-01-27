import { useState, useEffect } from 'react';
import { useMember } from '@/integrations';
import { useNavigate } from 'react-router-dom';
import { Loader, AlertCircle, CheckCircle, Sparkles, ArrowRight, Wand2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  generateProgramWithAI,
  saveProgramDraft,
  ProgramGeneratorInput,
  GeneratedProgram,
  isSafeProgram,
} from '@/lib/ai-program-generator-mock';
import { generateProgramDescription } from '@/lib/ai-description-generator';
import { BaseCrudService } from '@/integrations';
import { TrainerClientAssignments, ClientProfiles } from '@/entities';

type Step = 'input' | 'generating' | 'review' | 'success';

const EQUIPMENT_OPTIONS = [
  'Dumbbells',
  'Barbell',
  'Machines',
  'Cables',
  'Resistance Bands',
  'Bodyweight',
  'Kettlebells',
  'Medicine Balls',
  'Slam Balls',
  'Weight Plate',
  'Bench',
  'Ankle Weights',
];

const TRAINING_STYLES = [
  'Strength Building',
  'Endurance',
  'Recovery',
];

export default function AIAssistantPage() {
  const { member } = useMember();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>('input');
  const [generatedProgram, setGeneratedProgram] = useState<GeneratedProgram | null>(null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingGoal, setIsGeneratingGoal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [assignedClients, setAssignedClients] = useState<ClientProfiles[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);

  const [formData, setFormData] = useState<ProgramGeneratorInput>({
    programTitle: '',
    programGoal: '',
    programLength: '8 weeks',
    daysPerWeek: 4,
    experienceLevel: 'intermediate',
    equipment: [],
    timePerWorkout: 60,
    injuries: '',
    trainingStyle: 'Strength Building',
    additionalNotes: '',
  });

  // Load assigned clients
  useEffect(() => {
    const fetchAssignedClients = async () => {
      if (!member?._id) return;
      
      try {
        setLoadingClients(true);
        // Get trainer-client assignments for this trainer
        const assignmentsResult = await BaseCrudService.getAll<TrainerClientAssignments>('trainerclientassignments');
        const trainerAssignments = assignmentsResult.items.filter(a => a.trainerId === member._id);
        const clientIds = trainerAssignments.map(a => a.clientId);

        if (clientIds.length === 0) {
          setAssignedClients([]);
          return;
        }

        // Get client profiles for the assigned clients
        const clientsResult = await BaseCrudService.getAll<ClientProfiles>('clientprofiles');
        const trainerClients = clientsResult.items.filter(c => clientIds.includes(c._id));
        
        setAssignedClients(trainerClients);
      } catch (error) {
        console.error('Error loading assigned clients:', error);
      } finally {
        setLoadingClients(false);
      }
    };

    fetchAssignedClients();
  }, [member?._id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      const equipment = formData.equipment;

      if (checked) {
        setFormData(prev => ({
          ...prev,
          equipment: [...equipment, value],
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          equipment: equipment.filter(e => e !== value),
        }));
      }
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value, 10),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleGenerateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStep('generating');

    try {
      // Validate input
      if (!formData.programTitle.trim()) {
        throw new Error('Program title is required');
      }

      if (!formData.programGoal.trim()) {
        throw new Error('Program goal is required');
      }

      if (formData.equipment.length === 0) {
        throw new Error('Please select at least one equipment type');
      }

      // Generate program
      const program = await generateProgramWithAI(formData, member?._id || '');

      // Check safety
      if (!isSafeProgram(program)) {
        throw new Error('Generated program contains unsafe recommendations. Please try again with different parameters.');
      }

      setGeneratedProgram(program);
      setStep('review');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate program';
      setError(errorMessage);
      setStep('input');
    }
  };

  const handleSaveProgram = async () => {
    if (!generatedProgram) {
      const errorMsg = 'No program data to save';
      setError(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
      return;
    }

    if (!member?._id) {
      const errorMsg = 'Unable to identify trainer. Please log in again.';
      setError(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      // Validate program data before saving
      if (!generatedProgram.programName || !generatedProgram.programName.trim()) {
        throw new Error('Program name is missing');
      }

      if (!generatedProgram.workoutDays || generatedProgram.workoutDays.length === 0) {
        throw new Error('Program has no workout days');
      }

      console.log('🔄 Saving program...', {
        programName: generatedProgram.programName,
        trainerId: member._id,
        clientId: selectedClientId || 'none (template/draft)',
        workoutDays: generatedProgram.workoutDays.length,
      });

      // Pass clientId if selected, otherwise save as template/draft
      const programId = await saveProgramDraft(generatedProgram, member._id, selectedClientId || undefined);
      
      console.log('✅ Program saved successfully:', { programId });
      
      // Show success toast
      toast({
        title: 'Success',
        description: 'Program saved successfully! Redirecting to your programs...',
      });
      
      setStep('success');

      // Redirect after 2 seconds to programs created list
      setTimeout(() => {
        navigate('/trainer/programs-created');
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save program';
      console.error('❌ Save program error:', err);
      setError(errorMessage);
      
      // Show error toast
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      setIsSaving(false);
    }
  };

  const handleEditProgram = () => {
    if (generatedProgram) {
      // Store in session for editing
      sessionStorage.setItem('draft_program', JSON.stringify(generatedProgram));
      navigate('/trainer/program-editor');
    }
  };

  const handleGenerateGoalDescription = async () => {
    if (!formData.programTitle.trim()) {
      setError('Please enter a program title first');
      return;
    }

    setIsGeneratingGoal(true);
    setError('');

    try {
      const result = await generateProgramDescription({
        programTitle: formData.programTitle,
        duration: formData.programLength,
        focusArea: formData.trainingStyle,
        trainingStyle: formData.trainingStyle,
        equipment: formData.equipment,
        level: formData.experienceLevel,
        additionalContext: formData.injuries || formData.additionalNotes,
      });

      if (result.success && result.description) {
        setFormData(prev => ({
          ...prev,
          programGoal: result.description,
        }));
      } else {
        throw new Error('Failed to generate description');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate goal description';
      setError(errorMessage);
    } finally {
      setIsGeneratingGoal(false);
    }
  };

  // Input Step
  if (step === 'input') {
    return (
      <div className="p-8 lg:p-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-soft-bronze" />
              <h1 className="font-heading text-5xl font-bold text-charcoal-black">
                AI Program Assistant
              </h1>
            </div>
            <p className="font-paragraph text-lg text-warm-grey">
              Generate a customized training program for your client using AI
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <p className="font-paragraph text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="mb-8 bg-soft-bronze/10 border border-soft-bronze/30 rounded-2xl p-6">
            <h3 className="font-heading text-lg font-bold text-charcoal-black mb-3">
              How It Works
            </h3>
            <ol className="space-y-2 font-paragraph text-sm text-charcoal-black list-decimal list-inside">
              <li>Fill in your client's details and preferences</li>
              <li>AI generates a complete training program</li>
              <li>Review and edit the program as needed</li>
              <li>Save as a template or assign to a client</li>
            </ol>
          </div>

          {/* Form */}
          <form onSubmit={handleGenerateProgram} className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8 space-y-8">
            {/* Program Title */}
            <div>
              <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                Program Title *
              </label>
              <input
                type="text"
                name="programTitle"
                value={formData.programTitle}
                onChange={handleInputChange}
                placeholder="e.g., Postpartum Strength Builder, Advanced Endurance Program"
                className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
              />
            </div>

            {/* Program Goal */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block font-paragraph text-sm font-medium text-charcoal-black">
                  Program Goal *
                </label>
                <button
                  type="button"
                  onClick={handleGenerateGoalDescription}
                  disabled={isGeneratingGoal || !formData.programTitle.trim()}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-soft-bronze hover:text-charcoal-black border border-soft-bronze hover:bg-soft-bronze/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingGoal ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      Generate with AI
                    </>
                  )}
                </button>
              </div>
              <textarea
                name="programGoal"
                value={formData.programGoal}
                onChange={handleInputChange}
                placeholder="e.g., Build strength and muscle for postpartum recovery, Improve cardiovascular endurance, Lose weight while maintaining muscle"
                rows={5}
                className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph resize-none"
              />
              <p className="mt-2 text-xs text-warm-grey font-paragraph">
                Click "Generate with AI" to automatically create a detailed program goal based on your program title
              </p>
            </div>

            {/* Package Length */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                  Package Length *
                </label>
                <select
                  name="programLength"
                  value={formData.programLength}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                >
                  <option value="4 weeks">4 weeks</option>
                  <option value="8 weeks">8 weeks</option>
                  <option value="12 weeks">12 weeks</option>
                  <option value="16 weeks">16 weeks</option>
                  <option value="20 weeks">20 weeks</option>
                </select>
              </div>

              {/* Programs Per Week */}
              <div>
                <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                  Programs Per Week *
                </label>
                <select
                  name="daysPerWeek"
                  value={formData.daysPerWeek}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map(day => (
                    <option key={day} value={day}>{day} programs</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Experience Level */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                  Experience Level *
                </label>
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Time Per Workout */}
              <div>
                <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                  Time Per Workout (minutes) *
                </label>
                <input
                  type="number"
                  name="timePerWorkout"
                  value={formData.timePerWorkout}
                  onChange={handleInputChange}
                  min="15"
                  max="180"
                  className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                />
              </div>
            </div>

            {/* Equipment */}
            <div>
              <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-3">
                Available Equipment *
              </label>
              <div className="grid md:grid-cols-2 gap-3">
                {EQUIPMENT_OPTIONS.map(equipment => (
                  <label key={equipment} className="flex items-center gap-3 p-3 border border-warm-sand-beige rounded-lg hover:bg-warm-sand-beige/20 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      value={equipment}
                      checked={formData.equipment.includes(equipment)}
                      onChange={handleInputChange}
                      className="w-4 h-4 accent-soft-bronze"
                    />
                    <span className="font-paragraph text-sm text-charcoal-black">{equipment}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Training Style */}
            <div>
              <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                Training Style *
              </label>
              <select
                name="trainingStyle"
                value={formData.trainingStyle}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
              >
                {TRAINING_STYLES.map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>

            {/* Injuries / Limitations */}
            <div>
              <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                Injuries or Limitations
              </label>
              <textarea
                name="injuries"
                value={formData.injuries}
                onChange={handleInputChange}
                placeholder="e.g., Lower back pain, Knee issues, Recent shoulder surgery"
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph resize-none"
              />
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                Additional Notes
              </label>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                placeholder="Any other preferences or requirements..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph resize-none"
              />
            </div>

            {/* Assign to Client (Optional) */}
            <div>
              <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                Assign to Client (Optional)
              </label>
              <p className="font-paragraph text-xs text-warm-grey mb-3">
                Select a client to immediately assign this program to them. If you leave this blank, the program will be saved as a draft template.
              </p>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                disabled={loadingClients}
                className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph disabled:opacity-50"
              >
                <option value="">-- Save as Draft Template --</option>
                {assignedClients.map(client => (
                  <option key={client._id} value={client._id}>
                    {client.firstName} {client.lastName}
                  </option>
                ))}
              </select>
              {assignedClients.length === 0 && !loadingClients && (
                <p className="mt-2 text-xs text-warm-grey font-paragraph">
                  You don't have any assigned clients yet. You can assign this program to a client later from the Programs Created page.
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6 border-t border-warm-sand-beige">
              <button
                type="submit"
                className="flex-1 bg-charcoal-black text-soft-white py-3 rounded-lg font-medium text-lg hover:bg-soft-bronze transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles size={20} />
                Generate Program
              </button>
              <button
                type="button"
                onClick={() => navigate('/trainer')}
                className="flex-1 bg-warm-sand-beige text-charcoal-black py-3 rounded-lg font-medium text-lg hover:bg-warm-sand-beige/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Generating Step
  if (step === 'generating') {
    return (
      <div className="p-8 lg:p-12 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-soft-bronze/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader className="w-8 h-8 text-soft-bronze animate-spin" />
          </div>
          <h2 className="font-heading text-3xl font-bold text-charcoal-black mb-4">
            Generating Your Program
          </h2>
          <p className="font-paragraph text-lg text-warm-grey mb-8">
            Our AI is creating a customized training program based on your specifications. This may take a moment...
          </p>
          <div className="space-y-2 text-sm text-warm-grey">
            <p>✓ Analyzing client profile</p>
            <p>✓ Generating workout structure</p>
            <p>✓ Creating exercise recommendations</p>
          </div>
        </div>
      </div>
    );
  }

  // Review Step
  if (step === 'review' && generatedProgram) {
    return (
      <div className="p-8 lg:p-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="font-heading text-5xl font-bold text-charcoal-black mb-2">
              Review Generated Program
            </h1>
            <p className="font-paragraph text-lg text-warm-grey">
              Review the AI-generated program and make any edits before saving
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <p className="font-paragraph text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Program Overview */}
          <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8 mb-8">
            <h2 className="font-heading text-3xl font-bold text-charcoal-black mb-4">
              {generatedProgram.programName}
            </h2>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div>
                <p className="font-paragraph text-sm text-warm-grey mb-1">Duration</p>
                <p className="font-heading text-lg font-bold text-charcoal-black">
                  {generatedProgram.duration}
                </p>
              </div>
              <div>
                <p className="font-paragraph text-sm text-warm-grey mb-1">Focus Area</p>
                <p className="font-heading text-lg font-bold text-charcoal-black">
                  {generatedProgram.focusArea}
                </p>
              </div>
              <div>
                <p className="font-paragraph text-sm text-warm-grey mb-1">Weekly Split</p>
                <p className="font-heading text-lg font-bold text-charcoal-black">
                  {generatedProgram.weeklySplit}
                </p>
              </div>
            </div>

            <div className="border-t border-warm-sand-beige pt-6">
              <h3 className="font-heading text-xl font-bold text-charcoal-black mb-3">
                Overview
              </h3>
              <p className="font-paragraph text-base text-charcoal-black leading-relaxed">
                {generatedProgram.overview}
              </p>
            </div>
          </div>

          {/* Workout Days Preview */}
          <div className="space-y-6 mb-8">
            <h3 className="font-heading text-2xl font-bold text-charcoal-black">
              Workout Schedule
            </h3>
            {generatedProgram.workoutDays.map((day, index) => (
              <div key={index} className="bg-soft-white border border-warm-sand-beige rounded-2xl p-6">
                <h4 className="font-heading text-xl font-bold text-charcoal-black mb-4">
                  {day.day}
                </h4>
                <div className="space-y-4">
                  {day.exercises.map((exercise, exIndex) => (
                    <div key={exIndex} className="border-l-4 border-soft-bronze pl-4">
                      <p className="font-heading text-base font-bold text-charcoal-black">
                        {exercise.name}
                      </p>
                      <p className="font-paragraph text-sm text-warm-grey">
                        {exercise.sets} sets × {exercise.reps} reps • {exercise.restSeconds}s rest
                      </p>
                      {exercise.notes && (
                        <p className="font-paragraph text-sm text-charcoal-black mt-1">
                          {exercise.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Safety Notes */}
          <div className="bg-soft-bronze/10 border border-soft-bronze/30 rounded-2xl p-6 mb-8">
            <h3 className="font-heading text-lg font-bold text-charcoal-black mb-3">
              Safety Notes
            </h3>
            <p className="font-paragraph text-base text-charcoal-black">
              {generatedProgram.safetyNotes}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-warm-sand-beige">
            <button
              onClick={handleEditProgram}
              className="flex-1 bg-warm-sand-beige text-charcoal-black py-3 rounded-lg font-medium text-lg hover:bg-warm-sand-beige/80 transition-colors"
            >
              Edit Program
            </button>
            <button
              onClick={handleSaveProgram}
              disabled={isSaving}
              className="flex-1 bg-charcoal-black text-soft-white py-3 rounded-lg font-medium text-lg hover:bg-soft-bronze transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Save as Draft
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success Step
  if (step === 'success') {
    return (
      <div className="p-8 lg:p-12 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="font-heading text-3xl font-bold text-charcoal-black mb-4">
            Program Saved!
          </h2>
          <p className="font-paragraph text-lg text-warm-grey mb-8">
            Your AI-generated program has been saved successfully. You can view it in your Programs Created section.
          </p>
          <p className="font-paragraph text-sm text-warm-grey">
            Redirecting to programs list...
          </p>
          <Loader className="w-6 h-6 animate-spin mx-auto mt-6 text-soft-bronze" />
        </div>
      </div>
    );
  }

  return null;
}
