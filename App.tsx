import React, { useState, useEffect, useMemo } from 'react';
import {
  Key,
  ShieldCheck,
  StickyNote,
  Terminal,
  Plus,
  Search,
  Home,
  ShieldAlert,
  ArrowRight,
  X,
  Globe,
  User,
  Lock,
  Calendar,
  Layers,
  ChevronDown,
  Filter,
  CreditCard,
  Building2,
  IdCard,
  FileText,
  MoreHorizontal,
  Tag,
  Star
} from 'lucide-react';
import { useAuthContext, useVaultContext } from './contexts';
import { Category, PasswordEntry, SecureNote, DevKey, Environment, PasswordType } from './types';
import PasswordCard from './components/PasswordCard';
import SecurityScoreCard from './components/SecurityScoreCard';
import GeneratorModal from './components/GeneratorModal';
import Onboarding from './components/Onboarding';
import DevKeyCard from './components/DevKeyCard';
import PasswordDetailModal from './components/PasswordDetailModal';
import { ResponsiveLayout } from './components/layout/ResponsiveLayout';
import UserProfileMenu from './components/UserProfileMenu';
import NotificationDropdown from './components/NotificationDropdown';
import SecurityIssueDetailModal from './components/SecurityIssueDetailModal';
import DevKeyDetailModal from './components/DevKeyDetailModal';
import NoteDetailModal from './components/NoteDetailModal';
import SettingsModal from './components/SettingsModal';
import AddEntryModal from './components/AddEntryModal';
import AddPasswordModal from './components/AddPasswordModal';
import AddNoteModal from './components/AddNoteModal';
import AddDevKeyModal from './components/AddDevKeyModal';
import AvatarPickerModal from './components/AvatarPickerModal';
import AddCustomCategoryModal from './components/AddCustomCategoryModal';
import { analyzeVaultSecurity, generateSecurityNotifications } from './lib/security/scoreCalculator';
import { notificationManager, NotificationHelpers } from './lib/notifications/notificationManager';
import type { Notification } from './lib/notifications/notificationManager';
import { getAvatarPreferences, saveAvatarPreferences, getAvatarUrl } from './lib/supabase/avatar';

const App: React.FC = () => {
  const { isAuthenticated, encryptionKey, isLoading: authLoading } = useAuthContext();

  // Show onboarding if not authenticated
  if (!isAuthenticated || !encryptionKey) {
    return <Onboarding onComplete={() => {}} />;
  }

  // Show loading while authenticating
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Caricamento...</p>
        </div>
      </div>
    );
  }

  return <AuthenticatedApp />;
};

// Componente separato per l'app autenticata - contiene tutti gli hooks
const AuthenticatedApp: React.FC = () => {
  const { email, logout } = useAuthContext();
  const {
    data: vault,
    isLoading: vaultLoading,
    error: vaultError,
    loadVault,
    addPassword: vaultAddPassword,
    addDevKey: vaultAddDevKey,
    addNote: vaultAddNote,
    updatePassword,
    updateDevKey,
    updateNote,
    deletePassword,
    deleteDevKey,
    deleteNote,
    addCustomCategory,
    deleteCustomCategory,
    toggleHiddenCategory
  } = useVaultContext();

  // *** TUTTI GLI HOOKS DEVONO ESSERE QUI, PRIMA DI QUALSIASI RETURN ***
  const [activeTab, setActiveTab] = useState<Category>(Category.PASSWORDS);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddPasswordModal, setShowAddPasswordModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showAddDevKeyModal, setShowAddDevKeyModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPassword, setSelectedPassword] = useState<PasswordEntry | null>(null);
  const [selectedDevKey, setSelectedDevKey] = useState<DevKey | null>(null);
  const [selectedNote, setSelectedNote] = useState<SecureNote | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showSecurityIssue, setShowSecurityIssue] = useState<{
    type: 'weak' | 'reused' | 'old' | 'compromised';
    passwords: PasswordEntry[];
  } | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [avatarStyle, setAvatarStyle] = useState('avataaars');
  const [avatarSeed, setAvatarSeed] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [passwordView, setPasswordView] = useState<'all' | PasswordType>('all');
  const [showRecent, setShowRecent] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  // Use data from vault context (use empty arrays as fallback)
  const passwords = vault?.passwords || [];
  const devKeys = vault?.devKeys || [];
  const notes = vault?.notes || [];
  const customCategories = vault?.customCategories || [];
  const hiddenCategories = vault?.hiddenCategories || [];

  // Security Analysis (sempre chiamato, anche se con array vuoti)
  const securityAnalysis = useMemo(
    () => analyzeVaultSecurity(passwords, devKeys, notes),
    [passwords, devKeys, notes]
  );

  // Update notifications when analysis changes
  useEffect(() => {
    const newNotifications = generateSecurityNotifications(securityAnalysis);
    notificationManager.clear();
    newNotifications.forEach((notif) => notificationManager.add(notif));
  }, [securityAnalysis]);

  // Subscribe to notification changes
  useEffect(() => {
    const unsubscribe = notificationManager.subscribe((notifs) => {
      setNotifications(notifs);
    });
    setNotifications(notificationManager.getAll());
    return unsubscribe;
  }, []);

  // Load avatar preferences
  useEffect(() => {
    async function loadAvatar() {
      const result = await getAvatarPreferences();
      if (result.success && result.data) {
        setAvatarStyle(result.data.style);
        setAvatarSeed(result.data.seed);
        setAvatarUrl(getAvatarUrl(result.data.style, result.data.seed));
      } else if (email) {
        // Fallback to email-based avatar
        const hash = Math.abs(
          email.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)
        ).toString(36);
        setAvatarSeed(hash);
        setAvatarUrl(getAvatarUrl('avataaars', hash));
      }
    }
    loadAvatar();
  }, [email]);

  // *** CONDITIONAL RETURNS DOPO TUTTI GLI HOOKS ***

  // Show error if vault failed to load
  if (vaultError && !vaultLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={32} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Errore di Caricamento</h2>
          <p className="text-gray-600 mb-6">{vaultError}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => loadVault()}
              className="px-6 py-3 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-colors"
            >
              Riprova
            </button>
            <button
              onClick={logout}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-300 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while vault is loading
  if (vaultLoading || !vault) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Caricamento vault...</p>
        </div>
      </div>
    );
  }

  // Filter logic
  const filteredPasswords = passwords
    .filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((p) => {
      // Filter by password type or custom category
      if (passwordView !== 'all') {
        // Check if it's a custom category ID
        const isCustomCategory = customCategories.some(c => c.id === passwordView);
        if (isCustomCategory) {
          // Check if password belongs to this custom category
          return p.customCategoryIds?.includes(passwordView) || false;
        } else {
          // It's a PasswordType
          if ((p.type || PasswordType.LOGIN) !== passwordView) return false;
        }
      }
      return true;
    })
    .sort((a, b) => b.lastModified - a.lastModified);

  const filteredDevKeys = devKeys.filter((k) =>
    k.service.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper functions
  const addPassword = async (entry: Omit<PasswordEntry, 'id' | 'lastModified' | 'isFavorite'>) => {
    await vaultAddPassword(entry);
  };

  const addDevKey = async (entry: Omit<DevKey, 'id' | 'isFavorite'>) => {
    await vaultAddDevKey(entry);
  };

  const addNote = async (entry: { title: string; content: string; category: string }) => {
    await vaultAddNote(entry);
  };

  // Security scan
  const handleSecurityScan = () => {
    // Generate notification
    notificationManager.add(
      NotificationHelpers.securityCheckComplete(securityAnalysis.score)
    );
  };

  // Export vault
  const handleExportVault = () => {
    const exportData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: vault
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `custode-vault-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Save avatar preferences
  const handleSaveAvatar = async (style: string, seed: string) => {
    const result = await saveAvatarPreferences(style, seed);
    if (result.success) {
      setAvatarStyle(style);
      setAvatarSeed(seed);
      setAvatarUrl(getAvatarUrl(style, seed));
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (notification.actionType === 'password' && notification.relatedIds) {
      const relatedPasswords = passwords.filter((p) =>
        notification.relatedIds!.includes(p.id)
      );
      // Determine type from notification title
      let type: 'weak' | 'reused' | 'old' | 'compromised' = 'weak';
      if (notification.title.includes('Riutilizzate')) type = 'reused';
      else if (notification.title.includes('Non Aggiornate')) type = 'old';
      else if (notification.title.includes('Compromesse')) type = 'compromised';

      setShowSecurityIssue({ type, passwords: relatedPasswords });
    }
  };

  return (
    <ResponsiveLayout
      currentCategory={activeTab}
      onCategoryChange={setActiveTab}
      securityScore={securityAnalysis.score}
      userEmail={email!}
      onLogout={logout}
      passwordCount={passwords.length}
      noteCount={notes.length}
      devKeyCount={devKeys.length}
      onSettingsClick={() => setShowSettings(true)}
      notifications={notifications}
      unreadCount={notificationManager.getUnreadCount()}
      onMarkAsRead={(id) => notificationManager.markAsRead(id)}
      onMarkAllAsRead={() => notificationManager.markAllAsRead()}
      onClearNotification={(id) => notificationManager.remove(id)}
      onNotificationClick={handleNotificationClick}
      avatarUrl={avatarUrl}
      onAvatarClick={() => setShowAvatarPicker(true)}
      onGeneratorClick={() => setShowGenerator(true)}
    >
      <div className="min-h-screen bg-[#F8F9FA] md:bg-gray-50 flex flex-col max-w-md md:max-w-none mx-auto md:mx-0 relative shadow-2xl md:shadow-none border-x md:border-0 border-gray-100 overflow-hidden">
        {/* Header - Hidden on tablet/desktop, shown on mobile */}
        <header className="md:hidden p-6 flex items-center justify-between bg-white sticky top-0 z-20 border-b border-gray-50">
          <UserProfileMenu
            email={email!}
            passwordCount={passwords.length}
            noteCount={notes.length}
            devKeyCount={devKeys.length}
            onSettingsClick={() => setShowSettings(true)}
            onLogout={logout}
            onAvatarClick={() => setShowAvatarPicker(true)}
            avatarUrl={avatarUrl}
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowGenerator(true)}
              className="p-3 bg-gray-50 rounded-full text-gray-400 hover:bg-orange-50 hover:text-orange-500 transition-all"
            >
              <Key size={20} />
            </button>
            <NotificationDropdown
              notifications={notifications}
              unreadCount={notificationManager.getUnreadCount()}
              onMarkAsRead={(id) => notificationManager.markAsRead(id)}
              onMarkAllAsRead={() => notificationManager.markAllAsRead()}
              onClear={(id) => notificationManager.remove(id)}
              onNotificationClick={handleNotificationClick}
            />
          </div>
        </header>

        {/* Search Bar */}
        <div className="px-6 py-4 bg-white">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-orange-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder={`Cerca in ${
                activeTab === Category.PASSWORDS
                  ? 'Password'
                  : activeTab === Category.DEVELOPMENT
                  ? 'Dev Vault'
                  : 'Note'
              }...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F1F5F9] border-none rounded-2xl py-4 pl-12 pr-4 text-gray-900 focus:ring-2 focus:ring-orange-100 outline-none transition-all placeholder:text-gray-400 font-medium"
            />
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-36 md:pb-8 px-6 md:px-8 lg:px-12 scroll-smooth">
          {activeTab === Category.PASSWORDS && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-4">
              <SecurityScoreCard
                score={securityAnalysis.score}
                count={passwords.length}
                breakdown={securityAnalysis.breakdown}
                onShowDetails={() => {
                  if (securityAnalysis.weakPasswords.length > 0) {
                    setShowSecurityIssue({
                      type: 'weak',
                      passwords: securityAnalysis.weakPasswords
                    });
                  }
                }}
              />

              <section>
                <h2 className="text-lg font-bold mb-4 text-[#0F172A]">Categorie</h2>
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {/* "Tutte" - Always visible, cannot be hidden */}
                  <CategoryPill
                    label="Tutte"
                    active={passwordView === 'all'}
                    icon={<Layers size={18} />}
                    onClick={() => setPasswordView('all')}
                  />

                  {/* Predefined Categories - Can be hidden */}
                  {!hiddenCategories.includes(PasswordType.LOGIN) && (
                    <div className="relative group">
                      <CategoryPill
                        label="Login"
                        active={passwordView === PasswordType.LOGIN}
                        icon={<Key size={18} />}
                        onClick={() => setPasswordView(PasswordType.LOGIN)}
                      />
                      <button
                        onClick={() => toggleHiddenCategory(PasswordType.LOGIN)}
                        className="absolute -top-1 -right-1 w-7 h-7 aspect-square bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-red-700 hover:scale-110 shadow-xl"
                        title="Nascondi categoria"
                      >
                        <X size={16} strokeWidth={3} />
                      </button>
                    </div>
                  )}
                  {!hiddenCategories.includes(PasswordType.CREDIT_CARD) && (
                    <div className="relative group">
                      <CategoryPill
                        label="Carte"
                        active={passwordView === PasswordType.CREDIT_CARD}
                        icon={<CreditCard size={18} />}
                        onClick={() => setPasswordView(PasswordType.CREDIT_CARD)}
                      />
                      <button
                        onClick={() => toggleHiddenCategory(PasswordType.CREDIT_CARD)}
                        className="absolute -top-1 -right-1 w-7 h-7 aspect-square bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-red-700 hover:scale-110 shadow-xl"
                        title="Nascondi categoria"
                      >
                        <X size={16} strokeWidth={3} />
                      </button>
                    </div>
                  )}
                  {!hiddenCategories.includes(PasswordType.BANK_ACCOUNT) && (
                    <div className="relative group">
                      <CategoryPill
                        label="Conti"
                        active={passwordView === PasswordType.BANK_ACCOUNT}
                        icon={<Building2 size={18} />}
                        onClick={() => setPasswordView(PasswordType.BANK_ACCOUNT)}
                      />
                      <button
                        onClick={() => toggleHiddenCategory(PasswordType.BANK_ACCOUNT)}
                        className="absolute -top-1 -right-1 w-7 h-7 aspect-square bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-red-700 hover:scale-110 shadow-xl"
                        title="Nascondi categoria"
                      >
                        <X size={16} strokeWidth={3} />
                      </button>
                    </div>
                  )}
                  {!hiddenCategories.includes(PasswordType.ID_CARD) && (
                    <div className="relative group">
                      <CategoryPill
                        label="Documenti"
                        active={passwordView === PasswordType.ID_CARD}
                        icon={<IdCard size={18} />}
                        onClick={() => setPasswordView(PasswordType.ID_CARD)}
                      />
                      <button
                        onClick={() => toggleHiddenCategory(PasswordType.ID_CARD)}
                        className="absolute -top-1 -right-1 w-7 h-7 aspect-square bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-red-700 hover:scale-110 shadow-xl"
                        title="Nascondi categoria"
                      >
                        <X size={16} strokeWidth={3} />
                      </button>
                    </div>
                  )}
                  {!hiddenCategories.includes(PasswordType.SECURE_NOTE) && (
                    <div className="relative group">
                      <CategoryPill
                        label="Note"
                        active={passwordView === PasswordType.SECURE_NOTE}
                        icon={<FileText size={18} />}
                        onClick={() => setPasswordView(PasswordType.SECURE_NOTE)}
                      />
                      <button
                        onClick={() => toggleHiddenCategory(PasswordType.SECURE_NOTE)}
                        className="absolute -top-1 -right-1 w-7 h-7 aspect-square bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-red-700 hover:scale-110 shadow-xl"
                        title="Nascondi categoria"
                      >
                        <X size={16} strokeWidth={3} />
                      </button>
                    </div>
                  )}
                  {!hiddenCategories.includes(PasswordType.OTHER) && (
                    <div className="relative group">
                      <CategoryPill
                        label="Altro"
                        active={passwordView === PasswordType.OTHER}
                        icon={<MoreHorizontal size={18} />}
                        onClick={() => setPasswordView(PasswordType.OTHER)}
                      />
                      <button
                        onClick={() => toggleHiddenCategory(PasswordType.OTHER)}
                        className="absolute -top-1 -right-1 w-7 h-7 aspect-square bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-red-700 hover:scale-110 shadow-xl"
                        title="Nascondi categoria"
                      >
                        <X size={16} strokeWidth={3} />
                      </button>
                    </div>
                  )}

                  {/* Custom Categories */}
                  {customCategories
                    .filter(c => !hiddenCategories.includes(c.id))
                    .map((category) => (
                      <div key={category.id} className="relative group">
                        <CategoryPill
                          label={category.name}
                          active={passwordView === category.id}
                          icon={<Tag size={18} />}
                          onClick={() => setPasswordView(category.id as any)}
                        />
                        <button
                          onClick={() => deleteCustomCategory(category.id)}
                          className="absolute -top-1 -right-1 w-7 h-7 aspect-square bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-red-700 hover:scale-110 shadow-xl"
                          title="Elimina categoria"
                        >
                          <X size={16} strokeWidth={3} />
                        </button>
                      </div>
                    ))}
                  <button
                    onClick={() => setShowAddCategoryModal(true)}
                    className="flex-shrink-0 w-10 h-10 rounded-[1.3rem] border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50 transition-all"
                    title="Aggiungi categoria personalizzata"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-[#0F172A]">
                    {passwordView === 'all' ? 'Tutte le Password' :
                     passwordView === PasswordType.LOGIN ? 'Login' :
                     passwordView === PasswordType.CREDIT_CARD ? 'Carte di Credito' :
                     passwordView === PasswordType.BANK_ACCOUNT ? 'Conti Bancari' :
                     passwordView === PasswordType.ID_CARD ? 'Documenti' :
                     passwordView === PasswordType.SECURE_NOTE ? 'Note Sicure' :
                     passwordView === PasswordType.OTHER ? 'Altro' :
                     customCategories.find(c => c.id === passwordView)?.name || 'Password'}
                  </h2>
                  <div className="h-[2px] flex-1 bg-gray-50 mx-4"></div>
                </div>
                <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
                  {filteredPasswords.length > 0 ? (
                    filteredPasswords.map((pw) => (
                      <PasswordCard
                        key={pw.id}
                        entry={pw}
                        onClick={() => setSelectedPassword(pw)}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
                      <p className="text-gray-400 text-sm">Nessuna password trovata</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {activeTab === Category.DEVELOPMENT && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-4">
              <div className="bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] p-6 rounded-[2.5rem] text-white shadow-xl shadow-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                    <Terminal className="text-white" size={24} />
                  </div>
                  <span className="text-[10px] bg-white/20 px-3 py-1 rounded-full backdrop-blur-md uppercase tracking-[0.2em] font-bold">
                    Dev Hub
                  </span>
                </div>
                <h2 className="text-2xl font-bold">Chiavi Tecniche</h2>
                <p className="text-blue-100 text-sm mt-1">
                  Gestione API e credenziali server
                </p>
              </div>

              <section>
                <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
                  {filteredDevKeys.length > 0 ? (
                    filteredDevKeys.map((key) => (
                      <DevKeyCard
                        key={key.id}
                        entry={key}
                        onClick={() => setSelectedDevKey(key)}
                      />
                    ))
                  ) : (
                    <div className="text-center py-10 text-gray-400">
                      Nessuna chiave salvata
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {activeTab === Category.NOTES && (
            <div className="space-y-6 pt-4 animate-in fade-in duration-500">
              <h2 className="text-2xl font-bold text-[#0F172A]">Note Sicure</h2>
              <div className="grid grid-cols-1 gap-4">
                {filteredNotes.length > 0 ? (
                  filteredNotes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => setSelectedNote(note)}
                      className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-amber-100 active:scale-[0.98]"
                    >
                      <div className="mb-3">
                        <h3 className="font-bold text-gray-900 text-lg">{note.title}</h3>
                      </div>
                      <p className="text-gray-500 text-sm line-clamp-4 leading-relaxed whitespace-pre-wrap">
                        {note.content}
                      </p>
                      <div className="mt-5 pt-4 border-t border-gray-50 flex justify-between items-center">
                        <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                        <button className="text-[#1E3A8A] font-bold text-xs uppercase tracking-widest hover:underline">
                          Apri Nota
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
                    <div className="bg-orange-50 w-20 h-20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-4">
                      <StickyNote size={32} className="text-orange-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Note vuote</h3>
                    <p className="text-gray-400 mt-2 text-sm max-w-[200px] mx-auto leading-relaxed">
                      Salva codici di recupero e licenze in modo crittografato.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === Category.SECURITY && (
            <div className="space-y-6 pt-4">
              <h2 className="text-2xl font-bold text-[#0F172A]">Checkup Sicurezza</h2>
              <div className="grid grid-cols-2 gap-4">
                <SecurityIssueCard
                  icon={<ShieldAlert className="text-red-500" />}
                  title="Violate"
                  count={0}
                  onClick={() => {}}
                />
                <SecurityIssueCard
                  icon={<Key className="text-orange-500" />}
                  title="Deboli"
                  count={securityAnalysis.breakdown.weakCount}
                  onClick={() =>
                    securityAnalysis.weakPasswords.length > 0 &&
                    setShowSecurityIssue({
                      type: 'weak',
                      passwords: securityAnalysis.weakPasswords
                    })
                  }
                />
                <SecurityIssueCard
                  icon={<Star className="text-blue-500" />}
                  title="Riutilizzate"
                  count={securityAnalysis.breakdown.reusedCount}
                  onClick={() => {
                    const reusedPasswords = Array.from(
                      securityAnalysis.reusedPasswords.values()
                    ).flat();
                    if (reusedPasswords.length > 0) {
                      setShowSecurityIssue({ type: 'reused', passwords: reusedPasswords });
                    }
                  }}
                />
                <SecurityIssueCard
                  icon={<Calendar className="text-gray-500" />}
                  title="Vecchie"
                  count={securityAnalysis.breakdown.oldCount}
                  onClick={() =>
                    securityAnalysis.oldPasswords.length > 0 &&
                    setShowSecurityIssue({
                      type: 'old',
                      passwords: securityAnalysis.oldPasswords
                    })
                  }
                />
              </div>
              <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm mt-4 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-50 rounded-2xl text-[#1E3A8A]">
                      <ShieldCheck size={28} />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">Salute del Vault</h3>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed mb-6">
                    Analizziamo la complessità e l'unicità delle tue password per garantirti la
                    massima protezione.
                  </p>
                  <button
                    onClick={handleSecurityScan}
                    className="w-full py-5 bg-[#F8FAFC] text-[#1E3A8A] rounded-[2rem] font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-50 transition-all border border-blue-100"
                  >
                    Avvia Scansione Completa <ArrowRight size={18} />
                  </button>
                </div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full -mr-12 -mt-12 blur-2xl"></div>
              </div>
            </div>
          )}
        </main>

        {/* Floating Action Button - Desktop/Tablet only */}
        <div className="hidden md:block fixed bottom-8 right-8 z-30">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-16 h-16 bg-[#1E3A8A] text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-300 hover:scale-110 active:scale-95 transition-all group"
          >
            <Plus size={40} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Bottom Navigation - Hidden on tablet/desktop */}
        <nav className="md:hidden bg-white/90 backdrop-blur-xl border-t border-gray-100 h-24 px-8 flex items-center justify-between fixed bottom-0 max-w-md w-full z-20 rounded-t-[2.5rem] shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
          <NavButton
            active={activeTab === Category.PASSWORDS}
            icon={<Home size={28} />}
            onClick={() => setActiveTab(Category.PASSWORDS)}
          />
          <NavButton
            active={activeTab === Category.SECURITY}
            icon={<ShieldCheck size={28} />}
            onClick={() => setActiveTab(Category.SECURITY)}
          />

          {/* FAB integrato nella navigation bar - Mobile only */}
          <div className="relative -top-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-16 h-16 bg-[#1E3A8A] text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-300 active:scale-95 transition-all group"
            >
              <Plus size={36} className="group-active:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          <NavButton
            active={activeTab === Category.DEVELOPMENT}
            icon={<Terminal size={28} />}
            onClick={() => setActiveTab(Category.DEVELOPMENT)}
          />
          <NavButton
            active={activeTab === Category.NOTES}
            icon={<StickyNote size={28} />}
            onClick={() => setActiveTab(Category.NOTES)}
          />
        </nav>

        {/* Modals */}
        {showGenerator && <GeneratorModal onClose={() => setShowGenerator(false)} />}
        {showAddModal && (
          <AddEntryModal
            onClose={() => setShowAddModal(false)}
            activeTab={activeTab}
            onAddPassword={() => {
              setShowAddModal(false);
              setShowAddPasswordModal(true);
            }}
            onAddNote={() => {
              setShowAddModal(false);
              setShowAddNoteModal(true);
            }}
            onAddDevKey={() => {
              setShowAddModal(false);
              setShowAddDevKeyModal(true);
            }}
          />
        )}
        {showAddPasswordModal && (
          <AddPasswordModal
            onClose={() => setShowAddPasswordModal(false)}
            onAdd={addPassword}
          />
        )}
        {showAddNoteModal && (
          <AddNoteModal
            onClose={() => setShowAddNoteModal(false)}
            onAdd={addNote}
          />
        )}
        {showAddDevKeyModal && (
          <AddDevKeyModal
            onClose={() => setShowAddDevKeyModal(false)}
            onAdd={addDevKey}
          />
        )}
        {selectedPassword && (
          <PasswordDetailModal entry={selectedPassword} onClose={() => setSelectedPassword(null)} />
        )}
        {selectedDevKey && (
          <DevKeyDetailModal
            entry={selectedDevKey}
            onClose={() => setSelectedDevKey(null)}
            onUpdate={updateDevKey}
            onDelete={deleteDevKey}
          />
        )}
        {selectedNote && (
          <NoteDetailModal
            entry={selectedNote}
            onClose={() => setSelectedNote(null)}
            onUpdate={updateNote}
            onDelete={deleteNote}
          />
        )}
        {showSettings && (
          <SettingsModal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            email={email!}
            passwordCount={passwords.length}
            noteCount={notes.length}
            devKeyCount={devKeys.length}
            onExportVault={handleExportVault}
          />
        )}
        {showSecurityIssue && (
          <SecurityIssueDetailModal
            isOpen={true}
            onClose={() => setShowSecurityIssue(null)}
            issueType={showSecurityIssue.type}
            passwords={showSecurityIssue.passwords}
            onPasswordClick={(pw) => {
              setShowSecurityIssue(null);
              setSelectedPassword(pw);
            }}
          />
        )}
        <AvatarPickerModal
          isOpen={showAvatarPicker}
          onClose={() => setShowAvatarPicker(false)}
          currentSeed={avatarSeed}
          onSave={handleSaveAvatar}
        />
        {showAddCategoryModal && (
          <AddCustomCategoryModal
            onClose={() => setShowAddCategoryModal(false)}
            onAdd={addCustomCategory}
          />
        )}
      </div>
    </ResponsiveLayout>
  );
};

// --- Subcomponents ---

const CategoryPill: React.FC<{
  label: string;
  active: boolean;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ label, active, icon, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-6 py-4 rounded-[1.8rem] border transition-all ${
      active
        ? 'bg-orange-50 border-orange-200 text-orange-600 shadow-md shadow-orange-100'
        : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
    }`}
  >
    <span className={active ? 'text-orange-500' : 'text-gray-300'}>{icon}</span>
    <span className="font-bold text-sm tracking-wide">{label}</span>
  </button>
);

const NavButton: React.FC<{
  active: boolean;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ active, icon, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all ${
      active ? 'text-[#1E3A8A] scale-110' : 'text-gray-300 hover:text-gray-400'
    }`}
  >
    {icon}
    {active && <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1"></div>}
  </button>
);

const SecurityIssueCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  count: number;
  onClick: () => void;
}> = ({ icon, title, count, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col gap-3 ${
      count > 0
        ? 'cursor-pointer hover:bg-[#F8FAFC] transition-colors border-b-4 border-b-transparent hover:border-b-blue-100'
        : 'opacity-50'
    }`}
  >
    <div className="bg-gray-50 w-12 h-12 rounded-[1.2rem] flex items-center justify-center">
      {icon}
    </div>
    <div>
      <h4 className="font-bold text-gray-900 text-xl">{count}</h4>
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.15em]">{title}</p>
    </div>
  </div>
);

export default App;
