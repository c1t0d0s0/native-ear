export type Level = 300 | 400 | 500 | 600 | 700 | 800 | 900;
export type PracticeMode = 'dictation' | 'shadowing';

export interface Sentence {
  id: string;
  level: Level;
  category: string; // e.g. 'Office', 'Business', 'Travel', 'Finance', 'Logistics', 'Customer Service', 'Tech'
  english: string;
  japanese: string;
  vocabNotes?: { word: string; meaning: string }[];
  grammarTip?: string;
  linkingTip?: string; // Information on English connected speech / reductions
  speedDefault?: number; // Level recommended playback speed
}

export type DiffType = 'correct' | 'wrong' | 'missing' | 'extra';

export interface DiffToken {
  type: DiffType;
  expected?: string;
  actual?: string;
  text: string;
}

export interface EvaluationResult {
  isExactMatch: boolean;
  score: number; // 0 - 100%
  tokens: DiffToken[];
  totalExpectedWords: number;
  correctWordsCount: number;
  submittedText: string;
  originalText: string;
}

export type VoiceGender = 'male' | 'female' | 'auto';

export interface VoiceSettings {
  gender: VoiceGender;
  voiceURI?: string;
  speed: number;
  pitch: number;
  volume: number;
  autoPlayNext: boolean;
  strictPunctuation: boolean;
  showHints: boolean;
}

export interface QuestionHistoryItem {
  id: string;
  sentenceId: string;
  level: Level;
  submittedText: string;
  score: number;
  timestamp: number;
  isCorrect: boolean;
}

export interface UserStats {
  totalAnswered: number;
  totalCorrect: number; // score >= 90
  perfectCount: number; // 100%
  streakDays: number;
  lastPracticedDate: string;
  byLevel: Record<Level, { answered: number; totalScore: number; perfect: number }>;
  history: QuestionHistoryItem[];
  bookmarks: string[]; // sentence IDs
}
