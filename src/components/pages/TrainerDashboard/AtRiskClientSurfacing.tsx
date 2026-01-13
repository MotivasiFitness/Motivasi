import { useState, useEffect } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { TrainerClientAssignments, FitnessPrograms } from '@/entities';
import { AlertTriangle, Clock, MessageCircle, Loader, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTrainerClientAdherenceSignals, ClientAdherenceSignal } from '@/lib/adherence-tracking';

interface AtRiskClient {
  clientId: string;
  clientName: string;
  status: 'At Risk' | 'Inactive';
  reason: string;
  daysSinceActivity?: number;
  missedWorkouts?: number;
}

export default function AtRiskClientSurfacing() {
  const { member } = useMember();
  const [atRiskClients, setAtRiskClients] = useState<AtRiskClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);

  useEffect(() => {
    const loadAtRiskClients = async () => {
      if (!member?._id) return;

      try {
        setIsLoading(true);

        // Get adherence signals for all trainer's clients
        const signals = await getTrainerClientAdherenceSignals(member._id);

        // Filter only At Risk and Inactive clients
        const atRiskSignals = signals.filter(
          (s) => s.status === 'At Risk' || s.status === 'Inactive'
        );

        // Get trainer's client assignments to fetch client names
        const { items: assignments } = await BaseCrudService.getAll<TrainerClientAssignments>(
          'trainerclientassignments'
        );
        const trainerAssignments = assignments.filter(
          (a) => a.trainerId === member._id && a.status === 'active'
        );

        // Map client IDs to names (using assignment data)
        const clientMap = new Map(
          trainerAssignments.map((a) => [a.clientId, a.clientId])
        );

        // Build at-risk client list
        const atRiskList: AtRiskClient[] = atRiskSignals.map((signal) => ({
          clientId: signal.clientId,
          clientName: clientMap.get(signal.clientId) || `Client ${signal.clientId.slice(0, 8)}`,
          status: signal.status as 'At Risk' | 'Inactive',
          reason: signal.reason || 'No activity',
          daysSinceActivity: signal.daysSinceLastActivity,
          missedWorkouts: signal.missedWorkoutsLast7Days,
        }));

        // Sort by severity: Inactive first, then At Risk
        atRiskList.sort((a, b) => {
          if (a.status === 'Inactive' && b.status !== 'Inactive') return -1;
          if (a.status !== 'Inactive' && b.status === 'Inactive') return 1;
          return 0;
        });

        setAtRiskClients(atRiskList);
      } catch (error) {
        console.error('Error loading at-risk clients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAtRiskClients();
  }, [member?._id]);

  const getStatusIcon = (status: 'At Risk' | 'Inactive') => {
    if (status === 'Inactive') {
      return <Clock className="w-5 h-5 text-red-600" />;
    }
    return <AlertTriangle className="w-5 h-5 text-orange-600" />;
  };

  const getStatusColor = (status: 'At Risk' | 'Inactive') => {
    if (status === 'Inactive') {
      return 'bg-red-50 border-red-200';
    }
    return 'bg-orange-50 border-orange-200';
  };

  const getStatusTextColor = (status: 'At Risk' | 'Inactive') => {
    if (status === 'Inactive') {
      return 'text-red-700';
    }
    return 'text-orange-700';
  };

  if (isLoading) {
    return (
      <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
        <div className="flex items-center justify-center py-12">
          <Loader className="w-6 h-6 animate-spin text-soft-bronze" />
        </div>
      </div>
    );
  }

  if (atRiskClients.length === 0) {
    return (
      <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-heading text-lg font-bold text-charcoal-black mb-2">
            All Clients On Track
          </h3>
          <p className="font-paragraph text-sm text-warm-grey">
            No clients flagged as at-risk or inactive. Great work maintaining engagement!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-soft-white border border-warm-sand-beige rounded-2xl p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-6 h-6 text-orange-600" />
          <h2 className="font-heading text-2xl font-bold text-charcoal-black">
            Clients Needing Attention
          </h2>
        </div>
        <p className="font-paragraph text-sm text-warm-grey">
          {atRiskClients.length} client{atRiskClients.length !== 1 ? 's' : ''} flagged for follow-up
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="font-paragraph text-xs text-red-700 mb-1">Inactive</p>
          <p className="font-heading text-2xl font-bold text-red-700">
            {atRiskClients.filter((c) => c.status === 'Inactive').length}
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="font-paragraph text-xs text-orange-700 mb-1">At Risk</p>
          <p className="font-heading text-2xl font-bold text-orange-700">
            {atRiskClients.filter((c) => c.status === 'At Risk').length}
          </p>
        </div>
      </div>

      {/* Client List */}
      <div className="space-y-3">
        {atRiskClients.map((client) => (
          <div
            key={client.clientId}
            className={`border rounded-xl p-4 transition-all ${getStatusColor(client.status)}`}
          >
            {/* Main Row */}
            <div className="flex items-center justify-between gap-4">
              {/* Left: Icon + Info */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {getStatusIcon(client.status)}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-paragraph font-bold text-sm ${getStatusTextColor(client.status)} truncate`}>
                    {client.clientName}
                  </h3>
                  <p className={`font-paragraph text-xs ${getStatusTextColor(client.status)} opacity-75 truncate`}>
                    {client.reason}
                  </p>
                </div>
              </div>

              {/* Right: Status Badge + Message Button */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`font-paragraph text-xs font-bold px-2 py-1 rounded ${getStatusTextColor(client.status)}`}>
                  {client.status}
                </span>
                <Link
                  to="/trainer/messages"
                  className="p-2 rounded-lg bg-soft-bronze text-soft-white hover:bg-soft-bronze/90 transition-colors flex-shrink-0"
                  title={`Message ${client.clientName}`}
                >
                  <MessageCircle size={16} />
                </Link>
              </div>
            </div>

            {/* Expandable Details */}
            {expandedClientId === client.clientId && (
              <div className="mt-4 pt-4 border-t border-current border-opacity-20 space-y-2">
                {client.daysSinceActivity !== undefined && (
                  <div className="flex justify-between text-xs">
                    <span className={`font-paragraph ${getStatusTextColor(client.status)} opacity-75`}>
                      Days since activity:
                    </span>
                    <span className={`font-paragraph font-bold ${getStatusTextColor(client.status)}`}>
                      {client.daysSinceActivity} days
                    </span>
                  </div>
                )}
                {client.missedWorkouts !== undefined && (
                  <div className="flex justify-between text-xs">
                    <span className={`font-paragraph ${getStatusTextColor(client.status)} opacity-75`}>
                      Missed workouts (7d):
                    </span>
                    <span className={`font-paragraph font-bold ${getStatusTextColor(client.status)}`}>
                      {client.missedWorkouts} workouts
                    </span>
                  </div>
                )}
                <div className="pt-2 flex gap-2">
                  <Link
                    to="/trainer/messages"
                    className="flex-1 text-center text-xs font-medium px-3 py-2 rounded bg-soft-bronze text-soft-white hover:bg-soft-bronze/90 transition-colors"
                  >
                    Send Message
                  </Link>
                  <button
                    onClick={() => setExpandedClientId(null)}
                    className="flex-1 text-center text-xs font-medium px-3 py-2 rounded border border-current border-opacity-30 hover:bg-black/5 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Expand Button */}
            {expandedClientId !== client.clientId && (
              <button
                onClick={() => setExpandedClientId(client.clientId)}
                className={`mt-3 text-xs font-medium ${getStatusTextColor(client.status)} hover:opacity-75 transition-opacity flex items-center gap-1`}
              >
                View Details
                <ArrowRight size={12} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-soft-bronze/10 border border-soft-bronze/30 rounded-lg">
        <p className="font-paragraph text-xs text-charcoal-black leading-relaxed">
          <span className="font-bold">Quick Actions:</span> Click the message icon to reach out to clients, or expand for more details. Inactive clients haven't completed workouts in 7+ days. At-risk clients have missed 2+ workouts this week.
        </p>
      </div>
    </div>
  );
}
