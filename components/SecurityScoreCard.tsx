import React from 'react';
import { getSecurityScoreColor } from '../lib/security/scoreCalculator';

interface Props {
  score: number;
  count: number;
  breakdown?: {
    weakCount: number;
    reusedCount: number;
    oldCount: number;
    expiringKeysCount?: number;
  };
  onShowDetails?: () => void;
}

const SecurityScoreCard: React.FC<Props> = ({ score, count, breakdown, onShowDetails }) => {
  const scoreColor = getSecurityScoreColor(score);

  // Converti hex in RGB per gradiente
  const getGradientClass = () => {
    if (score >= 90) return 'from-green-500 via-emerald-500 to-teal-500';
    if (score >= 75) return 'from-blue-500 via-indigo-500 to-purple-500';
    if (score >= 60) return 'from-amber-500 via-orange-500 to-red-400';
    return 'from-red-500 via-pink-500 to-rose-600';
  };

  return (
    <div className={`relative overflow-hidden bg-gradient-to-r ${getGradientClass()} rounded-[2.5rem] p-8 text-white shadow-xl animate-in zoom-in-95 duration-500`}>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-1">Safety Score</h2>
            <p className="text-white/80 font-medium">{count} Passwords tracked</p>
          </div>

          <div className="relative w-24 h-24">
            {/* Circular Progress SVG */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50" cy="50" r="40"
                fill="transparent"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="10"
              />
              {/* Progress circle */}
              <circle
                cx="50" cy="50" r="40"
                fill="transparent"
                stroke="white"
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - score / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold">{score}%</span>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        {breakdown && (breakdown.weakCount > 0 || breakdown.reusedCount > 0 || breakdown.oldCount > 0) && (
          <div className="flex gap-2 flex-wrap">
            {breakdown.weakCount > 0 && (
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                {breakdown.weakCount} deboli
              </div>
            )}
            {breakdown.reusedCount > 0 && (
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                {breakdown.reusedCount} riutilizzate
              </div>
            )}
            {breakdown.oldCount > 0 && (
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                {breakdown.oldCount} vecchie
              </div>
            )}
          </div>
        )}

        {/* Show Details Button */}
        {onShowDetails && (
          <button
            onClick={onShowDetails}
            className="mt-4 w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm py-3 rounded-2xl font-bold text-sm transition-colors"
          >
            Vedi Dettagli →
          </button>
        )}
      </div>

      {/* Abstract background shapes */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-12 -mb-12"></div>
    </div>
  );
};

export default SecurityScoreCard;
