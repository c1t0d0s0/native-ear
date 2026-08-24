import { Level, UserStats, VoiceSettings, QuestionHistoryItem } from '../types';

const STATS_KEY = 'native_ear_user_stats_v1';
const SETTINGS_KEY = 'native_ear_voice_settings_v1';

const DEFAULT_SETTINGS: VoiceSettings = {
  gender: 'female',
  speed: 1.0,
  pitch: 1.0,
  volume: 1.0,
  autoPlayNext: false,
  strictPunctuation: false,
  showHints: true
};

const DEFAULT_STATS: UserStats = {
  totalAnswered: 0,
  totalCorrect: 0,
  perfectCount: 0,
  streakDays: 0,
  lastPracticedDate: '',
  byLevel: {
    500: { answered: 0, totalScore: 0, perfect: 0 },
    600: { answered: 0, totalScore: 0, perfect: 0 },
    700: { answered: 0, totalScore: 0, perfect: 0 },
    800: { answered: 0, totalScore: 0, perfect: 0 },
    900: { answered: 0, totalScore: 0, perfect: 0 }
  },
  history: [],
  bookmarks: []
};

export class StorageService {
  public static getSettings(): VoiceSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('Failed to load settings from localStorage', e);
    }
    return DEFAULT_SETTINGS;
  }

  public static saveSettings(settings: VoiceSettings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings to localStorage', e);
    }
  }

  public static getStats(): UserStats {
    try {
      const data = localStorage.getItem(STATS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...DEFAULT_STATS,
          ...parsed,
          byLevel: {
            ...DEFAULT_STATS.byLevel,
            ...(parsed.byLevel || {})
          },
          history: parsed.history || [],
          bookmarks: parsed.bookmarks || []
        };
      }
    } catch (e) {
      console.warn('Failed to load stats from localStorage', e);
    }
    return DEFAULT_STATS;
  }

  public static saveStats(stats: UserStats) {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (e) {
      console.warn('Failed to save stats to localStorage', e);
    }
  }

  public static recordQuestionResult(
    sentenceId: string,
    level: Level,
    submittedText: string,
    score: number
  ): UserStats {
    const stats = this.getStats();
    const isCorrect = score >= 90;
    const isPerfect = score === 100;

    const today = new Date().toISOString().split('T')[0];

    // Update streak
    if (stats.lastPracticedDate !== today) {
      if (stats.lastPracticedDate) {
        const lastDate = new Date(stats.lastPracticedDate);
        const currentDate = new Date(today);
        const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          stats.streakDays += 1;
        } else if (diffDays > 1) {
          stats.streakDays = 1;
        }
      } else {
        stats.streakDays = 1;
      }
      stats.lastPracticedDate = today;
    }

    stats.totalAnswered += 1;
    if (isCorrect) stats.totalCorrect += 1;
    if (isPerfect) stats.perfectCount += 1;

    // Update by level
    const levelStat = stats.byLevel[level] || { answered: 0, totalScore: 0, perfect: 0 };
    levelStat.answered += 1;
    levelStat.totalScore += score;
    if (isPerfect) levelStat.perfect += 1;
    stats.byLevel[level] = levelStat;

    // Add to history (keep max 100 recent)
    const historyItem: QuestionHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sentenceId,
      level,
      submittedText,
      score,
      timestamp: Date.now(),
      isCorrect
    };

    stats.history = [historyItem, ...stats.history.slice(0, 99)];

    this.saveStats(stats);
    return stats;
  }

  public static toggleBookmark(sentenceId: string): boolean {
    const stats = this.getStats();
    const index = stats.bookmarks.indexOf(sentenceId);
    let isBookmarked = false;

    if (index >= 0) {
      stats.bookmarks.splice(index, 1);
      isBookmarked = false;
    } else {
      stats.bookmarks.push(sentenceId);
      isBookmarked = true;
    }

    this.saveStats(stats);
    return isBookmarked;
  }

  public static isBookmarked(sentenceId: string): boolean {
    const stats = this.getStats();
    return stats.bookmarks.includes(sentenceId);
  }

  public static clearStats() {
    this.saveStats(DEFAULT_STATS);
  }
}
