import { useState, useEffect } from 'react';
import { useMember } from '@/integrations';
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Clock,
  Loader,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import {
  getTrainerClientAdherenceSignals,
  ClientAdherenceSignal,
} from '@/lib/adherence-tracking';

export default function MinimalRiskFlags() {
  const { member } = useMember();
  const [signals, setSignals] = useState<ClientAdherenceSignal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSignals = async () => {
      if (!member?._id) return;

      try {
        setIsLoading(true);
        const clientSignals = await getTrainerClientAdherenceSignals(member._id);
        setSignals(clientSignals);
      } catch (error) {
        console.error('Error loading risk flags:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSignals();
  }, [member?._id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'At Risk':
        return <AlertTriangle className="w-4 h-4" />;
      case 'Too Hard':
        return <TrendingUp className="w-4 h-4" />;
      case 'Too Easy':
        return <TrendingDown className="w-4 h-4" />;
      case 'Inactive':
        return <Clock className="w-4 h-4" />;
      case 'On Track':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'At Risk':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Too Hard':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Too Easy':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Inactive':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'On Track':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-warm-sand-beige/20 text-charcoal-black border-warm-sand-beige';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="w-6 h-6 animate-spin text-soft-bronze" />
      </div>
    );
  }

  if (signals.length === 0) {
    return (
      <div className="text-center py-8 bg-soft-white border border-warm-sand-beige rounded-2xl">
        <AlertCircle className="w-10 h-10 text-warm-grey mx-auto mb-3" />
        <p className="font-paragraph text-sm text-warm-grey">
          No client data available yet
        </p>
      </div>
    );
  }

  // Group by status
  const onTrack = signals.filter((s) => s.status === 'On Track');
  const atRisk = signals.filter((s) => s.status === 'At Risk');
  const tooHard = signals.filter((s) => s.status === 'Too Hard');
  const tooEasy = signals.filter((s) => s.status === 'Too Easy');
  const inactive = signals.filter((s) => s.status === 'Inactive');

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'On Track', count: onTrack.length, color: 'bg-green-50 border-green-200' },
          { label: 'At Risk', count: atRisk.length, color: 'bg-orange-50 border-orange-200' },
          { label: 'Too Hard', count: tooHard.length, color: 'bg-red-50 border-red-200' },
          { label: 'Too Easy', count: tooEasy.length, color: 'bg-blue-50 border-blue-200' },
          { label: 'Inactive', count: inactive.length, color: 'bg-red-50 border-red-200' },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`border rounded-lg p-3 text-center ${stat.color}`}
          >
            <p className="font-heading text-2xl font-bold">{stat.count}</p>
            <p className="font-paragraph text-xs mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Client Status List */}
      <div className="space-y-3">
        {signals.map((signal) => (
          <div
            key={signal.clientId}
            className={`flex items-center justify-between p-4 rounded-lg border ${getStatusColor(
              signal.status
            )}`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {getStatusIcon(signal.status)}
              <div className="min-w-0 flex-1">
                <p className="font-paragraph text-sm font-medium truncate">
                  Client {signal.clientId.slice(0, 8)}
                </p>
                {signal.reason && (
                  <p className="font-paragraph text-xs opacity-75 truncate">
                    {signal.reason}
                  </p>
                )}
              </div>
            </div>
            <span className="font-paragraph text-xs font-bold ml-2 flex-shrink-0">
              {signal.status}
            </span>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-soft-bronze/10 border border-soft-bronze/30 rounded-xl p-4">
        <p className="font-paragraph text-xs text-charcoal-black leading-relaxed">
          <span className="font-bold">Status Overview:</span> Simple client status indicators based on recent activity and feedback. Use the "Clients to Check In With" section to take action.
        </p>
      </div>
    </div>
  );
}
