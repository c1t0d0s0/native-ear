import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, MicOff, Send, Eye, EyeOff, HelpCircle, AlertCircle, RotateCcw, Volume2 } from 'lucide-react';
import { Sentence } from '../types';
import { Translations } from '../data/i18n';
import { speechRecognitionService } from '../services/speechRecognitionService';

interface ShadowingInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  onGiveUp: () => void;
  onClear: () => void;
  sentence: Sentence;
  showHints: boolean;
  onToggleHints: () => void;
  t: Translations;
  onPlayAudio?: () => void;
}

export const ShadowingInput: React.FC<ShadowingInputProps> = ({
  value,
  onChange,
  onSubmit,
  onGiveUp,
  onClear,
  sentence,
  showHints,
  onToggleHints,
  t,
  onPlayAudio,
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isSupported = speechRecognitionService.isSupported();
  const transcriptBoxRef = useRef<HTMLDivElement>(null);

  // Stop recording when sentence changes
  useEffect(() => {
    speechRecognitionService.stop();
    setIsRecording(false);
    setErrorMessage(null);
  }, [sentence.id]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      speechRecognitionService.stop();
    };
  }, []);

  const handleStartRecording = useCallback(() => {
    setErrorMessage(null);
    const started = speechRecognitionService.start(
      (transcript: string) => {
        onChange(transcript);
      },
      (error: string) => {
        setIsRecording(false);
        if (error === 'not-allowed' || error === 'permission-denied') {
          setErrorMessage(t.shadowingInput.micPermissionDenied);
        } else if (error === 'not_supported') {
          setErrorMessage(t.shadowingInput.micNotSupported);
        } else if (error !== 'no-speech' && error !== 'aborted') {
          setErrorMessage(`Audio recognition error: ${error}`);
        }
      },
      () => {
        setIsRecording(false);
      }
    );

    if (started) {
      setIsRecording(true);
    }
  }, [onChange, t]);

  const handleStopRecording = useCallback(() => {
    speechRecognitionService.stop();
    setIsRecording(false);
  }, []);

  const handleToggleRecording = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  const handleClear = () => {
    speechRecognitionService.stop();
    setIsRecording(false);
    onClear();
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
    <div className="w-full bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-3.5 sm:p-5 shadow-md dark:shadow-xl transition-colors space-y-3">
      {/* Header: Label + Hint toggle + Word Count */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Mic className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>{t.shadowingInput.label}</span>
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
        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 rounded-xl text-indigo-900 dark:text-indigo-200 text-xs font-mono tracking-wider flex items-center gap-2">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>{t.dictationInput.hintPrefix} {renderHints()}</span>
        </div>
      )}

      {/* Errors/Warnings */}
      {!isSupported && (
        <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/40 rounded-xl text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <span>{t.shadowingInput.micNotSupported}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-500/40 rounded-xl text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Compact Interactive Middle Grid: Record Button on Left, Live Transcript on Right */}
      <div className="flex flex-col sm:flex-row items-stretch gap-3">
        {/* Record Trigger Button Box */}
        <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-700/60 sm:w-44 shrink-0">
          <div className="relative">
            {isRecording && (
              <div className="absolute -inset-1.5 rounded-full bg-rose-500/30 animate-ping pointer-events-none" />
            )}
            <button
              type="button"
              onClick={handleToggleRecording}
              disabled={!isSupported}
              className={`relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-200 shadow-md cursor-pointer active:scale-95 disabled:opacity-50 ${
                isRecording
                  ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-400/40'
                  : 'bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white ring-2 ring-indigo-500/20 hover:scale-105'
              }`}
              title={isRecording ? t.shadowingInput.stopRecording : t.shadowingInput.startRecording}
            >
              {isRecording ? <MicOff className="w-6 h-6 animate-pulse" /> : <Mic className="w-6 h-6" />}
            </button>
          </div>

          <div className="text-right sm:text-center">
            <div className="text-xs font-bold">
              {isRecording ? (
                <span className="text-rose-600 dark:text-rose-400 animate-pulse flex items-center gap-1 justify-end sm:justify-center">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  {t.shadowingInput.stopRecording}
                </span>
              ) : (
                <span className="text-slate-800 dark:text-slate-200">{t.shadowingInput.startRecording}</span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">
              {isRecording ? t.shadowingInput.listeningTooltip : t.shadowingInput.clickToSpeakTooltip}
            </p>
          </div>
        </div>

        {/* Real-time Spoken Text Area */}
        <div className="flex-1 flex flex-col justify-between p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-700/60 min-h-[80px]">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
            <span>{t.shadowingInput.recognizedLabel}</span>
            {value.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition cursor-pointer"
                title={t.shadowingInput.clear}
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t.shadowingInput.clear}</span>
              </button>
            )}
          </div>

          <div
            ref={transcriptBoxRef}
            className={`flex-1 text-sm sm:text-base font-mono flex items-center ${
              value.trim().length > 0
                ? 'text-slate-900 dark:text-slate-100 font-bold break-words'
                : 'text-slate-400 dark:text-slate-600 italic text-xs sm:text-sm'
            }`}
          >
            {value.trim().length > 0 ? (
              <span>{value}</span>
            ) : (
              <span>{t.shadowingInput.emptyTranscript}</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer: Word count & Submit */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2">
          {onPlayAudio && (
            <button
              type="button"
              onClick={onPlayAudio}
              className="flex items-center gap-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{t.shadowingInput.playModelAudio}</span>
            </button>
          )}
          <span className="hidden sm:inline">
            {t.dictationInput.wordCount} <strong className="text-slate-900 dark:text-slate-200 font-bold">{wordCount}</strong> / {expectedWordCount} {t.dictationInput.wordsUnit}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onGiveUp}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition cursor-pointer"
            title={t.dictationInput.giveUpTitle}
          >
            {t.shadowingInput.giveUp}
          </button>

          <button
            type="button"
            onClick={() => {
              handleStopRecording();
              onSubmit();
            }}
            disabled={value.trim().length === 0}
            className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-800 dark:disabled:to-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white shadow-md shadow-indigo-600/30 active:scale-95 transition cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t.shadowingInput.submit}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
