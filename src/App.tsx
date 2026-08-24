import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { LevelSelector } from './components/LevelSelector';
import { AudioPlayer } from './components/AudioPlayer';
import { DictationInput } from './components/DictationInput';
import { ResultFeedback } from './components/ResultFeedback';
import { StatsModal } from './components/StatsModal';
import { ReviewModal } from './components/ReviewModal';
import { SettingsModal } from './components/SettingsModal';
import { LicenseModal } from './components/LicenseModal';
import { SENTENCE_DATABASE } from './data/sentences';
import { Level, Sentence, EvaluationResult, VoiceSettings, UserStats } from './types';
import { audioService } from './services/audioService';
import { EvaluationService } from './services/evaluationService';
import { StorageService } from './services/storageService';
import { Shuffle, SkipForward } from 'lucide-react';

export const App: React.FC = () => {
  // Application State
  const [currentLevel, setCurrentLevel] = useState<Level>(600);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => StorageService.getSettings());
  const [stats, setStats] = useState<UserStats>(() => StorageService.getStats());
  const [isDark, setIsDark] = useState<boolean>(true);
  const [isShuffle, setIsShuffle] = useState<boolean>(true);

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
      inputValue || '(未入力)',
      result.score
    );
    setStats(updatedStats);
    audioService.playPartialSound();
  }, [currentSentence, inputValue, voiceSettings]);

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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [evaluationResult, handlePlayAudio, handleNext]);

  const isCurrentBookmarked = currentSentence ? stats.bookmarks.includes(currentSentence.id) : false;

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col transition-colors duration-200`}>
      {/* App Header */}
      <Header
        stats={stats}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenReview={() => setIsReviewOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        bookmarkCount={stats.bookmarks.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Level Selector */}
        <LevelSelector
          currentLevel={currentLevel}
          onSelectLevel={(lvl) => setCurrentLevel(lvl)}
          stats={stats}
        />

        {/* Shuffle & Progress Controls */}
        <div className="flex items-center justify-between px-1 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition ${
                isShuffle
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                  : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:text-slate-200'
              }`}
              title="問題のランダム出題"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>{isShuffle ? 'ランダム出題: ON' : '順番通り出題'}</span>
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-700/40 bg-slate-800/40 hover:bg-slate-700/50 text-slate-300 hover:text-white transition text-xs"
              title="別の問題を引く"
            >
              <SkipForward className="w-3.5 h-3.5 text-indigo-400" />
              <span>別の問題</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 hidden sm:inline">(全 {SENTENCE_DATABASE.length} 問)</span>
            <span className="font-semibold text-slate-200">{currentIndex + 1}</span>
            <span>/ {levelSentences.length} 問</span>
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
          />
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
          />
        ) : (
          <DictationInput
            value={inputValue}
            onChange={(val) => setInputValue(val)}
            onSubmit={handleSubmit}
            onGiveUp={handleGiveUp}
            onClear={() => setInputValue('')}
            disabled={isPlaying}
            sentence={currentSentence}
            showHints={showHints}
            onToggleHints={() => setShowHints(!showHints)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-800/60 text-center text-xs text-slate-500 space-y-1.5">
        <p>NativeEar © cuio.net</p>
        <p className="text-[11px] text-slate-600">アメリカ英語ネイティブ音声 / 500〜900点レベル別対応</p>
        <div className="pt-1">
          <button
            onClick={() => setIsLicenseOpen(true)}
            className="text-[11px] text-slate-400 hover:text-indigo-400 underline underline-offset-2 transition"
          >
            OSSライセンス・著作権表記
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
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={voiceSettings}
        onUpdateSettings={handleUpdateSettings}
        onTestVoice={handleTestVoice}
      />

      <LicenseModal
        isOpen={isLicenseOpen}
        onClose={() => setIsLicenseOpen(false)}
      />
    </div>
  );
};

export default App;
