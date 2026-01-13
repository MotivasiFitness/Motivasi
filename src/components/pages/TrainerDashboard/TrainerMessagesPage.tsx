import { useEffect, useState, useRef } from 'react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { TrainerClientMessages } from '@/entities';
import { Send, MessageSquare, AlertCircle, Check, CheckCheck, RotateCcw, Loader } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { getClientDisplayNames } from '@/lib/client-display-name';

interface Conversation {
  conversationId: string;
  clientId: string;
  clientDisplayName: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
}

interface MessageWithStatus extends TrainerClientMessages {
  sendStatus?: 'pending' | 'sent' | 'failed';
  isOptimistic?: boolean;
}

export default function TrainerMessagesPage() {
  const { member } = useMember();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageWithStatus[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [failedMessageId, setFailedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        if (!member?._id) return;

        console.log('[TrainerMessagesPage] Fetching conversations for trainer:', member._id);
        const { items } = await BaseCrudService.getAll<TrainerClientMessages>('trainerclientmessages');
        
        // Filter messages where trainer is involved
        const trainerMessages = items.filter(
          (m) => m.senderId === member._id || m.recipientId === member._id
        );

        console.log('[TrainerMessagesPage] Found trainer messages:', trainerMessages.length);

        // Group by conversation
        const conversationMap = new Map<string, Conversation>();
        const clientIds = new Set<string>();

        trainerMessages.forEach((msg) => {
          const convId = msg.conversationId || `${msg.senderId}-${msg.recipientId}`;
          const clientId = msg.senderId === member._id ? msg.recipientId : msg.senderId;

          if (clientId) {
            clientIds.add(clientId);
          }

          const existing = conversationMap.get(convId) || {
            conversationId: convId,
            clientId: clientId || '',
            clientDisplayName: '',
            unreadCount: 0,
          };

          if (msg.recipientId === member._id && !msg.isRead) {
            existing.unreadCount += 1;
          }

          existing.lastMessage = msg.content;
          existing.lastMessageTime = new Date(msg.sentAt || '');

          conversationMap.set(convId, existing);
        });

        // Fetch display names for all clients
        const displayNames = await getClientDisplayNames(Array.from(clientIds));

        // Update conversations with display names
        const conversationsList = Array.from(conversationMap.values()).map(conv => ({
          ...conv,
          clientDisplayName: displayNames.get(conv.clientId) || `Client ${conv.clientId.slice(-4).toUpperCase()}`,
        }));

        setConversations(conversationsList);

        // Check if we have a clientId from query params (coming from TrainerClientsPage)
        const clientIdParam = searchParams.get('clientId');
        const conversationIdParam = searchParams.get('conversationId');
        
        if (clientIdParam) {
          console.log('[TrainerMessagesPage] Client ID from params:', clientIdParam);
          // Find or create conversation for this client
          const existingConv = conversationsList.find(c => c.clientId === clientIdParam);
          if (existingConv) {
            console.log('[TrainerMessagesPage] Found existing conversation:', existingConv.conversationId);
            setSelectedConversation(existingConv.conversationId);
          } else if (conversationIdParam) {
            console.log('[TrainerMessagesPage] Using conversation ID from params:', conversationIdParam);
            setSelectedConversation(conversationIdParam);
          } else {
            console.log('[TrainerMessagesPage] Creating new conversation ID for client:', clientIdParam);
            const newConvId = `${member._id}-${clientIdParam}`;
            setSelectedConversation(newConvId);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('[TrainerMessagesPage] Error fetching conversations:', err);
        setError('Failed to load conversations');
        setLoading(false);
      }
    };

    fetchConversations();
  }, [member?._id, searchParams]);

  // Fetch messages for selected conversation
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!selectedConversation) {
          console.log('[TrainerMessagesPage] No conversation selected');
          return;
        }

        console.log('[TrainerMessagesPage] Fetching messages for conversation:', selectedConversation);
        const { items } = await BaseCrudService.getAll<TrainerClientMessages>('trainerclientmessages');
        const convMessages = items.filter((m) => m.conversationId === selectedConversation);
        
        console.log('[TrainerMessagesPage] Found messages:', convMessages.length);
        
        // Sort messages and add status
        const messagesWithStatus: MessageWithStatus[] = convMessages
          .sort((a, b) => {
            const dateA = new Date(a.sentAt || 0).getTime();
            const dateB = new Date(b.sentAt || 0).getTime();
            return dateA - dateB;
          })
          .map(msg => ({
            ...msg,
            sendStatus: 'sent' as const,
            isOptimistic: false,
          }));

        setMessages(messagesWithStatus);
        setFailedMessageId(null);

        // Mark as read
        convMessages.forEach(async (msg) => {
          if (msg.recipientId === member?._id && !msg.isRead) {
            try {
              await BaseCrudService.update('trainerclientmessages', {
                _id: msg._id,
                isRead: true,
              });
            } catch (err) {
              console.error('[TrainerMessagesPage] Error marking message as read:', err);
            }
          }
        });
      } catch (err) {
        console.error('[TrainerMessagesPage] Error fetching messages:', err);
        setError('Failed to load messages');
      }
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

    const messageText = newMessage.trim();
    const messageId = crypto.randomUUID();
    
    // Create optimistic message
    const optimisticMessage: MessageWithStatus = {
      _id: messageId,
      conversationId: selectedConversation,
      senderId: member._id,
      recipientId: conversations.find(c => c.conversationId === selectedConversation)?.clientId || '',
      content: messageText,
      sentAt: new Date(),
      isRead: false,
      sendStatus: 'pending',
      isOptimistic: true,
    };

    // Add optimistic message to UI immediately
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    setIsSending(true);
    setError('');

    try {
      console.log('[TrainerMessagesPage] Sending message to conversation:', selectedConversation);
      
      const conversation = conversations.find((c) => c.conversationId === selectedConversation);
      const clientId = conversation?.clientId || '';

      if (!clientId) {
        throw new Error('Client ID not found for this conversation');
      }

      const message: TrainerClientMessages = {
        _id: messageId,
        conversationId: selectedConversation,
        senderId: member._id,
        recipientId: clientId,
        content: messageText,
        sentAt: new Date(),
        isRead: false,
      };

      console.log('[TrainerMessagesPage] Creating message:', message);
      await BaseCrudService.create('trainerclientmessages', message);

      // Update optimistic message to sent status
      setMessages(prev =>
        prev.map(msg =>
          msg._id === messageId
            ? { ...msg, sendStatus: 'sent' as const, isOptimistic: false }
            : msg
        )
      );

      console.log('[TrainerMessagesPage] Message sent successfully');
      setFailedMessageId(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send message';
      console.error('[TrainerMessagesPage] Error sending message:', errorMsg, err);
      
      // Update optimistic message to failed status
      setMessages(prev =>
        prev.map(msg =>
          msg._id === messageId
            ? { ...msg, sendStatus: 'failed' as const, isOptimistic: false }
            : msg
        )
      );

      setFailedMessageId(messageId);
      setError(errorMsg);
    } finally {
      setIsSending(false);
    }
  };

  const handleRetryMessage = async (messageId: string) => {
    const failedMessage = messages.find(m => m._id === messageId);
    if (!failedMessage || !failedMessage.content) return;

    // Update to pending status
    setMessages(prev =>
      prev.map(msg =>
        msg._id === messageId
          ? { ...msg, sendStatus: 'pending' as const }
          : msg
      )
    );

    setError('');

    try {
      console.log('[TrainerMessagesPage] Retrying message:', messageId);
      
      const message: TrainerClientMessages = {
        _id: messageId,
        conversationId: failedMessage.conversationId || '',
        senderId: failedMessage.senderId || '',
        recipientId: failedMessage.recipientId || '',
        content: failedMessage.content,
        sentAt: new Date(),
        isRead: false,
      };

      await BaseCrudService.create('trainerclientmessages', message);

      // Update to sent status
      setMessages(prev =>
        prev.map(msg =>
          msg._id === messageId
            ? { ...msg, sendStatus: 'sent' as const }
            : msg
        )
      );

      setFailedMessageId(null);
      console.log('[TrainerMessagesPage] Message retry successful');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to retry message';
      console.error('[TrainerMessagesPage] Error retrying message:', errorMsg, err);

      // Update back to failed status
      setMessages(prev =>
        prev.map(msg =>
          msg._id === messageId
            ? { ...msg, sendStatus: 'failed' as const }
            : msg
        )
      );

      setFailedMessageId(messageId);
      setError(errorMsg);
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

          {error && (
            <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <p className="font-paragraph text-xs text-red-800">{error}</p>
            </div>
          )}

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
                       <div className="flex-1 min-w-0">
                         <h3 className="font-paragraph font-bold truncate">
                           {conv.clientDisplayName}
                         </h3>
                         <p className="text-sm truncate opacity-75">
                           {conv.lastMessage}
                         </p>
                       </div>
                       {conv.unreadCount > 0 && (
                         <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
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
              {/* Chat Header */}
              <div className="p-6 border-b border-warm-sand-beige">
                <h2 className="font-heading text-2xl font-bold text-charcoal-black">
                  {conversations.find(c => c.conversationId === selectedConversation)?.clientDisplayName || 'Chat'}
                </h2>
              </div>

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
                      className={`flex flex-col ${msg.senderId === member?._id ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.senderId === member?._id
                            ? 'bg-soft-bronze text-soft-white'
                            : 'bg-warm-sand-beige text-charcoal-black'
                        } ${msg.isOptimistic ? 'opacity-75' : ''}`}
                      >
                        <p className="font-paragraph text-sm">{msg.content}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <p className="text-xs opacity-70">
                            {new Date(msg.sentAt || '').toLocaleTimeString()}
                          </p>
                          {msg.senderId === member?._id && (
                            <>
                              {msg.sendStatus === 'pending' && (
                                <Loader size={12} className="animate-spin" />
                              )}
                              {msg.sendStatus === 'sent' && (
                                <CheckCheck size={12} />
                              )}
                              {msg.sendStatus === 'failed' && (
                                <AlertCircle size={12} className="text-red-400" />
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Failed Message Retry */}
                      {msg.sendStatus === 'failed' && msg.senderId === member?._id && (
                        <div className="mt-2 flex items-center gap-2">
                          <p className="text-xs text-red-600 font-medium">Failed to send</p>
                          <button
                            onClick={() => handleRetryMessage(msg._id)}
                            className="text-xs text-soft-bronze hover:underline font-medium flex items-center gap-1"
                          >
                            <RotateCcw size={12} />
                            Retry
                          </button>
                        </div>
                      )}
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
