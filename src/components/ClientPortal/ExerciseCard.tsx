import { useState } from 'react';
import { ChevronDown, ChevronUp, Lightbulb, AlertCircle, TrendingUp, Volume2, Clock, Dumbbell } from 'lucide-react';

/**
 * Standardized Exercise Display Component
 * Used across client portal and trainer dashboard for consistent exercise presentation
 * 
 * Display Order:
 * 1. Exercise name
 * 2. Primary muscles worked
 * 3. Your Task (sets/reps/load/rest)
 * 4. Coach cue (single key cue)
 * 5. How to perform
 * 6. Tempo (with session-level tempo key handled separately)
 * 7. Common mistake and/or modification (optional)
 * 8. Progression
 */

export interface ExerciseCardData {
  _id: string;
  exerciseName?: string;
  sets?: number;
  reps?: number;
  weightOrResistance?: string;
  tempo?: string;
  restTimeSeconds?: number;
  exerciseNotes?: string;
  exerciseVideoUrl?: string;
  // New fields (with fallback support)
  coachCue?: string;
  primaryMuscles?: string | string[];
  secondaryMuscles?: string | string[];
  modification1Title?: string;
  modification1Description?: string;
  modification2Title?: string;
  modification2Description?: string;
  modification3Title?: string;
  modification3Description?: string;
  progression?: string;
}

export interface SessionContext {
  tempoKey?: string;
  effortGuidance?: string;
  equipment?: string[];
}

interface ExerciseCardProps {
  exercise: ExerciseCardData;
  sessionContext?: SessionContext;
  isExpanded?: boolean;
  onToggleExpand?: (id: string) => void;
  showVideo?: boolean;
  onVideoClick?: (url: string) => void;
  compact?: boolean;
}

export default function ExerciseCard({
  exercise,
  sessionContext,
  isExpanded = false,
  onToggleExpand,
  showVideo = false,
  onVideoClick,
  compact = false,
}: ExerciseCardProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    const newSet = new Set(expandedSections);
    if (newSet.has(section)) {
      newSet.delete(section);
    } else {
      newSet.add(section);
    }
    setExpandedSections(newSet);
  };

  const formatMuscles = (muscles: string | string[] | undefined): string => {
    if (!muscles) return '';
    if (Array.isArray(muscles)) {
      return muscles.join(', ');
    }
    return muscles;
  };

  const getFirstSentence = (text: string | undefined): string => {
    if (!text) return '';
    const match = text.match(/^[^.!?]*[.!?]/);
    return match ? match[0] : text;
  };

  const hasModifications =
    exercise.modification1Title ||
    exercise.modification2Title ||
    exercise.modification3Title;

  const modifications = [
    {
      title: exercise.modification1Title,
      description: exercise.modification1Description,
    },
    {
      title: exercise.modification2Title,
      description: exercise.modification2Description,
    },
    {
      title: exercise.modification3Title,
      description: exercise.modification3Description,
    },
  ].filter((m) => m.title);

  if (compact) {
    return (
      <div className="bg-soft-white border border-warm-grey/15 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h4 className="font-heading text-lg font-semibold text-charcoal-black mb-2">
              {exercise.exerciseName || 'Unnamed Exercise'}
            </h4>
            {exercise.primaryMuscles && (
              <p className="text-sm text-warm-grey mb-2">
                {formatMuscles(exercise.primaryMuscles)}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-warm-grey">
              {exercise.sets && exercise.reps && (
                <span>{exercise.sets} × {exercise.reps}</span>
              )}
              {exercise.weightOrResistance && (
                <span>{exercise.weightOrResistance}</span>
              )}
              {exercise.restTimeSeconds && (
                <span>{exercise.restTimeSeconds}s rest</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-soft-white border border-warm-grey/15 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header - Always Visible */}
      <div
        className="p-5 lg:p-6 cursor-pointer hover:bg-warm-sand-beige/20 transition-colors duration-200"
        onClick={() => onToggleExpand?.(exercise._id)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* 1. Exercise Name */}
            <h3 className="font-heading text-2xl font-semibold text-charcoal-black mb-3">
              {exercise.exerciseName || 'Unnamed Exercise'}
            </h3>

            {/* 2. Primary Muscles Worked */}
            {exercise.primaryMuscles && (
              <div className="flex items-center gap-2 mb-3 text-warm-grey">
                <Dumbbell className="w-4 h-4" />
                <span className="text-sm font-paragraph">
                  {formatMuscles(exercise.primaryMuscles)}
                </span>
              </div>
            )}

            {/* 3. Your Task (Sets/Reps/Load/Rest) */}
            <div className="flex flex-wrap items-center gap-4 mb-3 text-sm">
              {exercise.sets && exercise.reps && (
                <div className="flex items-center gap-2 text-charcoal-black font-medium">
                  <span className="bg-soft-bronze/20 px-3 py-1 rounded">
                    {exercise.sets} × {exercise.reps}
                  </span>
                </div>
              )}
              {exercise.weightOrResistance && (
                <div className="flex items-center gap-2 text-charcoal-black">
                  <span className="bg-warm-sand-beige/50 px-3 py-1 rounded">
                    {exercise.weightOrResistance}
                  </span>
                </div>
              )}
              {exercise.restTimeSeconds && (
                <div className="flex items-center gap-2 text-warm-grey">
                  <Clock className="w-4 h-4" />
                  <span>{exercise.restTimeSeconds}s rest</span>
                </div>
              )}
            </div>

            {/* 4. Coach Cue (Single Key Cue) */}
            {exercise.coachCue && (
              <div className="flex items-start gap-2 mb-3 p-3 bg-soft-bronze/10 rounded border-l-2 border-soft-bronze">
                <Volume2 className="w-4 h-4 text-soft-bronze flex-shrink-0 mt-0.5" />
                <p className="text-sm text-charcoal-black font-paragraph">
                  {getFirstSentence(exercise.coachCue)}
                </p>
              </div>
            )}
          </div>

          {/* Expand/Collapse Toggle */}
          {onToggleExpand && (
            <button className="flex-shrink-0 text-warm-grey hover:text-charcoal-black transition-colors">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-warm-grey/15 bg-soft-white/50">
          {/* 5. How to Perform */}
          {exercise.exerciseNotes && (
            <div className="p-5 lg:p-6 border-b border-warm-grey/15">
              <button
                onClick={() => toggleSection('howToPerform')}
                className="flex items-center justify-between w-full mb-3 hover:text-soft-bronze transition-colors"
              >
                <h4 className="font-heading text-lg font-semibold text-charcoal-black">
                  How to Perform
                </h4>
                {expandedSections.has('howToPerform') ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {expandedSections.has('howToPerform') && (
                <p className="text-sm text-charcoal-black font-paragraph leading-relaxed whitespace-pre-wrap">
                  {exercise.exerciseNotes}
                </p>
              )}
            </div>
          )}

          {/* 6. Tempo (with session-level tempo key) */}
          {(exercise.tempo || sessionContext?.tempoKey) && (
            <div className="p-5 lg:p-6 border-b border-warm-grey/15">
              <button
                onClick={() => toggleSection('tempo')}
                className="flex items-center justify-between w-full mb-3 hover:text-soft-bronze transition-colors"
              >
                <h4 className="font-heading text-lg font-semibold text-charcoal-black">
                  Tempo & Effort
                </h4>
                {expandedSections.has('tempo') ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {expandedSections.has('tempo') && (
                <div className="space-y-3">
                  {exercise.tempo && (
                    <div>
                      <p className="text-xs font-semibold text-warm-grey uppercase tracking-wide mb-1">
                        Exercise Tempo
                      </p>
                      <p className="text-sm text-charcoal-black font-paragraph">
                        {exercise.tempo}
                      </p>
                    </div>
                  )}
                  {sessionContext?.tempoKey && (
                    <div>
                      <p className="text-xs font-semibold text-warm-grey uppercase tracking-wide mb-1">
                        Tempo Key
                      </p>
                      <p className="text-sm text-charcoal-black font-paragraph">
                        {sessionContext.tempoKey}
                      </p>
                    </div>
                  )}
                  {sessionContext?.effortGuidance && (
                    <div className="p-3 bg-muted-rose/10 rounded border-l-2 border-muted-rose">
                      <p className="text-xs font-semibold text-warm-grey uppercase tracking-wide mb-1">
                        Effort Guidance
                      </p>
                      <p className="text-sm text-charcoal-black font-paragraph">
                        {sessionContext.effortGuidance}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 7. Common Mistake and/or Modification */}
          {hasModifications && (
            <div className="p-5 lg:p-6 border-b border-warm-grey/15">
              <button
                onClick={() => toggleSection('modifications')}
                className="flex items-center justify-between w-full mb-3 hover:text-soft-bronze transition-colors"
              >
                <h4 className="font-heading text-lg font-semibold text-charcoal-black">
                  Modifications & Adjustments
                </h4>
                {expandedSections.has('modifications') ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {expandedSections.has('modifications') && (
                <div className="space-y-3">
                  {modifications.map((mod, idx) => (
                    <div key={idx} className="p-3 bg-warm-sand-beige/30 rounded">
                      <h5 className="font-semibold text-charcoal-black mb-1 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-soft-bronze" />
                        {mod.title}
                      </h5>
                      {mod.description && (
                        <p className="text-sm text-charcoal-black font-paragraph">
                          {mod.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 8. Progression */}
          {exercise.progression && (
            <div className="p-5 lg:p-6 border-b border-warm-grey/15">
              <button
                onClick={() => toggleSection('progression')}
                className="flex items-center justify-between w-full mb-3 hover:text-soft-bronze transition-colors"
              >
                <h4 className="font-heading text-lg font-semibold text-charcoal-black">
                  Progression
                </h4>
                {expandedSections.has('progression') ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {expandedSections.has('progression') && (
                <div className="flex items-start gap-3 p-3 bg-soft-bronze/10 rounded">
                  <TrendingUp className="w-4 h-4 text-soft-bronze flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-charcoal-black font-paragraph">
                    {exercise.progression}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Video Link */}
          {showVideo && exercise.exerciseVideoUrl && (
            <div className="p-5 lg:p-6">
              <button
                onClick={() => onVideoClick?.(exercise.exerciseVideoUrl!)}
                className="w-full bg-soft-bronze text-soft-white px-4 py-2 rounded-lg font-medium hover:bg-soft-bronze/90 transition-colors"
              >
                Watch Exercise Video
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
