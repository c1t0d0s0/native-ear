import React from 'react';
import { Level, UserStats } from '../types';
import { LEVEL_INFO } from '../data/sentences';
import { Award, Zap } from 'lucide-react';
import { Translations } from '../data/i18n';

interface LevelSelectorProps {
  currentLevel: Level;
  onSelectLevel: (level: Level) => void;
  stats: UserStats;
  t: Translations;
}

const LEVELS: Level[] = [300, 400, 500, 600, 700, 800, 900];

const SHORT_TAGS: Record<Level, { ja: string; en: string }> = {
  300: { ja: '入門', en: 'Start' },
  400: { ja: '初級', en: 'Elem' },
  500: { ja: '基礎', en: 'Basic' },
  600: { ja: '日常', en: 'Daily' },
  700: { ja: '実務', en: 'Biz' },
  800: { ja: '高度', en: 'Adv' },
  900: { ja: '最速', en: 'Top' },
};

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  currentLevel,
  onSelectLevel,
  stats,
  t,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1 sm:mb-1.5 px-0.5">
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1 sm:gap-1.5">
          <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-600 dark:text-indigo-400" />
          {t.levelSelector.title}
        </span>
        <span className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 font-medium hidden sm:inline">
          {t.levelSelector.subtitle}
        </span>
      </div>

      {/* 7-Level Single-Row Grid across all viewports */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {LEVELS.map((lvl) => {
          const info = LEVEL_INFO[lvl];
          const isSelected = currentLevel === lvl;
          const levelStat = stats.byLevel[lvl];
          const answered = levelStat?.answered || 0;
          const avgScore = answered > 0 ? Math.round(levelStat.totalScore / answered) : 0;
          const levelSubtitle = t.levelSelector.levelSubtitles[lvl] || info.subtitle;
          const levelDesc = t.levelSelector.levelDescriptions[lvl] || info.description;
          const shortTag = SHORT_TAGS[lvl] ? (t.header.review === '復習' ? SHORT_TAGS[lvl].ja : SHORT_TAGS[lvl].en) : '';

          return (
            <button
              key={lvl}
              onClick={() => onSelectLevel(lvl)}
              title={`${lvl} - ${levelSubtitle}\n${levelDesc}`}
              className={`relative text-center sm:text-left p-1 sm:p-2.5 rounded-lg sm:rounded-xl transition-all duration-200 border cursor-pointer flex flex-col justify-between min-h-[42px] sm:min-h-[72px] ${
                isSelected
                  ? 'bg-indigo-50/90 dark:bg-slate-800 border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/30 shadow-md shadow-indigo-500/10'
                  : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm dark:shadow-none'
              }`}
            >
              {isSelected && (
                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-indigo-600 dark:bg-indigo-500 rounded-full ring-1 sm:ring-2 ring-white dark:ring-slate-900" />
              )}
              <div>
                <div className="flex items-center justify-center sm:justify-between mb-0 sm:mb-0.5">
                  <span className={`text-xs sm:text-base font-extrabold tracking-tight ${info.color}`}>
                    {lvl}
                  </span>
                  <span className="text-[9px] text-slate-700 dark:text-slate-300 font-semibold bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/40 px-1 py-0.2 rounded hidden sm:inline-block">
                    {t.levelSelector.target(info.target)}
                  </span>
                </div>
                {/* Mobile compact label */}
                <div className="text-[8px] font-bold text-slate-600 dark:text-slate-400 sm:hidden leading-none mt-0.5">
                  {shortTag}
                </div>
                {/* Desktop detailed label */}
                <div className="hidden sm:flex text-[10px] sm:text-[11px] font-semibold text-slate-800 dark:text-slate-200 leading-snug break-words min-h-[26px] items-center">
                  {levelSubtitle}
                </div>
              </div>
              {/* Desktop practice info */}
              <div className="mt-1.5 hidden sm:flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700/40 pt-1">
                <span>{t.levelSelector.practiced(answered)}</span>
                {answered > 0 && (
                  <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold">
                    <Award className="w-3 h-3" />
                    {t.levelSelector.avgScore(avgScore)}
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
