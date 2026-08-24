import React, { useRef, useEffect } from 'react';
import { Send, Eye, EyeOff, HelpCircle } from 'lucide-react';
import { Sentence } from '../types';

interface DictationInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  onGiveUp: () => void;
  onClear: () => void;
  disabled: boolean;
  sentence: Sentence;
  showHints: boolean;
  onToggleHints: () => void;
}

export const DictationInput: React.FC<DictationInputProps> = ({
  value,
  onChange,
  onSubmit,
  onGiveUp,
  onClear,
  disabled,
  sentence,
  showHints,
  onToggleHints,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled, sentence.id]);

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
    <div className="w-full bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-6 shadow-xl">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <span>聴こえた英文を入力 (Type what you heard)</span>
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleHints}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20"
            title="頭文字ヒントの表示/非表示"
          >
            {showHints ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showHints ? 'ヒントを隠す' : '頭文字ヒント'}</span>
          </button>
        </div>
      </div>

      {/* Hint Banner if active */}
      {showHints && (
        <div className="mb-3 p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-indigo-200 text-xs font-mono tracking-wider flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>ヒント: {renderHints()}</span>
        </div>
      )}

      {/* Textarea Input */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="聴こえた英語をタイプしてください... (例: The meeting will start...)"
          rows={3}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="w-full bg-slate-900/90 text-slate-100 text-base sm:text-lg rounded-xl p-4 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition resize-none disabled:opacity-50 placeholder:text-slate-600 font-sans"
        />

        {value.length > 0 && !disabled && (
          <button
            type="button"
            onClick={onClear}
            className="absolute top-3 right-3 text-xs text-slate-500 hover:text-slate-300 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition"
            title="入力をクリア"
          >
            クリア
          </button>
        )}
      </div>

      {/* Footer: Word count & Action Buttons */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span>単語数: <strong className="text-slate-200">{wordCount}</strong> / {expectedWordCount} words</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onGiveUp}
            disabled={disabled}
            className="px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 transition disabled:opacity-50"
            title="正解を確認する"
          >
            解答を見る
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={disabled || value.trim().length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 active:scale-95 transition"
          >
            <Send className="w-4 h-4" />
            <span>判定する (Submit)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
