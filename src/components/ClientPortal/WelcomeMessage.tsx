import { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface WelcomeMessageProps {
  clientName: string;
  onDismiss: () => void;
}

export default function WelcomeMessage({ clientName, onDismiss }: WelcomeMessageProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-charcoal-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-soft-white rounded-2xl max-w-2xl w-full p-8 lg:p-10 shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-warm-grey hover:text-charcoal-black transition-colors"
          aria-label="Close welcome message"
        >
          <X size={24} />
        </button>

        {/* Welcome content */}
        <div className="space-y-6">
          <div>
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-charcoal-black mb-3">
              Welcome to your training portal, {clientName}
            </h2>
            <p className="font-paragraph text-lg text-warm-grey leading-relaxed">
              You're all set. Here's what you need to know to get started.
            </p>
          </div>

          <div className="space-y-4 bg-warm-sand-beige/30 rounded-xl p-6">
            <div>
              <h3 className="font-heading text-lg font-bold text-charcoal-black mb-2">
                📋 Your workouts
              </h3>
              <p className="font-paragraph text-charcoal-black leading-relaxed">
                Find your personalised program in the <strong>"My Program"</strong> section. Each week includes 3–4 workouts designed specifically for you.
              </p>
            </div>

            <div>
              <h3 className="font-heading text-lg font-bold text-charcoal-black mb-2">
                📅 How weekly training works
              </h3>
              <p className="font-paragraph text-charcoal-black leading-relaxed">
                Complete your workouts at your own pace throughout the week. When you finish all workouts for the week, it moves to your history automatically, and the next week begins. <strong>Don't worry if you miss a workout—life happens, and your coach will help you adjust.</strong>
              </p>
            </div>

            <div>
              <h3 className="font-heading text-lg font-bold text-charcoal-black mb-2">
                💬 Coach support & check-ins
              </h3>
              <p className="font-paragraph text-charcoal-black leading-relaxed">
                <strong>Your coach is here for you.</strong> They review your progress regularly and will adjust your program based on how you're feeling. After each week, you'll be prompted to share a quick check-in—this helps your coach tailor your training to suit you better.
              </p>
            </div>
          </div>

          <div className="pt-4">
            <Link
              to="/portal/program"
              onClick={handleDismiss}
              className="inline-flex items-center justify-center gap-2 w-full bg-soft-bronze text-soft-white px-8 py-4 rounded-lg font-heading text-lg font-bold hover:bg-soft-bronze/90 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Take me to my program
              <ArrowRight size={20} />
            </Link>
          </div>

          <p className="text-center text-sm text-warm-grey italic">
            This message will only show once
          </p>
        </div>
      </div>
    </div>
  );
}
