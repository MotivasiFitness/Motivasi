import { useState, useEffect } from 'react';
import { useMember } from '@/integrations';
import { Loader, AlertCircle } from 'lucide-react';
import { getTrainerClientAdherenceSignals } from '@/lib/adherence-tracking';
import { getActivitySummary, getRecentFeedback } from '@/lib/adherence-tracking';

interface RetentionMetrics {
  activeClients: number;
  atRiskCount: number;
  inactiveCount: number;
  avgCompletionRate: number;
  avgDifficultyRating: number;
  totalClients: number;
}

export default function WeeklyRetentionSnapshot() {
  const { member } = useMember();
  const [metrics, setMetrics] = useState<RetentionMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      if (!member?._id) return;

      try {
        setIsLoading(true);
        const signals = await getTrainerClientAdherenceSignals(member._id);

        let totalCompletionRate = 0;
        let totalDifficulty = 0;
        let difficultyCount = 0;
        let activeCount = 0;

        // Calculate metrics for each client
        for (const signal of signals) {
          // Count active clients (at least 1 workout in last 7 days)
          const activitySummary = await getActivitySummary(signal.clientId, '', 7);
          if (activitySummary.completed > 0) {
            activeCount++;
          }
          totalCompletionRate += activitySummary.completionRate;

          // Get average difficulty
          const recentFeedback = await getRecentFeedback(signal.clientId, '', 7);
          if (recentFeedback.length > 0) {
            const avgDiff = recentFeedback.reduce((sum, f) => sum + f.difficultyRating, 0) / recentFeedback.length;
            totalDifficulty += avgDiff;
            difficultyCount++;
          }
        }

        const atRiskCount = signals.filter((s) => s.status === 'At Risk').length;
        const inactiveCount = signals.filter((s) => s.status === 'Inactive').length;

        setMetrics({
          activeClients: activeCount,
          atRiskCount,
          inactiveCount,
          avgCompletionRate: signals.length > 0 ? totalCompletionRate / signals.length : 0,
          avgDifficultyRating: difficultyCount > 0 ? totalDifficulty / difficultyCount : 0,
          totalClients: signals.length,
        });
      } catch (error) {
        console.error('Error loading retention metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMetrics();
  }, [member?._id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-soft-bronze" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-4 bg-warm-sand-beige/20 border border-warm-sand-beige rounded-xl flex gap-3">
        <AlertCircle className="w-5 h-5 text-warm-grey flex-shrink-0 mt-0.5" />
        <p className="font-paragraph text-sm text-warm-grey">
          Unable to load retention metrics
        </p>
      </div>
    );
  }

  return (
    <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="font-heading text-3xl font-bold text-charcoal-black mb-2">
          Weekly Retention Snapshot
        </h2>
        <p className="font-paragraph text-sm text-warm-grey">
          Last 7 days performance overview
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Active Clients */}
        <div className="bg-warm-sand-beige/20 rounded-xl p-6 border border-warm-sand-beige">
          <p className="font-paragraph text-xs text-warm-grey uppercase tracking-wide mb-2">
            Active Clients
          </p>
          <p className="font-heading text-4xl font-bold text-charcoal-black mb-1">
            {metrics.activeClients}
          </p>
          <p className="font-paragraph text-xs text-warm-grey">
            of {metrics.totalClients} total
          </p>
        </div>

        {/* At Risk Count */}
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <p className="font-paragraph text-xs text-orange-700 uppercase tracking-wide mb-2">
            At Risk
          </p>
          <p className="font-heading text-4xl font-bold text-orange-600 mb-1">
            {metrics.atRiskCount}
          </p>
          <p className="font-paragraph text-xs text-orange-600">
            missed 2+ workouts
          </p>
        </div>

        {/* Inactive Count */}
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <p className="font-paragraph text-xs text-red-700 uppercase tracking-wide mb-2">
            Inactive
          </p>
          <p className="font-heading text-4xl font-bold text-red-600 mb-1">
            {metrics.inactiveCount}
          </p>
          <p className="font-paragraph text-xs text-red-600">
            no activity 7+ days
          </p>
        </div>

        {/* Average Completion Rate */}
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <p className="font-paragraph text-xs text-green-700 uppercase tracking-wide mb-2">
            Avg Completion Rate
          </p>
          <p className="font-heading text-4xl font-bold text-green-600 mb-1">
            {metrics.avgCompletionRate.toFixed(0)}%
          </p>
          <p className="font-paragraph text-xs text-green-600">
            across all clients
          </p>
        </div>

        {/* Average Difficulty Rating */}
        <div className="bg-soft-bronze/10 rounded-xl p-6 border border-soft-bronze/30">
          <p className="font-paragraph text-xs text-soft-bronze uppercase tracking-wide mb-2">
            Avg Difficulty Rating
          </p>
          <p className="font-heading text-4xl font-bold text-soft-bronze mb-1">
            {metrics.avgDifficultyRating.toFixed(1)}
          </p>
          <p className="font-paragraph text-xs text-warm-grey">
            out of 5
          </p>
        </div>

        {/* On Track Count */}
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <p className="font-paragraph text-xs text-green-700 uppercase tracking-wide mb-2">
            On Track
          </p>
          <p className="font-heading text-4xl font-bold text-green-600 mb-1">
            {metrics.totalClients - metrics.atRiskCount - metrics.inactiveCount}
          </p>
          <p className="font-paragraph text-xs text-green-600">
            consistent & engaged
          </p>
        </div>
      </div>

      {/* Summary Copy */}
      <div className="mt-8 pt-6 border-t border-warm-sand-beige">
        <p className="font-paragraph text-sm text-warm-grey leading-relaxed">
          {metrics.activeClients === metrics.totalClients
            ? '✓ All clients are active this week. Great engagement!'
            : metrics.atRiskCount + metrics.inactiveCount === 0
            ? '✓ All clients are on track. Excellent work!'
            : `${metrics.atRiskCount + metrics.inactiveCount} client${metrics.atRiskCount + metrics.inactiveCount !== 1 ? 's' : ''} need attention. Consider sending check-ins to re-engage.`}
        </p>
      </div>
    </div>
  );
}
