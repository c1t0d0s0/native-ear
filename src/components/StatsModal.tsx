import React from 'react';
import { X, Trophy, Target, Flame, CheckCircle2, RotateCcw, TrendingUp } from 'lucide-react';
import { Level, UserStats } from '../types';
import { LEVEL_INFO } from '../data/sentences';
import { Translations } from '../data/i18n';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  onClearStats: () => void;
  t: Translations;
}

const LEVELS: Level[] = [300, 400, 500, 600, 700, 800, 900];

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  onClearStats,
  t,
}) => {
  if (!isOpen) return null;

  const totalAnswered = stats.totalAnswered;
  const overallAccuracy = totalAnswered > 0
    ? Math.round(
        (LEVELS.reduce((acc, lvl) => acc + (stats.byLevel[lvl]?.totalScore || 0), 0) /
          totalAnswered)
      )
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6 text-slate-900 dark:text-white transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.statsModal.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-1 mb-1">
              <Target className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              {t.statsModal.totalAnswered}
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalAnswered} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">{t.statsModal.questionsUnit}</span></div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-1 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              {t.statsModal.overallAccuracy}
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{overallAccuracy}%</div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-1 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              {t.statsModal.perfectCount}
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.perfectCount} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">{t.statsModal.questionsUnit}</span></div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-1 mb-1">
              <Flame className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              {t.statsModal.streakDays}
            </div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.streakDays} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">{t.statsModal.daysUnit}</span></div>
          </div>
        </div>

        {/* Level Breakdown */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
            {t.statsModal.levelBreakdownTitle}
          </h3>
          <div className="space-y-2.5">
            {LEVELS.map((lvl) => {
              const info = LEVEL_INFO[lvl];
              const levelData = stats.byLevel[lvl] || { answered: 0, totalScore: 0, perfect: 0 };
              const avg = levelData.answered > 0 ? Math.round(levelData.totalScore / levelData.answered) : 0;
              const levelSub = t.levelSelector.levelSubtitles[lvl] || info.subtitle;

              return (
                <div key={lvl} className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/40 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${info.color}`}>{lvl}</span>
                      <span className="text-slate-600 dark:text-slate-400 font-medium">({levelSub})</span>
                    </div>
                    <div className="flex items-center gap-3 font-semibold text-slate-700 dark:text-slate-300">
                      <span>{t.statsModal.practicedLabel(levelData.answered)}</span>
                      <span>{t.statsModal.perfectLabel(levelData.perfect)}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{t.statsModal.avgScoreLabel(avg)}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, avg)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent History */}
        {stats.history.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
              {t.statsModal.recentHistoryTitle}
            </h3>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {stats.history.slice(0, 10).map((h) => (
                <div key={h.id} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700/40 text-xs">
                  <div className="flex items-center gap-2 truncate mr-2">
                    <span className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded font-bold text-[10px]">
                      {h.level}
                    </span>
                    <span className="text-slate-800 dark:text-slate-300 truncate font-mono">{h.submittedText || t.statsModal.notSubmitted}</span>
                  </div>
                  <span className={`font-bold shrink-0 ${h.score >= 90 ? 'text-emerald-600 dark:text-emerald-400' : h.score >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {h.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm(t.statsModal.resetConfirm)) {
                onClearStats();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition px-2.5 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.statsModal.resetStats}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
          >
            {t.statsModal.close}
          </button>
        </div>
      </div>
    </div>
  );
};
