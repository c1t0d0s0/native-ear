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

class SpeechRecognitionService {
  private recognition: SpeechRecognitionInstance | null = null;
  private isListening: boolean = false;
  private onResultCallback: ((transcript: string, isFinal: boolean) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private onEndCallback: (() => void) | null = null;
  private accumulatedFinalTranscript: string = '';

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
        let interimTranscript = '';
        let newFinalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcriptText = result[0].transcript;
          if (result.isFinal) {
            newFinalTranscript += transcriptText + ' ';
          } else {
            interimTranscript += transcriptText;
          }
        }

        if (newFinalTranscript) {
          this.accumulatedFinalTranscript += newFinalTranscript;
        }

        const totalTranscript = (this.accumulatedFinalTranscript + interimTranscript).trim();
        if (this.onResultCallback) {
          this.onResultCallback(totalTranscript, interimTranscript.length === 0);
        }
      };

      rec.onerror = (event: SpeechRecognitionErrorEvent) => {
        // 'no-speech' is a common benign event when silence is detected
        if (event.error === 'no-speech') {
          return;
        }
        if (event.error === 'aborted') {
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

    this.accumulatedFinalTranscript = '';
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
      // If already started or browser state error, try re-initializing
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
    this.accumulatedFinalTranscript = '';
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

export const speechRecognitionService = new SpeechRecognitionService();
