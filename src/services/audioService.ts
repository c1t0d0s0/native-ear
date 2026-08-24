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
    this.voices = this.synth.getVoices();
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && this.synth) {
      this.voices = this.synth.getVoices();
    }
    return this.voices;
  }

  public getUSVoices(): SpeechSynthesisVoice[] {
    const all = this.getVoices();
    const usVoices = all.filter(v => v.lang === 'en-US' || v.lang.startsWith('en_US') || v.lang.startsWith('en-'));
    return usVoices.length > 0 ? usVoices : all;
  }

  public findVoice(gender: VoiceGender): SpeechSynthesisVoice | null {
    const usVoices = this.getUSVoices();
    if (usVoices.length === 0) return null;

    if (gender === 'female') {
      const femaleKeywords = ['female', 'samantha', 'victoria', 'karen', 'zira', 'susan', 'ava', 'allison', 'kate', 'natural'];
      const found = usVoices.find(v => femaleKeywords.some(kw => v.name.toLowerCase().includes(kw)));
      if (found) return found;
      // Fallback: pick first voice if female specific not found
      return usVoices[0];
    } else if (gender === 'male') {
      const maleKeywords = ['male', 'david', 'alex', 'fred', 'daniel', 'mark', 'tom', 'george', 'guy'];
      const found = usVoices.find(v => maleKeywords.some(kw => v.name.toLowerCase().includes(kw)));
      if (found) return found;
      // Fallback: try second voice or first
      return usVoices.length > 1 ? usVoices[1] : usVoices[0];
    }

    return usVoices[0];
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
    utterance.pitch = settings.pitch ?? 1.0;
    utterance.volume = settings.volume ?? 1.0;

    const voice = this.findVoice(settings.gender ?? 'female');
    if (voice) {
      utterance.voice = voice;
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
