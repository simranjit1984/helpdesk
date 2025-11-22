import { useState } from "react";
import { Bell, X, Trash2, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
}

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "User Added",
      message: "New user John Doe has been added to the system",
      timestamp: new Date(Date.now() - 5 * 60000),
      type: "success",
      read: false,
    },
    {
      id: "2",
      title: "Role Updated",
      message: "Administrator role permissions have been updated",
      timestamp: new Date(Date.now() - 30 * 60000),
      type: "info",
      read: false,
    },
    {
      id: "3",
      title: "Security Alert",
      message: "Multiple failed login attempts detected",
      timestamp: new Date(Date.now() - 2 * 60 * 60000),
      type: "warning",
      read: true,
    },
    {
      id: "4",
      title: "System Error",
      message: "Failed to sync data with external service",
      timestamp: new Date(Date.now() - 24 * 60 * 60000),
      type: "error",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleDismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const getTypeIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return (
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-green-600" />
        );
      case "warning":
        return <AlertCircle className="w-4 h-4 flex-shrink-0 text-yellow-600" />;
      case "error":
        return <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />;
      case "info":
      default:
        return <Info className="w-4 h-4 flex-shrink-0 text-blue-600" />;
    }
  };

  const getTypeColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 hover:bg-green-100";
      case "warning":
        return "bg-yellow-50 border-yellow-200 hover:bg-yellow-100";
      case "error":
        return "bg-red-50 border-red-200 hover:bg-red-100";
      case "info":
      default:
        return "bg-blue-50 border-blue-200 hover:bg-blue-100";
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="relative flex items-center justify-center h-10 w-10 rounded-sm hover:bg-bluegrey-25 transition-colors"
          aria-label="Notifications"
          aria-haspopup="dialog"
        >
          <Bell className="w-5 h-5 text-bluegrey-700" />
          {unreadCount > 0 && (
            <span
              className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
              aria-label={`${unreadCount} unread notifications`}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-96 p-0 rounded-md shadow-lg border border-bluegrey-200"
      >
        <div className="flex flex-col max-h-96 bg-white rounded-md">
          <div className="flex items-center justify-between px-4 py-3 border-b border-bluegrey-100">
            <h2 className="text-sm font-semibold text-bluegrey-900">
              Notifications
            </h2>
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-bluegrey-600 hover:text-bluegrey-900 transition-colors flex items-center gap-1"
                aria-label="Clear all notifications"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear all
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <Bell className="w-10 h-10 text-bluegrey-300 mb-2" />
              <p className="text-sm text-bluegrey-500">No notifications</p>
            </div>
          ) : (
            <div className="overflow-y-auto flex-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b border-bluegrey-100 last:border-b-0 transition-colors ${
                    !notification.read ? "bg-bluegrey-50" : ""
                  } ${getTypeColor(notification.type)}`}
                  onClick={() => handleMarkAsRead(notification.id)}
                  role="article"
                  aria-label={`${notification.title}: ${notification.message}`}
                >
                  <div className="flex items-start gap-3">
                    {getTypeIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-bluegrey-900 leading-4">
                          {notification.title}
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDismiss(notification.id);
                          }}
                          className="flex-shrink-0 text-bluegrey-400 hover:text-bluegrey-700 transition-colors"
                          aria-label={`Dismiss ${notification.title}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-bluegrey-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-bluegrey-500 mt-1.5">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="mt-2 flex justify-end">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        Unread
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-bluegrey-100 bg-bluegrey-50">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-bluegrey-700 hover:text-bluegrey-900 text-xs"
              >
                View all notifications
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
