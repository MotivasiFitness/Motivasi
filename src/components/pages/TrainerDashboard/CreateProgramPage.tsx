import { useState } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { Programs } from '@/entities';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function CreateProgramPage() {
  const { member } = useMember();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState({
    programName: '',
    description: '',
    clientId: '',
    duration: '',
    focusArea: '',
    status: 'Active',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
            Design a personalized fitness program for your client
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

            {/* Description */}
            <div>
              <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph resize-none"
                placeholder="Describe the program goals and approach..."
              />
            </div>

            {/* Client ID */}
            <div>
              <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                Client ID *
              </label>
              <input
                type="text"
                name="clientId"
                value={formData.clientId}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                placeholder="Enter the client's ID"
              />
              <p className="text-xs text-warm-grey mt-2">
                You can find the client ID in your client management system
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
