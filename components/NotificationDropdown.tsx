import React, { useState, useRef, useEffect } from 'react';
import { Bell, AlertTriangle, AlertCircle, Info, X, Check } from 'lucide-react';
import type { Notification, NotificationType } from '../lib/notifications/notificationManager';

interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClear: (id: string) => void;
  onNotificationClick: (notification: Notification) => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onClear,
  onNotificationClick
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Chiudi quando si clicca fuori
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    onNotificationClick(notification);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-gray-50 rounded-full text-gray-400 hover:bg-gray-100 relative transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-3 right-3 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200 z-50 max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <div>
              <h3 className="font-black text-lg text-gray-900">Notifiche</h3>
              <p className="text-xs text-gray-400 mt-1">
                {unreadCount > 0
                  ? `${unreadCount} non ${unreadCount === 1 ? 'letta' : 'lette'}`
                  : 'Tutto letto'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-xs font-bold text-[#1E3A8A] hover:underline flex items-center gap-1"
              >
                <Check size={14} />
                Segna tutte
              </button>
            )}
          </div>

          {/* Lista Notifiche */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell size={32} className="text-gray-300" />
                </div>
                <p className="text-gray-400 font-medium">Nessuna notifica</p>
                <p className="text-xs text-gray-300 mt-2">
                  Ti avviseremo quando ci saranno aggiornamenti
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map(notif => (
                  <NotificationItem
                    key={notif.id}
                    notification={notif}
                    onClick={() => handleNotificationClick(notif)}
                    onClear={(e) => {
                      e.stopPropagation();
                      onClear(notif.id);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Componente singola notifica
const NotificationItem: React.FC<{
  notification: Notification;
  onClick: () => void;
  onClear: (e: React.MouseEvent) => void;
}> = ({ notification, onClick, onClear }) => {
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle size={20} className="text-red-500" />;
      case 'warning':
        return <AlertCircle size={20} className="text-orange-500" />;
      case 'info':
        return <Info size={20} className="text-blue-500" />;
    }
  };

  const getBgColor = (type: NotificationType) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50';
      case 'warning':
        return 'bg-orange-50';
      case 'info':
        return 'bg-blue-50';
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ora';
    if (minutes < 60) return `${minutes}m fa`;
    if (hours < 24) return `${hours}h fa`;
    return `${days}g fa`;
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors relative ${
        !notification.isRead ? 'bg-blue-50/30' : ''
      }`}
    >
      <div className="flex gap-4">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getBgColor(notification.type)}`}>
          {getIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-bold text-sm text-gray-900 line-clamp-1">
              {notification.title}
            </h4>
            <button
              onClick={onClear}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
            >
              <X size={14} className="text-gray-400" />
            </button>
          </div>
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
            {notification.message}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] text-gray-400 font-medium">
              {formatTime(notification.timestamp)}
            </span>
            {!notification.isRead && (
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDropdown;
