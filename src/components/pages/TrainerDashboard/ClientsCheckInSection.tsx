import { useState, useEffect } from 'react';
import { useMember } from '@/integrations';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  Loader,
  AlertCircle,
  MessageSquare,
  X,
} from 'lucide-react';
import {
  getClientsNeedingCheckIn,
  ClientCheckInPrompt,
  hasRecentCheckIn,
} from '@/lib/coach-checkin-service';
import CoachCheckInModal from './CoachCheckInModal';

export default function ClientsCheckInSection() {
  const { member } = useMember();
  const [clients, setClients] = useState<ClientCheckInPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dismissedClients, setDismissedClients] = useState<Set<string>>(new Set());
  const [selectedClient, setSelectedClient] = useState<ClientCheckInPrompt | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadClients = async () => {
      if (!member?._id) return;

      try {
        setIsLoading(true);
        const checkInPrompts = await getClientsNeedingCheckIn(member._id);

        // Check which clients have recent check-ins
        const recentSet = new Set<string>();
        for (const prompt of checkInPrompts) {
          const hasRecent = await hasRecentCheckIn(prompt.clientId, member._id, 24);
          if (hasRecent) {
            recentSet.add(prompt.clientId);
          }
        }
        setRecentCheckIns(recentSet);
        setClients(checkInPrompts);
      } catch (error) {
        console.error('Error loading clients needing check-in:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadClients();
  }, [member?._id]);

  const handleDismiss = (clientId: string) => {
    setDismissedClients((prev) => new Set(prev).add(clientId));
  };

  const handleCheckInSuccess = () => {
    if (selectedClient) {
      setRecentCheckIns((prev) => new Set(prev).add(selectedClient.clientId));
      setSelectedClient(null);
    }
  };

  const getStatusIcon = (reason: string) => {
    switch (reason) {
      case 'At Risk':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'Too Hard':
        return <TrendingUp className="w-5 h-5 text-red-600" />;
      case 'Too Easy':
        return <TrendingDown className="w-5 h-5 text-blue-600" />;
      case 'Inactive':
        return <Clock className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-warm-grey" />;
    }
  };

  const getStatusColor = (reason: string) => {
    switch (reason) {
      case 'At Risk':
        return 'bg-orange-50 border-orange-200';
      case 'Too Hard':
        return 'bg-red-50 border-red-200';
      case 'Too Easy':
        return 'bg-blue-50 border-blue-200';
      case 'Inactive':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-warm-sand-beige/20 border-warm-sand-beige';
    }
  };

  const getStatusBadgeColor = (reason: string) => {
    switch (reason) {
      case 'At Risk':
        return 'bg-orange-100 text-orange-800';
      case 'Too Hard':
        return 'bg-red-100 text-red-800';
      case 'Too Easy':
        return 'bg-blue-100 text-blue-800';
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-warm-sand-beige text-charcoal-black';
    }
  };

  const visibleClients = clients.filter((c) => !dismissedClients.has(c.clientId));
  const hasRecentCheckInClients = visibleClients.filter((c) =>
    recentCheckIns.has(c.clientId)
  );
  const needsCheckInClients = visibleClients.filter(
    (c) => !recentCheckIns.has(c.clientId)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-soft-bronze" />
      </div>
    );
  }

  if (visibleClients.length === 0) {
    return (
      <div className="text-center py-12 bg-soft-white border border-warm-sand-beige rounded-2xl">
        <MessageSquare className="w-12 h-12 text-warm-grey mx-auto mb-4" />
        <p className="font-paragraph text-lg text-charcoal-black">
          All clients are on track!
        </p>
        <p className="font-paragraph text-sm text-warm-grey mt-2">
          No check-ins needed at the moment. Keep monitoring their progress.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Modal */}
      {selectedClient && (
        <CoachCheckInModal
          clientId={selectedClient.clientId}
          trainerId={member?._id || ''}
          reason={selectedClient.reason}
          reasonDescription={selectedClient.reasonDescription}
          onClose={() => setSelectedClient(null)}
          onSuccess={handleCheckInSuccess}
        />
      )}

      {/* Clients Needing Check-In */}
      {needsCheckInClients.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading text-2xl font-bold text-charcoal-black">
              Clients to Check In With
            </h3>
            <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full font-medium">
              {needsCheckInClients.length} action{needsCheckInClients.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-4">
            {needsCheckInClients.map((client) => (
              <div
                key={client.clientId}
                className={`border rounded-2xl p-6 transition-all ${getStatusColor(
                  client.reason
                )}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4 flex-1">
                    {getStatusIcon(client.reason)}
                    <div className="flex-1">
                      <h4 className="font-heading text-lg font-bold text-charcoal-black">
                        Client {client.clientId.slice(0, 8)}
                      </h4>
                      <p className="font-paragraph text-sm text-charcoal-black/70 mt-1">
                        {client.reasonDescription}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDismiss(client.clientId)}
                    className="p-2 hover:bg-black/10 rounded-lg transition-colors"
                    title="Dismiss"
                  >
                    <X size={18} className="text-charcoal-black/50" />
                  </button>
                </div>

                {/* Details */}
                <div className="grid md:grid-cols-3 gap-4 mb-6 text-sm">
                  {client.lastWorkoutDate && (
                    <div>
                      <p className="font-paragraph text-xs text-charcoal-black/60 mb-1">
                        Last Workout
                      </p>
                      <p className="font-paragraph text-charcoal-black">
                        {new Date(client.lastWorkoutDate).toLocaleDateString('en-GB', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                  {client.avgDifficulty !== undefined && (
                    <div>
                      <p className="font-paragraph text-xs text-charcoal-black/60 mb-1">
                        Avg Difficulty
                      </p>
                      <p className="font-paragraph text-charcoal-black">
                        {client.avgDifficulty.toFixed(1)}/5
                      </p>
                    </div>
                  )}
                  {client.missedWorkoutsLast7Days !== undefined && (
                    <div>
                      <p className="font-paragraph text-xs text-charcoal-black/60 mb-1">
                        Missed (7 days)
                      </p>
                      <p className="font-paragraph text-charcoal-black">
                        {client.missedWorkoutsLast7Days} workout
                        {client.missedWorkoutsLast7Days !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </div>

                {/* Status Badge and Actions */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                      client.reason
                    )}`}
                  >
                    {client.reason}
                  </span>
                  <button
                    onClick={() => setSelectedClient(client)}
                    className="px-4 py-2 rounded-lg font-medium text-sm bg-charcoal-black text-soft-white hover:bg-soft-bronze transition-colors flex items-center gap-2"
                  >
                    <MessageSquare size={16} />
                    Send Check-In
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently Checked In */}
      {hasRecentCheckInClients.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading text-xl font-bold text-charcoal-black">
              Recently Checked In
            </h3>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
              {hasRecentCheckInClients.length}
            </span>
          </div>

          <div className="space-y-3">
            {hasRecentCheckInClients.map((client) => (
              <div
                key={client.clientId}
                className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-2 h-2 rounded-full bg-green-600" />
                  <div>
                    <p className="font-paragraph text-sm font-medium text-charcoal-black">
                      Client {client.clientId.slice(0, 8)}
                    </p>
                    <p className="font-paragraph text-xs text-warm-grey">
                      {client.reasonDescription}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                  ✓ Contacted
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-soft-bronze/10 border border-soft-bronze/30 rounded-2xl p-6 mt-8">
        <h4 className="font-heading text-lg font-bold text-charcoal-black mb-3">
          About Check-Ins
        </h4>
        <div className="space-y-2 text-sm">
          <p className="font-paragraph text-charcoal-black">
            <span className="font-bold">At Risk:</span> Client has missed 2+ workouts in the last 7 days
          </p>
          <p className="font-paragraph text-charcoal-black">
            <span className="font-bold">Too Hard:</span> Average difficulty rating ≥4.5/5 in last 7 days
          </p>
          <p className="font-paragraph text-charcoal-black">
            <span className="font-bold">Too Easy:</span> Average difficulty rating ≤2/5 in last 7 days
          </p>
          <p className="font-paragraph text-charcoal-black">
            <span className="font-bold">Inactive:</span> No activity for 7+ days
          </p>
        </div>
      </div>
    </div>
  );
}
