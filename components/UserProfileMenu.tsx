import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, Shield, Database, ChevronDown } from 'lucide-react';

interface UserProfileMenuProps {
  email: string;
  passwordCount: number;
  noteCount: number;
  devKeyCount: number;
  onSettingsClick: () => void;
  onLogout: () => void;
  onAvatarClick?: () => void;
  avatarUrl?: string;
}

/**
 * Genera hash semplice dall'email per avatar consistente
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  email,
  passwordCount,
  noteCount,
  devKeyCount,
  onSettingsClick,
  onLogout,
  onAvatarClick,
  avatarUrl
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Estrai nome utente dalla parte prima di @
  const username = email.split('@')[0];
  const displayName = username.charAt(0).toUpperCase() + username.slice(1);

  // Genera avatar consistente basato su hash email
  const avatarSeed = hashString(email);
  const defaultAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;
  const finalAvatarUrl = avatarUrl || defaultAvatarUrl;

  // Chiudi menu quando si clicca fuori
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

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onAvatarClick}
          className="relative group"
          title="Cambia avatar"
        >
          <img
            src={finalAvatarUrl}
            alt={displayName}
            className="w-12 h-12 rounded-full border-2 border-orange-100 bg-gray-50 shadow-sm group-hover:border-orange-400 transition-all"
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        </button>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hover:bg-gray-50 rounded-[1.5rem] px-3 py-2 transition-colors group flex-1 md:flex-initial"
        >
          <div className="hidden md:block text-left">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              Vault Secure
            </p>
            <h2 className="text-lg font-bold text-[#0F172A]">{displayName}</h2>
          </div>
          <ChevronDown
            size={18}
            className={`hidden md:block text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 md:left-auto md:right-0 mt-2 w-80 bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200 z-50">
          {/* Header con info utente */}
          <div className="bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] p-6 text-white">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={finalAvatarUrl}
                alt={displayName}
                className="w-16 h-16 rounded-full border-2 border-white/30"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">{displayName}</h3>
                <p className="text-blue-100 text-sm truncate">{email}</p>
              </div>
            </div>

            {/* Statistiche Vault */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <div className="text-2xl font-black">{passwordCount}</div>
                <div className="text-[10px] uppercase tracking-wider text-blue-100">
                  Password
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <div className="text-2xl font-black">{noteCount}</div>
                <div className="text-[10px] uppercase tracking-wider text-blue-100">
                  Note
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <div className="text-2xl font-black">{devKeyCount}</div>
                <div className="text-[10px] uppercase tracking-wider text-blue-100">
                  Dev Keys
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-3">
            <button
              onClick={() => {
                setIsOpen(false);
                onSettingsClick();
              }}
              className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 rounded-[1.3rem] transition-colors group"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Settings size={20} className="text-[#1E3A8A]" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-bold text-gray-900">Impostazioni</div>
                <div className="text-xs text-gray-400">
                  Configura il tuo vault
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-4 px-4 py-4 hover:bg-red-50 rounded-[1.3rem] transition-colors group mt-2"
            >
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center group-hover:bg-red-100 transition-colors">
                <LogOut size={20} className="text-red-500" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-bold text-gray-900">Disconnetti</div>
                <div className="text-xs text-gray-400">Blocca il vault</div>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 p-4 bg-gray-50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Custode v1.0.0</span>
              <div className="flex items-center gap-1 text-green-600">
                <Shield size={14} />
                <span className="font-bold">Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileMenu;
