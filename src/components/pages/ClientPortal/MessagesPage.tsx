import { useEffect, useState, useRef } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { ClientMessages } from '@/entities';
import { Send, MessageCircle, Lightbulb, CheckCircle2 } from 'lucide-react';

export default function MessagesPage() {
  const { member } = useMember();
  const [messages, setMessages] = useState<ClientMessages[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Message starter suggestions
  const messageSuggestions = [
    "I'm feeling low on energy this week",
    "Can we adjust my workouts?",
    "I'm struggling with motivation"
  ];

  useEffect(() => {
    const fetchMessages = async () => {
      if (!member?._id) return;

      try {
        const { items } = await BaseCrudService.getAll<ClientMessages>('clientmessages');
        // Sort by date (oldest first)
        const sorted = items.sort((a, b) => 
          new Date(a.sentAt || '').getTime() - new Date(b.sentAt || '').getTime()
        );
        setMessages(sorted);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [member?._id]);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!member?._id || !newMessage.trim()) return;

    setIsSending(true);

    try {
      const message: ClientMessages = {
        _id: crypto.randomUUID(),
        conversationId: 'main-conversation',
        senderIdentifier: member._id,
        recipientIdentifier: 'trainer',
        messageContent: newMessage,
        sentAt: new Date().toISOString(),
        isRead: false
      };

      await BaseCrudService.create('clientmessages', message);

      // Refresh messages
      const { items } = await BaseCrudService.getAll<ClientMessages>('clientmessages');
      const sorted = items.sort((a, b) => 
        new Date(a.sentAt || '').getTime() - new Date(b.sentAt || '').getTime()
      );
      setMessages(sorted);

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setNewMessage(suggestion);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-warm-grey">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-screen flex flex-col bg-warm-sand-beige/10 p-6 lg:p-8 rounded-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-soft-bronze to-soft-bronze/80 rounded-2xl p-8 text-soft-white">
        <h1 className="font-heading text-4xl font-bold mb-2">Messages</h1>
        <p className="text-soft-white/90">
          Chat with your trainer for support and guidance
        </p>
      </div>

      {/* Response Time Reassurance */}
      <div className="bg-soft-bronze/5 border border-soft-bronze/20 rounded-xl p-5 flex gap-3 items-start">
        <Lightbulb size={20} className="text-soft-bronze flex-shrink-0 mt-0.5" />
        <p className="font-paragraph text-sm text-charcoal-black leading-relaxed">
          <span className="font-medium">💬 I usually reply within 24 hours (Mon–Fri).</span> You can message anytime — no question is too small.
        </p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 bg-soft-white border border-warm-sand-beige rounded-2xl p-6 lg:p-8 overflow-y-auto flex flex-col">
        {messages.length > 0 ? (
          <div className="space-y-6 flex-1">
            {/* Proactive System Message */}
            <div className="flex justify-start">
              <div className="max-w-xs lg:max-w-md px-6 py-4 rounded-2xl bg-warm-sand-beige/40 border border-warm-sand-beige text-charcoal-black rounded-bl-none">
                <div className="flex items-start gap-2 mb-2">
                  <Lightbulb size={16} className="text-soft-bronze flex-shrink-0 mt-0.5" />
                  <p className="font-paragraph text-sm">
                    👋 Quick check-in: How are you feeling this week? Reply anytime — I'm here to support you.
                  </p>
                </div>
                <p className="text-xs text-warm-grey/70 ml-6">
                  System message
                </p>
              </div>
            </div>

            {/* Messages */}
            {messages.map((message, idx) => {
              const isFromClient = message.senderIdentifier === member?._id;
              return (
                <div
                  key={message._id}
                  className={`flex ${isFromClient ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-6 py-4 rounded-2xl ${ 
                      isFromClient
                        ? 'bg-soft-bronze text-soft-white rounded-br-none shadow-sm'
                        : 'bg-warm-sand-beige/60 border border-warm-sand-beige text-charcoal-black rounded-bl-none'
                    }`}
                  >
                    <p className="font-paragraph text-sm mb-2 leading-relaxed">
                      {message.messageContent}
                    </p>
                    <p className={`text-xs ${isFromClient ? 'text-soft-white/60' : 'text-warm-grey/70'}`}>
                      {new Date(message.sentAt || '').toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Positive Closing Loop (Optional) */}
            {messages.length > 3 && (
              <div className="flex justify-start mt-8">
                <div className="max-w-xs lg:max-w-md px-6 py-4 rounded-2xl bg-green-50/40 border border-green-200/30 text-charcoal-black rounded-bl-none">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="font-paragraph text-sm text-charcoal-black/80">
                      ✅ Great check-in today — consistency over perfection.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-sm">
              {/* Proactive System Message for Empty State */}
              <div className="mb-8 px-6 py-4 rounded-2xl bg-warm-sand-beige/40 border border-warm-sand-beige text-charcoal-black rounded-bl-none mx-auto">
                <div className="flex items-start gap-2 mb-2">
                  <Lightbulb size={16} className="text-soft-bronze flex-shrink-0 mt-0.5" />
                  <p className="font-paragraph text-sm">
                    👋 Quick check-in: How are you feeling this week? Reply anytime — I'm here to support you.
                  </p>
                </div>
                <p className="text-xs text-warm-grey/70 ml-6">
                  System message
                </p>
              </div>
              <MessageCircle className="w-12 h-12 text-warm-grey/30 mx-auto mb-4" />
              <p className="text-warm-grey mb-6">
                Start a conversation with your trainer!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* What You Can Message About */}
      <div className="bg-warm-sand-beige/30 border border-warm-sand-beige rounded-xl p-5">
        <h3 className="font-paragraph font-bold text-sm text-charcoal-black mb-3">
          What you can message me about:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            'Exercise form or technique',
            'Nutrition questions',
            'Motivation or low-energy days',
            'Adjustments around family or work'
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-soft-bronze flex-shrink-0 mt-1" />
              <span className="font-paragraph text-xs text-charcoal-black/80">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Message Starter Suggestions */}
      <div className="space-y-3">
        <p className="font-paragraph text-xs text-warm-grey/70 uppercase tracking-widest">
          💡 Quick starters
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {messageSuggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(suggestion)}
              className="text-left px-4 py-3 rounded-lg bg-soft-white border border-warm-sand-beige hover:border-soft-bronze hover:bg-soft-bronze/5 transition-all duration-200 font-paragraph text-sm text-charcoal-black/80 hover:text-charcoal-black"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="flex gap-3">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          rows={4}
          className="flex-1 px-5 py-4 rounded-2xl border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph text-sm resize-none"
          disabled={isSending}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(e);
            }
          }}
        />
        <button
          type="submit"
          disabled={isSending || !newMessage.trim()}
          className="bg-soft-bronze text-soft-white px-6 py-4 rounded-2xl hover:bg-soft-bronze/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 self-end"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
