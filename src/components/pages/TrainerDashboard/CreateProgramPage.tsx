import { useState, useEffect } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { Programs, TrainerClientAssignments } from '@/entities';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Sparkles, Loader, X } from 'lucide-react';
import { getTrainerClients } from '@/lib/role-utils';
import {
  generateProgramDescription,
  generateFallbackDescription,
  validateDescription,
  formatDescription,
} from '@/lib/ai-description-generator';

export default function CreateProgramPage() {
  const { member } = useMember();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [assignedClients, setAssignedClients] = useState<TrainerClientAssignments[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [descriptionError, setDescriptionError] = useState('');
  const [showReplacePrompt, setShowReplacePrompt] = useState(false);
  const [pendingDescription, setPendingDescription] = useState('');

  const [formData, setFormData] = useState({
    programName: '',
    description: '',
    clientId: '',
    duration: '',
    focusArea: '',
    status: 'Active',
  });

  // Load assigned clients
  useEffect(() => {
    const fetchAssignedClients = async () => {
      if (!member?._id) return;
      
      try {
        const clients = await getTrainerClients(member._id);
        setAssignedClients(clients);
      } catch (error) {
        console.error('Error fetching assigned clients:', error);
      } finally {
        setLoadingClients(false);
      }
    };

    fetchAssignedClients();
  }, [member?._id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenerateDescription = async () => {
    setIsGeneratingDescription(true);
    setDescriptionError('');
    setPendingDescription('');

    try {
      // Validate required fields
      if (!formData.programName.trim()) {
        setDescriptionError('Please enter a program name first');
        setIsGeneratingDescription(false);
        return;
      }

      if (!formData.duration.trim()) {
        setDescriptionError('Please enter a program duration first');
        setIsGeneratingDescription(false);
        return;
      }

      if (!formData.focusArea.trim()) {
        setDescriptionError('Please select a focus area first');
        setIsGeneratingDescription(false);
        return;
      }

      // Generate description
      const generatedResult = await generateProgramDescription({
        programTitle: formData.programName,
        duration: formData.duration,
        focusArea: formData.focusArea,
        trainingStyle: 'personalized and progressive',
        clientGoals: formData.focusArea,
      });

      const formattedDescription = formatDescription(generatedResult.description);

      // Validate generated description
      const validation = validateDescription(formattedDescription);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // If there's existing description, show replace prompt
      if (formData.description.trim()) {
        setPendingDescription(formattedDescription);
        setShowReplacePrompt(true);
      } else {
        // No existing description, insert directly
        setFormData((prev) => ({
          ...prev,
          description: formattedDescription,
        }));
      }
    } catch (error) {
      console.error('Error generating description:', error);

      // Try fallback generation
      try {
        const fallback = generateFallbackDescription({
          programTitle: formData.programName,
          duration: formData.duration,
          focusArea: formData.focusArea,
        });

        const formattedFallback = formatDescription(fallback.description);

        if (formData.description.trim()) {
          setPendingDescription(formattedFallback);
          setShowReplacePrompt(true);
        } else {
          setFormData((prev) => ({
            ...prev,
            description: formattedFallback,
          }));
        }

        setDescriptionError(
          'Used fallback description. You can edit it as needed.'
        );
      } catch (fallbackError) {
        setDescriptionError(
          'Failed to generate description. Please write one manually.'
        );
      }
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleReplaceDescription = () => {
    setFormData((prev) => ({
      ...prev,
      description: pendingDescription,
    }));
    setShowReplacePrompt(false);
    setPendingDescription('');
  };

  const handleKeepExisting = () => {
    setShowReplacePrompt(false);
    setPendingDescription('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      if (!formData.programName || !formData.clientId || !formData.duration || !formData.focusArea) {
        setSubmitError('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      const newProgram: Programs = {
        _id: crypto.randomUUID(),
        programName: formData.programName,
        description: formData.description,
        trainerId: member?._id,
        clientId: formData.clientId,
        duration: formData.duration,
        focusArea: formData.focusArea,
        status: formData.status,
      };

      await BaseCrudService.create('programs', newProgram);

      setSubmitSuccess(true);
      setFormData({
        programName: '',
        description: '',
        clientId: '',
        duration: '',
        focusArea: '',
        status: 'Active',
      });

      setTimeout(() => {
        navigate('/trainer');
      }, 2000);
    } catch (error) {
      setSubmitError('Failed to create program. Please try again.');
      console.error('Error creating program:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-heading text-5xl font-bold text-charcoal-black mb-2">
            Create New Program
          </h1>
          <p className="text-lg text-warm-grey">
            Design a personalised fitness programme for your client
          </p>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
            <div>
              <p className="font-paragraph text-sm text-green-800">
                Program created successfully! Redirecting...
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <div>
              <p className="font-paragraph text-sm text-red-800">
                {submitError}
              </p>
            </div>
          </div>
        )}

        {/* Replace Description Prompt Modal */}
        {showReplacePrompt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-soft-white rounded-2xl p-8 max-w-md w-full">
              <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                Replace Description?
              </h3>
              <p className="font-paragraph text-base text-warm-grey mb-6">
                You already have a description. Would you like to replace it with the AI-generated one?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleReplaceDescription}
                  className="flex-1 bg-soft-bronze text-soft-white py-2 rounded-lg font-medium hover:bg-soft-bronze/90 transition-colors"
                >
                  Replace
                </button>
                <button
                  onClick={handleKeepExisting}
                  className="flex-1 bg-warm-sand-beige text-charcoal-black py-2 rounded-lg font-medium hover:bg-warm-sand-beige/80 transition-colors"
                >
                  Keep Existing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
          <div className="space-y-8">
            {/* Program Name */}
            <div>
              <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                Program Name *
              </label>
              <input
                type="text"
                name="programName"
                value={formData.programName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                placeholder="e.g., 12-Week Strength Building"
              />
            </div>

            {/* Description with AI Generate Button */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block font-paragraph text-sm font-medium text-charcoal-black">
                  Description
                </label>
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={
                    isGeneratingDescription ||
                    !formData.programName.trim() ||
                    !formData.duration.trim() ||
                    !formData.focusArea.trim()
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-soft-bronze text-soft-white font-medium text-sm hover:bg-soft-bronze/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingDescription ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Generate with AI
                    </>
                  )}
                </button>
              </div>

              {/* Description Error */}
              {descriptionError && (
                <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
                  <AlertCircle className="text-amber-600 flex-shrink-0" size={16} />
                  <p className="font-paragraph text-xs text-amber-800">{descriptionError}</p>
                </div>
              )}

              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph resize-none"
                placeholder="Describe the program goals and approach..."
              />
              <p className="text-xs text-warm-grey mt-2">
                AI can generate a description based on the program name, duration, and focus area.
              </p>
            </div>

            {/* Client Selection */}
            <div>
              <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                Select Client *
              </label>
              {loadingClients ? (
                <div className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige bg-warm-sand-beige/30 text-warm-grey">
                  Loading assigned clients...
                </div>
              ) : assignedClients.length === 0 ? (
                <div className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige bg-warm-sand-beige/30">
                  <p className="text-warm-grey text-sm">
                    No clients assigned yet. <a href="/trainer/clients" className="text-soft-bronze hover:underline">Assign a client first</a>
                  </p>
                </div>
              ) : (
                <select
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                >
                  <option value="">Select a client</option>
                  {assignedClients.map((assignment) => (
                    <option key={assignment._id} value={assignment.clientId}>
                      Client {assignment.clientId?.slice(0, 8)}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-xs text-warm-grey mt-2">
                Only clients assigned to you will appear in this list
              </p>
            </div>

            {/* Duration */}
            <div>
              <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                Duration *
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                placeholder="e.g., 12 weeks, 3 months"
              />
            </div>

            {/* Focus Area */}
            <div>
              <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                Focus Area *
              </label>
              <select
                name="focusArea"
                value={formData.focusArea}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
              >
                <option value="">Select a focus area</option>
                <option value="Strength">Strength Building</option>
                <option value="Weight Loss">Weight Loss</option>
                <option value="Postpartum">Postpartum Recovery</option>
                <option value="Cardio">Cardio & Endurance</option>
                <option value="Flexibility">Flexibility & Mobility</option>
                <option value="Perimenopause">Perimenopause Support</option>
                <option value="General">General Fitness</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Paused">Paused</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6 border-t border-warm-sand-beige">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-charcoal-black text-soft-white py-3 rounded-lg font-medium text-lg hover:bg-soft-bronze transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Program...' : 'Create Program'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/trainer')}
                className="flex-1 bg-warm-sand-beige text-charcoal-black py-3 rounded-lg font-medium text-lg hover:bg-warm-sand-beige/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
