import { useState, useEffect } from 'react';
import { useMember } from '@/integrations';
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Clock,
  Loader,
  AlertCircle,
  MessageSquare,
  Eye,
  FileText,
  X,
} from 'lucide-react';
import {
  getTrainerClientAdherenceSignals,
  ClientAdherenceSignal,
  getActivitySummary,
  getRecentFeedback,
} from '@/lib/adherence-tracking';
import { 
  getClientsWithNoResponseAfterCheckIn,
  getFollowUpReminders,
  dismissFollowUpReminder,
} from '@/lib/coach-checkin-service';

interface ClientReviewData extends ClientAdherenceSignal {
  activitySummary?: {
    completed: number;
    missed: number;
    total: number;
    completionRate: number;
  };
  lastFeedbackNote?: string;
  noResponseLabel?: string;
  followUpReminder?: {
    label: string;
    daysSinceLastInteraction: number;
    type: 'no-checkin' | 'no-response';
  };
}

export default function ClientsToReviewSection() {
  const { member } = useMember();
  const [clients, setClients] = useState<ClientReviewData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadClients = async () => {
      if (!member?._id) return;

      try {
        setIsLoading(true);
        const signals = await getTrainerClientAdherenceSignals(member._id);

        // Also get clients with no response after check-in
        const noResponseClients = await getClientsWithNoResponseAfterCheckIn(member._id);

        // Also get follow-up reminders
        const followUpReminders = await getFollowUpReminders(member._id);

        // Combine all lists
        const allSignals = [...signals];
        for (const noResponseClient of noResponseClients) {
          if (!allSignals.find((s) => s.clientId === noResponseClient.clientId)) {
            allSignals.push(noResponseClient);
          }
        }

        // Add follow-up reminders to matching clients
        for (const reminder of followUpReminders) {
          const existingClient = allSignals.find((s) => s.clientId === reminder.clientId);
          if (existingClient) {
            existingClient.followUpReminder = reminder.followUpReminder;
          } else {
            allSignals.push(reminder);
          }
        }

        // Enrich with activity summaries and feedback
        const enrichedClients: ClientReviewData[] = await Promise.all(
          allSignals.map(async (signal) => {
            const activitySummary = await getActivitySummary(signal.clientId, '');
            const recentFeedback = await getRecentFeedback(signal.clientId, '', 7);
            const lastFeedbackNote = recentFeedback[0]?.feedbackNote;

            return {
              ...signal,
              activitySummary,
              lastFeedbackNote,
            };
          })
        );

        // Sort by urgency: Inactive → At Risk → Too Hard → Too Easy → On Track
        const urgencyOrder: Record<string, number> = {
          Inactive: 0,
          'At Risk': 1,
          'Too Hard': 2,
          'Too Easy': 3,
          'On Track': 4,
        };

        const sorted = enrichedClients.sort(
          (a, b) => (urgencyOrder[a.status] || 5) - (urgencyOrder[b.status] || 5)
        );

        setClients(sorted);
      } catch (error) {
        console.error('Error loading clients to review:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadClients();
  }, [member?._id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
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

  const getUrgencyLabel = (status: string) => {
    switch (status) {
      case 'Inactive':
        return '🔴 Urgent';
      case 'At Risk':
        return '🟠 High';
      case 'Too Hard':
        return '🟡 Medium';
      case 'Too Easy':
        return '🟢 Low';
      default:
        return 'Normal';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-soft-bronze" />
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-12 bg-soft-white border border-warm-sand-beige rounded-2xl">
        <AlertCircle className="w-12 h-12 text-warm-grey mx-auto mb-4" />
        <p className="font-paragraph text-lg text-charcoal-black">
          No clients to review
        </p>
        <p className="font-paragraph text-sm text-warm-grey mt-2">
          All your clients are on track!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-2xl font-bold text-charcoal-black">
          Clients to Review
        </h3>
        <span className="px-3 py-1 bg-warm-sand-beige text-charcoal-black text-sm rounded-full font-medium">
          {clients.length} client{clients.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Client Cards */}
      <div className="space-y-4">
        {clients.map((client) => (
          <div
            key={client.clientId}
            className={`border rounded-2xl p-6 transition-all ${getStatusColor(client.status)}`}
          >
            {/* Header Row */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4 flex-1">
                {getStatusIcon(client.status)}
                <div className="flex-1">
                  <h4 className="font-heading text-lg font-bold text-charcoal-black">
                    Client {client.clientId.slice(0, 8)}
                  </h4>
                  <p className="font-paragraph text-sm text-charcoal-black/70">
                    {client.noResponseLabel || client.reason || client.status}
                  </p>
                  {/* Follow-Up Reminder Label */}
                  {client.followUpReminder && (
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => dismissFollowUpReminder(member?._id || '', client.clientId)}
                        className="text-xs text-warm-grey hover:text-charcoal-black transition-colors flex items-center gap-1 bg-warm-sand-beige/30 px-2 py-1 rounded"
                      >
                        <Clock size={14} />
                        {client.followUpReminder.label}
                        <X size={12} className="ml-1" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                    client.status
                  )}`}
                >
                  {client.status}
                </span>
                <span className="text-xs font-medium text-charcoal-black/60">
                  {getUrgencyLabel(client.status)}
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid md:grid-cols-4 gap-4 mb-6 bg-white/50 rounded-xl p-4">
              {/* Last Workout */}
              {client.lastWorkoutDate && (
                <div>
                  <p className="font-paragraph text-xs text-charcoal-black/60 mb-1">
                    Last Workout
                  </p>
                  <p className="font-paragraph text-sm font-medium text-charcoal-black">
                    {new Date(client.lastWorkoutDate).toLocaleDateString('en-GB', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}

              {/* 7-Day Completion Rate */}
              {client.activitySummary && (
                <div>
                  <p className="font-paragraph text-xs text-charcoal-black/60 mb-1">
                    7-Day Completion
                  </p>
                  <p className="font-paragraph text-sm font-medium text-charcoal-black">
                    {client.activitySummary.completionRate}%
                  </p>
                </div>
              )}

              {/* Workouts Completed */}
              {client.activitySummary && (
                <div>
                  <p className="font-paragraph text-xs text-charcoal-black/60 mb-1">
                    Completed / Total
                  </p>
                  <p className="font-paragraph text-sm font-medium text-charcoal-black">
                    {client.activitySummary.completed} / {client.activitySummary.total}
                  </p>
                </div>
              )}

              {/* Status Reason */}
              <div>
                <p className="font-paragraph text-xs text-charcoal-black/60 mb-1">
                  Status Reason
                </p>
                <p className="font-paragraph text-sm font-medium text-charcoal-black line-clamp-2">
                  {client.reason || 'N/A'}
                </p>
              </div>
            </div>

            {/* Last Feedback Note */}
            {client.lastFeedbackNote && (
              <div className="mb-6 p-4 bg-white/50 rounded-xl border-l-4 border-soft-bronze">
                <p className="font-paragraph text-xs text-charcoal-black/60 mb-2">
                  Last Feedback Note
                </p>
                <p className="font-paragraph text-sm text-charcoal-black line-clamp-2">
                  "{client.lastFeedbackNote}"
                </p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex gap-3">
              <button className="flex-1 py-2 rounded-lg font-medium text-sm bg-charcoal-black text-soft-white hover:bg-soft-bronze transition-colors flex items-center justify-center gap-2">
                <MessageSquare size={16} />
                Message
              </button>
              <button className="flex-1 py-2 rounded-lg font-medium text-sm border border-charcoal-black text-charcoal-black hover:bg-charcoal-black/5 transition-colors flex items-center justify-center gap-2">
                <Eye size={16} />
                View Program
              </button>
              <button className="flex-1 py-2 rounded-lg font-medium text-sm border border-charcoal-black text-charcoal-black hover:bg-charcoal-black/5 transition-colors flex items-center justify-center gap-2">
                <FileText size={16} />
                View Feedback
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-soft-bronze/10 border border-soft-bronze/30 rounded-2xl p-6">
        <h4 className="font-heading text-lg font-bold text-charcoal-black mb-3">
          Review Queue Priority
        </h4>
        <div className="space-y-2 text-sm">
          <p className="font-paragraph text-charcoal-black">
            <span className="font-bold">🔴 Urgent (Inactive):</span> No activity for 7+ days
          </p>
          <p className="font-paragraph text-charcoal-black">
            <span className="font-bold">🟠 High (At Risk):</span> Missed 2+ workouts in 7 days
          </p>
          <p className="font-paragraph text-charcoal-black">
            <span className="font-bold">🟡 Medium (Too Hard):</span> Avg difficulty ≥4.5/5
          </p>
          <p className="font-paragraph text-charcoal-black">
            <span className="font-bold">🟢 Low (Too Easy):</span> Avg difficulty ≤2/5
          </p>
        </div>
      </div>
    </div>
  );
}
