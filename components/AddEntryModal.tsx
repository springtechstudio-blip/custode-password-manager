import React from 'react';
import { X, Key, StickyNote, Terminal } from 'lucide-react';
import { Category } from '../types';

interface AddEntryModalProps {
  onClose: () => void;
  activeTab: Category;
  onAddPassword: () => void;
  onAddNote: () => void;
  onAddDevKey: () => void;
}

const AddEntryModal: React.FC<AddEntryModalProps> = ({
  onClose,
  activeTab,
  onAddPassword,
  onAddNote,
  onAddDevKey
}) => {
  // Determina quali opzioni mostrare in base al tab attivo
  const shouldShowPassword = activeTab === Category.PASSWORDS || activeTab === Category.FAVORITES || activeTab === Category.SECURITY;
  const shouldShowNote = activeTab === Category.NOTES || activeTab === Category.FAVORITES || activeTab === Category.SECURITY;
  const shouldShowDevKey = activeTab === Category.DEVELOPMENT || activeTab === Category.FAVORITES || activeTab === Category.SECURITY;

  // Se siamo in un tab specifico, mostra solo quell'opzione
  const showOnlyPassword = activeTab === Category.PASSWORDS;
  const showOnlyNote = activeTab === Category.NOTES;
  const showOnlyDevKey = activeTab === Category.DEVELOPMENT;

  const handleOptionClick = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-gray-900">
            {showOnlyPassword && 'Aggiungi Password'}
            {showOnlyNote && 'Aggiungi Nota'}
            {showOnlyDevKey && 'Aggiungi Chiave'}
            {!showOnlyPassword && !showOnlyNote && !showOnlyDevKey && 'Cosa vuoi aggiungere?'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {shouldShowPassword && (
            <button
              onClick={() => handleOptionClick(onAddPassword)}
              className="w-full flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-2xl transition-all group"
            >
              <div className="w-12 h-12 bg-[#1E3A8A] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Key size={24} className="text-white" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-bold text-gray-900 text-lg">Nuova Password</h3>
                <p className="text-sm text-gray-600">Aggiungi credenziali di accesso</p>
              </div>
            </button>
          )}

          {shouldShowNote && (
            <button
              onClick={() => handleOptionClick(onAddNote)}
              className="w-full flex items-center gap-4 p-4 bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 rounded-2xl transition-all group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <StickyNote size={24} className="text-white" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-bold text-gray-900 text-lg">Nuova Nota</h3>
                <p className="text-sm text-gray-600">Salva informazioni sensibili</p>
              </div>
            </button>
          )}

          {shouldShowDevKey && (
            <button
              onClick={() => handleOptionClick(onAddDevKey)}
              className="w-full flex items-center gap-4 p-4 bg-gradient-to-br from-green-50 to-emerald-100 hover:from-green-100 hover:to-emerald-200 rounded-2xl transition-all group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Terminal size={24} className="text-white" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-bold text-gray-900 text-lg">Nuova Chiave</h3>
                <p className="text-sm text-gray-600">API keys e credenziali dev</p>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddEntryModal;
