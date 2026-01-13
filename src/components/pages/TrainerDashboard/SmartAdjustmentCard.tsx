import { useState } from 'react';
import { Check, X, Edit2, Loader, Zap, AlertCircle } from 'lucide-react';
import { SmartAdjustmentSuggestion } from '@/lib/program-performance-intelligence';

interface SmartAdjustmentCardProps {
  suggestion: SmartAdjustmentSuggestion;
  onAccept: (suggestion: SmartAdjustmentSuggestion) => void;
  onEdit: (suggestion: SmartAdjustmentSuggestion) => void;
  onIgnore: (suggestionId: string) => void;
  isProcessing?: boolean;
}

export default function SmartAdjustmentCard({
  suggestion,
  onAccept,
  onEdit,
  onIgnore,
  isProcessing = false,
}: SmartAdjustmentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedValue, setEditedValue] = useState(suggestion.suggestedValue || '');

  const getAdjustmentLabel = (type: SmartAdjustmentSuggestion['adjustmentType']) => {
    const labels: Record<string, string> = {
      'load-increase': '⬆️ Increase Load',
      'load-decrease': '⬇️ Decrease Load',
      'volume-increase': '📈 Increase Volume',
      'volume-decrease': '📉 Decrease Volume',
      'deload-week': '🔄 Add Deload Week',
      'exercise-swap': '🔀 Swap Exercise',
      'frequency-change': '📅 Change Frequency',
    };
    return labels[type] || type;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'bg-green-100 text-green-700';
    if (confidence >= 70) return 'bg-yellow-100 text-yellow-700';
    return 'bg-orange-100 text-orange-700';
  };

  return (
    <div className="bg-soft-white border-2 border-soft-bronze/30 rounded-2xl p-6 hover:border-soft-bronze transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-10 h-10 rounded-full bg-soft-bronze/10 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-soft-bronze" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-lg font-bold text-charcoal-black mb-1">
              {getAdjustmentLabel(suggestion.adjustmentType)}
            </h3>
            <p className="font-paragraph text-sm text-warm-grey">
              {suggestion.rationale}
            </p>
          </div>
        </div>

        {/* Confidence Badge */}
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}>
          {suggestion.confidence}% confident
        </div>
      </div>

      {/* Metrics Basis */}
      <div className="mb-4 flex flex-wrap gap-2">
        {suggestion.basedOnMetrics.map((metric, idx) => (
          <span
            key={idx}
            className="px-2 py-1 bg-warm-sand-beige/30 rounded text-xs font-paragraph text-charcoal-black"
          >
            {metric.replace(/([A-Z])/g, ' $1').trim()}
          </span>
        ))}
      </div>

      {/* Suggested Values */}
      {suggestion.currentValue && suggestion.suggestedValue && (
        <div className="mb-4 p-3 bg-soft-bronze/5 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-paragraph text-xs text-warm-grey mb-1">Current</p>
              <p className="font-paragraph font-bold text-charcoal-black">
                {suggestion.currentValue}
              </p>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-soft-bronze font-bold">→</span>
            </div>
            <div>
              <p className="font-paragraph text-xs text-warm-grey mb-1">Suggested</p>
              <p className="font-paragraph font-bold text-charcoal-black">
                {editMode ? (
                  <input
                    type="text"
                    value={editedValue}
                    onChange={(e) => setEditedValue(e.target.value)}
                    className="w-full px-2 py-1 rounded border border-soft-bronze focus:outline-none"
                  />
                ) : (
                  suggestion.suggestedValue
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Target Week (if applicable) */}
      {suggestion.targetWeek && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <p className="font-paragraph text-sm text-blue-700">
            Target: Week {suggestion.targetWeek}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {editMode ? (
          <>
            <button
              onClick={() => {
                setEditMode(false);
                onEdit({
                  ...suggestion,
                  suggestedValue: editedValue,
                });
              }}
              disabled={isProcessing}
              className="flex-1 bg-green-600 text-soft-white py-2 rounded-lg font-medium text-sm hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Save Edit
                </>
              )}
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="flex-1 bg-warm-sand-beige text-charcoal-black py-2 rounded-lg font-medium text-sm hover:bg-warm-sand-beige/80 transition-colors"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onAccept(suggestion)}
              disabled={isProcessing}
              className="flex-1 bg-soft-bronze text-soft-white py-2 rounded-lg font-medium text-sm hover:bg-soft-bronze/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Accept
                </>
              )}
            </button>

            <button
              onClick={() => setEditMode(true)}
              className="flex-1 bg-warm-sand-beige text-charcoal-black py-2 rounded-lg font-medium text-sm hover:bg-warm-sand-beige/80 transition-colors flex items-center justify-center gap-2"
            >
              <Edit2 size={16} />
              Edit
            </button>

            <button
              onClick={() => onIgnore(suggestion._id)}
              className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg font-medium text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
            >
              <X size={16} />
              Ignore
            </button>
          </>
        )}
      </div>

      {/* Expand for more details */}
      {suggestion.basedOnMetrics.length > 0 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-4 text-center text-xs text-soft-bronze hover:underline font-medium"
        >
          {isExpanded ? 'Hide Details' : 'Show Details'}
        </button>
      )}

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-warm-sand-beige space-y-3">
          <div>
            <p className="font-paragraph text-xs font-bold text-charcoal-black mb-2">
              Based on Metrics:
            </p>
            <ul className="space-y-1">
              {suggestion.basedOnMetrics.map((metric, idx) => (
                <li key={idx} className="font-paragraph text-xs text-warm-grey">
                  • {metric.replace(/([A-Z])/g, ' $1').trim()}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-paragraph text-xs font-bold text-charcoal-black mb-2">
              Confidence Level:
            </p>
            <div className="w-full bg-warm-sand-beige rounded-full h-2">
              <div
                className="bg-soft-bronze h-2 rounded-full transition-all"
                style={{ width: `${suggestion.confidence}%` }}
              />
            </div>
            <p className="font-paragraph text-xs text-warm-grey mt-1">
              {suggestion.confidence}% confidence in this recommendation
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
