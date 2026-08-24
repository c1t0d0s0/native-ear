import React from 'react';
import { X, Bookmark, Volume2, ArrowRight, Trash2, CheckCircle2 } from 'lucide-react';
import { Sentence } from '../types';
import { SENTENCE_DATABASE } from '../data/sentences';
import { Translations } from '../data/i18n';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: string[];
  onSelectSentence: (sentence: Sentence) => void;
  onRemoveBookmark: (sentenceId: string) => void;
  onPlayPreview: (sentence: Sentence) => void;
  t: Translations;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  bookmarks,
  onSelectSentence,
  onRemoveBookmark,
  onPlayPreview,
  t,
}) => {
  if (!isOpen) return null;

  const bookmarkedSentences = SENTENCE_DATABASE.filter(s => bookmarks.includes(s.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5 text-slate-900 dark:text-white transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.reviewModal.title(bookmarkedSentences.length)}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Sentences */}
        {bookmarkedSentences.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 dark:text-emerald-400 mx-auto opacity-80" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-300">{t.reviewModal.emptyTitle}</p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              {t.reviewModal.emptyDesc}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {bookmarkedSentences.map((sentence) => (
              <div
                key={sentence.id}
                className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50 space-y-2 hover:border-slate-300 dark:hover:border-slate-600 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                      {sentence.level}
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                      {sentence.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onPlayPreview(sentence)}
                      className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700/80 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition"
                      title={t.reviewModal.playPreview}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRemoveBookmark(sentence.id)}
                      className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700/80 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 transition"
                      title={t.reviewModal.remove}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{sentence.english}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">{sentence.japanese}</p>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/40 flex justify-end">
                  <button
                    onClick={() => {
                      onSelectSentence(sentence);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    <span>{t.reviewModal.practiceThis}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
          >
            {t.reviewModal.close}
          </button>
        </div>
      </div>
    </div>
  );
};
