import React, { useState } from 'react';
import { X, Terminal, Copy, Edit2, Trash2, Eye, EyeOff, Calendar, Layers } from 'lucide-react';
import { DevKey, Environment } from '../types';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface DevKeyDetailModalProps {
  entry: DevKey;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<DevKey>) => void;
  onDelete: (id: string) => void;
}

const DevKeyDetailModal: React.FC<DevKeyDetailModalProps> = ({
  entry,
  onClose,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editForm, setEditForm] = useState({
    service: entry.service,
    environment: entry.environment,
    key: entry.key,
    description: entry.description || '',
    expiryDate: entry.expiryDate || ''
  });

  const handleSave = () => {
    onUpdate(entry.id, editForm);
    setIsEditing(false);
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    // TODO: mostra toast "Copiato!"
  };

  const getEnvColor = (env: Environment) => {
    switch (env) {
      case Environment.PRODUCTION:
        return 'bg-red-500';
      case Environment.STAGING:
        return 'bg-orange-500';
      case Environment.DEVELOPMENT:
        return 'bg-blue-500';
      case Environment.TEST:
        return 'bg-gray-500';
    }
  };

  const isExpiring = entry.expiryDate
    ? new Date(entry.expiryDate).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000
    : false;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-end md:items-center justify-center p-0 md:p-4">
        <div className="bg-white w-full md:max-w-2xl md:rounded-[3rem] rounded-t-[3rem] max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-20 md:slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] text-white p-6 flex items-start justify-between z-10">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.service}
                  onChange={(e) =>
                    setEditForm({ ...editForm, service: e.target.value })
                  }
                  className="bg-white/20 backdrop-blur-sm text-white text-2xl font-black rounded-2xl px-4 py-2 w-full border-2 border-white/30 focus:border-white outline-none"
                />
              ) : (
                <h2 className="text-2xl font-black mb-2">{entry.service}</h2>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`${getEnvColor(
                    entry.environment
                  )} text-white text-xs font-bold px-3 py-1 rounded-full uppercase`}
                >
                  {entry.environment}
                </span>
                {isExpiring && (
                  <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Calendar size={12} />
                    In scadenza
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Actions Bar */}
          <div className="flex items-center justify-end gap-2 p-4 border-b border-gray-100 bg-gray-50">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-300 transition-colors"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl font-bold text-sm hover:bg-[#2952B6] transition-colors"
                  >
                    Salva
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 bg-blue-50 text-[#1E3A8A] rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </>
              )}
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Environment (in edit mode) */}
            {isEditing && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Layers size={16} />
                  Environment
                </label>
                <select
                  value={editForm.environment}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      environment: e.target.value as Environment
                    })
                  }
                  className="w-full bg-gray-50 rounded-2xl px-4 py-3 border-2 border-gray-100 focus:border-blue-200 outline-none"
                >
                  <option value={Environment.PRODUCTION}>Production</option>
                  <option value={Environment.STAGING}>Staging</option>
                  <option value={Environment.DEVELOPMENT}>Development</option>
                  <option value={Environment.TEST}>Test</option>
                </select>
              </div>
            )}

            {/* API Key */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Terminal size={16} />
                API Key / Token
              </label>
              {isEditing ? (
                <textarea
                  value={editForm.key}
                  onChange={(e) =>
                    setEditForm({ ...editForm, key: e.target.value })
                  }
                  className="w-full bg-gray-50 rounded-2xl px-4 py-3 border-2 border-gray-100 focus:border-blue-200 outline-none font-mono text-sm h-32"
                />
              ) : (
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400 font-bold uppercase">
                      Token Crittografato
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowKey(!showKey)}
                        className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        {showKey ? (
                          <EyeOff size={16} className="text-gray-600" />
                        ) : (
                          <Eye size={16} className="text-gray-600" />
                        )}
                      </button>
                      <button
                        onClick={() => handleCopy(entry.key)}
                        className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Copy size={16} className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <p className="font-mono text-sm text-gray-900 break-all">
                    {showKey ? entry.key : '•'.repeat(40)}
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Descrizione (opzionale)
              </label>
              {isEditing ? (
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  placeholder="Aggiungi note o dettagli..."
                  className="w-full bg-gray-50 rounded-2xl px-4 py-3 border-2 border-gray-100 focus:border-blue-200 outline-none h-24"
                />
              ) : entry.description ? (
                <p className="text-gray-700 bg-gray-50 rounded-2xl p-4">
                  {entry.description}
                </p>
              ) : (
                <p className="text-gray-400 text-sm italic">
                  Nessuna descrizione
                </p>
              )}
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar size={16} />
                Data di Scadenza
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={editForm.expiryDate}
                  onChange={(e) =>
                    setEditForm({ ...editForm, expiryDate: e.target.value })
                  }
                  className="w-full bg-gray-50 rounded-2xl px-4 py-3 border-2 border-gray-100 focus:border-blue-200 outline-none"
                />
              ) : entry.expiryDate ? (
                <p className="text-gray-700">
                  {new Date(entry.expiryDate).toLocaleDateString('it-IT', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              ) : (
                <p className="text-gray-400 text-sm italic">Non impostata</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => onDelete(entry.id)}
        itemName={entry.service}
        itemType="chiave"
      />
    </>
  );
};

export default DevKeyDetailModal;
