import { useState, useEffect } from 'react';
import { useMember } from '@/integrations';
import { Loader, AlertCircle, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { getActivitySummary, getClientAdherenceSignal, AdherenceStatus } from '@/lib/adherence-tracking';

interface ClientProgressReassuranceCardProps {
  programId: string;
  programName?: string;
  currentWeek?: number;
  totalWeeks?: number;
}

export default function ClientProgressReassuranceCard({
  programId,
  programName = 'Your Program',
  currentWeek = 1,
  totalWeeks = 12,
}: ClientProgressReassuranceCardProps) {
  const { member } = useMember();
  const [summary, setSummary] = useState<{
    completed: number;
    missed: number;
    total: number;
    completionRate: number;
  } | null>(null);
  const [status, setStatus] = useState<AdherenceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!member?._id) return;

      try {
        setIsLoading(true);
        const activitySummary = await getActivitySummary(member._id, programId, 7);
        setSummary(activitySummary);

        // Get adherence signal to determine status
        const signal = await getClientAdherenceSignal(member._id, programId);
        setStatus(signal.status);
      } catch (error) {
        console.error('Error loading progress data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [member?._id, programId]);

  const getStatusIcon = () => {
    switch (status) {
      case 'At Risk':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'Too Hard':
        return <TrendingUp className="w-5 h-5 text-red-600" />;
      case 'Too Easy':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'Inactive':
        return <Clock className="w-5 h-5 text-red-600" />;
      case 'On Track':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'At Risk':
        return 'bg-orange-50 border-orange-200';
      case 'Too Hard':
        return 'bg-red-50 border-red-200';
      case 'Too Easy':
        return 'bg-blue-50 border-blue-200';
      case 'Inactive':
        return 'bg-red-50 border-red-200';
      case 'On Track':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-soft-white border-warm-sand-beige';
    }
  };

  const getStatusBadgeColor = () => {
    switch (status) {
      case 'At Risk':
        return 'bg-orange-100 text-orange-800';
      case 'Too Hard':
        return 'bg-red-100 text-red-800';
      case 'Too Easy':
        return 'bg-blue-100 text-blue-800';
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      case 'On Track':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-warm-sand-beige text-charcoal-black';
    }
  };

  const getReassuranceLine = () => {
    switch (status) {
      case 'At Risk':
        return 'Your coach has noticed you\'ve missed a few workouts. Don\'t worry—we\'re here to help you get back on track. Reach out if you need support.';
      case 'Inactive':
        return 'We haven\'t seen you in a while. Your coach is here to help you overcome any barriers. Let\'s reconnect and get you back to your goals.';
      case 'Too Hard':
        return 'Your feedback shows the programme might be too intense right now. Your coach can adjust it to find the right balance for you.';
      case 'Too Easy':
        return 'Great work! You\'re finding the programme manageable. Your coach is ready to progress you to the next level.';
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="w-6 h-6 animate-spin text-soft-bronze" />
      </div>
    );
  }

  if (!summary || !status) {
    return (
      <div className="p-4 bg-warm-sand-beige/20 border border-warm-sand-beige rounded-xl flex gap-3">
        <AlertCircle className="w-5 h-5 text-warm-grey flex-shrink-0 mt-0.5" />
        <p className="font-paragraph text-sm text-warm-grey">
          Unable to load progress data
        </p>
      </div>
    );
  }

  return (
    <div className={`border rounded-2xl p-6 md:p-8 transition-all ${getStatusColor()}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-heading text-2xl font-bold text-charcoal-black mb-2">
            Your Progress
          </h3>
          <p className="font-paragraph text-sm text-warm-grey">
            {programName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor()}`}>
            {status}
          </span>
        </div>
      </div>

      {/* Progress Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Workouts Completed */}
        <div className="bg-white/50 rounded-xl p-4 text-center">
          <p className="font-heading text-3xl font-bold text-green-600 mb-1">
            {summary.completed}
          </p>
          <p className="font-paragraph text-xs text-charcoal-black/70">
            Workouts Completed
          </p>
        </div>

        {/* Programme Progress */}
        <div className="bg-white/50 rounded-xl p-4 text-center">
          <p className="font-heading text-3xl font-bold text-soft-bronze mb-1">
            {currentWeek}/{totalWeeks}
          </p>
          <p className="font-paragraph text-xs text-charcoal-black/70">
            Programme Week
          </p>
        </div>

        {/* Completion Rate */}
        <div className="bg-white/50 rounded-xl p-4 text-center">
          <p className="font-heading text-3xl font-bold text-charcoal-black mb-1">
            {summary.completionRate}%
          </p>
          <p className="font-paragraph text-xs text-charcoal-black/70">
            Completion Rate
          </p>
        </div>
      </div>

      {/* Reassurance Message */}
      {getReassuranceLine() && (
        <div className="bg-white/50 rounded-xl p-4 border-l-4 border-soft-bronze">
          <p className="font-paragraph text-sm text-charcoal-black leading-relaxed">
            {getReassuranceLine()}
          </p>
        </div>
      )}

      {/* Info */}
      <p className="font-paragraph text-xs text-warm-grey text-center mt-6">
        Progress tracked for the last 7 days
      </p>
    </div>
  );
}
