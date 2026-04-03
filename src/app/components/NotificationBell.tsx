import { Bell, X } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, removeNotification, clearAll } = useNotification();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-4">
          <h3 className="font-semibold mb-3">Notifications</h3>
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No notifications</p>
          ) : (
            <>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-lg border ${
                      notif.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{notif.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {notif.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      <button
                        onClick={() => removeNotification(notif.id)}
                        className="ml-2"
                      >
                        <X className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                    {!notif.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notif.id)}
                        className="mt-2 w-full"
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="w-full mt-3"
                >
                  Clear All
                </Button>
              )}
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
