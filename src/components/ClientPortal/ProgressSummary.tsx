import { useState, useEffect } from 'react';
import { useMember } from '@/integrations';
import { Loader, AlertCircle, TrendingUp } from 'lucide-react';
import { getActivitySummary } from '@/lib/adherence-tracking';

interface ProgressSummaryProps {
  programId: string;
  programName?: string;
  totalWeeks?: number;
  currentWeek?: number;
}

export default function ProgressSummary({
  programId,
  programName = 'Your Program',
  totalWeeks = 12,
  currentWeek = 1,
}: ProgressSummaryProps) {
  const { member } = useMember();
  const [summary, setSummary] = useState<{
    completed: number;
    missed: number;
    total: number;
    completionRate: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      if (!member?._id) return;

      try {
        setIsLoading(true);
        const activitySummary = await getActivitySummary(member._id, programId, 7);
        setSummary(activitySummary);
      } catch (error) {
        console.error('Error loading progress summary:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSummary();
  }, [member?._id, programId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="w-6 h-6 animate-spin text-soft-bronze" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-4 bg-warm-sand-beige/20 border border-warm-sand-beige rounded-xl flex gap-3">
        <AlertCircle className="w-5 h-5 text-warm-grey flex-shrink-0 mt-0.5" />
        <p className="font-paragraph text-sm text-warm-grey">
          Unable to load progress summary
        </p>
      </div>
    );
  }

  const progressPercentage = (currentWeek / totalWeeks) * 100;
  const isOnTrack = summary.completionRate >= 80;

  return (
    <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-6 md:p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-2">
            Your Progress
          </h3>
          <p className="font-paragraph text-sm text-warm-grey">
            {programName}
          </p>
        </div>
        {isOnTrack && (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="font-paragraph text-xs font-medium text-green-700">
              On Track
            </span>
          </div>
        )}
      </div>

      {/* Program Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="font-paragraph text-sm font-medium text-charcoal-black">
            Programme Progress
          </p>
          <p className="font-paragraph text-sm font-bold text-soft-bronze">
            Week {currentWeek} of {totalWeeks}
          </p>
        </div>
        <div className="w-full bg-warm-sand-beige rounded-full h-2 overflow-hidden">
          <div
            className="bg-soft-bronze h-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Weekly Activity */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-warm-sand-beige/30 rounded-xl p-4 text-center">
          <p className="font-heading text-3xl font-bold text-green-600 mb-1">
            {summary.completed}
          </p>
          <p className="font-paragraph text-xs text-charcoal-black/70">
            Completed
          </p>
        </div>
        <div className="bg-warm-sand-beige/30 rounded-xl p-4 text-center">
          <p className="font-heading text-3xl font-bold text-charcoal-black mb-1">
            {summary.total}
          </p>
          <p className="font-paragraph text-xs text-charcoal-black/70">
            Total This Week
          </p>
        </div>
        <div className="bg-soft-bronze/10 rounded-xl p-4 text-center">
          <p className="font-heading text-3xl font-bold text-soft-bronze mb-1">
            {summary.completionRate}%
          </p>
          <p className="font-paragraph text-xs text-charcoal-black/70">
            Completion Rate
          </p>
        </div>
      </div>

      {/* Positive Reinforcement */}
      <div className="bg-soft-bronze/10 border border-soft-bronze/30 rounded-xl p-4">
        {summary.completionRate >= 90 ? (
          <p className="font-paragraph text-sm text-charcoal-black">
            <span className="font-bold">Excellent work!</span> You're crushing your programme. Keep up this momentum! 💪
          </p>
        ) : summary.completionRate >= 80 ? (
          <p className="font-paragraph text-sm text-charcoal-black">
            <span className="font-bold">Great effort!</span> You're staying consistent with your training. You're on track to reach your goals. 🎯
          </p>
        ) : summary.completionRate >= 60 ? (
          <p className="font-paragraph text-sm text-charcoal-black">
            <span className="font-bold">You're making progress.</span> A few more sessions this week will get you back on track. You've got this! 💪
          </p>
        ) : (
          <p className="font-paragraph text-sm text-charcoal-black">
            <span className="font-bold">Let's get back on track.</span> Your coach is here to support you. Reach out if you need help fitting workouts into your schedule.
          </p>
        )}
      </div>

      {/* Info */}
      <p className="font-paragraph text-xs text-warm-grey text-center mt-6">
        Progress tracked for the last 7 days
      </p>
    </div>
  );
}
