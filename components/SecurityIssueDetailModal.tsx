import React from 'react';
import { X, AlertTriangle, Key, Clock, RefreshCw, ArrowRight } from 'lucide-react';
import type { PasswordEntry } from '../types';

interface SecurityIssueDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  issueType: 'weak' | 'reused' | 'old' | 'compromised';
  passwords: PasswordEntry[];
  onPasswordClick: (password: PasswordEntry) => void;
}

const SecurityIssueDetailModal: React.FC<SecurityIssueDetailModalProps> = ({
  isOpen,
  onClose,
  issueType,
  passwords,
  onPasswordClick
}) => {
  if (!isOpen) return null;

  const getIssueConfig = () => {
    switch (issueType) {
      case 'weak':
        return {
          title: 'Password Deboli',
          icon: <Key className="text-orange-500" size={32} />,
          bgColor: 'bg-orange-50',
          description:
            'Queste password non rispettano i criteri di sicurezza. Sono troppo corte, semplici o prevedibili.',
          suggestion:
            'Usa almeno 12 caratteri con maiuscole, minuscole, numeri e simboli.',
          color: 'orange'
        };
      case 'reused':
        return {
          title: 'Password Riutilizzate',
          icon: <RefreshCw className="text-blue-500" size={32} />,
          bgColor: 'bg-blue-50',
          description:
            'Queste password sono usate per più servizi. Se una viene compromessa, tutti gli account sono a rischio.',
          suggestion:
            'Crea password uniche per ogni servizio. Usa il generatore integrato.',
          color: 'blue'
        };
      case 'old':
        return {
          title: 'Password Non Aggiornate',
          icon: <Clock className="text-gray-500" size={32} />,
          bgColor: 'bg-gray-50',
          description:
            'Queste password non vengono modificate da oltre 90 giorni. È buona pratica aggiornarle periodicamente.',
          suggestion:
            'Aggiorna le password critiche ogni 3-6 mesi per maggiore sicurezza.',
          color: 'gray'
        };
      case 'compromised':
        return {
          title: '🚨 Password Compromesse',
          icon: <AlertTriangle className="text-red-500" size={32} />,
          bgColor: 'bg-red-50',
          description:
            'Queste password sono apparse in data breach noti. DEVONO essere cambiate immediatamente!',
          suggestion:
            'Cambia subito queste password e attiva l\'autenticazione a due fattori dove possibile.',
          color: 'red'
        };
    }
  };

  const config = getIssueConfig();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full md:max-w-2xl md:rounded-[3rem] rounded-t-[3rem] max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-20 md:slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className={`${config.bgColor} w-14 h-14 rounded-2xl flex items-center justify-center`}>
              {config.icon}
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                {config.title}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {passwords.length}{' '}
                {passwords.length === 1 ? 'password trovata' : 'password trovate'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Descrizione */}
        <div className="p-6 border-b border-gray-100">
          <p className="text-gray-700 leading-relaxed mb-4">
            {config.description}
          </p>
          <div className={`bg-${config.color}-50 border-2 border-${config.color}-100 rounded-2xl p-4`}>
            <p className="text-sm font-medium text-gray-900 flex items-start gap-2">
              <span className="text-lg">💡</span>
              <span>{config.suggestion}</span>
            </p>
          </div>
        </div>

        {/* Lista Password */}
        <div className="p-6">
          <div className="space-y-3">
            {passwords.map((password) => (
              <div
                key={password.id}
                onClick={() => {
                  onPasswordClick(password);
                  onClose();
                }}
                className="bg-gray-50 hover:bg-gray-100 rounded-2xl p-4 cursor-pointer transition-all group border border-transparent hover:border-gray-200"
              >
                <div className="flex items-center gap-4">
                  {/* Icon/Logo */}
                  <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {password.icon ? (
                      <img
                        src={password.icon}
                        alt={password.name}
                        className="w-8 h-8"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (
                            e.target as HTMLImageElement
                          ).nextElementSibling!.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div
                      className={`${
                        password.icon ? 'hidden' : ''
                      } w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm`}
                    >
                      {password.name.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 truncate">
                      {password.name}
                    </h4>
                    <p className="text-sm text-gray-500 truncate">
                      {password.username}
                    </p>
                  </div>

                  {/* Arrow */}
                  <ArrowRight
                    size={20}
                    className="text-gray-300 group-hover:text-[#1E3A8A] transition-colors"
                  />
                </div>

                {/* Timestamp se "old" */}
                {issueType === 'old' && (
                  <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-400 flex items-center gap-2">
                    <Clock size={12} />
                    <span>
                      Ultima modifica:{' '}
                      {new Date(password.lastModified).toLocaleDateString('it-IT')}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer con azione */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6">
          <button
            onClick={onClose}
            className="w-full py-4 bg-[#1E3A8A] text-white rounded-2xl font-bold hover:bg-[#2952B6] transition-colors"
          >
            Ho Capito
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityIssueDetailModal;
