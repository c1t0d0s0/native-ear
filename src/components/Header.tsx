import React from 'react';
import { Headphones, Flame, Bookmark, BarChart2, Settings, Moon, Sun, Languages } from 'lucide-react';
import { UserStats } from '../types';
import { Translations, Language } from '../data/i18n';

interface HeaderProps {
  stats: UserStats;
  onOpenStats: () => void;
  onOpenReview: () => void;
  onOpenSettings: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  bookmarkCount: number;
  t: Translations;
  lang: Language;
  onToggleLang: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  onOpenStats,
  onOpenReview,
  onOpenSettings,
  isDark,
  onToggleTheme,
  bookmarkCount,
  t,
  lang,
  onToggleLang,
}) => {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/90 dark:bg-slate-900/80 border-b border-slate-200/90 dark:border-slate-800/80 transition-colors shadow-sm dark:shadow-none">
      <div className="max-w-6xl mx-auto px-2.5 sm:px-6 h-13 sm:h-14 flex items-center justify-between gap-1">
        {/* Brand */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/25 ring-1 ring-white/20 shrink-0">
            <Headphones className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h1 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">{t.header.title}</h1>
              <span className="text-[8px] sm:text-[9px] uppercase font-semibold tracking-wider bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-1 py-0.2 rounded border border-indigo-500/20 dark:border-indigo-500/30 hidden xs:inline-block">
                {t.header.badge}
              </span>
            </div>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 hidden md:block">
              {t.header.subtitle}
            </p>
          </div>
        </div>

        {/* Stats & Actions: Tight and scroll-free on all mobile screens */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Streak */}
          <div
            className="flex items-center gap-1 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-amber-50 dark:bg-slate-800/80 border border-amber-200 dark:border-slate-700/60 text-amber-700 dark:text-amber-400 text-[11px] sm:text-xs font-semibold cursor-pointer hover:bg-amber-100 dark:hover:bg-slate-700/80 transition"
            onClick={onOpenStats}
            title={t.header.streakTitle}
          >
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400 animate-pulse shrink-0" />
            <span className="font-bold">{stats.streakDays}<span className="hidden xs:inline">{lang === 'ja' ? '日' : 'd'}</span></span>
          </div>

          {/* Bookmarks */}
          <button
            onClick={onOpenReview}
            className="relative flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/80 text-[11px] sm:text-xs font-semibold transition cursor-pointer"
            title={t.header.reviewTitle}
          >
            <Bookmark className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="hidden sm:inline">{t.header.review}</span>
            {bookmarkCount > 0 && (
              <span className="px-1 py-0.2 bg-indigo-600 text-white rounded-full text-[9px] font-bold">
                {bookmarkCount}
              </span>
            )}
          </button>

          {/* Stats Button */}
          <button
            onClick={onOpenStats}
            className="p-1.5 sm:p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/80 transition cursor-pointer"
            title={t.header.statsTitle}
          >
            <BarChart2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
          </button>

          {/* Language Switcher */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-0.5 px-1.5 py-1 sm:px-2 sm:py-1.5 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/80 transition text-[11px] font-bold cursor-pointer"
            title={t.header.langSwitch}
          >
            <Languages className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="uppercase text-[10px] sm:text-[11px]">{lang === 'ja' ? 'EN' : 'JA'}</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 sm:p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/80 transition cursor-pointer"
            title={t.header.settingsTitle}
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 dark:text-slate-300" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 sm:p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/80 transition cursor-pointer"
            title={isDark ? t.header.themeDark : t.header.themeLight}
          >
            {isDark ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
