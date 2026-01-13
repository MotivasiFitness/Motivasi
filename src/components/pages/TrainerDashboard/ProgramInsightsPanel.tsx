import { useState, useEffect } from 'react';
import { useMember } from '@/integrations';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Loader,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Zap,
  AlertCircle,
} from 'lucide-react';
import {
  getPerformanceSummary,
  analyzePerformance,
  PerformanceInsight,
} from '@/lib/program-performance-intelligence';

interface PerformanceSummary {
  totalPrograms: number;
  averageCompletion: number;
  highPerformers: number;
  needsAttention: number;
  insights: PerformanceInsight[];
}

export default function ProgramInsightsPanel() {
  const { member } = useMember();
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadSummary = async () => {
      if (!member?._id) return;
      try {
        const data = await getPerformanceSummary(member._id);
        setSummary(data);
      } catch (error) {
        console.error('Error loading performance summary:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSummary();
  }, [member?._id]);

  const toggleInsight = (insightTitle: string) => {
    const newExpanded = new Set(expandedInsights);
    if (newExpanded.has(insightTitle)) {
      newExpanded.delete(insightTitle);
    } else {
      newExpanded.add(insightTitle);
    }
    setExpandedInsights(newExpanded);
  };

  const getInsightIcon = (type: PerformanceInsight['type']) => {
    switch (type) {
      case 'high-performer':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'low-performer':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      case 'drop-off-warning':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'volume-concern':
        return <Zap className="w-5 h-5 text-yellow-600" />;
      case 'engagement-issue':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <BarChart3 className="w-5 h-5 text-soft-bronze" />;
    }
  };

  const getSeverityColor = (severity: PerformanceInsight['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 border-red-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      case 'low':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-soft-bronze" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-warm-grey mx-auto mb-4" />
        <p className="font-paragraph text-lg text-warm-grey">
          No performance data available yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-6">
          <p className="font-paragraph text-sm text-warm-grey mb-2">Total Programs</p>
          <p className="font-heading text-4xl font-bold text-charcoal-black">
            {summary.totalPrograms}
          </p>
        </div>

        <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-6">
          <p className="font-paragraph text-sm text-warm-grey mb-2">Avg Completion</p>
          <div className="flex items-baseline gap-2">
            <p className="font-heading text-4xl font-bold text-charcoal-black">
              {summary.averageCompletion}%
            </p>
            {summary.averageCompletion >= 70 ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
          </div>
        </div>

        <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-6">
          <p className="font-paragraph text-sm text-warm-grey mb-2">High Performers</p>
          <p className="font-heading text-4xl font-bold text-green-600">
            {summary.highPerformers}
          </p>
          <p className="font-paragraph text-xs text-warm-grey mt-2">
            {summary.totalPrograms > 0
              ? Math.round((summary.highPerformers / summary.totalPrograms) * 100)
              : 0}% of total
          </p>
        </div>

        <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-6">
          <p className="font-paragraph text-sm text-warm-grey mb-2">Needs Attention</p>
          <p className="font-heading text-4xl font-bold text-red-600">
            {summary.needsAttention}
          </p>
          <p className="font-paragraph text-xs text-warm-grey mt-2">
            {summary.totalPrograms > 0
              ? Math.round((summary.needsAttention / summary.totalPrograms) * 100)
              : 0}% of total
          </p>
        </div>
      </div>

      {/* Insights Section */}
      {summary.insights.length > 0 ? (
        <div className="space-y-4">
          <h3 className="font-heading text-2xl font-bold text-charcoal-black">
            Performance Insights
          </h3>

          {summary.insights.map((insight, idx) => (
            <div
              key={idx}
              className={`border rounded-2xl p-6 transition-all ${getSeverityColor(insight.severity)}`}
            >
              <button
                onClick={() => toggleInsight(insight.title)}
                className="w-full flex items-start justify-between"
              >
                <div className="flex items-start gap-4 flex-1">
                  {getInsightIcon(insight.type)}
                  <div className="text-left flex-1">
                    <h4 className="font-heading text-lg font-bold text-charcoal-black mb-1">
                      {insight.title}
                    </h4>
                    <p className="font-paragraph text-sm text-charcoal-black/70">
                      {insight.description}
                    </p>
                  </div>
                </div>
                {expandedInsights.has(insight.title) ? (
                  <ChevronUp className="w-5 h-5 text-charcoal-black flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-charcoal-black flex-shrink-0" />
                )}
              </button>

              {expandedInsights.has(insight.title) && (
                <div className="mt-6 pt-6 border-t border-current/20 space-y-4">
                  <div>
                    <p className="font-paragraph text-sm font-bold text-charcoal-black mb-2">
                      Recommendation
                    </p>
                    <p className="font-paragraph text-sm text-charcoal-black/70">
                      {insight.recommendation}
                    </p>
                  </div>

                  {insight.suggestedAction && (
                    <div>
                      <p className="font-paragraph text-sm font-bold text-charcoal-black mb-2">
                        Suggested Action
                      </p>
                      <p className="font-paragraph text-sm text-charcoal-black/70">
                        {insight.suggestedAction}
                      </p>
                    </div>
                  )}

                  {insight.affectedPrograms && insight.affectedPrograms.length > 0 && (
                    <div>
                      <p className="font-paragraph text-sm font-bold text-charcoal-black mb-2">
                        Affected Programs ({insight.affectedPrograms.length})
                      </p>
                      <div className="space-y-1">
                        {insight.affectedPrograms.slice(0, 3).map((programId, i) => (
                          <p key={i} className="font-paragraph text-xs text-charcoal-black/60">
                            • {programId.slice(0, 8)}...
                          </p>
                        ))}
                        {insight.affectedPrograms.length > 3 && (
                          <p className="font-paragraph text-xs text-warm-grey italic">
                            +{insight.affectedPrograms.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <button className="w-full mt-4 bg-charcoal-black text-soft-white py-2 rounded-lg font-medium text-sm hover:bg-soft-bronze transition-colors">
                    Take Action
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-soft-white border border-warm-sand-beige rounded-2xl">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <p className="font-paragraph text-lg text-charcoal-black">
            All programs are performing well!
          </p>
          <p className="font-paragraph text-sm text-warm-grey mt-2">
            No critical insights at this time.
          </p>
        </div>
      )}

      {/* Performance Metrics Legend */}
      <div className="bg-warm-sand-beige/20 border border-warm-sand-beige rounded-2xl p-6">
        <h4 className="font-heading text-lg font-bold text-charcoal-black mb-4">
          How We Calculate Performance
        </h4>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <p className="font-paragraph font-bold text-charcoal-black mb-2">
              Completion Rate
            </p>
            <p className="font-paragraph text-warm-grey">
              Percentage of prescribed workouts completed by the client
            </p>
          </div>
          <div>
            <p className="font-paragraph font-bold text-charcoal-black mb-2">
              Drop-Off Week
            </p>
            <p className="font-paragraph text-warm-grey">
              Week where clients typically stop adhering to the program
            </p>
          </div>
          <div>
            <p className="font-paragraph font-bold text-charcoal-black mb-2">
              Substitution Rate
            </p>
            <p className="font-paragraph text-warm-grey">
              Number of times clients swap exercises for alternatives
            </p>
          </div>
          <div>
            <p className="font-paragraph font-bold text-charcoal-black mb-2">
              Trainer Edits
            </p>
            <p className="font-paragraph text-warm-grey">
              Percentage of program sections manually edited by trainer
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
