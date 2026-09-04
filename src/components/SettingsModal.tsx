import React, { useState, useEffect, useMemo } from 'react';
import { X, Settings, Volume2, User, Check, Languages, Mic } from 'lucide-react';
import { VoiceSettings, VoiceGender } from '../types';
import { Translations, Language } from '../data/i18n';
import { audioService } from '../services/audioService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: VoiceSettings;
  onUpdateSettings: (newSettings: Partial<VoiceSettings>) => void;
  onTestVoice: () => void;
  t: Translations;
  lang: Language;
  onChangeLang: (lang: Language) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onTestVoice,
  t,
  lang,
  onChangeLang,
}) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showAllVoices, setShowAllVoices] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    const loadVoices = () => {
      const en = audioService.getEnglishVoices();
      setVoices(en);
    };
    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [isOpen]);

  const filteredVoices = useMemo(() => {
    if (showAllVoices) return voices;
    return audioService.getVoicesByGender(settings.gender);
  }, [voices, settings.gender, showAllVoices]);

  const handleGenderChange = (gender: VoiceGender) => {
    const updated = {
      gender,
      voiceURI: undefined, // Reset character voice to auto-detect for selected gender
    };
    onUpdateSettings(updated);
    audioService.speak(
      gender === 'male' ? 'NativeEar US male voice.' : 'NativeEar US female voice.',
      { ...settings, ...updated }
    );
  };

  const handleVoiceChange = (voiceURI: string) => {
    const targetVoice = voices.find((v) => v.voiceURI === voiceURI);
    let newGender = settings.gender;
    if (targetVoice) {
      if (audioService.isMaleVoice(targetVoice)) {
        newGender = 'male';
      } else if (audioService.isFemaleVoice(targetVoice)) {
        newGender = 'female';
      }
    }
    const updated = {
      voiceURI: voiceURI || undefined,
      gender: newGender,
    };
    onUpdateSettings(updated);

    if (targetVoice) {
      audioService.speak(`Hello! I'm ${targetVoice.name}. Ready for practice!`, {
        ...settings,
        ...updated,
      });
    } else {
      audioService.speak(
        newGender === 'male' ? 'Hello! NativeEar male voice.' : 'Hello! NativeEar female voice.',
        { ...settings, ...updated }
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6 text-slate-900 dark:text-white transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.settingsModal.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Display Language Selection */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Languages className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 block">
              {t.settingsModal.languageTitle}
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onChangeLang('ja')}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer ${
                lang === 'ja'
                  ? 'bg-indigo-50 dark:bg-indigo-600/20 border-indigo-600 dark:border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900 dark:text-white">日本語</div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">Japanese</div>
              </div>
              {lang === 'ja' && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 font-bold" />}
            </button>

            <button
              onClick={() => onChangeLang('en')}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer ${
                lang === 'en'
                  ? 'bg-indigo-50 dark:bg-indigo-600/20 border-indigo-600 dark:border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900 dark:text-white">English</div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">英語</div>
              </div>
              {lang === 'en' && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 font-bold" />}
            </button>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.settingsModal.languageDesc}</p>
        </div>

        {/* Voice Gender & Character Selection */}
        <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 block mb-2">
              {t.settingsModal.voiceGenderTitle}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleGenderChange('female')}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer ${
                  settings.gender === 'female'
                    ? 'bg-indigo-50 dark:bg-indigo-600/20 border-indigo-600 dark:border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{t.settingsModal.femaleVoice}</div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">{t.settingsModal.femaleVoiceSub}</div>
                  </div>
                </div>
                {settings.gender === 'female' && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 font-bold" />}
              </button>

              <button
                type="button"
                onClick={() => handleGenderChange('male')}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer ${
                  settings.gender === 'male'
                    ? 'bg-indigo-50 dark:bg-indigo-600/20 border-indigo-600 dark:border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{t.settingsModal.maleVoice}</div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">{t.settingsModal.maleVoiceSub}</div>
                  </div>
                </div>
                {settings.gender === 'male' && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 font-bold" />}
              </button>
            </div>
          </div>

          {/* OS Native Voice Characters Selection */}
          <div className="space-y-2 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{t.settingsModal.characterVoiceTitle}</span>
              </label>
              {voices.length > 2 && (
                <button
                  type="button"
                  onClick={() => setShowAllVoices((prev) => !prev)}
                  className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  {showAllVoices ? '性別で絞り込む' : 'すべての英語音声を表示'}
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t.settingsModal.characterVoiceDesc}
            </p>

            <select
              value={settings.voiceURI || ''}
              onChange={(e) => handleVoiceChange(e.target.value)}
              className="w-full text-xs font-medium p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs"
            >
              <option value="">
                🌟 {t.settingsModal.autoVoice} ({settings.gender === 'male' ? 'US Male' : 'US Female'})
              </option>
              {filteredVoices.map((v) => {
                const isSelected = settings.voiceURI === v.voiceURI;
                return (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {isSelected ? '✓ ' : ''}{v.name} [{v.lang}]
                  </option>
                );
              })}
            </select>

            {/* Quick Helper / Selected Voice Details */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[280px]">
                {settings.voiceURI
                  ? `選択中: ${voices.find((v) => v.voiceURI === settings.voiceURI)?.name || settings.voiceURI}`
                  : `選択中: 自動選択 (${settings.gender === 'male' ? '男声' : '女声'})`}
              </span>
              <button
                type="button"
                onClick={onTestVoice}
                className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-indigo-600 dark:text-indigo-400 rounded-lg border border-slate-200 dark:border-slate-700 transition cursor-pointer shadow-xs active:scale-95 shrink-0"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{t.settingsModal.testVoice}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Options Toggles */}
        <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 block">
            {t.settingsModal.learningOptionsTitle}
          </label>

          {/* Auto play on next */}
          <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">{t.settingsModal.autoPlayTitle}</div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">{t.settingsModal.autoPlayDesc}</div>
            </div>
            <input
              type="checkbox"
              checked={settings.autoPlayNext}
              onChange={(e) => onUpdateSettings({ autoPlayNext: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:ring-indigo-500"
            />
          </label>

          {/* Strict punctuation */}
          <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">{t.settingsModal.strictModeTitle}</div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">{t.settingsModal.strictModeDesc}</div>
            </div>
            <input
              type="checkbox"
              checked={settings.strictPunctuation}
              onChange={(e) => onUpdateSettings({ strictPunctuation: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:ring-indigo-500"
            />
          </label>

          {/* Default show hints */}
          <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">{t.settingsModal.showHintsTitle}</div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">{t.settingsModal.showHintsDesc}</div>
            </div>
            <input
              type="checkbox"
              checked={settings.showHints}
              onChange={(e) => onUpdateSettings({ showHints: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:ring-indigo-500"
            />
          </label>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
          >
            {t.settingsModal.close}
          </button>
        </div>
      </div>
    </div>
  );
};
