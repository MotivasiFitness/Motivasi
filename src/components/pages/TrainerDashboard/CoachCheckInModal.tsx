import { useState, useEffect } from 'react';
import { X, Send, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { sendCoachCheckInMessage, getCheckInMessageTemplate } from '@/lib/coach-checkin-service';
import { AdherenceStatus } from '@/lib/adherence-tracking';
import { getClientDisplayName } from '@/lib/client-profile-service';

interface CoachCheckInModalProps {
  clientId: string;
  trainerId: string;
  reason: AdherenceStatus;
  reasonDescription: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CoachCheckInModal({
  clientId,
  trainerId,
  reason,
  reasonDescription,
  onClose,
  onSuccess,
}: CoachCheckInModalProps) {
  const [message, setMessage] = useState(getCheckInMessageTemplate(reason));
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [clientName, setClientName] = useState<string>('');

  useEffect(() => {
    const loadClientName = async () => {
      const name = await getClientDisplayName(clientId);
      setClientName(name);
    };
    loadClientName();
  }, [clientId]);

  const handleSend = async () => {
    if (!message.trim()) {
      setError('Message cannot be empty');
      return;
    }

    setIsSending(true);
    setError('');

    try {
      await sendCoachCheckInMessage(clientId, trainerId, message, reason);
      setIsSuccess(true);
      onSuccess?.();

      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error sending check-in:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-soft-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-2">
            Message Sent!
          </h3>
          <p className="font-paragraph text-sm text-warm-grey">
            Your check-in message has been sent to the client.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-soft-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-soft-white border-b border-warm-sand-beige p-6 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold text-charcoal-black">
              Send Check-In Message
            </h2>
            <p className="font-paragraph text-sm text-warm-grey mt-1">
              {clientName && <span className="font-medium">{clientName}</span>}
              {clientName && reasonDescription && ' • '}
              {reasonDescription}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-warm-sand-beige rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-warm-grey" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="font-paragraph text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Reason Badge */}
          <div className="inline-block">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                reason === 'At Risk'
                  ? 'bg-orange-100 text-orange-800'
                  : reason === 'Too Hard'
                  ? 'bg-red-100 text-red-800'
                  : reason === 'Too Easy'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {reason}
            </span>
          </div>

          {/* Message Editor */}
          <div>
            <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-3">
              Your Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={10}
              className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph text-sm resize-none"
              placeholder="Type your check-in message..."
            />
            <p className="text-xs text-warm-grey mt-2">
              {message.length} characters
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-soft-bronze/10 border border-soft-bronze/30 rounded-lg p-4">
            <p className="font-paragraph text-xs text-charcoal-black leading-relaxed">
              <span className="font-bold">💡 Tip:</span> Personalize this message to make it feel more genuine. The template is just a starting point – feel free to adjust the tone and content to match your coaching style.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-warm-sand-beige">
            <button
              onClick={onClose}
              disabled={isSending}
              className="flex-1 py-3 rounded-lg font-medium text-sm border border-warm-sand-beige text-charcoal-black hover:bg-warm-sand-beige/20 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={isSending || !message.trim()}
              className="flex-1 py-3 rounded-lg font-medium text-sm bg-charcoal-black text-soft-white hover:bg-soft-bronze transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSending ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send Message
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
