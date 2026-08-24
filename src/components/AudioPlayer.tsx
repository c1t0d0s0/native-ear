import React from 'react';
import { Volume2, Play, RotateCcw, User, Sparkles } from 'lucide-react';
import { Sentence, VoiceSettings } from '../types';
import { Translations } from '../data/i18n';

interface AudioPlayerProps {
  sentence: Sentence;
  isPlaying: boolean;
  onPlay: () => void;
  voiceSettings: VoiceSettings;
  onUpdateSettings: (settings: Partial<VoiceSettings>) => void;
  playCount: number;
  totalQuestionsInLevel: number;
  currentIndex: number;
  t: Translations;
}

const SPEED_OPTIONS = [0.75, 0.88, 1.0, 1.1, 1.25];

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  sentence,
  isPlaying,
  onPlay,
  voiceSettings,
  onUpdateSettings,
  playCount,
  totalQuestionsInLevel,
  currentIndex,
  t,
}) => {
  return (
    <div className="w-full bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-3 sm:p-4 shadow-md dark:shadow-xl backdrop-blur-sm transition-colors">
      {/* Top Bar: Category & Question Counter */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 px-2 py-0.5 rounded-lg">
            {sentence.category}
          </span>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
            {t.audioPlayer.questionCount(currentIndex + 1, totalQuestionsInLevel)}
          </span>
        </div>

        {/* Voice Gender Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/60 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <button
            onClick={() => onUpdateSettings({ gender: 'female' })}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
              voiceSettings.gender === 'female'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title={t.audioPlayer.femaleVoiceTitle}
          >
            <User className="w-3 h-3" />
            <span>{t.audioPlayer.femaleVoice}</span>
          </button>
          <button
            onClick={() => onUpdateSettings({ gender: 'male' })}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
              voiceSettings.gender === 'male'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title={t.audioPlayer.maleVoiceTitle}
          >
            <User className="w-3 h-3" />
            <span>{t.audioPlayer.maleVoice}</span>
          </button>
        </div>
      </div>

      {/* Main Play Area */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-1 sm:py-2">
        {/* Play Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onPlay}
            disabled={isPlaying}
            className={`relative flex items-center justify-center gap-2.5 w-full sm:w-auto px-5 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base transition-all shadow-md active:scale-95 cursor-pointer ${
              isPlaying
                ? 'bg-indigo-600/80 text-white ring-4 ring-indigo-500/30 cursor-wait'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5'
            }`}
          >
            {isPlaying ? (
              <>
                <Volume2 className="w-5 h-5 animate-pulse text-indigo-200" />
                <span>{t.audioPlayer.playing}</span>
              </>
            ) : playCount === 0 ? (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>{t.audioPlayer.playAudio}</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4 text-indigo-100" />
                <span>{t.audioPlayer.playAgain(playCount)}</span>
              </>
            )}
          </button>
        </div>

        {/* Sound Waveform Visualizer */}
        <div className="flex items-center gap-1.5 h-8 px-3.5 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700/60 w-full sm:w-44 justify-center">
          {isPlaying ? (
            <>
              <div className="w-1 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-wave-1" />
              <div className="w-1 bg-indigo-400 dark:bg-indigo-300 rounded-full animate-wave-2" />
              <div className="w-1 bg-purple-500 dark:bg-purple-400 rounded-full animate-wave-3" />
              <div className="w-1 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-wave-4" />
              <div className="w-1 bg-purple-400 dark:bg-purple-300 rounded-full animate-wave-5" />
              <div className="w-1 bg-indigo-400 dark:bg-indigo-300 rounded-full animate-wave-2" />
              <div className="w-1 bg-purple-500 dark:bg-purple-400 rounded-full animate-wave-1" />
            </>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-500 font-semibold">
              <Sparkles className="w-3 h-3 text-slate-500" />
              <span>{t.audioPlayer.waveformHint}</span>
            </div>
          )}
        </div>
      </div>

      {/* Speed Controls & Shortcut Info */}
      <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/50 flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-slate-700 dark:text-slate-400 font-semibold mr-1">{t.audioPlayer.speedLabel}</span>
          {SPEED_OPTIONS.map((speed) => {
            const isCurrent = Math.abs(voiceSettings.speed - speed) < 0.04;
            const isDefault = Math.abs((sentence.speedDefault || 1.0) - speed) < 0.04;
            return (
              <button
                key={speed}
                onClick={() => onUpdateSettings({ speed })}
                className={`px-1.5 py-0.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-600 text-white ring-1 ring-indigo-400 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-900/60 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700/40 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {speed}x
                {isDefault && (
                  <span className="ml-0.5 text-[8px] text-indigo-600 dark:text-indigo-300 font-medium">{t.audioPlayer.speedDefault}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="text-[10px] text-slate-600 dark:text-slate-400 hidden sm:flex items-center gap-2 font-medium">
          <span>
            {t.audioPlayer.shortcutHint}
          </span>
        </div>
      </div>
    </div>
  );
};
