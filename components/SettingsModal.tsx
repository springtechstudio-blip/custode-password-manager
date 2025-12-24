import React, { useState } from 'react';
import {
  X,
  User,
  Shield,
  Database,
  Download,
  Info,
  Lock,
  Clock,
  CheckCircle
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  passwordCount: number;
  noteCount: number;
  devKeyCount: number;
  onExportVault: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  email,
  passwordCount,
  noteCount,
  devKeyCount,
  onExportVault
}) => {
  const [activeSection, setActiveSection] = useState<
    'account' | 'security' | 'vault' | 'info'
  >('account');

  if (!isOpen) return null;

  const totalItems = passwordCount + noteCount + devKeyCount;
  const estimatedSize = `~${Math.ceil(totalItems * 0.5)}KB`;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full md:max-w-4xl md:rounded-[3rem] rounded-t-[3rem] max-h-[90vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-20 md:slide-in-from-bottom-4 duration-300 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">Impostazioni</h2>
            <p className="text-blue-100 text-sm mt-1">
              Gestisci il tuo vault e le preferenze
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Sidebar Navigation */}
          <div className="w-48 bg-gray-50 border-r border-gray-100 p-4 space-y-2 overflow-y-auto">
            <NavItem
              icon={<User size={18} />}
              label="Account"
              active={activeSection === 'account'}
              onClick={() => setActiveSection('account')}
            />
            <NavItem
              icon={<Shield size={18} />}
              label="Sicurezza"
              active={activeSection === 'security'}
              onClick={() => setActiveSection('security')}
            />
            <NavItem
              icon={<Database size={18} />}
              label="Vault"
              active={activeSection === 'vault'}
              onClick={() => setActiveSection('vault')}
            />
            <NavItem
              icon={<Info size={18} />}
              label="Info"
              active={activeSection === 'info'}
              onClick={() => setActiveSection('info')}
            />
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeSection === 'account' && (
              <div className="space-y-6">
                <SectionTitle>Informazioni Account</SectionTitle>

                <SettingRow
                  label="Email"
                  value={email}
                  icon={<User size={18} />}
                  description="Il tuo indirizzo email per l'accesso"
                />

                <SettingRow
                  label="Master Password"
                  value="••••••••••••"
                  icon={<Lock size={18} />}
                  description="Password principale per crittografia"
                  action={
                    <button className="text-sm font-bold text-gray-400 cursor-not-allowed">
                      Cambio disabilitato
                    </button>
                  }
                />

                <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl p-4 mt-6">
                  <p className="text-sm text-amber-900">
                    ⚠️ <strong>Nota:</strong> Non esiste un sistema di recupero
                    password. Se dimentichi la master password, i dati non
                    potranno essere recuperati.
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-6">
                <SectionTitle>Sicurezza & Privacy</SectionTitle>

                <SettingRow
                  label="Auto-Lock"
                  value="15 minuti"
                  icon={<Clock size={18} />}
                  description="Blocca automaticamente il vault dopo inattività"
                  action={
                    <select className="bg-gray-50 border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-bold text-gray-700 outline-none focus:border-blue-200">
                      <option value="5">5 minuti</option>
                      <option value="15" selected>
                        15 minuti
                      </option>
                      <option value="30">30 minuti</option>
                      <option value="60">1 ora</option>
                      <option value="0">Mai</option>
                    </select>
                  }
                />

                <SettingRow
                  label="Richiedi Password"
                  value="Per azioni sensibili"
                  icon={<Shield size={18} />}
                  description="Richiedi conferma password per eliminazioni"
                  action={
                    <label className="relative inline-block w-12 h-6">
                      <input type="checkbox" className="sr-only peer" checked />
                      <div className="w-full h-full bg-gray-200 peer-checked:bg-[#1E3A8A] rounded-full peer transition-colors"></div>
                      <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full peer-checked:translate-x-6 transition-transform"></div>
                    </label>
                  }
                />

                <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-4 mt-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="font-bold text-blue-900 mb-1">
                        Crittografia Attiva
                      </p>
                      <p className="text-sm text-blue-800">
                        Tutti i dati sono crittografati con AES-256-GCM prima di
                        essere salvati. La chiave di crittografia è derivata
                        dalla tua master password e non lascia mai il tuo
                        dispositivo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'vault' && (
              <div className="space-y-6">
                <SectionTitle>Gestione Vault</SectionTitle>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <StatCard
                    label="Password"
                    value={passwordCount}
                    color="blue"
                  />
                  <StatCard label="Note" value={noteCount} color="amber" />
                  <StatCard label="Dev Keys" value={devKeyCount} color="purple" />
                </div>

                <SettingRow
                  label="Elementi Totali"
                  value={totalItems.toString()}
                  icon={<Database size={18} />}
                  description="Numero totale di elementi nel vault"
                />

                <SettingRow
                  label="Spazio Usato"
                  value={estimatedSize}
                  icon={<Database size={18} />}
                  description="Spazio occupato dal vault crittografato"
                />

                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={onExportVault}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#1E3A8A] text-white rounded-2xl font-bold hover:bg-[#2952B6] transition-colors"
                  >
                    <Download size={20} />
                    Esporta Vault (Crittografato)
                  </button>
                  <p className="text-xs text-gray-400 text-center mt-3">
                    Scarica una copia crittografata del tuo vault in formato
                    JSON
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'info' && (
              <div className="space-y-6">
                <SectionTitle>Informazioni</SectionTitle>

                <SettingRow
                  label="Versione"
                  value="1.0.0-alpha"
                  icon={<Info size={18} />}
                  description="Custode Password Manager"
                />

                <SettingRow
                  label="Crittografia"
                  value="AES-256-GCM"
                  icon={<Shield size={18} />}
                  description="Standard di crittografia utilizzato"
                />

                <SettingRow
                  label="Key Derivation"
                  value="PBKDF2 (100k iterazioni)"
                  icon={<Lock size={18} />}
                  description="Algoritmo di derivazione chiave"
                />

                <div className="bg-gray-50 rounded-2xl p-6 mt-6 space-y-4">
                  <h3 className="font-black text-gray-900">
                    Architettura Zero-Knowledge
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Custode utilizza un'architettura zero-knowledge: i tuoi dati
                    vengono crittografati sul dispositivo prima di essere
                    sincronizzati. Nemmeno noi possiamo accedere alle tue
                    password.
                  </p>
                  <div className="flex gap-2 pt-4">
                    <a
                      href="#"
                      className="text-sm font-bold text-[#1E3A8A] hover:underline"
                    >
                      Privacy Policy
                    </a>
                    <span className="text-gray-300">·</span>
                    <a
                      href="#"
                      className="text-sm font-bold text-[#1E3A8A] hover:underline"
                    >
                      Termini di Servizio
                    </a>
                    <span className="text-gray-300">·</span>
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-[#1E3A8A] hover:underline"
                    >
                      Open Source
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componenti Helper

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active
        ? 'bg-[#1E3A8A] text-white shadow-lg'
        : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    {icon}
    <span className="font-bold text-sm">{label}</span>
  </button>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({
  children
}) => <h3 className="text-xl font-black text-gray-900 mb-6">{children}</h3>;

const SettingRow: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  action?: React.ReactNode;
}> = ({ label, value, icon, description, action }) => (
  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3 flex-1">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-600 border border-gray-100 flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 mb-1">{label}</h4>
          <p className="text-sm text-gray-500">{description}</p>
          {!action && (
            <p className="text-sm font-mono text-gray-700 mt-2">{value}</p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  </div>
);

const StatCard: React.FC<{
  label: string;
  value: number;
  color: 'blue' | 'amber' | 'purple';
}> = ({ label, value, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className={`${colors[color]} rounded-2xl p-4 text-center`}>
      <div className="text-3xl font-black">{value}</div>
      <div className="text-xs uppercase tracking-wider mt-1 opacity-80">
        {label}
      </div>
    </div>
  );
};

export default SettingsModal;
