import React, { useEffect } from 'react';
import { CheckCircle2, Bookmark, ArrowRight, Volume2, BookOpen, MessageSquareQuote } from 'lucide-react';
import { Sentence, EvaluationResult } from '../types';
import { Translations } from '../data/i18n';
import confetti from 'canvas-confetti';

interface ResultFeedbackProps {
  sentence: Sentence;
  result: EvaluationResult;
  onNext: () => void;
  onReplay: (speed?: number) => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  t: Translations;
}

export const ResultFeedback: React.FC<ResultFeedbackProps> = ({
  sentence,
  result,
  onNext,
  onReplay,
  isBookmarked,
  onToggleBookmark,
  t,
}) => {
  useEffect(() => {
    if (result.score === 100) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore confetti errors
      }
    }
  }, [result.score]);

  const getScoreBadge = () => {
    if (result.score === 100) {
      return {
        text: t.resultFeedback.badgePerfect,
        color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30'
      };
    } else if (result.score >= 80) {
      return {
        text: t.resultFeedback.badgeGreat,
        color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 border-sky-300 dark:border-sky-500/30'
      };
    } else if (result.score >= 50) {
      return {
        text: t.resultFeedback.badgeGood,
        color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30'
      };
    } else {
      return {
        text: t.resultFeedback.badgePractice,
        color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/30'
      };
    }
  };

  const badge = getScoreBadge();

  return (
    <div className="w-full bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-4 sm:p-6 shadow-lg dark:shadow-2xl space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300 transition-colors">
      {/* Header: Score & Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-1 bg-slate-100 dark:bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">{t.resultFeedback.accuracy}</span>
            <span className={`text-xl font-black ${result.score >= 90 ? 'text-emerald-600 dark:text-emerald-400' : result.score >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {result.score}%
            </span>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${badge.color}`}>
            {badge.text}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Bookmark Button */}
          <button
            onClick={onToggleBookmark}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition shadow-sm dark:shadow-none ${
              isBookmarked
                ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/40'
                : 'bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-slate-200 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700/50'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400' : ''}`} />
            <span>{isBookmarked ? t.resultFeedback.bookmarkSaved : t.resultFeedback.bookmarkSave}</span>
          </button>

          {/* Next Question Button */}
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-500/20 active:scale-95 transition"
          >
            <span>{t.resultFeedback.next}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Diff Analysis Block */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
          <span>{t.resultFeedback.diffTitle}</span>
          <div className="flex items-center gap-3 text-[11px] font-semibold normal-case">
            <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" /> {t.resultFeedback.diffCorrect}
            </span>
            <span className="flex items-center gap-1 text-rose-700 dark:text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500 dark:bg-rose-400" /> {t.resultFeedback.diffWrong}
            </span>
            <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400" /> {t.resultFeedback.diffMissing}
            </span>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-wrap gap-2 text-base sm:text-lg leading-relaxed font-mono">
          {result.tokens.map((token, index) => {
            if (token.type === 'correct') {
              return (
                <span
                  key={index}
                  className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 font-bold"
                >
                  {token.text}
                </span>
              );
            } else if (token.type === 'wrong') {
              return (
                <span
                  key={index}
                  className="px-2 py-0.5 rounded-lg bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 line-through decoration-rose-500 font-bold flex items-center gap-1"
                  title={`Input: ${token.actual} → Expected: ${token.expected}`}
                >
                  <span>{token.actual}</span>
                  <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-bold no-underline ml-1">
                    ({t.resultFeedback.diffExpectedPrefix} {token.expected})
                  </span>
                </span>
              );
            } else if (token.type === 'missing') {
              return (
                <span
                  key={index}
                  className="px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-dashed border-amber-400 dark:border-amber-500/50 font-bold"
                >
                  [{token.expected}]
                </span>
              );
            } else if (token.type === 'extra') {
              return (
                <span
                  key={index}
                  className="px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-700/60 text-slate-700 dark:text-slate-400 line-through border border-slate-300 dark:border-slate-600 font-medium"
                >
                  {token.actual}
                </span>
              );
            }
            return null;
          })}
        </div>
      </div>

      {/* Full Sentence & Audio Replay Section */}
      <div className="p-4 bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/20 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {t.resultFeedback.modelSentenceTitle}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onReplay(1.0)}
              className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-indigo-600/30 hover:bg-indigo-50 dark:hover:bg-indigo-600/50 border border-indigo-200 dark:border-indigo-500/30 rounded-lg text-xs font-semibold text-indigo-700 dark:text-indigo-200 transition shadow-sm dark:shadow-none"
              title="1.0x"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{t.resultFeedback.speedNormal}</span>
            </button>
            <button
              onClick={() => onReplay(0.8)}
              className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-indigo-600/30 hover:bg-indigo-50 dark:hover:bg-indigo-600/50 border border-indigo-200 dark:border-indigo-500/30 rounded-lg text-xs font-semibold text-indigo-700 dark:text-indigo-200 transition shadow-sm dark:shadow-none"
              title="0.8x"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{t.resultFeedback.speedSlow}</span>
            </button>
          </div>
        </div>
        <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-wide">
          {sentence.english}
        </p>
        <p className="text-sm text-slate-700 dark:text-slate-300 pt-1 border-t border-indigo-200/60 dark:border-slate-700/40">
          {sentence.japanese}
        </p>
      </div>

      {/* TOEIC Tips & Key Vocab */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Vocabulary Breakdown */}
        {sentence.vocabNotes && sentence.vocabNotes.length > 0 && (
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              {t.resultFeedback.vocabTitle}
            </span>
            <div className="space-y-1 text-xs">
              {sentence.vocabNotes.map((vocab, i) => (
                <div key={i} className="flex items-baseline justify-between gap-2 py-0.5">
                  <span className="font-bold text-slate-900 dark:text-slate-200">{vocab.word}</span>
                  <span className="text-slate-600 dark:text-slate-400 text-right font-medium">{vocab.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grammar & Linking Tips */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
          <span className="text-xs font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1">
            <MessageSquareQuote className="w-3.5 h-3.5" />
            {t.resultFeedback.tipsTitle}
          </span>
          {sentence.grammarTip && (
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong className="text-slate-900 dark:text-slate-200 font-semibold">{t.resultFeedback.grammarLabel} </strong>
              {sentence.grammarTip}
            </p>
          )}
          {sentence.linkingTip && (
            <p className="text-xs text-indigo-900 dark:text-indigo-300 leading-relaxed bg-indigo-50 dark:bg-indigo-500/10 p-2 rounded-lg border border-indigo-200 dark:border-indigo-500/20 font-medium">
              <strong className="text-indigo-800 dark:text-indigo-200 font-bold">{t.resultFeedback.linkingLabel} </strong>
              {sentence.linkingTip}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
