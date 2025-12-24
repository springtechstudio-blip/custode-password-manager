import React, { useState } from 'react';
import { X, StickyNote, FileText } from 'lucide-react';

interface AddNoteModalProps {
  onClose: () => void;
  onAdd: (entry: { title: string; content: string; category: string }) => Promise<void>;
}

const AddNoteModal: React.FC<AddNoteModalProps> = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;

    setIsSubmitting(true);
    try {
      await onAdd(formData);
      onClose();
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full md:max-w-2xl md:rounded-[3rem] rounded-t-[3rem] max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-20 md:slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-amber-500 to-orange-500 text-white p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-black">Nuova Nota Sicura</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Titolo */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <FileText size={16} />
              Titolo *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="es. Codici di Recupero, Licenze Software..."
              className="w-full bg-gray-50 rounded-2xl px-4 py-3 border-2 border-gray-100 focus:border-amber-200 outline-none"
              required
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Categoria (opzionale)
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="es. Personale, Lavoro, Backup..."
              className="w-full bg-gray-50 rounded-2xl px-4 py-3 border-2 border-gray-100 focus:border-amber-200 outline-none"
            />
          </div>

          {/* Contenuto */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <StickyNote size={16} />
              Contenuto *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Scrivi qui le tue informazioni sensibili..."
              className="w-full bg-gray-50 rounded-2xl px-4 py-3 border-2 border-gray-100 focus:border-amber-200 outline-none font-mono text-sm leading-relaxed min-h-[300px]"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-300 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title || !formData.content}
              className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-2xl font-bold hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Salvataggio...' : 'Salva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNoteModal;
