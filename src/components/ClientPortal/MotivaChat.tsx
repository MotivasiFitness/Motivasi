import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader } from 'lucide-react';
import { useMember } from '@/integrations';
import { BaseCrudService } from '@/integrations';
import { TrainerClientMessages } from '@/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

export default function MotivaChat() {
  const { member } = useMember();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<TrainerClientMessages[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [conversationId, setConversationId] = useState<string>('');

  // Load messages when chat opens
  useEffect(() => {
    if (isOpen && member?._id) {
      loadMessages();
    }
  }, [isOpen, member?._id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMessages = async () => {
    if (!member?._id) return;
    
    setIsLoading(true);
    try {
      // Get all messages where user is sender or recipient
      const { items } = await BaseCrudService.getAll<TrainerClientMessages>('trainerclientmessages');
      
      // Filter messages for this client
      const clientMessages = items.filter(
        msg => msg.senderId === member._id || msg.recipientId === member._id
      );

      // Sort by date
      clientMessages.sort((a, b) => {
        const dateA = a.sentAt ? new Date(a.sentAt).getTime() : 0;
        const dateB = b.sentAt ? new Date(b.sentAt).getTime() : 0;
        return dateA - dateB;
      });

      setMessages(clientMessages);

      // Set conversation ID (use existing or create new)
      if (clientMessages.length > 0 && clientMessages[0].conversationId) {
        setConversationId(clientMessages[0].conversationId);
      } else {
        setConversationId(`conv-${member._id}-${Date.now()}`);
      }

      // Mark unread messages as read
      const unreadMessages = clientMessages.filter(
        msg => msg.recipientId === member._id && !msg.isRead
      );
      
      for (const msg of unreadMessages) {
        await BaseCrudService.update('trainerclientmessages', {
          _id: msg._id,
          isRead: true
        });
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !member?._id || isSending) return;

    setIsSending(true);
    try {
      const messageData: TrainerClientMessages = {
        _id: crypto.randomUUID(),
        conversationId: conversationId,
        senderId: member._id,
        recipientId: 'trainer', // Will be assigned to client's trainer
        content: newMessage.trim(),
        sentAt: new Date().toISOString(),
        isRead: false
      };

      // Optimistic update
      setMessages(prev => [...prev, messageData]);
      setNewMessage('');

      await BaseCrudService.create('trainerclientmessages', messageData);
    } catch (error) {
      console.error('Error sending message:', error);
      // Reload messages on error
      loadMessages();
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Count unread messages
  const unreadCount = messages.filter(
    msg => msg.recipientId === member?._id && !msg.isRead
  ).length;

  return (
    <>
      {/* Chat Toggle Button - Fixed Position */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-soft-bronze hover:bg-soft-bronze/90 text-soft-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
        aria-label="Open MotivaChat"
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <>
            <MessageCircle size={24} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-destructive text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-soft-white rounded-2xl shadow-2xl flex flex-col border-2 border-soft-bronze/20 overflow-hidden">
          {/* Header */}
          <div className="bg-soft-bronze text-soft-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle size={20} />
              <div>
                <h3 className="font-heading text-lg font-bold">MotivaChat</h3>
                <p className="text-xs opacity-90">Chat with your trainer</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-soft-white/20 p-1 rounded transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4 bg-warm-sand-beige/20">
            <div ref={scrollRef} className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader className="w-6 h-6 animate-spin text-soft-bronze" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-warm-grey mx-auto mb-4 opacity-50" />
                  <p className="font-paragraph text-warm-grey">
                    No messages yet. Start a conversation with your trainer!
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwnMessage = msg.senderId === member?._id;
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                          isOwnMessage
                            ? 'bg-soft-bronze text-soft-white rounded-br-sm'
                            : 'bg-soft-white text-charcoal-black rounded-bl-sm border border-warm-grey/20'
                        }`}
                      >
                        <p className="font-paragraph text-sm whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            isOwnMessage ? 'text-soft-white/70' : 'text-warm-grey'
                          }`}
                        >
                          {msg.sentAt ? format(new Date(msg.sentAt), 'HH:mm') : ''}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 bg-soft-white border-t border-warm-grey/20">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isSending}
                className="flex-1 font-paragraph"
              />
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || isSending}
                className="bg-soft-bronze hover:bg-soft-bronze/90 text-soft-white"
                size="icon"
              >
                {isSending ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
