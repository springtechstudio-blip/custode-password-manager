import React, { useState } from 'react';
import { X, RefreshCw, Sparkles, User } from 'lucide-react';

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSeed: string;
  onSave: (style: string, seed: string) => Promise<void>;
}

const AVATAR_STYLES = [
  { id: 'avataaars', name: 'Cartoon', description: 'Stile cartoon colorato' },
  { id: 'bottts', name: 'Robot', description: 'Avatar robotici' },
  { id: 'personas', name: 'Persone', description: 'Ritratti realistici' },
  { id: 'lorelei', name: 'Anime', description: 'Stile anime/manga' },
  { id: 'micah', name: 'Illustrato', description: 'Illustrazioni moderne' },
  { id: 'adventurer', name: 'Avventuriero', description: 'Stile avventura' }
];

const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  isOpen,
  onClose,
  currentSeed,
  onSave
}) => {
  const [selectedStyle, setSelectedStyle] = useState('avataaars');
  const [seed, setSeed] = useState(currentSeed);
  const [isSaving, setIsSaving] = useState(false);

  const generateRandomSeed = () => {
    const randomSeed = Math.random().toString(36).substring(2, 15);
    setSeed(randomSeed);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(selectedStyle, seed);
      onClose();
    } catch (error) {
      console.error('Error saving avatar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const previewUrl = `https://api.dicebear.com/7.x/${selectedStyle}/svg?seed=${seed}`;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] text-white p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-black">Cambia Foto Profilo</h2>
            <p className="text-blue-100 text-sm">Personalizza il tuo avatar</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Avatar Preview */}
          <div className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8">
            <div className="relative mb-4">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-32 h-32 rounded-3xl border-4 border-orange-200 bg-white shadow-xl"
              />
              <button
                onClick={generateRandomSeed}
                className="absolute -bottom-2 -right-2 p-3 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition-all hover:scale-110 active:scale-95"
                title="Genera casuale"
              >
                <RefreshCw size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-500">Anteprima del tuo avatar</p>
          </div>

          {/* Style Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-orange-500" />
              Scegli uno Stile
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AVATAR_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-4 rounded-2xl border-2 transition-all text-left ${
                    selectedStyle === style.id
                      ? 'border-[#1E3A8A] bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={`https://api.dicebear.com/7.x/${style.id}/svg?seed=${seed}`}
                      alt={style.name}
                      className="w-10 h-10 rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm truncate">
                        {style.name}
                      </h4>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{style.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Seed */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <User size={16} className="text-orange-500" />
              Personalizza (opzionale)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="es. mio-avatar-unico"
                className="flex-1 bg-gray-50 rounded-2xl px-4 py-3 border-2 border-gray-100 focus:border-blue-300 outline-none"
              />
              <button
                onClick={generateRandomSeed}
                className="px-4 py-3 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 transition-colors flex items-center gap-2 font-bold"
              >
                <RefreshCw size={18} />
                Casuale
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Inserisci un testo personalizzato per creare un avatar unico
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-300 transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-6 py-3 bg-[#1E3A8A] text-white rounded-2xl font-bold hover:bg-[#2952B6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Salvataggio...' : 'Salva Avatar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarPickerModal;
