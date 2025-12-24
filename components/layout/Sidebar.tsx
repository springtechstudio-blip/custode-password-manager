import React from 'react';
import { Shield, Key, FileText, Code, ShieldCheck, LogOut, Settings } from 'lucide-react';
import { Category } from '../../types';

/**
 * Genera hash dall'email per avatar consistente
 */
function hashEmail(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

interface SidebarProps {
  currentCategory: Category;
  onCategoryChange: (category: Category) => void;
  securityScore: number;
  userEmail: string | null;
  onLogout: () => void;
  passwordCount?: number;
  noteCount?: number;
  devKeyCount?: number;
  onSettingsClick?: () => void;
  avatarUrl?: string;
  onAvatarClick?: () => void;
}

export function Sidebar({
  currentCategory,
  onCategoryChange,
  securityScore,
  userEmail,
  onLogout,
  passwordCount = 0,
  noteCount = 0,
  devKeyCount = 0,
  onSettingsClick,
  avatarUrl,
  onAvatarClick
}: SidebarProps) {
  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center">
            <Shield className="text-orange-500" size={24} />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Custode</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <NavItem
          icon={Key}
          label="Password"
          active={currentCategory === Category.PASSWORDS}
          onClick={() => onCategoryChange(Category.PASSWORDS)}
        />
        <NavItem
          icon={FileText}
          label="Note Sicure"
          active={currentCategory === Category.NOTES}
          onClick={() => onCategoryChange(Category.NOTES)}
        />
        <NavItem
          icon={Code}
          label="Development"
          active={currentCategory === Category.DEVELOPMENT}
          onClick={() => onCategoryChange(Category.DEVELOPMENT)}
        />
        <NavItem
          icon={ShieldCheck}
          label="Security"
          active={currentCategory === Category.SECURITY}
          onClick={() => onCategoryChange(Category.SECURITY)}
        />
      </nav>

      {/* Security Score */}
      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Security Score</span>
            <Shield className="text-orange-500" size={16} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{securityScore}</span>
            <span className="text-sm text-gray-500">/100</span>
          </div>
          <div className="mt-2 h-2 bg-white rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-500"
              style={{ width: `${securityScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* User Profile Section - Desktop Elegant Design */}
      <div className="p-4 border-t border-gray-100 bg-gradient-to-br from-gray-50 to-white">
        {/* Avatar & User Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative group">
            <button
              onClick={onAvatarClick}
              className="relative block focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 rounded-2xl transition-all"
              title="Clicca per cambiare avatar"
            >
              <img
                src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${hashEmail(userEmail || '')}`}
                alt="User"
                className="w-14 h-14 rounded-2xl border-2 border-orange-200 bg-white shadow-sm group-hover:border-orange-400 transition-all group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-2xl transition-all flex items-center justify-center">
                <Settings className="opacity-0 group-hover:opacity-100 text-white transition-opacity" size={20} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">
              Vault Secure
            </p>
            <h3 className="font-bold text-gray-900 truncate text-sm">
              {(userEmail || '').split('@')[0]}
            </h3>
            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-blue-50 rounded-xl p-2 text-center">
            <div className="text-lg font-black text-[#1E3A8A]">{passwordCount}</div>
            <div className="text-[9px] uppercase tracking-wider text-gray-500">Pwd</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-2 text-center">
            <div className="text-lg font-black text-amber-600">{noteCount}</div>
            <div className="text-[9px] uppercase tracking-wider text-gray-500">Note</div>
          </div>
          <div className="bg-green-50 rounded-xl p-2 text-center">
            <div className="text-lg font-black text-green-600">{devKeyCount}</div>
            <div className="text-[9px] uppercase tracking-wider text-gray-500">Keys</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={onSettingsClick}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-gray-700 hover:bg-white rounded-xl transition-all hover:shadow-sm group"
          >
            <Settings className="text-gray-400 group-hover:text-[#1E3A8A] transition-colors" size={16} />
            <span className="text-sm font-medium">Impostazioni</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all group"
          >
            <LogOut className="group-hover:scale-110 transition-transform" size={16} />
            <span className="text-sm font-medium">Disconnetti</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavItem({ icon: Icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
        ${active
          ? 'bg-[#1E3A8A] text-white shadow-lg shadow-blue-100'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }
      `}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );
}
