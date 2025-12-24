import React, { useState } from 'react';
import { X, Globe, User, Lock, Key, Folder, Tag } from 'lucide-react';
import { PasswordEntry, PasswordType } from '../types';
import { useVaultContext } from '../contexts';

interface AddPasswordModalProps {
  onClose: () => void;
  onAdd: (entry: Omit<PasswordEntry, 'id' | 'lastModified' | 'isFavorite'>) => Promise<void>;
}

const AddPasswordModal: React.FC<AddPasswordModalProps> = ({ onClose, onAdd }) => {
  const { data: vault } = useVaultContext();
  const customCategories = vault?.customCategories || [];

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    url: '',
    type: PasswordType.LOGIN,
    customCategoryIds: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.password) return;

    setIsSubmitting(true);
    try {
      await onAdd({
        name: formData.name,
        username: formData.username,
        password: formData.password,
        url: formData.url,
        type: formData.type,
        customCategoryIds: formData.customCategoryIds,
        notes: ''
      });
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
          <h2 className="text-2xl font-black">Nuova Password</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nome Servizio */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Globe size={16} />
              Nome Servizio *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="es. Gmail, Netflix, GitHub..."
              className="w-full bg-gray-50 rounded-2xl px-4 py-3 border-2 border-gray-100 focus:border-blue-300 outline-none"
              required
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Globe size={16} />
              URL (opzionale)
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://example.com"
              className="w-full bg-gray-50 rounded-2xl px-4 py-3 border-2 border-gray-100 focus:border-blue-300 outline-none"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <User size={16} />
              Username / Email
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="user@example.com"
              className="w-full bg-gray-50 rounded-2xl px-4 py-3 border-2 border-gray-100 focus:border-blue-300 outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Lock size={16} />
              Password *
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="•••••••••"
              className="w-full bg-gray-50 rounded-2xl px-4 py-3 border-2 border-gray-100 focus:border-blue-300 outline-none font-mono"
              required
            />
          </div>

          {/* Custom Categories */}
          {customCategories.length > 0 && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Tag size={16} />
                Categorie
              </label>
              <div className="flex flex-wrap gap-2">
                {customCategories.map(category => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      const isSelected = formData.customCategoryIds.includes(category.id);
                      setFormData({
                        ...formData,
                        customCategoryIds: isSelected
                          ? formData.customCategoryIds.filter(id => id !== category.id)
                          : [...formData.customCategoryIds, category.id]
                      });
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      formData.customCategoryIds.includes(category.id)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}

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
              disabled={isSubmitting || !formData.name || !formData.password}
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

export default AddPasswordModal;
