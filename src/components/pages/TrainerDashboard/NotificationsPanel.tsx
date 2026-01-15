import { useState, useEffect } from 'react';
import { useMember } from '@/integrations';
import { TrainerNotifications } from '@/entities';
import { getTrainerNotifications, markNotificationAsRead, dismissNotification, markAllAsRead, getUnreadCount } from '@/lib/notification-service';
import { getClientDisplayName } from '@/lib/client-display-name';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationsPanel() {
  const { member } = useMember();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<TrainerNotifications[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (member?.loginEmail) {
      loadNotifications();
      loadUnreadCount();
    }
  }, [member]);

  const loadNotifications = async () => {
    if (!member?.loginEmail) return;
    
    setIsLoading(true);
    const result = await getTrainerNotifications(member.loginEmail, 50, 0);
    setNotifications(result.items);
    setIsLoading(false);
  };

  const loadUnreadCount = async () => {
    if (!member?.loginEmail) return;
    const count = await getUnreadCount(member.loginEmail);
    setUnreadCount(count);
  };

  const handleNotificationClick = async (notification: TrainerNotifications) => {
    // Mark as read
    if (!notification.isRead) {
      await markNotificationAsRead(notification._id);
      setNotifications(prev => prev.map(n => 
        n._id === notification._id ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    // Navigate to the linked page
    if (notification.linkUrl) {
      navigate(notification.linkUrl);
      setIsOpen(false);
    }
  };

  const handleDismiss = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Optimistic update
    const notification = notifications.find(n => n._id === notificationId);
    setNotifications(prev => prev.filter(n => n._id !== notificationId));
    if (notification && !notification.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    try {
      await dismissNotification(notificationId);
    } catch (error) {
      // Revert on error
      loadNotifications();
      loadUnreadCount();
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!member?.loginEmail) return;

    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await markAllAsRead(member.loginEmail);
    } catch (error) {
      // Revert on error
      loadNotifications();
      loadUnreadCount();
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'workout_completed':
        return '💪';
      case 'week_completed':
        return '🎉';
      case 'reflection_submitted':
        return '📝';
      default:
        return '🔔';
    }
  };

  const getTimeAgo = (dateString: string | Date | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-muted-rose text-white"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-12 z-50 w-96 bg-white rounded-lg shadow-lg border border-warm-grey/20"
            >
              <Card className="border-0 shadow-none">
                <CardHeader className="border-b border-warm-grey/20 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-heading text-xl">Notifications</CardTitle>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-soft-bronze hover:text-soft-bronze/80"
                      >
                        <CheckCheck className="h-4 w-4 mr-1" />
                        Mark all read
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px]">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-soft-bronze" />
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <Bell className="h-12 w-12 text-warm-grey/40 mb-3" />
                        <p className="font-paragraph text-warm-grey">No notifications yet</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-warm-grey/10">
                        {notifications.map((notification) => (
                          <motion.div
                            key={notification._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={`p-4 hover:bg-warm-sand-beige/20 cursor-pointer transition-colors relative ${
                              !notification.isRead ? 'bg-soft-bronze/5' : ''
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="text-2xl flex-shrink-0">
                                {getNotificationIcon(notification.notificationType || '')}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`font-paragraph text-sm ${
                                  !notification.isRead ? 'font-medium text-charcoal-black' : 'text-charcoal-black/80'
                                }`}>
                                  {notification.message}
                                </p>
                                <p className="font-paragraph text-xs text-warm-grey mt-1">
                                  {getTimeAgo(notification.createdAt)}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 flex-shrink-0 hover:bg-warm-grey/20"
                                onClick={(e) => handleDismiss(notification._id, e)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            {!notification.isRead && (
                              <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-soft-bronze rounded-full" />
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
