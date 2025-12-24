
import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Copy, Shield, Check } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const GeneratorModal: React.FC<Props> = ({ onClose }) => {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let chars = lower;
    if (includeUppercase) chars += upper;
    if (includeNumbers) chars += numbers;
    if (includeSymbols) chars += symbols;
    
    if (chars === "") return;
    
    let generated = '';
    for (let i = 0; i < length; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
  };

  useEffect(() => {
    generatePassword();
  }, [length, includeUppercase, includeNumbers, includeSymbols]);

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStrength = () => {
    if (length < 10) return { label: 'Weak', color: 'bg-red-500', shadow: 'shadow-red-200' };
    if (length < 14) return { label: 'Medium', color: 'bg-orange-500', shadow: 'shadow-orange-200' };
    if (length < 18) return { label: 'Strong', color: 'bg-green-500', shadow: 'shadow-green-200' };
    return { label: 'Elite', color: 'bg-indigo-600', shadow: 'shadow-indigo-200' };
  };

  const strength = getStrength();

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Generator</h2>
          <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="bg-[#F8F9FA] p-8 rounded-[2rem] mb-8 relative border border-gray-100">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
               <div className={`w-2.5 h-2.5 rounded-full ${strength.color} animate-pulse`}></div>
               <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{strength.label} Security</span>
             </div>
             <button onClick={generatePassword} className="text-orange-500 hover:rotate-180 transition-transform duration-500 p-1">
               <RefreshCw size={22} />
             </button>
          </div>
          <p className="monospace text-2xl font-bold text-gray-900 break-all select-all leading-tight">
            {password}
          </p>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">Length</span>
              <span className="bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full font-bold">{length}</span>
            </div>
            <input 
              type="range" 
              min="8" 
              max="64" 
              value={length} 
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#1E3A8A]"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
             <ToggleOption label="Uppercase Letters" active={includeUppercase} onToggle={() => setIncludeUppercase(!includeUppercase)} />
             <ToggleOption label="Numbers" active={includeNumbers} onToggle={() => setIncludeNumbers(!includeNumbers)} />
             <ToggleOption label="Symbols" active={includeSymbols} onToggle={() => setIncludeSymbols(!includeSymbols)} />
          </div>

          <div className="flex gap-4 pt-4">
             <button 
               onClick={handleCopy}
               className="flex-1 py-5 bg-[#1E3A8A] text-white rounded-[2rem] font-bold text-lg shadow-xl shadow-blue-100 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
             >
               {copied ? <><Check size={22} /> Copied</> : <><Copy size={22} /> Copy</>}
             </button>
             <button 
               onClick={onClose}
               className="px-8 py-5 bg-gray-100 text-gray-900 rounded-[2rem] font-bold text-lg hover:bg-gray-200 transition-all"
             >
               Use
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ToggleOption: React.FC<{ label: string, active: boolean, onToggle: () => void }> = ({ label, active, onToggle }) => (
  <div className="flex items-center justify-between p-5 bg-gray-50 rounded-[1.5rem] border border-transparent hover:border-gray-100 transition-all">
    <span className="text-sm font-bold text-gray-700">{label}</span>
    <button 
      onClick={onToggle}
      className={`w-14 h-7 rounded-full transition-all relative ${active ? 'bg-orange-500' : 'bg-gray-200'}`}
    >
      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${active ? 'translate-x-8' : 'translate-x-1'}`}></div>
    </button>
  </div>
);

export default GeneratorModal;
