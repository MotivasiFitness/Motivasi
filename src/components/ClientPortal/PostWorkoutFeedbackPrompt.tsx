import { useState } from 'react';
import { X, CheckCircle, Loader, AlertCircle } from 'lucide-react';
import { recordWorkoutFeedback } from '@/lib/adherence-tracking';

interface PostWorkoutFeedbackPromptProps {
  clientId: string;
  programId: string;
  workoutActivityId: string;
  workoutTitle?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PostWorkoutFeedbackPrompt({
  clientId,
  programId,
  workoutActivityId,
  workoutTitle = 'Today\'s Workout',
  onClose,
  onSuccess,
}: PostWorkoutFeedbackPromptProps) {
  const [difficultyRating, setDifficultyRating] = useState<number | null>(null);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (difficultyRating === null) {
      setSubmitError('Please rate the difficulty');
      return;
    }

    setIsSubmitting(true);

    try {
      await recordWorkoutFeedback(
        clientId,
        programId,
        workoutActivityId,
        difficultyRating,
        feedbackNote || undefined
      );

      setIsSubmitted(true);
      onSuccess?.();

      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-end z-50">
        <div className="w-full bg-soft-white rounded-t-3xl p-6 md:p-8 max-w-md mx-auto animate-in slide-in-from-bottom">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-2">
              Thanks for the feedback!
            </h3>
            <p className="font-paragraph text-sm text-warm-grey">
              Your trainer will use this to optimize your programme.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="w-full bg-soft-white rounded-t-3xl p-6 md:p-8 max-w-md mx-auto animate-in slide-in-from-bottom">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading text-2xl font-bold text-charcoal-black">
            How was {workoutTitle}?
          </h3>
          <button
            onClick={handleSkip}
            className="p-2 hover:bg-warm-sand-beige rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-warm-grey" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="font-paragraph text-sm text-red-800">{submitError}</p>
            </div>
          )}

          {/* Difficulty Rating */}
          <div>
            <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-4">
              How difficult was it?
            </label>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setDifficultyRating(rating)}
                  className={`flex-1 py-3 rounded-lg font-heading text-lg font-bold transition-all ${
                    difficultyRating === rating
                      ? 'bg-soft-bronze text-soft-white shadow-lg'
                      : 'bg-warm-sand-beige text-charcoal-black hover:bg-soft-bronze/20'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="font-paragraph text-xs text-warm-grey">Easy</span>
              <span className="font-paragraph text-xs text-warm-grey">Hard</span>
            </div>
          </div>

          {/* Optional Feedback Note */}
          <div>
            <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-2">
              Any comments? (optional)
            </label>
            <textarea
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
              placeholder="e.g., Felt strong today, or struggled with form..."
              maxLength={200}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph text-sm resize-none"
            />
            <p className="text-xs text-warm-grey mt-1">
              {feedbackNote.length}/200 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleSkip}
              className="flex-1 py-3 rounded-lg font-medium text-sm border border-warm-sand-beige text-charcoal-black hover:bg-warm-sand-beige/20 transition-colors"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={isSubmitting || difficultyRating === null}
              className="flex-1 py-3 rounded-lg font-medium text-sm bg-charcoal-black text-soft-white hover:bg-soft-bronze transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit'
              )}
            </button>
          </div>

          {/* Privacy Note */}
          <p className="text-xs text-warm-grey text-center">
            Your feedback helps your trainer optimize your programme
          </p>
        </form>
      </div>
    </div>
  );
}
