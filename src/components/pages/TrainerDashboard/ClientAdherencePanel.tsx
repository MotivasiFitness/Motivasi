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
  Activity,
  MessageSquare,
  Send,
  X,
} from 'lucide-react';
import {
  getTrainerClientAdherenceSignals,
  ClientAdherenceSignal,
  getActivitySummary,
  getRecentFeedback,
} from '@/lib/adherence-tracking';
import { BaseCrudService } from '@/integrations';
import { ClientCoachMessages } from '@/entities';
import {
  sendCoachCheckInMessage,
  getCheckInMessageTemplate,
  getCheckInMessageTemplates,
  getClientsWithNoResponseAfterCheckIn,
  getFollowUpReminders,
  getFollowUpMessageTemplates,
  dismissFollowUpReminder,
} from '@/lib/coach-checkin-service';

interface ClientAdherenceData extends ClientAdherenceSignal {
  clientName?: string;
  activitySummary?: {
    completed: number;
    missed: number;
    total: number;
    completionRate: number;
  };
  recentDifficultyAvg?: number;
  recentMessages?: Array<{
    message: string;
    reason: string;
    sentAt: Date;
  }>;
  followUpReminder?: {
    label: string;
    daysSinceLastInteraction: number;
    type: 'no-checkin' | 'no-response';
  };
}

interface CheckInModalState {
  isOpen: boolean;
  clientId: string | null;
  status: string | null;
  message: string;
  isFollowUp?: boolean;
  selectedTemplate: string;
  isSending: boolean;
}

export default function ClientAdherencePanel() {
  const { member } = useMember();
  const [clients, setClients] = useState<ClientAdherenceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [checkInModal, setCheckInModal] = useState<CheckInModalState>({
    isOpen: false,
    clientId: null,
    status: null,
    message: '',
    selectedTemplate: 'default',
    isSending: false,
  });

  useEffect(() => {
    const loadAdherenceData = async () => {
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
          // Check if this client is already in the signals list
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

        // Enrich signals with activity summaries and recent messages
        const enrichedClients: ClientAdherenceData[] = await Promise.all(
          allSignals.map(async (signal) => {
            // Get activity summary
            const activitySummary = await getActivitySummary(signal.clientId, '');

            // Get recent feedback for difficulty average
            const recentFeedback = await getRecentFeedback(signal.clientId, '', 7);
            const recentDifficultyAvg =
              recentFeedback.length > 0
                ? recentFeedback.reduce((sum, f) => sum + f.difficultyRating, 0) /
                  recentFeedback.length
                : undefined;

            // Get recent check-in messages (last 3)
            const { items: allMessages } = await BaseCrudService.getAll<ClientCoachMessages>(
              'clientcoachmessages'
            );
            const clientMessages = allMessages
              .filter((m) => m.clientId === signal.clientId && m.trainerId === member._id)
              .sort((a, b) => {
                const dateA = a.sentAt ? new Date(a.sentAt).getTime() : 0;
                const dateB = b.sentAt ? new Date(b.sentAt).getTime() : 0;
                return dateB - dateA;
              })
              .slice(0, 3)
              .map((m) => ({
                message: m.message || '',
                reason: m.reason || '',
                sentAt: new Date(m.sentAt || new Date()),
              }));

            return {
              ...signal,
              activitySummary,
              recentDifficultyAvg,
              recentMessages: clientMessages,
            };
          })
        );

        setClients(enrichedClients);
      } catch (error) {
        console.error('Error loading adherence data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAdherenceData();
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
      case 'On Track':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Activity className="w-5 h-5 text-warm-grey" />;
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
      case 'On Track':
        return 'bg-green-50 border-green-200';
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
      case 'On Track':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-warm-sand-beige text-charcoal-black';
    }
  };

  const getQuickTemplates = (status: string): Array<{ label: string; text: string }> => {
    return getCheckInMessageTemplates(status as any);
  };

  const handleOpenCheckInModal = (clientId: string, status: string, isFollowUp: boolean = false) => {
    const template = isFollowUp 
      ? getFollowUpMessageTemplates(status as any)[0]?.text || ''
      : getCheckInMessageTemplate(status as any);
    
    setCheckInModal({
      isOpen: true,
      clientId,
      status,
      message: template,
      isFollowUp,
      selectedTemplate: 'default',
      isSending: false,
    });
  };

  const handleSendCheckIn = async () => {
    if (!checkInModal.clientId || !checkInModal.status || !member?._id) return;

    setCheckInModal((prev) => ({ ...prev, isSending: true }));

    try {
      await sendCoachCheckInMessage(
        checkInModal.clientId,
        member._id,
        checkInModal.message,
        checkInModal.status as any
      );

      // Refresh the client data to show the new message
      const signals = await getTrainerClientAdherenceSignals(member._id);
      const enrichedClients: ClientAdherenceData[] = await Promise.all(
        signals.map(async (signal) => {
          const activitySummary = await getActivitySummary(signal.clientId, '');
          const recentFeedback = await getRecentFeedback(signal.clientId, '', 7);
          const recentDifficultyAvg =
            recentFeedback.length > 0
              ? recentFeedback.reduce((sum, f) => sum + f.difficultyRating, 0) /
                recentFeedback.length
              : undefined;

          const { items: allMessages } = await BaseCrudService.getAll<ClientCoachMessages>(
            'clientcoachmessages'
          );
          const clientMessages = allMessages
            .filter((m) => m.clientId === signal.clientId && m.trainerId === member._id)
            .sort((a, b) => {
              const dateA = a.sentAt ? new Date(a.sentAt).getTime() : 0;
              const dateB = b.sentAt ? new Date(b.sentAt).getTime() : 0;
              return dateB - dateA;
            })
            .slice(0, 3)
            .map((m) => ({
              message: m.message || '',
              reason: m.reason || '',
              sentAt: new Date(m.sentAt || new Date()),
            }));

          return {
            ...signal,
            activitySummary,
            recentDifficultyAvg,
            recentMessages: clientMessages,
          };
        })
      );

      setClients(enrichedClients);
      setCheckInModal({
        isOpen: false,
        clientId: null,
        status: null,
        message: '',
        selectedTemplate: 'default',
        isSending: false,
      });
    } catch (error) {
      console.error('Error sending check-in:', error);
    } finally {
      setCheckInModal((prev) => ({ ...prev, isSending: false }));
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
          No client adherence data yet
        </p>
        <p className="font-paragraph text-sm text-warm-grey mt-2">
          Adherence signals will appear as clients complete workouts and provide feedback
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-2xl font-bold text-charcoal-black">
          Client Adherence Status
        </h3>
        <span className="px-3 py-1 bg-warm-sand-beige text-charcoal-black text-sm rounded-full font-medium">
          {clients.length} client{clients.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Status Summary */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'On Track', count: clients.filter((c) => c.status === 'On Track').length },
          { label: 'At Risk', count: clients.filter((c) => c.status === 'At Risk').length },
          { label: 'Too Hard', count: clients.filter((c) => c.status === 'Too Hard').length },
          { label: 'Inactive', count: clients.filter((c) => c.status === 'Inactive').length },
        ].map((stat) => (
          <div key={stat.label} className="bg-soft-white border border-warm-sand-beige rounded-xl p-4">
            <p className="font-paragraph text-xs text-warm-grey mb-1">{stat.label}</p>
            <p className="font-heading text-3xl font-bold text-charcoal-black">{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Client Cards */}
      <div className="space-y-4">
        {clients.map((client) => (
          <div
            key={client.clientId}
            className={`border rounded-2xl p-6 transition-all ${getStatusColor(client.status)}`}
          >
            {/* Header */}
            <button
              onClick={() =>
                setExpandedClient(
                  expandedClient === client.clientId ? null : client.clientId
                )
              }
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-4 flex-1">
                {getStatusIcon(client.status)}
                <div className="text-left flex-1">
                  <h4 className="font-heading text-lg font-bold text-charcoal-black">
                    Client {client.clientId.slice(0, 8)}
                  </h4>
                  <p className="font-paragraph text-sm text-charcoal-black/70">
                    {client.noResponseLabel || client.reason || 'Status: ' + client.status}
                  </p>
                  {/* Follow-Up Reminder Label */}
                  {client.followUpReminder && (
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCheckInModal(client.clientId, client.status, true);
                        }}
                        className="text-xs text-warm-grey hover:text-charcoal-black transition-colors flex items-center gap-1 bg-warm-sand-beige/30 px-2 py-1 rounded hover:bg-warm-sand-beige/50"
                      >
                        <Clock size={14} />
                        {client.followUpReminder.label}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissFollowUpReminder(member?._id || '', client.clientId);
                          setClients((prev) =>
                            prev.map((c) =>
                              c.clientId === client.clientId
                                ? { ...c, followUpReminder: undefined }
                                : c
                            )
                          );
                        }}
                        className="text-xs text-warm-grey hover:text-charcoal-black transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                  client.status
                )}`}
              >
                {client.status}
              </span>
            </button>

            {/* Expanded Details */}
            {expandedClient === client.clientId && (
              <div className="mt-6 pt-6 border-t border-current/20 space-y-4">
                {/* Last Workout */}
                {client.lastWorkoutDate && (
                  <div>
                    <p className="font-paragraph text-sm font-bold text-charcoal-black mb-1">
                      Last Workout
                    </p>
                    <p className="font-paragraph text-sm text-charcoal-black/70">
                      {new Date(client.lastWorkoutDate).toLocaleDateString('en-GB', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}

                {/* Activity Summary */}
                {client.activitySummary && (
                  <div>
                    <p className="font-paragraph text-sm font-bold text-charcoal-black mb-2">
                      Last 7 Days Activity
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white/50 rounded-lg p-3 text-center">
                        <p className="font-heading text-2xl font-bold text-green-600">
                          {client.activitySummary.completed}
                        </p>
                        <p className="font-paragraph text-xs text-charcoal-black/70">Completed</p>
                      </div>
                      <div className="bg-white/50 rounded-lg p-3 text-center">
                        <p className="font-heading text-2xl font-bold text-red-600">
                          {client.activitySummary.missed}
                        </p>
                        <p className="font-paragraph text-xs text-charcoal-black/70">Missed</p>
                      </div>
                      <div className="bg-white/50 rounded-lg p-3 text-center">
                        <p className="font-heading text-2xl font-bold text-soft-bronze">
                          {client.activitySummary.completionRate}%
                        </p>
                        <p className="font-paragraph text-xs text-charcoal-black/70">Rate</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Average Difficulty */}
                {client.recentDifficultyAvg !== undefined && (
                  <div>
                    <p className="font-paragraph text-sm font-bold text-charcoal-black mb-2">
                      Avg Difficulty (Last 7 Days)
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-white/50 rounded-lg p-3">
                        <p className="font-heading text-3xl font-bold text-charcoal-black">
                          {client.recentDifficultyAvg.toFixed(1)}
                        </p>
                        <p className="font-paragraph text-xs text-charcoal-black/70">out of 5</p>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div
                            key={star}
                            className={`w-2 h-8 rounded-full ${
                              star <= Math.round(client.recentDifficultyAvg || 0)
                                ? 'bg-soft-bronze'
                                : 'bg-white/30'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Messages */}
                {client.recentMessages && client.recentMessages.length > 0 && (
                  <div className="pt-4 border-t border-current/20">
                    <p className="font-paragraph text-sm font-bold text-charcoal-black mb-3">
                      Recent Check-Ins ({client.recentMessages.length})
                    </p>
                    <div className="space-y-2">
                      {client.recentMessages.map((msg, idx) => (
                        <div key={idx} className="bg-white/50 rounded-lg p-3">
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-xs font-medium text-charcoal-black/70">
                              {msg.reason}
                            </span>
                            <span className="text-xs text-charcoal-black/50">
                              {msg.sentAt.toLocaleDateString('en-GB', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <p className="font-paragraph text-xs text-charcoal-black/70 line-clamp-2">
                            {msg.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleOpenCheckInModal(client.clientId, client.status)}
                    className="flex-1 py-2 rounded-lg font-medium text-sm bg-charcoal-black text-soft-white hover:bg-soft-bronze transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageSquare size={16} />
                    Send Check-In
                  </button>
                  <button className="flex-1 py-2 rounded-lg font-medium text-sm border border-charcoal-black text-charcoal-black hover:bg-charcoal-black/5 transition-colors">
                    View Program
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-soft-bronze/10 border border-soft-bronze/30 rounded-2xl p-6 mt-8">
        <h4 className="font-heading text-lg font-bold text-charcoal-black mb-3">
          Understanding Adherence Signals
        </h4>
        <div className="space-y-2 text-sm">
          <p className="font-paragraph text-charcoal-black">
            <span className="font-bold">On Track:</span> Client is completing workouts consistently with moderate difficulty
          </p>
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

      {/* Check-In Modal */}
      {checkInModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-soft-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-soft-white border-b border-warm-sand-beige p-6 flex items-center justify-between">
              <h2 className="font-heading text-2xl font-bold text-charcoal-black">
                Send Check-In Message
              </h2>
              <button
                onClick={() =>
                  setCheckInModal({
                    isOpen: false,
                    clientId: null,
                    status: null,
                    message: '',
                    selectedTemplate: 'default',
                    isSending: false,
                  })
                }
                className="p-2 hover:bg-warm-sand-beige rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                    checkInModal.status || ''
                  )}`}
                >
                  {checkInModal.status}
                </span>
              </div>

              {/* Quick Templates Dropdown */}
              <div>
                <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-3">
                  Quick Templates
                </label>
                <select
                  value={checkInModal.selectedTemplate}
                  onChange={(e) => {
                    const templates = checkInModal.isFollowUp
                      ? getFollowUpMessageTemplates(checkInModal.status || '')
                      : getQuickTemplates(checkInModal.status || '');
                    const selectedIdx = parseInt(e.target.value);
                    if (selectedIdx >= 0 && templates[selectedIdx]) {
                      setCheckInModal((prev) => ({
                        ...prev,
                        message: templates[selectedIdx].text,
                        selectedTemplate: e.target.value,
                      }));
                    }
                  }}
                  className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph text-sm"
                >
                  <option value="default">-- Select a template --</option>
                  {(checkInModal.isFollowUp
                    ? getFollowUpMessageTemplates(checkInModal.status || '')
                    : getQuickTemplates(checkInModal.status || '')
                  ).map((template, idx) => (
                    <option key={idx} value={idx}>
                      {template.label}
                    </option>
                  ))}
                </select>
                {checkInModal.isFollowUp && (
                  <p className="text-xs text-soft-bronze mt-2">
                    💡 Follow-up templates are designed for clients who haven't responded to previous check-ins.
                  </p>
                )}
              </div>

              {/* Message Editor */}
              <div>
                <label className="block font-paragraph text-sm font-medium text-charcoal-black mb-3">
                  Your Message
                </label>
                <textarea
                  value={checkInModal.message}
                  onChange={(e) =>
                    setCheckInModal((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  rows={10}
                  className="w-full px-4 py-3 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph text-sm resize-none"
                  placeholder="Type your check-in message..."
                />
                <p className="text-xs text-warm-grey mt-2">
                  {checkInModal.message.length} characters
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-soft-bronze/10 border border-soft-bronze/30 rounded-lg p-4">
                <p className="font-paragraph text-xs text-charcoal-black leading-relaxed">
                  <span className="font-bold">💡 Tip:</span> Personalize this message to make it feel more genuine. The templates are just starting points.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-warm-sand-beige">
                <button
                  onClick={() =>
                    setCheckInModal({
                      isOpen: false,
                      clientId: null,
                      status: null,
                      message: '',
                      isFollowUp: false,
                      selectedTemplate: 'default',
                      isSending: false,
                    })
                  }
                  disabled={checkInModal.isSending}
                  className="flex-1 py-3 rounded-lg font-medium text-sm border border-warm-sand-beige text-charcoal-black hover:bg-warm-sand-beige/20 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendCheckIn}
                  disabled={checkInModal.isSending || !checkInModal.message.trim()}
                  className="flex-1 py-3 rounded-lg font-medium text-sm bg-charcoal-black text-soft-white hover:bg-soft-bronze transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {checkInModal.isSending ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
