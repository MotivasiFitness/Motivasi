/**
 * Shared WorkoutCard Component
 * Standardized workout/session card used across client portal and history pages
 * Handles optional fields with clean fallbacks and responsive design
 */

import { ClientAssignedWorkouts, ClientPrograms } from '@/entities';
import { Clock, CheckCircle2, Star, ChevronDown } from 'lucide-react';
import { extractWorkoutCardMetadata, getNextUpCardClasses, getNextUpHeaderClasses, getNextUpBadgeClasses } from '@/lib/workout-card-utils';

interface WorkoutCardProps {
  // Data
  workout: ClientAssignedWorkouts | ClientPrograms;
  workoutNumber: number;
  dayExercises?: (ClientAssignedWorkouts | ClientPrograms)[];
  
  // State
  isExpanded: boolean;
  isActive: boolean;
  isCompleted: boolean;
  isNextRecommended: boolean;
  
  // Callbacks
  onToggle: () => void;
  onStartClick?: () => void;
  
  // Optional styling
  className?: string;
}

export default function WorkoutCard({
  workout,
  workoutNumber,
  dayExercises = [],
  isExpanded,
  isActive,
  isCompleted,
  isNextRecommended,
  onToggle,
  onStartClick,
  className = '',
}: WorkoutCardProps) {
  // Extract metadata from exercises (for session-level info)
  const metadata = dayExercises.length > 0 
    ? extractWorkoutCardMetadata(dayExercises as ClientPrograms[])
    : { exerciseCountLabel: 'focused movements' };

  // Get visual classes for "Next up" state
  const nextUpCardClasses = getNextUpCardClasses(isNextRecommended, isCompleted, isActive);
  const nextUpHeaderClasses = getNextUpHeaderClasses(isNextRecommended, isCompleted, isActive);
  const nextUpBadgeClasses = getNextUpBadgeClasses(isActive);

  return (
    <div
      className={`bg-soft-white border rounded-2xl overflow-hidden transition-all duration-300 ${
        isActive
          ? 'border-soft-bronze shadow-lg'
          : isCompleted
          ? 'border-green-200 bg-green-50/30'
          : isNextRecommended
          ? 'border-soft-bronze/60 shadow-md'
          : 'border-warm-sand-beige'
      } ${nextUpCardClasses} ${className}`}
    >
      {/* Card Header */}
      <button
        onClick={onToggle}
        className={`w-full px-6 lg:px-8 py-5 lg:py-6 flex items-center justify-between transition-all duration-300 ${
          isActive
            ? 'bg-soft-bronze text-soft-white'
            : 'hover:bg-soft-bronze hover:text-soft-white'
        } ${nextUpHeaderClasses}`}
      >
        <div className="flex-1 text-left">
          {/* Title Row with Number and Badge */}
          <div className="flex items-center gap-3 mb-2">
            <h3
              className={`font-heading text-lg lg:text-xl font-bold ${
                isActive ? 'text-soft-white' : 'text-charcoal-black'
              }`}
            >
              Training {workoutNumber}
            </h3>
            {isNextRecommended && !isCompleted && (
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${nextUpBadgeClasses}`}
              >
                <Star size={12} className="fill-current" /> Next up
              </span>
            )}
            {isCompleted && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold border border-green-300">
                <CheckCircle2 size={14} /> Completed
              </span>
            )}
          </div>

          {/* Session Title/Description - if available */}
          {metadata.sessionDescription && (
            <p
              className={`text-sm font-medium mb-2 ${
                isActive ? 'text-soft-white/90' : 'text-soft-bronze'
              }`}
            >
              {metadata.sessionDescription}
            </p>
          )}

          {/* Session Focus and Duration Row */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className={`${isActive ? 'text-soft-white/70' : 'text-warm-grey'}`}>
              {dayExercises.length || 1} {metadata.exerciseCountLabel}
            </span>
            {metadata.estimatedDuration && (
              <span
                className={`flex items-center gap-1 ${
                  isActive ? 'text-soft-white/70' : 'text-warm-grey'
                }`}
              >
                <Clock size={14} />
                {metadata.estimatedDuration}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 ml-4">
          {!isExpanded && onStartClick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartClick();
              }}
              className="hidden sm:flex items-center gap-2 bg-soft-bronze text-soft-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-soft-bronze/90 transition-colors whitespace-nowrap"
            >
              Start Training →
            </button>
          )}
          <ChevronDown
            size={24}
            className={`${
              isActive ? 'text-soft-white' : 'text-soft-bronze'
            } transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Mobile Start Button */}
      {!isExpanded && onStartClick && (
        <div className="sm:hidden px-6 py-3 border-t border-warm-sand-beige">
          <button
            onClick={() => onStartClick?.()}
            className="w-full flex items-center justify-center gap-2 bg-soft-bronze text-soft-white px-4 py-3 rounded-lg font-bold text-base hover:bg-soft-bronze/90 transition-colors"
          >
            Start Training →
          </button>
        </div>
      )}
    </div>
  );
}
