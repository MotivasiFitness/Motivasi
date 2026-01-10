import { useEffect, useState, useRef } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { ClientMessages } from '@/entities';
import { Send, MessageCircle } from 'lucide-react';

export default function MessagesPage() {
  const { member } = useMember();
  const [messages, setMessages] = useState<ClientMessages[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-warm-grey">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-soft-bronze to-soft-bronze/80 rounded-2xl p-8 text-soft-white">
        <h1 className="font-heading text-4xl font-bold mb-2">Messages</h1>
        <p className="text-soft-white/90">
          Chat with your trainer for support and guidance
        </p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 bg-soft-white border border-warm-sand-beige rounded-2xl p-8 overflow-y-auto flex flex-col">
        {messages.length > 0 ? (
          <div className="space-y-4 flex-1">
            {messages.map((message) => {
              const isFromClient = message.senderIdentifier === member?._id;
              return (
                <div
                  key={message._id}
                  className={`flex ${isFromClient ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-6 py-3 rounded-2xl ${
                      isFromClient
                        ? 'bg-soft-bronze text-soft-white rounded-br-none'
                        : 'bg-warm-sand-beige text-charcoal-black rounded-bl-none'
                    }`}
                  >
                    <p className="font-paragraph text-sm mb-2">
                      {message.messageContent}
                    </p>
                    <p className={`text-xs ${isFromClient ? 'text-soft-white/70' : 'text-warm-grey'}`}>
                      {new Date(message.sentAt || '').toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-warm-grey mx-auto mb-4 opacity-50" />
              <p className="text-warm-grey">
                No messages yet. Start a conversation with your trainer!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="flex gap-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-6 py-4 rounded-full border border-warm-sand-beige focus:border-soft-bronze focus:outline-none transition-colors font-paragraph"
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={isSending || !newMessage.trim()}
          className="bg-soft-bronze text-soft-white px-6 py-4 rounded-full hover:bg-soft-bronze/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Send size={20} />
        </button>
      </form>

      {/* Info */}
      <div className="text-center text-sm text-warm-grey">
        <p>
          💡 Your trainer typically responds within 24 hours. For urgent matters, please email hello@motivasi.co.uk
        </p>
      </div>
    </div>
  );
}
