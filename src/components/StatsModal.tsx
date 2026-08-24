import React from 'react';
import { X, Trophy, Target, Flame, CheckCircle2, RotateCcw, TrendingUp } from 'lucide-react';
import { Level, UserStats } from '../types';
import { LEVEL_INFO } from '../data/sentences';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  onClearStats: () => void;
}

const LEVELS: Level[] = [500, 600, 700, 800, 900];

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  onClearStats,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">学習データ・成績レポート</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
            <div className="text-xs text-slate-400 flex items-center gap-1 mb-1">
              <Target className="w-3.5 h-3.5 text-indigo-400" />
              総演習数
            </div>
            <div className="text-2xl font-bold text-white">{totalAnswered} <span className="text-xs text-slate-400 font-normal">問</span></div>
          </div>

          <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
            <div className="text-xs text-slate-400 flex items-center gap-1 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              平均一致率
            </div>
            <div className="text-2xl font-bold text-emerald-400">{overallAccuracy}%</div>
          </div>

          <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
            <div className="text-xs text-slate-400 flex items-center gap-1 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
              完全正解数
            </div>
            <div className="text-2xl font-bold text-purple-400">{stats.perfectCount} <span className="text-xs text-slate-400 font-normal">問</span></div>
          </div>

          <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
            <div className="text-xs text-slate-400 flex items-center gap-1 mb-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              継続日数
            </div>
            <div className="text-2xl font-bold text-amber-400">{stats.streakDays} <span className="text-xs text-slate-400 font-normal">日</span></div>
          </div>
        </div>

        {/* Level Breakdown */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            TOEIC スコアレベル別 実績
          </h3>
          <div className="space-y-2.5">
            {LEVELS.map((lvl) => {
              const info = LEVEL_INFO[lvl];
              const levelData = stats.byLevel[lvl] || { answered: 0, totalScore: 0, perfect: 0 };
              const avg = levelData.answered > 0 ? Math.round(levelData.totalScore / levelData.answered) : 0;

              return (
                <div key={lvl} className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/40 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${info.color}`}>{lvl} 点クラス</span>
                      <span className="text-slate-400">({info.subtitle})</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300 font-medium">
                      <span>演習: {levelData.answered}問</span>
                      <span>平均: <strong className={avg >= 80 ? 'text-emerald-400' : 'text-slate-200'}>{avg}%</strong></span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 bg-slate-700/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${avg}%` }}
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
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              直近の回答履歴 (最新10件)
            </h3>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {stats.history.slice(0, 10).map((h) => (
                <div key={h.id} className="flex items-center justify-between p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/40 text-xs">
                  <div className="flex items-center gap-2 truncate mr-2">
                    <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded font-semibold text-[10px]">
                      {h.level}
                    </span>
                    <span className="text-slate-300 truncate font-mono">{h.submittedText || '(未入力)'}</span>
                  </div>
                  <span className={`font-bold shrink-0 ${h.score >= 90 ? 'text-emerald-400' : h.score >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {h.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm('学習データをすべてリセットしますか？')) {
                onClearStats();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition px-2.5 py-1.5 rounded-lg hover:bg-rose-500/10"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>データを初期化</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
