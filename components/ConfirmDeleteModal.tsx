import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType: 'password' | 'nota' | 'chiave' | 'folder';
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Icon e Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="bg-red-50 w-16 h-16 rounded-[1.5rem] flex items-center justify-center">
            <AlertTriangle className="text-red-500" size={32} />
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Contenuto */}
        <div className="mb-8">
          <h2 className="text-2xl font-black text-gray-900 mb-3">
            Conferma Eliminazione
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Stai per eliminare definitivamente la {itemType}:
          </p>
          <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-4 mb-4">
            <p className="font-bold text-gray-900 text-center break-words">
              "{itemName}"
            </p>
          </div>
          <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl p-4">
            <p className="text-sm text-amber-900 font-medium">
              ⚠️ Questa azione è irreversibile. I dati eliminati non possono essere recuperati.
            </p>
          </div>
        </div>

        {/* Azioni */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-[1.5rem] font-bold hover:bg-gray-200 transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-4 bg-red-500 text-white rounded-[1.5rem] font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
          >
            Elimina
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
