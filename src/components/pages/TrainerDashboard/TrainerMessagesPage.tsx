import { useEffect, useState, useRef } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { TrainerClientMessages } from '@/entities';
import { Send, MessageSquare } from 'lucide-react';

interface Conversation {
  conversationId: string;
  clientId: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
}

export default function TrainerMessagesPage() {
  const { member } = useMember();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<TrainerClientMessages[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!member?._id) return;

      const { items } = await BaseCrudService.getAll<TrainerClientMessages>('trainerclientmessages');
      
      // Filter messages where trainer is involved
      const trainerMessages = items.filter(
        (m) => m.senderId === member._id || m.recipientId === member._id
      );

      // Group by conversation
      const conversationMap = new Map<string, Conversation>();
      trainerMessages.forEach((msg) => {
        const convId = msg.conversationId || `${msg.senderId}-${msg.recipientId}`;
        const clientId = msg.senderId === member._id ? msg.recipientId : msg.senderId;

        const existing = conversationMap.get(convId) || {
          conversationId: convId,
          clientId: clientId || '',
          unreadCount: 0,
        };

        if (msg.recipientId === member._id && !msg.isRead) {
          existing.unreadCount += 1;
        }

        existing.lastMessage = msg.content;
        existing.lastMessageTime = new Date(msg.sentAt || '');

        conversationMap.set(convId, existing);
      });

      setConversations(Array.from(conversationMap.values()));
      setLoading(false);
    };

    fetchConversations();
  }, [member?._id]);

  // Fetch messages for selected conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return;

      const { items } = await BaseCrudService.getAll<TrainerClientMessages>('trainerclientmessages');
      const convMessages = items.filter((m) => m.conversationId === selectedConversation);
      
      setMessages(convMessages.sort((a, b) => {
        const dateA = new Date(a.sentAt || 0).getTime();
        const dateB = new Date(b.sentAt || 0).getTime();
        return dateA - dateB;
      }));

      // Mark as read
      convMessages.forEach(async (msg) => {
        if (msg.recipientId === member?._id && !msg.isRead) {
          await BaseCrudService.update('trainerclientmessages', {
            _id: msg._id,
            isRead: true,
          });
        }
      });
    };

    fetchMessages();
  }, [selectedConversation, member?._id]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !member?._id) return;

    setIsSending(true);

    try {
      const conversation = conversations.find((c) => c.conversationId === selectedConversation);
      const clientId = conversation?.clientId || '';

      const message: TrainerClientMessages = {
        _id: crypto.randomUUID(),
        conversationId: selectedConversation,
        senderId: member._id,
        recipientId: clientId,
        content: newMessage,
        sentAt: new Date(),
        isRead: false,
      };

      await BaseCrudService.create('trainerclientmessages', message);
      setNewMessage('');
      
      // Refresh messages
      const { items } = await BaseCrudService.getAll<TrainerClientMessages>('trainerclientmessages');
      const convMessages = items.filter((m) => m.conversationId === selectedConversation);
      setMessages(convMessages.sort((a, b) => {
        const dateA = new Date(a.sentAt || 0).getTime();
        const dateB = new Date(b.sentAt || 0).getTime();
        return dateA - dateB;
      }));
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <p className="text-warm-grey">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 h-screen flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 flex gap-6">
        {/* Conversations List */}
        <div className="w-full lg:w-80 bg-soft-white border border-warm-sand-beige rounded-2xl flex flex-col">
          <div className="p-6 border-b border-warm-sand-beige">
            <h2 className="font-heading text-2xl font-bold text-charcoal-black">Messages</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center">
                <MessageSquare className="mx-auto text-warm-grey mb-4" size={32} />
                <p className="text-warm-grey">No conversations yet</p>
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {conversations.map((conv) => (
                  <button
                    key={conv.conversationId}
                    onClick={() => setSelectedConversation(conv.conversationId)}
                    className={`w-full text-left p-4 rounded-lg transition-colors ${
                      selectedConversation === conv.conversationId
                        ? 'bg-soft-bronze text-soft-white'
                        : 'hover:bg-warm-sand-beige/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-paragraph font-bold">
                          Client {conv.clientId.slice(0, 8)}
                        </h3>
                        <p className="text-sm truncate opacity-75">
                          {conv.lastMessage}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-soft-white border border-warm-sand-beige rounded-2xl flex flex-col hidden lg:flex">
          {selectedConversation ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-warm-grey">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex ${msg.senderId === member?._id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.senderId === member?._id
                            ? 'bg-soft-bronze text-soft-white'
                            : 'bg-warm-sand-beige text-charcoal-black'
                        }`}
                      >
                        <p className="font-paragraph text-sm">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.sentAt || '').toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-6 border-t border-warm-sand-beige flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 rounded-lg border border-warm-sand-beige focus:border-soft-bronze focus:outline-none font-paragraph"
                />
                <button
                  type="submit"
                  disabled={isSending || !newMessage.trim()}
                  className="bg-soft-bronze text-soft-white p-2 rounded-lg hover:bg-charcoal-black transition-colors disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-warm-grey">
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
