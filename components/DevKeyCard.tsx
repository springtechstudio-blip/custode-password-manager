
import React, { useState } from 'react';
import { Copy, Terminal, ExternalLink, Shield } from 'lucide-react';
import { DevKey, Environment } from '../types';
import { useVaultContext } from '../contexts';

interface Props {
  entry: DevKey;
  onClick?: () => void;
}

const DevKeyCard: React.FC<Props> = ({ entry, onClick }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(entry.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getEnvColor = (env: Environment) => {
    switch(env) {
      case Environment.PRODUCTION: return 'bg-red-50 text-red-600 border-red-100';
      case Environment.STAGING: return 'bg-orange-50 text-orange-600 border-orange-100';
      case Environment.DEVELOPMENT: return 'bg-green-50 text-green-600 border-green-100';
      case Environment.TEST: return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group cursor-pointer hover:border-blue-100 active:scale-[0.98]"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 mr-2">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-bold text-gray-900 truncate">{entry.service}</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider whitespace-nowrap ${getEnvColor(entry.environment)}`}>
              {entry.environment}
            </span>
          </div>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Shield size={10} /> {entry.type}
          </p>
          {entry.endpoint && (
            <p className="text-gray-300 text-[10px] font-medium truncate mt-1">
              {entry.endpoint.replace(/^https?:\/\//, '')}
            </p>
          )}
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-3 flex items-center justify-between group-hover:bg-gray-100/50 transition-colors">
        <code className="monospace text-xs text-gray-500 truncate flex-1 min-w-0 mr-4">
          {entry.key.substring(0, 32)}...
        </code>
        <button
          onClick={handleCopy}
          className={`p-1.5 rounded-lg transition-all flex-shrink-0 ${copied ? 'bg-green-500 text-white' : 'text-indigo-500 hover:bg-white'}`}
        >
          {copied ? <span className="text-[10px] font-bold">✓</span> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );
};

export default DevKeyCard;
