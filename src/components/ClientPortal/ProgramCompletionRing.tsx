import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProgramCompletionRingProps {
  completedWorkouts: number;
  totalWorkouts: number;
  showAnimation?: boolean;
  onAnimationComplete?: () => void;
  compact?: boolean; // For overview display
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
  compact = false,
}: ProgramCompletionRingProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [previousPercentage, setPreviousPercentage] = useState(0);
  const messageIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const percentage = totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0;
  const shouldAnimate = percentage > previousPercentage;

  // Rotate through messages every 5 seconds (only on full display)
  useEffect(() => {
    if (compact) return;

    messageIntervalRef.current = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % ENCOURAGING_MESSAGES.length);
    }, 5000);

    return () => {
      if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
    };
  }, [compact]);

  // Handle animation trigger - only animate when progress increases
  useEffect(() => {
    if (showAnimation && shouldAnimate && !hasAnimated) {
      setHasAnimated(true);
      const timer = setTimeout(() => {
        onAnimationComplete?.();
        setPreviousPercentage(percentage);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showAnimation, shouldAnimate, hasAnimated, percentage, onAnimationComplete]);

  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Color progression: warm-grey → soft-bronze (neutral to warm)
  const getProgressColor = () => {
    if (percentage < 33) return '#B8B2AA'; // warm-grey
    if (percentage < 66) return '#C4A57B'; // transitional warm tone
    return '#B08D57'; // soft-bronze
  };

  // Compact version for overview
  if (compact) {
    return (
      <div className="flex flex-col items-center justify-center py-4 px-3">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 120 120"
            style={{ transform: 'rotate(-90deg)' }}
          >
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="#E8DED3"
              strokeWidth="2.5"
              opacity="0.3"
            />

            <motion.circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke={getProgressColor()}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{
                strokeDashoffset: strokeDashoffset,
              }}
              transition={{
                duration: 0.8,
                ease: 'easeInOut',
              }}
              style={{
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.05))',
              }}
            />
          </svg>

          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <motion.div
              className="font-heading text-3xl font-bold text-charcoal-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              {Math.round(percentage)}%
            </motion.div>
            <p className="font-paragraph text-xs text-warm-grey mt-1 uppercase tracking-wide">
              Complete
            </p>
          </motion.div>
        </div>

        <motion.p
          className="mt-3 font-paragraph text-xs text-charcoal-black text-center"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <span className="font-bold">{completedWorkouts}</span>/{totalWorkouts}
        </motion.p>
      </div>
    );
  }

  // Full version for post-completion display
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Circular Progress Ring */}
      <div className="relative w-56 h-56 flex items-center justify-center">
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
              duration: showAnimation ? 1.8 : 0.8,
              ease: 'easeInOut',
            }}
            style={{
              filter: 'drop-shadow(0 4px 12px rgba(176, 141, 87, 0.15))',
            }}
          />
        </svg>

        {/* Center content */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {/* Percentage */}
          <div className="text-center">
            <motion.div
              className="font-heading text-6xl font-bold text-charcoal-black"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {Math.round(percentage)}%
            </motion.div>

            {/* Subtext */}
            <p className="font-paragraph text-xs text-warm-grey mt-3 uppercase tracking-widest font-medium">
              Complete
            </p>
          </div>
        </motion.div>
      </div>

      {/* Workout count */}
      <motion.div
        className="mt-8 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.4 }}
      >
        <p className="font-paragraph text-base text-charcoal-black leading-relaxed">
          <span className="font-bold text-lg">{completedWorkouts}</span> of{' '}
          <span className="font-bold text-lg">{totalWorkouts}</span> workouts completed
        </p>
        <p className="font-paragraph text-xs text-warm-grey mt-2">
          {totalWorkouts - completedWorkouts === 0
            ? 'You\'ve completed all workouts this week!'
            : `${totalWorkouts - completedWorkouts} workout${totalWorkouts - completedWorkouts !== 1 ? 's' : ''} remaining`}
        </p>
      </motion.div>

      {/* Rotating encouraging message */}
      <AnimatePresence mode="wait">
        <motion.div
          className="mt-6 text-center h-8 flex items-center justify-center"
          key={messageIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-paragraph text-sm text-soft-bronze italic max-w-xs">
            "{ENCOURAGING_MESSAGES[messageIndex]}"
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Progress bar below ring */}
      <motion.div
        className="mt-8 w-full max-w-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.4 }}
      >
        <div className="h-2 bg-warm-sand-beige rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(to right, #B8B2AA, ${getProgressColor()})`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{
              duration: showAnimation ? 1.8 : 0.8,
              ease: 'easeInOut',
            }}
          />
        </div>
      </motion.div>

      {/* Motivational footer */}
      {percentage === 100 && (
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <p className="font-heading text-2xl font-bold text-soft-bronze">
            🎉 Week Complete!
          </p>
          <p className="font-paragraph text-sm text-warm-grey mt-2">
            Rest well and prepare for next week's challenges
          </p>
        </motion.div>
      )}
    </div>
  );
}
