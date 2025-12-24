import React, { useState } from 'react';
import { X, StickyNote, Edit2, Trash2, Copy } from 'lucide-react';
import { SecureNote } from '../types';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface NoteDetailModalProps {
  entry: SecureNote;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<SecureNote>) => void;
  onDelete: (id: string) => void;
}

const NoteDetailModal: React.FC<NoteDetailModalProps> = ({
  entry,
  onClose,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editForm, setEditForm] = useState({
    title: entry.title,
    content: entry.content,
    category: entry.category || ''
  });

  const handleSave = () => {
    onUpdate(entry.id, editForm);
    setIsEditing(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(entry.content);
    // TODO: mostra toast "Copiato!"
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-end md:items-center justify-center p-0 md:p-4">
        <div className="bg-white w-full md:max-w-3xl md:rounded-[3rem] rounded-t-[3rem] max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-20 md:slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-br from-amber-500 to-orange-500 text-white p-6 flex items-start justify-between z-10">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  className="bg-white/20 backdrop-blur-sm text-white text-2xl font-black rounded-2xl px-4 py-2 w-full border-2 border-white/30 focus:border-white outline-none"
                />
              ) : (
                <h2 className="text-2xl font-black mb-2">{entry.title}</h2>
              )}
              <p className="text-amber-100 text-sm">
                Creata il{' '}
                {new Date(entry.createdAt).toLocaleDateString('it-IT', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
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
                    className="px-4 py-2 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-colors"
                  >
                    Salva
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleCopy}
                    className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    <Copy size={18} />
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-colors"
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
          <div className="p-6">
            {isEditing ? (
              <div className="space-y-4">
                {/* Categoria */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Categoria (opzionale)
                  </label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                    placeholder="es. Codici di Recupero, Licenze Software..."
                    className="w-full bg-gray-50 rounded-2xl px-4 py-3 border-2 border-gray-100 focus:border-amber-200 outline-none"
                  />
                </div>

                {/* Contenuto */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <StickyNote size={16} />
                    Contenuto
                  </label>
                  <textarea
                    value={editForm.content}
                    onChange={(e) =>
                      setEditForm({ ...editForm, content: e.target.value })
                    }
                    placeholder="Scrivi qui le tue informazioni sensibili..."
                    className="w-full bg-gray-50 rounded-2xl px-4 py-3 border-2 border-gray-100 focus:border-amber-200 outline-none font-mono text-sm leading-relaxed min-h-[400px]"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Categoria */}
                {entry.category && (
                  <div className="inline-block bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-sm font-bold">
                    {entry.category}
                  </div>
                )}

                {/* Contenuto */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <pre className="font-mono text-sm text-gray-900 leading-relaxed whitespace-pre-wrap break-words">
                    {entry.content}
                  </pre>
                </div>

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-100">
                  <span>
                    Creata: {new Date(entry.createdAt).toLocaleString('it-IT')}
                  </span>
                  <span>{entry.content.length} caratteri</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => onDelete(entry.id)}
        itemName={entry.title}
        itemType="nota"
      />
    </>
  );
};

export default NoteDetailModal;
