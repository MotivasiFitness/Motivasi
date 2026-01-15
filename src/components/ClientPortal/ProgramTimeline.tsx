import { CheckCircle2, Lock, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProgramTimelineProps {
  currentWeek: number;
  weeksCompleted: number[];
  totalWeeks?: number;
  onWeekClick?: (weekNumber: number) => void;
}

export default function ProgramTimeline({
  currentWeek,
  weeksCompleted,
  totalWeeks = 4,
  onWeekClick,
}: ProgramTimelineProps) {
  const weeks = Array.from({ length: totalWeeks }, (_, i) => i + 1);

  const getWeekState = (weekNum: number): 'completed' | 'current' | 'locked' => {
    if (weeksCompleted.includes(weekNum)) return 'completed';
    if (weekNum === currentWeek) return 'current';
    return 'locked';
  };

  return (
    <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-6 lg:p-8">
      <h2 className="font-heading text-xl font-bold text-charcoal-black mb-6">
        Program Timeline
      </h2>
      
      {/* Horizontal Timeline */}
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-warm-sand-beige">
          <motion.div
            className="h-full bg-soft-bronze"
            initial={{ width: 0 }}
            animate={{ 
              width: `${(weeksCompleted.length / totalWeeks) * 100}%` 
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Week Nodes */}
        <div className="relative flex justify-between items-start">
          {weeks.map((weekNum) => {
            const state = getWeekState(weekNum);
            const isClickable = state === 'completed' || state === 'current';

            return (
              <motion.button
                key={weekNum}
                onClick={() => isClickable && onWeekClick?.(weekNum)}
                disabled={!isClickable}
                className={`flex flex-col items-center gap-2 transition-all ${
                  isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                }`}
                whileHover={isClickable ? { scale: 1.05 } : {}}
                whileTap={isClickable ? { scale: 0.95 } : {}}
              >
                {/* Week Circle */}
                <div
                  className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    state === 'completed'
                      ? 'bg-green-100 text-green-700 border-2 border-green-500'
                      : state === 'current'
                      ? 'bg-soft-bronze text-soft-white border-2 border-soft-bronze shadow-lg'
                      : 'bg-warm-sand-beige/50 text-warm-grey border-2 border-warm-sand-beige'
                  }`}
                >
                  {state === 'completed' ? (
                    <CheckCircle2 size={24} />
                  ) : state === 'current' ? (
                    <Circle size={24} className="animate-pulse" />
                  ) : (
                    <Lock size={20} />
                  )}
                </div>

                {/* Week Label */}
                <div className="text-center">
                  <p
                    className={`font-heading text-sm font-bold ${
                      state === 'current'
                        ? 'text-soft-bronze'
                        : state === 'completed'
                        ? 'text-green-700'
                        : 'text-warm-grey'
                    }`}
                  >
                    Week {weekNum}
                  </p>
                  {state === 'current' && (
                    <p className="text-xs text-soft-bronze font-medium mt-1">
                      Active
                    </p>
                  )}
                  {state === 'completed' && (
                    <p className="text-xs text-green-600 font-medium mt-1">
                      ✓ Done
                    </p>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Cycle Progress Info */}
      <div className="mt-6 pt-6 border-t border-warm-sand-beige">
        <div className="flex items-center justify-between text-sm">
          <span className="text-warm-grey">
            Cycle Progress: {weeksCompleted.length} of {totalWeeks} weeks completed
          </span>
          {weeksCompleted.length === totalWeeks && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
              <CheckCircle2 size={14} />
              Cycle Complete!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
