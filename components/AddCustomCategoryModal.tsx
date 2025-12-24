import React, { useState } from 'react';
import { X, Tag } from 'lucide-react';

interface AddCustomCategoryModalProps {
  onClose: () => void;
  onAdd: (name: string) => Promise<void>;
}

const AddCustomCategoryModal: React.FC<AddCustomCategoryModalProps> = ({ onClose, onAdd }) => {
  const [categoryName, setCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    setIsSubmitting(true);
    try {
      await onAdd(categoryName.trim());
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
        className="bg-white w-full md:max-w-md md:rounded-[3rem] rounded-t-[3rem] max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-20 md:slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-black">Nuova Categoria</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nome Categoria */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Tag size={16} />
              Nome Categoria *
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="es. Servizi Streaming, Social Media..."
              className="w-full bg-gray-50 rounded-2xl px-4 py-3 border-2 border-gray-100 focus:border-orange-300 outline-none"
              required
              autoFocus
            />
          </div>

          {/* Info */}
          <div className="bg-orange-50 border-2 border-orange-100 rounded-2xl p-4">
            <p className="text-sm text-orange-800">
              <strong>Suggerimento:</strong> Crea categorie per organizzare meglio le tue password.
              Ad esempio: "Servizi Streaming", "Social Media", "Gaming", ecc.
            </p>
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
              disabled={isSubmitting || !categoryName.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-bold hover:from-orange-600 hover:to-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Salvataggio...' : 'Aggiungi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomCategoryModal;
