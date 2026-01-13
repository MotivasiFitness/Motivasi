import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ProgramCompletionRingProps {
  completedWorkouts: number;
  totalWorkouts: number;
  showAnimation?: boolean;
  onAnimationComplete?: () => void;
}

const ENCOURAGING_MESSAGES = [
  'You\'re building momentum',
  'Consistency is your superpower',
  'Every workout counts',
  'You\'re stronger than yesterday',
  'Progress over perfection',
  'Trust the process',
  'You\'ve got this',
  'Keep the momentum going',
  'Small steps, big results',
  'Your future self thanks you',
];

export default function ProgramCompletionRing({
  completedWorkouts,
  totalWorkouts,
  showAnimation = false,
  onAnimationComplete,
}: ProgramCompletionRingProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Rotate through messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % ENCOURAGING_MESSAGES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Handle animation trigger
  useEffect(() => {
    if (showAnimation && !hasAnimated) {
      setHasAnimated(true);
      const timer = setTimeout(() => {
        onAnimationComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showAnimation, hasAnimated, onAnimationComplete]);

  const percentage = totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Color progression: warm-grey → soft-bronze (neutral to warm)
  const getProgressColor = () => {
    if (percentage < 33) return '#B8B2AA'; // warm-grey
    if (percentage < 66) return '#C4A57B'; // transitional warm tone
    return '#B08D57'; // soft-bronze
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      {/* Circular Progress Ring */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Background circle */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 120 120"
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Subtle background ring */}
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="#E8DED3"
            strokeWidth="3"
            opacity="0.3"
          />

          {/* Progress ring with smooth animation */}
          <motion.circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke={getProgressColor()}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{
              strokeDashoffset: strokeDashoffset,
            }}
            transition={{
              duration: showAnimation ? 1.5 : 0.6,
              ease: 'easeInOut',
            }}
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.05))',
            }}
          />
        </svg>

        {/* Center content */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {/* Percentage */}
          <div className="text-center">
            <motion.div
              className="font-heading text-5xl font-bold text-charcoal-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              {Math.round(percentage)}%
            </motion.div>

            {/* Subtext */}
            <p className="font-paragraph text-xs text-warm-grey mt-2 uppercase tracking-wide">
              Complete
            </p>
          </div>
        </motion.div>
      </div>

      {/* Workout count */}
      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <p className="font-paragraph text-sm text-charcoal-black">
          <span className="font-bold">{completedWorkouts}</span> of{' '}
          <span className="font-bold">{totalWorkouts}</span> workouts
        </p>
      </motion.div>

      {/* Rotating encouraging message */}
      <motion.div
        className="mt-4 text-center h-6 flex items-center justify-center"
        key={messageIndex}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.4 }}
      >
        <p className="font-paragraph text-sm text-soft-bronze italic">
          "{ENCOURAGING_MESSAGES[messageIndex]}"
        </p>
      </motion.div>

      {/* Progress bar below ring (optional visual reinforcement) */}
      <motion.div
        className="mt-6 w-full max-w-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      >
        <div className="h-1.5 bg-warm-sand-beige rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(to right, #B8B2AA, ${getProgressColor()})`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{
              duration: showAnimation ? 1.5 : 0.6,
              ease: 'easeInOut',
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
