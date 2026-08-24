import React from 'react';
import { Level, UserStats } from '../types';
import { LEVEL_INFO } from '../data/sentences';
import { Award, Zap } from 'lucide-react';

interface LevelSelectorProps {
  currentLevel: Level;
  onSelectLevel: (level: Level) => void;
  stats: UserStats;
}

const LEVELS: Level[] = [500, 600, 700, 800, 900];

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  currentLevel,
  onSelectLevel,
  stats,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          TOEIC 目標スコアレベル
        </span>
        <span className="text-xs text-slate-400">
          発話速度・難易度が自動調整されます
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5">
        {LEVELS.map((lvl) => {
          const info = LEVEL_INFO[lvl];
          const isSelected = currentLevel === lvl;
          const levelStat = stats.byLevel[lvl];
          const answered = levelStat?.answered || 0;
          const avgScore = answered > 0 ? Math.round(levelStat.totalScore / answered) : 0;

          return (
            <button
              key={lvl}
              onClick={() => onSelectLevel(lvl)}
              className={`relative text-left p-3 rounded-xl transition-all duration-200 border ${
                isSelected
                  ? 'bg-slate-800 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              {isSelected && (
                <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-indigo-500 rounded-full ring-2 ring-slate-900" />
              )}
              <div className="flex items-center justify-between mb-1">
                <span className={`text-base font-bold tracking-tight ${info.color}`}>
                  {lvl}
                </span>
                <span className="text-[10px] text-slate-400 font-medium bg-slate-900/60 px-1.5 py-0.5 rounded">
                  {info.target}
                </span>
              </div>
              <div className="text-xs font-medium text-slate-200 truncate">
                {info.subtitle}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-700/40 pt-1.5">
                <span>演習: {answered}問</span>
                {answered > 0 && (
                  <span className="flex items-center gap-0.5 text-emerald-400 font-medium">
                    <Award className="w-3 h-3" />
                    {avgScore}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
