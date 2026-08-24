import React, { useRef, useEffect } from 'react';
import { Send, Eye, EyeOff, HelpCircle } from 'lucide-react';
import { Sentence } from '../types';
import { Translations } from '../data/i18n';

interface DictationInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  onGiveUp: () => void;
  onClear: () => void;
  sentence: Sentence;
  showHints: boolean;
  onToggleHints: () => void;
  t: Translations;
}

export const DictationInput: React.FC<DictationInputProps> = ({
  value,
  onChange,
  onSubmit,
  onGiveUp,
  onClear,
  sentence,
  showHints,
  onToggleHints,
  t,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [sentence.id]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim().length > 0) {
        onSubmit();
      }
    }
  };

  // Generate word hints (first letter of each word)
  const renderHints = () => {
    const words = sentence.english.split(' ');
    return words
      .map((w) => {
        const first = w.charAt(0);
        const rest = w.slice(1).replace(/[a-zA-Z]/g, '_');
        return `${first}${rest}`;
      })
      .join(' ');
  };

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const expectedWordCount = sentence.english.split(/\s+/).length;

  return (
    <div className="w-full bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-3.5 sm:p-5 shadow-md dark:shadow-xl transition-colors">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <span>{t.dictationInput.label}</span>
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleHints}
            className="flex items-center gap-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 cursor-pointer"
            title={t.dictationInput.hintTitle}
          >
            {showHints ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            <span>{showHints ? t.dictationInput.hintHide : t.dictationInput.hintShow}</span>
          </button>
        </div>
      </div>

      {/* Hint Banner if active */}
      {showHints && (
        <div className="mb-2 p-2.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 rounded-xl text-indigo-900 dark:text-indigo-200 text-xs font-mono tracking-wider flex items-center gap-2">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>{t.dictationInput.hintPrefix} {renderHints()}</span>
        </div>
      )}

      {/* Textarea Input - Always enabled for real-time dictation while listening */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.dictationInput.placeholder}
          rows={2}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="w-full bg-slate-50 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 text-base sm:text-lg rounded-xl p-3 border border-slate-300 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600 font-sans shadow-inner"
        />

        {value.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2.5 right-2.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 p-1.5 rounded-lg bg-slate-200/80 dark:bg-slate-800/80 hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
            title={t.dictationInput.clear}
          >
            {t.dictationInput.clear}
          </button>
        )}
      </div>

      {/* Footer: Word count & Action Buttons */}
      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2">
          <span>{t.dictationInput.wordCount} <strong className="text-slate-900 dark:text-slate-200 font-bold">{wordCount}</strong> / {expectedWordCount} {t.dictationInput.wordsUnit}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onGiveUp}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition cursor-pointer"
            title={t.dictationInput.giveUpTitle}
          >
            {t.dictationInput.giveUp}
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={value.trim().length === 0}
            className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl font-bold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/50 active:scale-95 transition cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t.dictationInput.submit}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
