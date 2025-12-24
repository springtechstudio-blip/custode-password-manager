import React, { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Category } from '../../types';
import NotificationDropdown from '../NotificationDropdown';
import type { Notification } from '../../lib/notifications/notificationManager';
import { Key } from 'lucide-react';

interface ResponsiveLayoutProps {
  children: ReactNode;
  currentCategory: Category;
  onCategoryChange: (category: Category) => void;
  securityScore: number;
  userEmail: string | null;
  onLogout: () => void;
  passwordCount?: number;
  noteCount?: number;
  devKeyCount?: number;
  onSettingsClick?: () => void;
  notifications?: Notification[];
  unreadCount?: number;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onClearNotification?: (id: string) => void;
  onNotificationClick?: (notification: Notification) => void;
  avatarUrl?: string;
  onAvatarClick?: () => void;
  onGeneratorClick?: () => void;
}

export function ResponsiveLayout({
  children,
  currentCategory,
  onCategoryChange,
  securityScore,
  userEmail,
  onLogout,
  passwordCount,
  noteCount,
  devKeyCount,
  onSettingsClick,
  notifications = [],
  unreadCount = 0,
  onMarkAsRead = () => {},
  onMarkAllAsRead = () => {},
  onClearNotification = () => {},
  onNotificationClick = () => {},
  avatarUrl,
  onAvatarClick,
  onGeneratorClick
}: ResponsiveLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Hidden on mobile, visible on tablet+ */}
      <Sidebar
        currentCategory={currentCategory}
        onCategoryChange={onCategoryChange}
        securityScore={securityScore}
        userEmail={userEmail}
        onLogout={onLogout}
        passwordCount={passwordCount}
        noteCount={noteCount}
        devKeyCount={devKeyCount}
        onSettingsClick={onSettingsClick}
        avatarUrl={avatarUrl}
        onAvatarClick={onAvatarClick}
      />

      {/* Main Content - Full width on mobile, adjusted on tablet+ */}
      <main className="flex-1 md:ml-0 bg-white md:bg-gray-50 flex flex-col">
        {/* Desktop Header - Hidden on mobile */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 sticky top-0 z-20">
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              {currentCategory === Category.PASSWORDS && 'Password Manager'}
              {currentCategory === Category.NOTES && 'Note Sicure'}
              {currentCategory === Category.DEVELOPMENT && 'Development Vault'}
              {currentCategory === Category.FAVORITES && 'Preferiti'}
              {currentCategory === Category.SECURITY && 'Security Dashboard'}
            </h1>
            <p className="text-sm text-gray-500">Gestisci i tuoi dati in sicurezza</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onGeneratorClick}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl hover:from-orange-600 hover:to-orange-700 transition-all hover:shadow-lg active:scale-95"
              title="Genera Password Sicura"
            >
              <Key size={20} />
              <span className="font-semibold text-sm">Genera Password</span>
            </button>
            <NotificationDropdown
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAsRead={onMarkAsRead}
              onMarkAllAsRead={onMarkAllAsRead}
              onClear={onClearNotification}
              onNotificationClick={onNotificationClick}
            />
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
