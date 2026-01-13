import { CheckCircle, RefreshCw, Heart } from 'lucide-react';

interface ProgramConfidenceIndicatorsProps {
  isCoachApproved?: boolean;
  isUpdatedFromFeedback?: boolean;
  isAdjustedForRecovery?: boolean;
  lastUpdated?: Date | string;
}

export default function ProgramConfidenceIndicators({
  isCoachApproved = true,
  isUpdatedFromFeedback = false,
  isAdjustedForRecovery = false,
  lastUpdated,
}: ProgramConfidenceIndicatorsProps) {
  const indicators = [
    {
      show: isCoachApproved,
      icon: <CheckCircle className="w-4 h-4" />,
      label: 'Coach-approved program',
      color: 'bg-green-50 border-green-200 text-green-700',
    },
    {
      show: isUpdatedFromFeedback,
      icon: <RefreshCw className="w-4 h-4" />,
      label: 'Updated based on your feedback',
      color: 'bg-blue-50 border-blue-200 text-blue-700',
    },
    {
      show: isAdjustedForRecovery,
      icon: <Heart className="w-4 h-4" />,
      label: 'Adjusted for recovery this week',
      color: 'bg-soft-bronze/10 border-soft-bronze/30 text-soft-bronze',
    },
  ];

  const activeIndicators = indicators.filter((ind) => ind.show);

  if (activeIndicators.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {activeIndicators.map((indicator, idx) => (
        <div
          key={idx}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${indicator.color} text-sm`}
        >
          {indicator.icon}
          <span className="font-paragraph font-medium">{indicator.label}</span>
        </div>
      ))}
      {lastUpdated && (
        <p className="font-paragraph text-xs text-warm-grey text-center">
          Last updated: {new Date(lastUpdated).toLocaleDateString('en-GB', {
            month: 'short',
            day: 'numeric',
          })}
        </p>
      )}
    </div>
  );
}
