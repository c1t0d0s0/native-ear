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

  public findVoice(gender: VoiceGender): { voice: SpeechSynthesisVoice | null; isMaleVoiceFound: boolean } {
    const usVoices = this.getUSVoices();
    const allVoices = this.getVoices();
    if (usVoices.length === 0 && allVoices.length === 0) {
      return { voice: null, isMaleVoiceFound: false };
    }

    const maleKeywords = [
      'male', 'david', 'alex', 'fred', 'daniel', 'mark', 'tom', 'george', 'guy',
      'brian', 'richard', 'james', 'john', 'oliver', 'aaron', 'arthur', 'gordon',
      'evan', 'nathan', 'standard-b', 'standard-d', 'standard-j', 'wavenet-b',
      'wavenet-d', 'wavenet-j', 'neural2-d', 'neural2-j', 'journey-d', 'polyglot-1',
      'studio-b', 'studio-d', 'uk english male', 'us male', 'guy online', 'christopher',
      'eric', 'andrew', 'ryan', 'thomas'
    ];

    const femaleKeywords = [
      'female', 'samantha', 'victoria', 'karen', 'zira', 'susan', 'ava', 'allison',
      'kate', 'natural', 'jenny', 'aria', 'sonia', 'libby', 'clara', 'emma', 'ana',
      'steffi', 'standard-a', 'standard-c', 'standard-e', 'standard-f', 'standard-g',
      'standard-h', 'standard-i', 'wavenet-a', 'wavenet-c', 'wavenet-e', 'wavenet-f',
      'neural2-a', 'neural2-c', 'neural2-e', 'neural2-f', 'uk english female'
    ];

    if (gender === 'male') {
      // 1. Search in US voices for explicit male keywords
      let found = usVoices.find(v => {
        const name = v.name.toLowerCase();
        return maleKeywords.some(kw => name.includes(kw)) && !femaleKeywords.some(kw => name.includes(kw));
      });
      if (found) return { voice: found, isMaleVoiceFound: true };

      // 2. Search in all English voices for explicit male keywords
      found = allVoices.find(v => {
        const name = v.name.toLowerCase();
        return (v.lang.toLowerCase().startsWith('en')) &&
          maleKeywords.some(kw => name.includes(kw)) &&
          !femaleKeywords.some(kw => name.includes(kw));
      });
      if (found) return { voice: found, isMaleVoiceFound: true };

      // 3. Fallback: If multiple voices exist, try a voice not labeled female
      const nonFemale = usVoices.find(v => !femaleKeywords.some(kw => v.name.toLowerCase().includes(kw)));
      if (nonFemale) return { voice: nonFemale, isMaleVoiceFound: false };

      return { voice: usVoices[0] || null, isMaleVoiceFound: false };
    } else {
      // Female voice search
      let found = usVoices.find(v => {
        const name = v.name.toLowerCase();
        return femaleKeywords.some(kw => name.includes(kw)) && !maleKeywords.some(kw => name.includes(kw));
      });
      if (found) return { voice: found, isMaleVoiceFound: false };

      found = allVoices.find(v => {
        const name = v.name.toLowerCase();
        return (v.lang.toLowerCase().startsWith('en')) &&
          femaleKeywords.some(kw => name.includes(kw));
      });
      if (found) return { voice: found, isMaleVoiceFound: false };

      return { voice: usVoices[0] || null, isMaleVoiceFound: false };
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

    // Acoustic pitch modulation for clear male / female distinction on all OS/browsers
    if (gender === 'male') {
      if (isMaleVoiceFound) {
        utterance.pitch = settings.pitch ?? 0.88;
      } else {
        // Fallback pitch lowering to create a clear, natural masculine tone
        utterance.pitch = settings.pitch ?? 0.78;
        utterance.rate = (settings.speed ?? 1.0) * 0.95;
      }
    } else {
      // Female tone
      utterance.pitch = settings.pitch ?? 1.12;
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
