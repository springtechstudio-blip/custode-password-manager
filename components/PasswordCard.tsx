
import React, { useState } from 'react';
import { Copy, ChevronRight, Check, ShieldCheck } from 'lucide-react';
import { PasswordEntry } from '../types';
import { useVaultContext } from '../contexts';

interface Props {
  entry: PasswordEntry;
  onClick?: () => void;
}

const PasswordCard: React.FC<Props> = ({ entry, onClick }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(entry.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={onClick}
      className="bg-white p-5 rounded-[2.5rem] flex items-center justify-between group hover:bg-[#F8FAFC] transition-all cursor-pointer border border-transparent hover:border-blue-50 shadow-sm active:scale-[0.98]"
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-14 h-14 bg-[#F1F5F9] rounded-[1.2rem] flex items-center justify-center shadow-sm overflow-hidden p-3 relative flex-shrink-0">
          {entry.icon ? (
            <img src={entry.icon} alt={entry.name} className="w-full h-full object-contain" />
          ) : (
            <span className="text-xl font-black text-[#1E3A8A]">{entry.name.charAt(0)}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#0F172A] text-lg truncate">{entry.name}</h3>
          <p className="text-gray-400 text-xs font-medium truncate">{entry.username}</p>
          {entry.url && (
            <p className="text-gray-300 text-[10px] font-medium truncate mt-0.5">
              {entry.url.replace(/^https?:\/\//, '').replace(/^www\./, 'www.')}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        <button
          onClick={handleCopy}
          className={`p-3 rounded-[1.2rem] transition-all shadow-sm flex-shrink-0 ${copied ? 'bg-green-500 text-white' : 'bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-500'}`}
        >
          {copied ? <Check size={20} /> : <Copy size={20} />}
        </button>
        <div className="text-gray-200 group-hover:text-orange-500 group-hover:translate-x-1 transition-all pl-1 flex-shrink-0">
          <ChevronRight size={24} />
        </div>
      </div>
    </div>
  );
};

export default PasswordCard;
