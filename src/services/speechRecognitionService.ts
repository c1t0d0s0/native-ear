// Web Speech API interface declarations for TypeScript
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

/**
 * Normalizes a word for comparison (lowercase without punctuation)
 */
function normalizeWord(w: string): string {
  return (w || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Merges two transcript strings, resolving any overlaps or duplication
 * (Crucial for fixing Android Chrome SpeechRecognition duplicate output bugs)
 */
export function mergeTranscripts(a: string, b: string): string {
  const strA = (a || '').trim();
  const strB = (b || '').trim();
  if (!strA) return strB;
  if (!strB) return strA;

  const normA = strA.split(/\s+/).map(normalizeWord).join(' ');
  const normB = strB.split(/\s+/).map(normalizeWord).join(' ');

  // 1. Complete match or prefix/suffix containment
  if (normA === normB) return strB;
  if (normB.startsWith(normA)) return strB;
  if (normA.endsWith(normB)) return strA;

  const wordsA = strA.split(/\s+/);
  const wordsB = strB.split(/\s+/);

  // 2. Overlap merge (suffix of A matching prefix of B)
  const maxOverlap = Math.min(wordsA.length, wordsB.length);
  for (let k = maxOverlap; k > 0; k--) {
    const tailA = wordsA.slice(wordsA.length - k).map(normalizeWord).join(' ');
    const headB = wordsB.slice(0, k).map(normalizeWord).join(' ');
    if (tailA && headB && tailA === headB) {
      return wordsA.slice(0, wordsA.length - k).concat(wordsB).join(' ');
    }
  }

  // 3. Fallback standard join
  return `${strA} ${strB}`;
}

/**
 * Detects and eliminates consecutive repeated word sequences
 * (e.g. "this is the this is the" -> "this is the")
 */
export function cleanRepeatedPhrases(text: string): string {
  if (!text || !text.trim()) return '';
  let current = text.trim();
  let changed = true;

  while (changed) {
    changed = false;
    const words = current.split(/\s+/);
    if (words.length < 2) break;

    const newWords: string[] = [];
    let i = 0;
    while (i < words.length) {
      let matchedLength = 0;
      const maxL = Math.floor((words.length - i) / 2);
      for (let L = maxL; L >= 1; L--) {
        let isRepeat = true;
        for (let k = 0; k < L; k++) {
          if (normalizeWord(words[i + k]) !== normalizeWord(words[i + L + k])) {
            isRepeat = false;
            break;
          }
        }
        if (isRepeat) {
          matchedLength = L;
          break;
        }
      }

      if (matchedLength > 0) {
        // Keep one copy of the phrase
        for (let k = 0; k < matchedLength; k++) {
          newWords.push(words[i + k]);
        }
        i += matchedLength * 2;
        changed = true;
      } else {
        newWords.push(words[i]);
        i++;
      }
    }
    current = newWords.join(' ');
  }

  return current;
}

class SpeechRecognitionService {
  private recognition: SpeechRecognitionInstance | null = null;
  private isListening: boolean = false;
  private onResultCallback: ((transcript: string, isFinal: boolean) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private onEndCallback: (() => void) | null = null;

  constructor() {
    this.initRecognition();
  }

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  private initRecognition(): void {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;

    try {
      const rec = new SpeechRecognitionClass();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';
      rec.maxAlternatives = 1;

      rec.onresult = (event: SpeechRecognitionEvent) => {
        let finalCombined = '';
        let interimText = '';

        for (let i = 0; i < event.results.length; i++) {
          const item = event.results[i];
          const text = item[0]?.transcript || '';
          if (item.isFinal) {
            finalCombined = mergeTranscripts(finalCombined, text);
          } else {
            interimText = mergeTranscripts(interimText, text);
          }
        }

        // Merge final and interim transcripts smoothly
        let totalTranscript = mergeTranscripts(finalCombined, interimText);
        // Remove any adjacent duplicated phrases caused by Android Chrome speech engine
        totalTranscript = cleanRepeatedPhrases(totalTranscript);

        if (this.onResultCallback) {
          this.onResultCallback(totalTranscript, interimText.length === 0);
        }
      };

      rec.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === 'no-speech' || event.error === 'aborted') {
          return;
        }
        if (this.onErrorCallback) {
          this.onErrorCallback(event.error || 'speech_recognition_error');
        }
      };

      rec.onend = () => {
        this.isListening = false;
        if (this.onEndCallback) {
          this.onEndCallback();
        }
      };

      this.recognition = rec;
    } catch (e) {
      console.warn('SpeechRecognition initialization error:', e);
    }
  }

  public start(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ): boolean {
    if (!this.isSupported()) {
      onError('not_supported');
      return false;
    }

    if (this.isListening) {
      this.stop();
    }

    this.onResultCallback = onResult;
    this.onErrorCallback = onError;
    this.onEndCallback = onEnd;

    try {
      if (!this.recognition) {
        this.initRecognition();
      }
      if (this.recognition) {
        this.recognition.start();
        this.isListening = true;
        return true;
      }
    } catch (e) {
      try {
        this.initRecognition();
        this.recognition?.start();
        this.isListening = true;
        return true;
      } catch (err: any) {
        onError(err?.message || 'failed_to_start');
      }
    }
    return false;
  }

  public stop(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.isListening = false;
  }

  public abort(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.abort();
      } catch (e) {}
    }
    this.isListening = false;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

export const speechRecognitionService = new SpeechRecognitionService();

