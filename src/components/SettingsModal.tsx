import React from 'react';
import { X, Settings, Volume2, User, Check } from 'lucide-react';
import { VoiceSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: VoiceSettings;
  onUpdateSettings: (newSettings: Partial<VoiceSettings>) => void;
  onTestVoice: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onTestVoice,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">アプリ・音声設定</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voice Gender Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            標準ネイティブ発話者 (Native Voice)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onUpdateSettings({ gender: 'female' })}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition ${
                settings.gender === 'female'
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-2 ring-indigo-500/20'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-indigo-400" />
                <div className="text-left">
                  <div className="text-xs font-bold text-white">女性ネイティブ</div>
                  <div className="text-[10px] text-slate-400">US Female Voice</div>
                </div>
              </div>
              {settings.gender === 'female' && <Check className="w-4 h-4 text-indigo-400" />}
            </button>

            <button
              onClick={() => onUpdateSettings({ gender: 'male' })}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition ${
                settings.gender === 'male'
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 ring-2 ring-indigo-500/20'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-indigo-400" />
                <div className="text-left">
                  <div className="text-xs font-bold text-white">男性ネイティブ</div>
                  <div className="text-[10px] text-slate-400">US Male Voice</div>
                </div>
              </div>
              {settings.gender === 'male' && <Check className="w-4 h-4 text-indigo-400" />}
            </button>
          </div>

          <div className="pt-1 flex justify-end">
            <button
              onClick={onTestVoice}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-indigo-300 rounded-lg border border-slate-700 transition"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>テスト音声を再生</span>
            </button>
          </div>
        </div>

        {/* Options Toggles */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            学習オプション
          </label>

          {/* Auto play on next */}
          <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 cursor-pointer hover:bg-slate-800 transition">
            <div>
              <div className="text-xs font-bold text-white">問題切り替え時に自動再生</div>
              <div className="text-[11px] text-slate-400">次の問題へ進んだ際、自動的に音声を流します</div>
            </div>
            <input
              type="checkbox"
              checked={settings.autoPlayNext}
              onChange={(e) => onUpdateSettings({ autoPlayNext: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
            />
          </label>

          {/* Strict punctuation */}
          <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 cursor-pointer hover:bg-slate-800 transition">
            <div>
              <div className="text-xs font-bold text-white">厳格判定モード (Strict Mode)</div>
              <div className="text-[11px] text-slate-400">ピリオド、カンマ、大文字・小文字も厳密に判定します</div>
            </div>
            <input
              type="checkbox"
              checked={settings.strictPunctuation}
              onChange={(e) => onUpdateSettings({ strictPunctuation: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
            />
          </label>

          {/* Default show hints */}
          <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 cursor-pointer hover:bg-slate-800 transition">
            <div>
              <div className="text-xs font-bold text-white">頭文字ヒントを初期表示</div>
              <div className="text-[11px] text-slate-400">各単語の先頭文字のヒントを表示します</div>
            </div>
            <input
              type="checkbox"
              checked={settings.showHints}
              onChange={(e) => onUpdateSettings({ showHints: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
            />
          </label>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-md"
          >
            設定を完了
          </button>
        </div>
      </div>
    </div>
  );
};
