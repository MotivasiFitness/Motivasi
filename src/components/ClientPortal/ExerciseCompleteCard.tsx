import { CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ExerciseCompleteCardProps {
  onDismiss?: () => void;
  autoDismissMs?: number;
}

export default function ExerciseCompleteCard({ onDismiss, autoDismissMs = 3000 }: ExerciseCompleteCardProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoDismissMs > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, autoDismissMs);
      return () => clearTimeout(timer);
    }
  }, [autoDismissMs, onDismiss]);

  if (!isVisible) return null;

  return (
    <div className="w-full mb-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 lg:p-8 text-center shadow-sm">
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-green-200 rounded-full animate-pulse opacity-50" />
            <CheckCircle2 size={48} className="text-green-600 relative z-10" />
          </div>
        </div>
        
        <h3 className="font-heading text-2xl lg:text-3xl font-bold text-green-700 mb-2">
          ✅ Exercise Complete
        </h3>
        
        <p className="text-green-600 text-base lg:text-lg font-paragraph mb-6">
          Take 60–90 seconds to recover before moving on.
        </p>

        <button
          onClick={() => {
            setIsVisible(false);
            onDismiss?.();
          }}
          className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
