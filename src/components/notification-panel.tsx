'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  CheckCircle,
  Circle,
  Dot,
  Info,
  X,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  isRead: boolean;
}

// Convert your socket notification type to the UI notification type
const convertSocketNotification = (socketNotification: {
  type: 'success' | 'error' | 'info';
  message: string;
  timestamp: string;
}): Notification => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  title:
    socketNotification.type === 'success'
      ? 'Success'
      : socketNotification.type === 'error'
      ? 'Error'
      : 'Information',
  message: socketNotification.message,
  type:
    socketNotification.type === 'error'
      ? 'error'
      : socketNotification.type === 'success'
      ? 'success'
      : 'info',
  timestamp: new Date(socketNotification.timestamp),
  isRead: false,
});

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'info':
      return <Info className="h-4 w-4 text-blue-500" />;
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'error':
      return <XCircle className="h-4 w-4 text-red-500" />;
  }
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

interface NotificationSystemProps {
  backendUrl?: string;
  maxNotifications?: number;
  autoRemoveDelay?: number;
}

export default function NotificationSystem({
  backendUrl = process.env.NEXT_PUBLIC_API_URL,
  maxNotifications = 50,
  autoRemoveDelay = 5000,
}: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Initialize socket connection
  useEffect(() => {
    if (!backendUrl) return;

    const socket = io(backendUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      path: '/socket.io',
      timeout: 20000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to notification server');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from notification server');
    });

    socket.on(
      'cron-notification',
      (socketNotification: {
        type: 'success' | 'error' | 'info';
        message: string;
        timestamp: string;
      }) => {
        const notification = convertSocketNotification(socketNotification);

        setNotifications((prev) => {
          const updated = [notification, ...prev];
          return updated.slice(0, maxNotifications); // Keep only recent notifications
        });

        // Auto-remove notification after delay
        const timeoutId = setTimeout(() => {
          setNotifications((prev) =>
            prev.filter((n) => n.id !== notification.id)
          );
          timeoutRefs.current.delete(notification.id);
        }, autoRemoveDelay);

        timeoutRefs.current.set(notification.id, timeoutId);
      }
    );

    return () => {
      // Clear all timeouts
      timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
      timeoutRefs.current.clear();

      socket.disconnect();
    };
  }, [backendUrl, maxNotifications, autoRemoveDelay]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }, []);

  const markAsUnread = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: false }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
  }, []);

  const deleteNotification = useCallback((id: string) => {
    // Clear timeout if exists
    const timeoutId = timeoutRefs.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutRefs.current.delete(id);
    }

    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    // Clear all timeouts
    timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
    timeoutRefs.current.clear();

    setNotifications([]);
  }, []);

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <Button
        variant="outline"
        size="icon"
        className="relative h-9 w-9 rounded-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
        {/* Connection status indicator */}
        <div
          className={`absolute -bottom-1 -right-1 h-2 w-2 rounded-full ${
            isConnected ? 'bg-primary' : 'bg-gray-400'
          }`}
        />
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50">
          <Card className="w-80 shadow-lg border bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Notifications</CardTitle>
                  <CardDescription>
                    {unreadCount > 0
                      ? `${unreadCount} unread messages`
                      : 'All caught up!'}
                    {!isConnected && (
                      <span className="text-yellow-600 ml-2">
                        • Disconnected
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      <CheckCheck className="h-3 w-3 mr-1" />
                      Mark all read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-6 w-6"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No notifications yet</p>
                    <p className="text-xs mt-1">
                      {isConnected
                        ? 'Waiting for new notifications...'
                        : 'Connecting...'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {notifications.map((notification, index) => (
                      <div key={notification.id}>
                        <div
                          className={`p-4 hover:bg-muted/50 transition-colors ${
                            !notification.isRead
                              ? 'bg-blue-50/50 border-l-2 border-l-blue-500'
                              : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4
                                      className={`text-sm font-medium ${
                                        !notification.isRead
                                          ? 'text-foreground'
                                          : 'text-muted-foreground'
                                      }`}
                                    >
                                      {notification.title}
                                    </h4>
                                    {!notification.isRead && (
                                      <Circle className="h-2 w-2 fill-blue-500 text-blue-500" />
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    {formatTimeAgo(notification.timestamp)}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 mt-3">
                                {notification.isRead ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      markAsUnread(notification.id)
                                    }
                                    className="h-6 px-2 text-xs"
                                  >
                                    <Dot className="h-3 w-3 mr-1" />
                                    Mark unread
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markAsRead(notification.id)}
                                    className="h-6 px-2 text-xs"
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    Mark read
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    deleteNotification(notification.id)
                                  }
                                  className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        {index < notifications.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              {notifications.length > 0 && (
                <div className="p-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllNotifications}
                    className="w-full text-xs"
                  >
                    Clear All Notifications
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
