import React, { useState } from 'react';
import { X, Eye, EyeOff, Copy, Edit2, Trash2, Check, Globe, User, Lock, ArrowRight, Tag } from 'lucide-react';
import { PasswordEntry, PasswordType } from '../types';
import { useVaultContext } from '../contexts';

interface Props {
  entry: PasswordEntry;
  onClose: () => void;
}

const PasswordDetailModal: React.FC<Props> = ({ entry, onClose }) => {
  const { updatePassword, deletePassword, data: vault } = useVaultContext();
  const customCategories = vault?.customCategories || [];

  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: entry.name,
    username: entry.username,
    password: entry.password,
    url: entry.url || '',
    type: entry.type || PasswordType.LOGIN,
    customCategoryIds: entry.customCategoryIds || []
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(entry.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    await updatePassword(entry.id, {
      name: formData.name,
      username: formData.username,
      password: formData.password,
      url: formData.url,
      type: formData.type,
      customCategoryIds: formData.customCategoryIds,
      icon: formData.url ? `https://www.google.com/s2/favicons?domain=${formData.url}&sz=128` : undefined
    });
    setIsEditing(false);
    onClose(); // Chiudi il modal dopo il salvataggio
  };

  const handleDelete = async () => {
    await deletePassword(entry.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-end md:items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-t-[3rem] md:rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom-20 md:slide-in-from-bottom-0 md:zoom-in-95 duration-500 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#F1F5F9] rounded-[1.5rem] flex items-center justify-center shadow-sm overflow-hidden p-3">
              {entry.icon ? (
                <img src={entry.icon} alt={entry.name} className="w-full h-full object-contain" />
              ) : (
                <span className="text-2xl font-black text-[#1E3A8A]">{entry.name.charAt(0)}</span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-black text-[#0F172A]">{isEditing ? 'Modifica Password' : entry.name}</h2>
              <p className="text-gray-400 text-sm">{isEditing ? 'Aggiorna le informazioni' : entry.username}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-gray-50 rounded-full text-gray-400 hover:text-red-500 transition-colors">
            <X size={24}/>
          </button>
        </div>

        {/* Content */}
        {!isEditing ? (
          <div className="space-y-6 mb-8">
            {/* Username */}
            <div>
              <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-wider">Username</label>
              <div className="bg-[#F8FAFC] rounded-[1.5rem] px-6 py-4 text-gray-900 font-medium">
                {entry.username}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-wider">Password</label>
              <div className="bg-[#F8FAFC] rounded-[1.5rem] p-1 flex items-center">
                <div className="flex-1 px-5 py-3 text-gray-900 font-mono font-medium">
                  {showPassword ? entry.password : '••••••••••••'}
                </div>
                <div className="flex gap-2 pr-2">
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  <button
                    onClick={handleCopy}
                    className={`p-3 rounded-[1.2rem] transition-all ${copied ? 'bg-green-500 text-white' : 'bg-white text-gray-400 hover:text-orange-500'}`}
                  >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {/* URL */}
            {entry.url && (
              <div>
                <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-wider">Sito Web</label>
                <a
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#F8FAFC] rounded-[1.5rem] px-6 py-4 text-blue-600 font-medium flex items-center gap-2 hover:bg-blue-50 transition-colors"
                >
                  <Globe size={16} />
                  {entry.url.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}

            {/* Type */}
            <div>
              <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-wider">Tipo</label>
              <div className="bg-[#F8FAFC] rounded-[1.5rem] px-6 py-4">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  <Tag size={14} />
                  {entry.type || PasswordType.LOGIN}
                </span>
              </div>
            </div>

            {/* Metadata */}
            <div className="flex gap-4 text-xs text-gray-400 pt-4 border-t border-gray-100">
              <div>
                <span className="font-bold uppercase tracking-wider">Creata</span>
                <p className="text-gray-600 font-medium mt-1">
                  {new Date(entry.lastModified).toLocaleDateString('it-IT')}
                </p>
              </div>
              <div>
                <span className="font-bold uppercase tracking-wider">Ultima Modifica</span>
                <p className="text-gray-600 font-medium mt-1">
                  {new Date(entry.lastModified).toLocaleDateString('it-IT')}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Edit Form */
          <div className="space-y-5 mb-8">
            <InputWithIcon
              icon={<Globe size={18}/>}
              placeholder="Nome Servizio"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
            <InputWithIcon
              icon={<User size={18}/>}
              placeholder="Username / Email"
              value={formData.username}
              onChange={e => setFormData({...formData, username: e.target.value})}
            />
            <InputWithIcon
              icon={<Lock size={18}/>}
              placeholder="Password"
              type="password"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
            <InputWithIcon
              icon={<ArrowRight size={18}/>}
              placeholder="URL Sito (opzionale)"
              value={formData.url}
              onChange={e => setFormData({...formData, url: e.target.value})}
            />

            {/* Custom Categories */}
            {customCategories.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Categorie Personalizzate</label>
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
          </div>
        )}

        {/* Actions */}
        {!showDeleteConfirm ? (
          <div className="space-y-3">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full py-5 bg-[#1E3A8A] text-white rounded-[2rem] font-bold text-lg shadow-xl shadow-blue-100 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <Edit2 size={20} />
                  Modifica Password
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-5 bg-red-50 text-red-600 rounded-[2rem] font-bold text-lg flex items-center justify-center gap-3 hover:bg-red-100 active:scale-95 transition-all"
                >
                  <Trash2 size={20} />
                  Elimina Password
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="w-full py-5 bg-[#1E3A8A] text-white rounded-[2rem] font-bold text-lg shadow-xl shadow-blue-100 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <Check size={20} />
                  Salva Modifiche
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: entry.name,
                      username: entry.username,
                      password: entry.password,
                      url: entry.url || '',
                      type: entry.type || PasswordType.LOGIN,
                      customCategoryIds: entry.customCategoryIds || []
                    });
                  }}
                  className="w-full py-5 bg-gray-100 text-gray-700 rounded-[2rem] font-bold text-lg flex items-center justify-center gap-3 hover:bg-gray-200 active:scale-95 transition-all"
                >
                  Annulla
                </button>
              </>
            )}
          </div>
        ) : (
          /* Delete Confirmation */
          <div className="bg-red-50 border-2 border-red-200 rounded-[2rem] p-6 space-y-4">
            <div className="text-center">
              <Trash2 size={48} className="text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-red-900 mb-2">Eliminare questa password?</h3>
              <p className="text-red-700 text-sm">
                Questa azione è permanente e non può essere annullata.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleDelete}
                className="w-full py-4 bg-red-600 text-white rounded-[1.5rem] font-bold flex items-center justify-center gap-3 hover:bg-red-700 active:scale-95 transition-all"
              >
                Conferma Eliminazione
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-4 bg-white text-gray-700 rounded-[1.5rem] font-bold hover:bg-gray-50 active:scale-95 transition-all"
              >
                Annulla
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const InputWithIcon: React.FC<{
  icon: React.ReactNode;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ icon, placeholder, type = "text", value, onChange }) => (
  <div className="relative group">
    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#1E3A8A] transition-colors">
      {icon}
    </div>
    <input
      required
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full bg-[#F8FAFC] rounded-[1.8rem] py-5 pl-14 pr-6 text-gray-900 border-2 border-transparent focus:border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none font-medium transition-all placeholder:text-gray-300"
    />
  </div>
);

export default PasswordDetailModal;
