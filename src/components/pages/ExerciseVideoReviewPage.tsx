import { useState } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { PrivateVideoLibrary, TrainerClientAssignments } from '@/entities';
import { Upload, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sendVideoUploadNotification } from '@/lib/email-service';
import { getClientTrainers } from '@/lib/role-utils';

export default function ExerciseVideoReviewPage() {
  const { member } = useMember();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    videoTitle: '',
    description: '',
    videoUrl: '',
    category: 'exercise-review',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      if (!formData.videoTitle.trim()) {
        setSubmitError('Please enter a video title');
        setIsSubmitting(false);
        return;
      }

      if (!formData.videoUrl.trim()) {
        setSubmitError('Please enter a video URL');
        setIsSubmitting(false);
        return;
      }

      // Validate URL format
      try {
        new URL(formData.videoUrl);
      } catch {
        setSubmitError('Please enter a valid video URL');
        setIsSubmitting(false);
        return;
      }

      const videoSubmission: PrivateVideoLibrary = {
        _id: crypto.randomUUID(),
        videoTitle: formData.videoTitle,
        description: formData.description,
        videoUrl: formData.videoUrl,
        category: formData.category,
        accessTags: member?._id || '', // Tag with member ID so trainers can find it
        isPublic: false, // Default: private to client and their trainers
      };

      await BaseCrudService.create('privatevideolibrary', videoSubmission);

      // Send notification to assigned trainers
      try {
        const trainers = await getClientTrainers(member?._id || '');
        for (const trainer of trainers) {
          // In a real app, we'd fetch the trainer's email from their member profile
          // For now, we'll use a placeholder that would be replaced with actual email
          const trainerEmail = `trainer-${trainer.trainerId}@motivasi.co.uk`;
          const trainerName = trainer.trainerId?.slice(0, 8) || 'Trainer';
          
          await sendVideoUploadNotification(
            trainerEmail,
            trainerName,
            member?._id || '',
            formData.videoTitle,
            formData.videoUrl
          );
        }
      } catch (error) {
        console.error('Error sending notifications:', error);
        // Don't fail the submission if notifications fail
      }

      setSubmitSuccess(true);
      setFormData({
        videoTitle: '',
        description: '',
        videoUrl: '',
        category: 'exercise-review',
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/portal/video-library');
      }, 2000);
    } catch (error) {
      console.error('Error submitting video:', error);
      setSubmitError('Failed to submit video. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-soft-white min-h-screen">
      {/* Header */}
      <section className="py-12 px-8 lg:px-20 bg-warm-sand-beige border-b border-warm-sand-beige">
        <div className="max-w-[100rem] mx-auto">
          <h1 className="font-heading text-5xl font-bold text-charcoal-black mb-2">
            Exercise Video Review
          </h1>
          <p className="font-paragraph text-lg text-warm-grey">
            Upload a video of your exercise for your trainer to review and provide feedback
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-8 lg:px-20">
        <div className="max-w-2xl mx-auto">
          {submitSuccess ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="font-heading text-3xl font-bold text-charcoal-black mb-4">
                Video Submitted Successfully!
              </h2>
              <p className="font-paragraph text-lg text-warm-grey mb-8">
                Your trainer will review your video and provide feedback via messages. You'll be redirected to your video library shortly.
              </p>
              <div className="flex items-center justify-center gap-2 text-soft-bronze">
                <Loader className="w-5 h-5 animate-spin" />
                <span className="font-medium">Redirecting...</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Error Message */}
              {submitError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                  <p className="font-paragraph text-sm text-red-800">{submitError}</p>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-soft-bronze/10 border border-soft-bronze/30 rounded-2xl p-6">
                <h3 className="font-heading text-lg font-bold text-charcoal-black mb-3">
                  Tips for a Great Video Review
                </h3>
                <ul className="space-y-2 font-paragraph text-sm text-charcoal-black">
                  <li>✓ Film from multiple angles (front, side) if possible</li>
                  <li>✓ Ensure good lighting and clear audio</li>
                  <li>✓ Show the full range of motion for the exercise</li>
                  <li>✓ Include a brief description of what you'd like feedback on</li>
                  <li>✓ Keep videos under 5 minutes for easier review</li>
                </ul>
              </div>

              {/* Video Title */}
              <div>
                <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                  Video Title *
                </label>
                <input
                  type="text"
                  name="videoTitle"
                  value={formData.videoTitle}
                  onChange={handleInputChange}
                  placeholder="e.g., Squat Form Check - Week 4"
                  className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                />
                <p className="text-xs text-warm-grey mt-2">
                  Give your video a descriptive title so your trainer knows what to look for
                </p>
              </div>

              {/* Video Upload */}
              <div>
                <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                  Upload your video *
                </label>
                <input
                  type="url"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/video.mp4 or YouTube/Vimeo link"
                  className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                />
                <p className="text-xs text-warm-grey mt-2">
                  You can upload videos directly from your phone or computer (MP4, MOV supported). Short clips under 5 minutes are best.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                  Description / Notes
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="What would you like your trainer to focus on? Any specific concerns or questions?"
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph resize-none"
                />
                <p className="text-xs text-warm-grey mt-2">
                  Optional: Provide context to help your trainer give more targeted feedback
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
                  Exercise Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
                >
                  <option value="exercise-review">Exercise Form Review</option>
                  <option value="strength">Strength Training</option>
                  <option value="cardio">Cardio</option>
                  <option value="flexibility">Flexibility / Mobility</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Privacy Notice */}
              <div className="bg-warm-sand-beige/30 border border-warm-sand-beige rounded-lg p-4">
                <p className="font-paragraph text-xs text-charcoal-black leading-relaxed">
                  Your video will only be visible to your assigned trainer. They will review it and provide feedback via the Messages section of your portal.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-charcoal-black text-soft-white py-4 rounded-lg font-medium text-lg hover:bg-soft-bronze transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Submit Video for Review
                  </>
                )}
              </button>

              {/* Cancel Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/portal/video-library')}
                  className="text-soft-bronze hover:underline font-paragraph text-base"
                >
                  Back to Video Library
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
