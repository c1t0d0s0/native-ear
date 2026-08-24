import React from 'react';
import { Headphones, Flame, Bookmark, BarChart2, Settings, Moon, Sun } from 'lucide-react';
import { UserStats } from '../types';

interface HeaderProps {
  stats: UserStats;
  onOpenStats: () => void;
  onOpenReview: () => void;
  onOpenSettings: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  bookmarkCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  onOpenStats,
  onOpenReview,
  onOpenSettings,
  isDark,
  onToggleTheme,
  bookmarkCount,
}) => {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/90 dark:bg-slate-900/80 border-b border-slate-200/90 dark:border-slate-800/80 transition-colors shadow-sm dark:shadow-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <Headphones className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">NativeEar</h1>
              <span className="text-[10px] uppercase font-semibold tracking-wider bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/20 dark:border-indigo-500/30">
                TOEIC Listening
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 hidden sm:block">
              米語ネイティブ発音・ディクテーション特訓
            </p>
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-slate-800/80 border border-amber-200 dark:border-slate-700/60 text-amber-700 dark:text-amber-400 text-xs font-semibold cursor-pointer hover:bg-amber-100 dark:hover:bg-slate-700/80 transition shadow-sm dark:shadow-none"
            onClick={onOpenStats}
            title="連続学習日数"
          >
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400 animate-pulse" />
            <span>{stats.streakDays}日</span>
          </div>

          {/* Bookmarks */}
          <button
            onClick={onOpenReview}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/80 text-xs font-semibold transition shadow-sm dark:shadow-none"
            title="復習・ブックマーク"
          >
            <Bookmark className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">復習</span>
            {bookmarkCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-indigo-600 text-white rounded-full text-[10px] font-bold">
                {bookmarkCount}
              </span>
            )}
          </button>

          {/* Stats Button */}
          <button
            onClick={onOpenStats}
            className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/80 transition shadow-sm dark:shadow-none"
            title="学習データ・成績"
          >
            <BarChart2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/80 transition shadow-sm dark:shadow-none"
            title="設定"
          >
            <Settings className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/80 transition shadow-sm dark:shadow-none"
            title={isDark ? 'ライトモードに切替' : 'ダークモードに切替'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
