import React, { useState } from 'react';
import { X, Terminal, Calendar, Layers, FileText } from 'lucide-react';
import { Environment, DevKey } from '../types';

interface AddDevKeyModalProps {
  onClose: () => void;
  onAdd: (entry: Omit<DevKey, 'id' | 'isFavorite'>) => Promise<void>;
}

const AddDevKeyModal: React.FC<AddDevKeyModalProps> = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    service: '',
    environment: Environment.DEVELOPMENT,
    key: '',
    description: '',
    expiryDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.service || !formData.key) return;

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
        <div className="sticky top-0 bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] text-white p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-black">Nuova Chiave Development</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Service Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Terminal size={16} />
              Nome Servizio *
            </label>
            <input
              type="text"
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              placeholder="es. OpenAI API, Stripe, AWS..."
              className="w-full bg-gray-50 rounded-2xl px-4 py-3 border-2 border-gray-100 focus:border-blue-200 outline-none"
              required
            />
          </div>

          {/* Environment */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Layers size={16} />
              Environment *
            </label>
            <select
              value={formData.environment}
              onChange={(e) =>
                setFormData({ ...formData, environment: e.target.value as Environment })
              }
              className="w-full bg-gray-50 rounded-2xl px-4 py-3 border-2 border-gray-100 focus:border-blue-200 outline-none"
            >
              <option value={Environment.PRODUCTION}>Production</option>
              <option value={Environment.STAGING}>Staging</option>
              <option value={Environment.DEVELOPMENT}>Development</option>
              <option value={Environment.TEST}>Test</option>
            </select>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Terminal size={16} />
              API Key / Token *
            </label>
            <textarea
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              placeholder="sk_test_..."
              className="w-full bg-gray-50 rounded-2xl px-4 py-3 border-2 border-gray-100 focus:border-blue-200 outline-none font-mono text-sm h-32"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <FileText size={16} />
              Descrizione (opzionale)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Aggiungi note o dettagli..."
              className="w-full bg-gray-50 rounded-2xl px-4 py-3 border-2 border-gray-100 focus:border-blue-200 outline-none h-24"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Calendar size={16} />
              Data di Scadenza (opzionale)
            </label>
            <input
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className="w-full bg-gray-50 rounded-2xl px-4 py-3 border-2 border-gray-100 focus:border-blue-200 outline-none"
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
              disabled={isSubmitting || !formData.service || !formData.key}
              className="flex-1 px-6 py-3 bg-[#1E3A8A] text-white rounded-2xl font-bold hover:bg-[#2952B6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Salvataggio...' : 'Salva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDevKeyModal;
