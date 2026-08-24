import React from 'react';
import { Volume2, Play, RotateCcw, User, Sparkles } from 'lucide-react';
import { Sentence, VoiceSettings } from '../types';

interface AudioPlayerProps {
  sentence: Sentence;
  isPlaying: boolean;
  onPlay: () => void;
  voiceSettings: VoiceSettings;
  onUpdateSettings: (settings: Partial<VoiceSettings>) => void;
  playCount: number;
  totalQuestionsInLevel: number;
  currentIndex: number;
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
}) => {
  return (
    <div className="w-full bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-sm">
      {/* Top Bar: Category & Question Counter */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-lg">
            {sentence.category}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            問題 {currentIndex + 1} / {totalQuestionsInLevel}
          </span>
        </div>

        {/* Voice Gender Switcher */}
        <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-700/60">
          <button
            onClick={() => onUpdateSettings({ gender: 'female' })}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
              voiceSettings.gender === 'female'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="女性ネイティブ音声 (Female Voice)"
          >
            <User className="w-3.5 h-3.5" />
            <span>女声 (Female)</span>
          </button>
          <button
            onClick={() => onUpdateSettings({ gender: 'male' })}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
              voiceSettings.gender === 'male'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="男性ネイティブ音声 (Male Voice)"
          >
            <User className="w-3.5 h-3.5" />
            <span>男声 (Male)</span>
          </button>
        </div>
      </div>

      {/* Main Play Area */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 sm:py-4">
        {/* Big Play Button */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button
            onClick={onPlay}
            disabled={isPlaying}
            className={`relative flex items-center justify-center gap-3 w-full sm:w-auto px-6 py-4 rounded-2xl font-semibold text-base transition-all shadow-lg active:scale-95 ${
              isPlaying
                ? 'bg-indigo-600/80 text-white ring-4 ring-indigo-500/30 cursor-wait'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5'
            }`}
          >
            {isPlaying ? (
              <>
                <Volume2 className="w-6 h-6 animate-pulse text-indigo-200" />
                <span>再生中...</span>
              </>
            ) : playCount === 0 ? (
              <>
                <Play className="w-6 h-6 fill-white" />
                <span>音声を聴く (Play Audio)</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-5 h-5 text-indigo-100" />
                <span>もう一度聴く ({playCount}回目)</span>
              </>
            )}
          </button>
        </div>

        {/* Sound Waveform Visualizer */}
        <div className="flex items-center gap-1.5 h-10 px-4 bg-slate-900/60 rounded-xl border border-slate-700/60 w-full sm:w-48 justify-center">
          {isPlaying ? (
            <>
              <div className="w-1.5 bg-indigo-400 rounded-full animate-wave-1" />
              <div className="w-1.5 bg-indigo-300 rounded-full animate-wave-2" />
              <div className="w-1.5 bg-purple-400 rounded-full animate-wave-3" />
              <div className="w-1.5 bg-indigo-400 rounded-full animate-wave-4" />
              <div className="w-1.5 bg-purple-300 rounded-full animate-wave-5" />
              <div className="w-1.5 bg-indigo-300 rounded-full animate-wave-2" />
              <div className="w-1.5 bg-purple-400 rounded-full animate-wave-1" />
            </>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-slate-500" />
              <span>Space / クリックで再生</span>
            </div>
          )}
        </div>
      </div>

      {/* Speed Controls & Shortcut Info */}
      <div className="mt-3 pt-3 border-t border-slate-700/50 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 font-medium mr-1">速度 (Speed):</span>
          {SPEED_OPTIONS.map((speed) => {
            const isCurrent = Math.abs(voiceSettings.speed - speed) < 0.02;
            const isDefault = Math.abs((sentence.speedDefault || 1.0) - speed) < 0.03;
            return (
              <button
                key={speed}
                onClick={() => onUpdateSettings({ speed })}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition ${
                  isCurrent
                    ? 'bg-indigo-600 text-white ring-1 ring-indigo-400 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-700/40'
                }`}
              >
                {speed}x
                {isDefault && (
                  <span className="ml-1 text-[9px] text-indigo-300 font-normal">標準</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="text-[11px] text-slate-400 hidden sm:flex items-center gap-2">
          <span>
            ショートカット: <kbd className="px-1.5 py-0.5 bg-slate-900 rounded border border-slate-700 text-slate-300">Space</kbd> 再生 / <kbd className="px-1.5 py-0.5 bg-slate-900 rounded border border-slate-700 text-slate-300">Enter</kbd> 判定
          </span>
        </div>
      </div>
    </div>
  );
};
