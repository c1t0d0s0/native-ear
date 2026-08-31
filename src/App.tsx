import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { LevelSelector } from './components/LevelSelector';
import { AudioPlayer } from './components/AudioPlayer';
import { DictationInput } from './components/DictationInput';
import { ShadowingInput } from './components/ShadowingInput';
import { ResultFeedback } from './components/ResultFeedback';
import { StatsModal } from './components/StatsModal';
import { ReviewModal } from './components/ReviewModal';
import { SettingsModal } from './components/SettingsModal';
import { LicenseModal } from './components/LicenseModal';
import { SENTENCE_DATABASE } from './data/sentences';
import { Level, Sentence, EvaluationResult, VoiceSettings, UserStats, PracticeMode } from './types';
import { audioService } from './services/audioService';
import { EvaluationService } from './services/evaluationService';
import { StorageService } from './services/storageService';
import { Language, TRANSLATIONS, detectBrowserLanguage } from './data/i18n';
import { Shuffle, SkipForward, Keyboard, Mic } from 'lucide-react';

export const App: React.FC = () => {
  // Application State
  const [currentLevel, setCurrentLevel] = useState<Level>(() => {
    const saved = localStorage.getItem('native_ear_level');
    if (saved) {
      const num = parseInt(saved, 10);
      if ([300, 400, 500, 600, 700, 800, 900].includes(num)) {
        return num as Level;
      }
    }
    return 300; // Default to 300 (入門・超短文)
  });
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => StorageService.getSettings());
  const [stats, setStats] = useState<UserStats>(() => StorageService.getStats());
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('native_ear_theme');
    if (saved !== null) {
      return saved === 'dark';
    }
    return false; // Default to Light mode
  });
  const [lang, setLang] = useState<Language>(() => detectBrowserLanguage());
  const [practiceMode, setPracticeMode] = useState<PracticeMode>(() => {
    const saved = localStorage.getItem('native_ear_practice_mode') as PracticeMode;
    return saved === 'shadowing' || saved === 'dictation' ? saved : 'shadowing'; // Default to Shadowing mode
  });
  const [isShuffle, setIsShuffle] = useState<boolean>(true);

  // Active translation dictionary
  const t = useMemo(() => TRANSLATIONS[lang] || TRANSLATIONS.en, [lang]);

  // Sync level with localStorage
  useEffect(() => {
    localStorage.setItem('native_ear_level', String(currentLevel));
  }, [currentLevel]);

  // Sync practice mode with localStorage
  useEffect(() => {
    localStorage.setItem('native_ear_practice_mode', practiceMode);
  }, [practiceMode]);

  // Sync language with <html> element and localStorage
  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem('native_ear_lang', lang);
  }, [lang]);

  // Sync theme class with <html> element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('native_ear_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('native_ear_theme', 'light');
    }
  }, [isDark]);

  // Modals
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isLicenseOpen, setIsLicenseOpen] = useState<boolean>(false);

  // Active question pool for current level
  const levelSentences = useMemo(() => {
    const list = SENTENCE_DATABASE.filter((s) => s.level === currentLevel);
    return list.length > 0 ? list : SENTENCE_DATABASE;
  }, [currentLevel]);

  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    const list = SENTENCE_DATABASE.filter((s) => s.level === 600);
    return list.length > 0 ? Math.floor(Math.random() * list.length) : 0;
  });
  const currentSentence: Sentence = levelSentences[currentIndex] || levelSentences[0];

  // Question interaction state
  const [inputValue, setInputValue] = useState<string>('');
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playCount, setPlayCount] = useState<number>(0);
  const [showHints, setShowHints] = useState<boolean>(voiceSettings.showHints);

  // Sync isPlaying with AudioService
  useEffect(() => {
    audioService.setOnStateChange((speaking) => {
      setIsPlaying(speaking);
    });
  }, []);

  // Update speed default and pick random question when level changes
  useEffect(() => {
    const list = SENTENCE_DATABASE.filter((s) => s.level === currentLevel);
    const newIndex = list.length > 0 ? Math.floor(Math.random() * list.length) : 0;
    setCurrentIndex(newIndex);

    const sentence = list[newIndex];
    if (sentence && sentence.speedDefault) {
      setVoiceSettings((prev) => {
        const updated = { ...prev, speed: sentence.speedDefault || 1.0 };
        StorageService.saveSettings(updated);
        return updated;
      });
    }
    setInputValue('');
    setEvaluationResult(null);
    setPlayCount(0);
  }, [currentLevel]);

  // Audio Playback handler
  const handlePlayAudio = useCallback((customSpeed?: number) => {
    if (!currentSentence) return;
    const speed = customSpeed ?? voiceSettings.speed;
    audioService.speak(
      currentSentence.english,
      { ...voiceSettings, speed },
      () => {}
    );
    setPlayCount((prev) => prev + 1);
  }, [currentSentence, voiceSettings]);

  // Submit Evaluation handler
  const handleSubmit = useCallback(() => {
    if (!currentSentence || inputValue.trim().length === 0) return;

    const result = EvaluationService.evaluate(
      currentSentence.english,
      inputValue,
      voiceSettings.strictPunctuation
    );
    setEvaluationResult(result);

    // Record statistics
    const updatedStats = StorageService.recordQuestionResult(
      currentSentence.id,
      currentSentence.level,
      inputValue,
      result.score
    );
    setStats(updatedStats);

    // Play feedback sound
    if (result.score >= 90) {
      audioService.playSuccessSound();
    } else {
      audioService.playPartialSound();
    }
  }, [currentSentence, inputValue, voiceSettings]);

  // Give Up handler
  const handleGiveUp = useCallback(() => {
    if (!currentSentence) return;
    const result = EvaluationService.evaluate(
      currentSentence.english,
      inputValue,
      voiceSettings.strictPunctuation
    );
    setEvaluationResult(result);

    const updatedStats = StorageService.recordQuestionResult(
      currentSentence.id,
      currentSentence.level,
      inputValue || t.statsModal.notSubmitted,
      result.score
    );
    setStats(updatedStats);
    audioService.playPartialSound();
  }, [currentSentence, inputValue, voiceSettings, t]);

  // Next Question handler
  const handleNext = useCallback(() => {
    setInputValue('');
    setEvaluationResult(null);
    setPlayCount(0);

    let nextIndex = currentIndex + 1;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * levelSentences.length);
    } else if (nextIndex >= levelSentences.length) {
      nextIndex = 0;
    }
    setCurrentIndex(nextIndex);

    if (voiceSettings.autoPlayNext) {
      setTimeout(() => {
        const nextSentence = levelSentences[nextIndex];
        if (nextSentence) {
          audioService.speak(
            nextSentence.english,
            { ...voiceSettings, speed: nextSentence.speedDefault || voiceSettings.speed }
          );
          setPlayCount(1);
        }
      }, 400);
    }
  }, [currentIndex, isShuffle, levelSentences, voiceSettings]);

  // Bookmark Toggle
  const handleToggleBookmark = useCallback(() => {
    if (!currentSentence) return;
    StorageService.toggleBookmark(currentSentence.id);
    setStats(StorageService.getStats());
  }, [currentSentence]);

  // Update Settings
  const handleUpdateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    setVoiceSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      StorageService.saveSettings(updated);
      return updated;
    });
    if (newSettings.showHints !== undefined) {
      setShowHints(newSettings.showHints);
    }
  }, []);

  // Voice Test in settings
  const handleTestVoice = useCallback(() => {
    audioService.speak(
      'Hello! This is a test of the American English voice for NativeEar.',
      voiceSettings
    );
  }, [voiceSettings]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      const isInputActive = activeTag === 'textarea' || activeTag === 'input';

      // Replay shortcut: Space (when not typing in input) or Ctrl+P / Cmd+P
      if ((e.code === 'Space' && !isInputActive) || ((e.ctrlKey || e.metaKey) && e.key === 'p')) {
        e.preventDefault();
        handlePlayAudio();
        return;
      }

      // Next question shortcut: Tab or Enter (when result feedback is showing)
      if (evaluationResult && (e.key === 'Tab' || e.key === 'Enter')) {
        e.preventDefault();
        handleNext();
        return;
      }

      // Submit shortcut in shadowing mode: Enter (when result feedback is not showing and has spoken text)
      if (!evaluationResult && practiceMode === 'shadowing' && inputValue.trim().length > 0 && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [evaluationResult, practiceMode, inputValue, handlePlayAudio, handleNext, handleSubmit]);

  const isCurrentBookmarked = currentSentence ? stats.bookmarks.includes(currentSentence.id) : false;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* App Header */}
      <Header
        stats={stats}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenReview={() => setIsReviewOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        bookmarkCount={stats.bookmarks.length}
        t={t}
        lang={lang}
        onToggleLang={() => setLang(lang === 'ja' ? 'en' : 'ja')}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-6 py-1.5 sm:py-2.5 space-y-1.5 sm:space-y-2">
        {/* Level Selector */}
        <LevelSelector
          currentLevel={currentLevel}
          onSelectLevel={(lvl) => setCurrentLevel(lvl)}
          stats={stats}
          t={t}
        />

        {/* Shuffle & Progress Controls */}
        <div className="flex items-center justify-between px-1 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-semibold transition cursor-pointer ${
                isShuffle
                  ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-500/40 shadow-sm'
                  : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/40 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50'
              }`}
              title={t.controls.shuffleTitle}
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>{isShuffle ? t.controls.shuffleOn : t.controls.shuffleOff}</span>
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700/40 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold transition text-xs shadow-sm cursor-pointer"
              title={t.controls.skipTitle}
            >
              <SkipForward className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{t.controls.skip}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
              (全 {SENTENCE_DATABASE.length.toLocaleString()} {t.controls.questionsUnit})
            </span>
            <span className="font-bold text-slate-900 dark:text-slate-200">{currentIndex + 1}</span>
            <span>/ {levelSentences.length} {t.controls.questionsUnit}</span>
          </div>
        </div>

        {/* Audio Player Card */}
        {currentSentence && (
          <AudioPlayer
            sentence={currentSentence}
            isPlaying={isPlaying}
            onPlay={() => handlePlayAudio()}
            voiceSettings={voiceSettings}
            onUpdateSettings={handleUpdateSettings}
            playCount={playCount}
            totalQuestionsInLevel={levelSentences.length}
            currentIndex={currentIndex}
            t={t}
          />
        )}

        {/* Practice Mode Tabs (Dictation vs Shadowing) */}
        {!evaluationResult && (
          <div className="flex items-center justify-center pt-0.5">
            <div className="inline-flex p-0.5 bg-slate-200/90 dark:bg-slate-800/90 rounded-xl border border-slate-300 dark:border-slate-700/60 shadow-inner">
              <button
                onClick={() => {
                  setPracticeMode('dictation');
                  setInputValue('');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  practiceMode === 'dictation'
                    ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-sm border border-slate-200/80 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Keyboard className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{t.modeTabs.dictation}</span>
              </button>
              <button
                onClick={() => {
                  setPracticeMode('shadowing');
                  setInputValue('');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  practiceMode === 'shadowing'
                    ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-sm border border-slate-200/80 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Mic className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{t.modeTabs.shadowing}</span>
              </button>
            </div>
          </div>
        )}

        {/* Question Area: Input vs Evaluation Result */}
        {evaluationResult ? (
          <ResultFeedback
            sentence={currentSentence}
            result={evaluationResult}
            onNext={handleNext}
            onReplay={(spd) => handlePlayAudio(spd)}
            isBookmarked={isCurrentBookmarked}
            onToggleBookmark={handleToggleBookmark}
            t={t}
          />
        ) : practiceMode === 'shadowing' ? (
          <ShadowingInput
            value={inputValue}
            onChange={(val) => setInputValue(val)}
            onSubmit={handleSubmit}
            onGiveUp={handleGiveUp}
            onClear={() => setInputValue('')}
            sentence={currentSentence}
            showHints={showHints}
            onToggleHints={() => setShowHints(!showHints)}
            t={t}
            onPlayAudio={() => handlePlayAudio()}
          />
        ) : (
          <DictationInput
            value={inputValue}
            onChange={(val) => setInputValue(val)}
            onSubmit={handleSubmit}
            onGiveUp={handleGiveUp}
            onClear={() => setInputValue('')}
            sentence={currentSentence}
            showHints={showHints}
            onToggleHints={() => setShowHints(!showHints)}
            t={t}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="py-2 border-t border-slate-200 dark:border-slate-800/60 text-center text-xs text-slate-600 dark:text-slate-500 space-y-0.5 transition-colors">
        <p className="font-semibold text-slate-700 dark:text-slate-400">{t.footer.copyright}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-600">{t.footer.subtitle}</p>
        <div>
          <button
            onClick={() => setIsLicenseOpen(true)}
            className="text-[11px] text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 underline underline-offset-2 transition font-medium cursor-pointer"
          >
            {t.footer.licenseLink}
          </button>
        </div>
      </footer>

      {/* Modals */}
      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
        onClearStats={() => {
          StorageService.clearStats();
          setStats(StorageService.getStats());
        }}
        t={t}
      />

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        bookmarks={stats.bookmarks}
        onSelectSentence={(sentence) => {
          setCurrentLevel(sentence.level);
          const index = SENTENCE_DATABASE.filter(s => s.level === sentence.level).findIndex(s => s.id === sentence.id);
          if (index >= 0) setCurrentIndex(index);
          setInputValue('');
          setEvaluationResult(null);
        }}
        onRemoveBookmark={(id) => {
          StorageService.toggleBookmark(id);
          setStats(StorageService.getStats());
        }}
        onPlayPreview={(sentence) => {
          audioService.speak(sentence.english, voiceSettings);
        }}
        t={t}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={voiceSettings}
        onUpdateSettings={handleUpdateSettings}
        onTestVoice={handleTestVoice}
        t={t}
        lang={lang}
        onChangeLang={(l) => setLang(l)}
      />

      <LicenseModal
        isOpen={isLicenseOpen}
        onClose={() => setIsLicenseOpen(false)}
        t={t}
      />
    </div>
  );
};

export default App;
