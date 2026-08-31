import { VoiceGender, VoiceSettings } from '../types';

export class AudioService {
  private static instance: AudioService;
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private audioCtx: AudioContext | null = null;
  private isSpeaking = false;
  private onStateChangeCallback: ((speaking: boolean) => void) | null = null;

  private constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  public setOnStateChange(callback: (speaking: boolean) => void) {
    this.onStateChangeCallback = callback;
  }

  private loadVoices() {
    if (!this.synth) return;
    const v = this.synth.getVoices();
    if (v.length > 0) {
      this.voices = v;
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.synth) {
      const v = this.synth.getVoices();
      if (v.length > 0) {
        this.voices = v;
      }
    }
    return this.voices;
  }

  public getUSVoices(): SpeechSynthesisVoice[] {
    const all = this.getVoices();
    const usVoices = all.filter(v => v.lang === 'en-US' || v.lang.startsWith('en_US'));
    if (usVoices.length > 0) return usVoices;
    const generalEn = all.filter(v => v.lang.toLowerCase().startsWith('en'));
    return generalEn.length > 0 ? generalEn : all;
  }

  private isMaleVoice(v: SpeechSynthesisVoice): boolean {
    const text = `${v.name} ${v.voiceURI}`.toLowerCase();
    const maleKeywords = [
      '#male', 'male_', 'male-', '-male', '_male', ' male', '(male)',
      'david', 'alex', 'fred', 'daniel', 'mark', 'tom', 'george', 'guy',
      'brian', 'richard', 'james', 'john', 'oliver', 'aaron', 'arthur', 'gordon',
      'evan', 'nathan', 'christopher', 'eric', 'andrew', 'ryan', 'thomas',
      'standard-b', 'standard-d', 'standard-j', 'wavenet-b', 'wavenet-d', 'wavenet-j',
      'neural2-d', 'neural2-j', 'journey-d', 'polyglot-1', 'studio-b', 'studio-d',
      'uk english male', 'us male', 'guy online',
      '-iom', '-iob', '-iod', '-rjs', '-fis', '-aub', '-cjc', 'male_1', 'male_2', 'male_3'
    ];
    const femaleKeywords = [
      '#female', 'female_', 'female-', '-female', '_female', ' female', '(female)',
      'samantha', 'victoria', 'karen', 'zira', 'susan', 'ava', 'allison',
      'kate', 'natural', 'jenny', 'aria', 'sonia', 'libby', 'clara', 'emma', 'ana',
      'steffi', 'standard-a', 'standard-c', 'standard-e', 'standard-f', 'standard-g',
      'standard-h', 'standard-i', 'wavenet-a', 'wavenet-c', 'wavenet-e', 'wavenet-f',
      'neural2-a', 'neural2-c', 'neural2-e', 'neural2-f', 'uk english female',
      '-iol', '-iof'
    ];

    const hasMale = maleKeywords.some(kw => text.includes(kw));
    const hasFemale = femaleKeywords.some(kw => text.includes(kw));
    return hasMale && !hasFemale;
  }

  private isFemaleVoice(v: SpeechSynthesisVoice): boolean {
    const text = `${v.name} ${v.voiceURI}`.toLowerCase();
    const femaleKeywords = [
      '#female', 'female_', 'female-', '-female', '_female', ' female', '(female)',
      'samantha', 'victoria', 'karen', 'zira', 'susan', 'ava', 'allison',
      'kate', 'natural', 'jenny', 'aria', 'sonia', 'libby', 'clara', 'emma', 'ana',
      'steffi', 'standard-a', 'standard-c', 'standard-e', 'standard-f', 'standard-g',
      'standard-h', 'standard-i', 'wavenet-a', 'wavenet-c', 'wavenet-e', 'wavenet-f',
      'neural2-a', 'neural2-c', 'neural2-e', 'neural2-f', 'uk english female',
      '-iol', '-iof'
    ];
    const maleKeywords = [
      '#male', 'male_', 'male-', '-male', '_male', ' male', '(male)',
      'david', 'alex', 'fred', 'daniel', 'mark', 'tom', 'george', 'guy',
      'brian', 'richard', 'james', 'john', 'oliver', 'aaron', 'arthur', 'gordon',
      'evan', 'nathan', 'christopher', 'eric', 'andrew', 'ryan', 'thomas',
      '-iom', '-iob', '-iod'
    ];

    const hasFemale = femaleKeywords.some(kw => text.includes(kw));
    const hasMale = maleKeywords.some(kw => text.includes(kw));
    return hasFemale && !hasMale;
  }

  public findVoice(gender: VoiceGender): { voice: SpeechSynthesisVoice | null; isMaleVoiceFound: boolean } {
    const usVoices = this.getUSVoices();
    const allVoices = this.getVoices();

    if (gender === 'male') {
      // 1. Search in US English voices for explicit male keywords in name or voiceURI
      const usMale = usVoices.find(v => this.isMaleVoice(v));
      if (usMale) return { voice: usMale, isMaleVoiceFound: true };

      // 2. Search in any English voices for explicit male keywords
      const enMale = allVoices.find(v => v.lang.toLowerCase().startsWith('en') && this.isMaleVoice(v));
      if (enMale) return { voice: enMale, isMaleVoiceFound: true };

      // 3. Search across all voices for explicit male keywords
      const anyMale = allVoices.find(v => this.isMaleVoice(v));
      if (anyMale) return { voice: anyMale, isMaleVoiceFound: true };

      // Crucial: On Android, if NO explicit male voice is registered in the OS,
      // do NOT force a female voice object into utterance.voice (which overrides pitch modulation).
      // Returning null allows the Android TTS engine to lower pitch for default speech.
      return { voice: null, isMaleVoiceFound: false };
    } else {
      // Female voice search
      const usFemale = usVoices.find(v => this.isFemaleVoice(v));
      if (usFemale) return { voice: usFemale, isMaleVoiceFound: false };

      const enFemale = allVoices.find(v => v.lang.toLowerCase().startsWith('en') && this.isFemaleVoice(v));
      if (enFemale) return { voice: enFemale, isMaleVoiceFound: false };

      return { voice: usVoices[0] || allVoices[0] || null, isMaleVoiceFound: false };
    }
  }

  public speak(
    text: string,
    settings: Partial<VoiceSettings> = {},
    onEnd?: () => void
  ) {
    if (!this.synth) {
      console.warn('Speech synthesis is not supported on this browser.');
      onEnd?.();
      return;
    }

    // Refresh voices list in case async loaded
    this.getVoices();

    // Cancel any ongoing speech
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = settings.speed ?? 1.0;
    utterance.volume = settings.volume ?? 1.0;

    const gender = settings.gender ?? 'female';
    const { voice, isMaleVoiceFound } = this.findVoice(gender);

    if (voice) {
      utterance.voice = voice;
    }

    // Acoustic pitch modulation for clear male / female distinction across Android, iOS, Windows, and macOS
    if (gender === 'male') {
      if (isMaleVoiceFound) {
        utterance.pitch = settings.pitch ?? 0.88;
      } else {
        // Fallback pitch lowering for systems with single default voice (e.g. Android default TTS)
        utterance.pitch = settings.pitch ?? 0.72;
        utterance.rate = (settings.speed ?? 1.0) * 0.95;
      }
    } else {
      // Female tone
      utterance.pitch = settings.pitch ?? 1.15;
      utterance.rate = (settings.speed ?? 1.0) * 1.02;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.onStateChangeCallback?.(true);
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.onStateChangeCallback?.(false);
      onEnd?.();
    };

    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      this.isSpeaking = false;
      this.onStateChangeCallback?.(false);
      onEnd?.();
    };

    this.synth.speak(utterance);
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    this.onStateChangeCallback?.(false);
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  // Web Audio API synthesized sound effects
  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public playSuccessSound() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Arpeggio chords: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);

        gain.gain.setValueAtTime(0, now + index * 0.08);
        gain.gain.linearRampToValueAtTime(0.15, now + index * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.4);
      });
    } catch (err) {
      console.warn('Audio FX play error:', err);
    }
  }

  public playPartialSound() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const freqs = [440, 554.37];
      freqs.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.1);

        gain.gain.setValueAtTime(0, now + index * 0.1);
        gain.gain.linearRampToValueAtTime(0.12, now + index * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.1);
        osc.stop(now + index * 0.1 + 0.3);
      });
    } catch (err) {
      console.warn('Audio FX play error:', err);
    }
  }

  public playClickSound() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (err) {
      console.warn('Audio FX play error:', err);
    }
  }
}

export const audioService = AudioService.getInstance();
