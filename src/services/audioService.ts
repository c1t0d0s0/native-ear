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
      if (this.synth.addEventListener) {
        this.synth.addEventListener('voiceschanged', () => this.loadVoices());
      } else {
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

  public getEnglishVoices(): SpeechSynthesisVoice[] {
    const all = this.getVoices();
    const enVoices = all.filter(v => v.lang.toLowerCase().startsWith('en'));
    // Sort US English to the top, followed by UK, AU, etc.
    return enVoices.sort((a, b) => {
      const aUS = a.lang === 'en-US' || a.lang.startsWith('en_US');
      const bUS = b.lang === 'en-US' || b.lang.startsWith('en_US');
      if (aUS && !bUS) return -1;
      if (!aUS && bUS) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  public isNoveltyVoice(v: SpeechSynthesisVoice): boolean {
    const text = `${v.name} ${v.voiceURI}`.toLowerCase();
    const noveltyNames = [
      'albert', 'bad news', 'bahh', 'bells', 'boing', 'bubbles',
      'cellos', 'deranged', 'good news', 'hysterical', 'junior',
      'kathy', 'pipe organ', 'princess', 'ralph', 'trinoids',
      'whisper', 'zarvox', 'agnes', 'bruce', 'vicki', 'wobble',
      'jester', 'organ'
    ];
    return noveltyNames.some(name => text.includes(name));
  }

  public isMaleVoice(v: SpeechSynthesisVoice): boolean {
    if (this.isNoveltyVoice(v)) return false;
    const text = `${v.name} ${v.voiceURI}`.toLowerCase();
    const maleKeywords = [
      '#male', 'male_', 'male-', '-male', '_male', ' male', '(male)',
      'fred', 'alex', 'david', 'daniel', 'mark', 'tom', 'george', 'guy',
      'brian', 'richard', 'james', 'john', 'oliver', 'aaron', 'arthur', 'gordon',
      'evan', 'nathan', 'christopher', 'eric', 'andrew', 'ryan', 'thomas',
      'lee', 'russell', 'rishi',
      'standard-b', 'standard-d', 'standard-j', 'wavenet-b', 'wavenet-d', 'wavenet-j',
      'neural2-d', 'neural2-j', 'journey-d', 'polyglot-1', 'studio-b', 'studio-d',
      'uk english male', 'us male', 'guy online',
      'google uk english male', 'marcus', 'ravi', 'steve', 'paul',
      '-iom', '-iob', '-iod', '-rjs', '-fis', '-aub', '-cjc', 'male_1', 'male_2', 'male_3'
    ];
    const femaleKeywords = [
      '#female', 'female_', 'female-', '-female', '_female', ' female', '(female)',
      'samantha', 'victoria', 'karen', 'zira', 'susan', 'ava', 'allison',
      'kate', 'natural', 'jenny', 'aria', 'sonia', 'libby', 'clara', 'emma', 'ana',
      'steffi', 'standard-a', 'standard-c', 'standard-e', 'standard-f', 'standard-g',
      'standard-h', 'standard-i', 'wavenet-a', 'wavenet-c', 'wavenet-e', 'wavenet-f',
      'neural2-a', 'neural2-c', 'neural2-e', 'neural2-f', 'uk english female',
      'zoe', 'nicky', 'fiona', 'moira', 'tessa', 'serena', 'stephanie', 'veena',
      'sangeeta',
      'google us english', 'catherine', 'matilda', 'linda', 'martha', 'hazel',
      '-iol', '-iof'
    ];

    const hasMale = maleKeywords.some(kw => text.includes(kw));
    const hasFemale = femaleKeywords.some(kw => text.includes(kw));
    return hasMale && !hasFemale;
  }

  public isFemaleVoice(v: SpeechSynthesisVoice): boolean {
    if (this.isNoveltyVoice(v)) return false;
    const text = `${v.name} ${v.voiceURI}`.toLowerCase();
    const femaleKeywords = [
      '#female', 'female_', 'female-', '-female', '_female', ' female', '(female)',
      'samantha', 'victoria', 'karen', 'zira', 'susan', 'ava', 'allison',
      'kate', 'natural', 'jenny', 'aria', 'sonia', 'libby', 'clara', 'emma', 'ana',
      'steffi', 'standard-a', 'standard-c', 'standard-e', 'standard-f', 'standard-g',
      'standard-h', 'standard-i', 'wavenet-a', 'wavenet-c', 'wavenet-e', 'wavenet-f',
      'neural2-a', 'neural2-c', 'neural2-e', 'neural2-f', 'uk english female',
      'zoe', 'nicky', 'fiona', 'moira', 'tessa', 'serena', 'stephanie', 'veena',
      'sangeeta',
      'google us english', 'catherine', 'matilda', 'linda', 'martha', 'hazel',
      '-iol', '-iof'
    ];
    const maleKeywords = [
      '#male', 'male_', 'male-', '-male', '_male', ' male', '(male)',
      'fred', 'alex', 'david', 'daniel', 'mark', 'tom', 'george', 'guy',
      'brian', 'richard', 'james', 'john', 'oliver', 'aaron', 'arthur', 'gordon',
      'evan', 'nathan', 'christopher', 'eric', 'andrew', 'ryan', 'thomas',
      'lee', 'russell', 'rishi',
      'standard-b', 'standard-d', 'standard-j', 'wavenet-b', 'wavenet-d', 'wavenet-j',
      'neural2-d', 'neural2-j', 'journey-d', 'polyglot-1', 'studio-b', 'studio-d',
      'uk english male', 'us male', 'guy online',
      'google uk english male', 'marcus', 'ravi', 'steve', 'paul',
      '-iom', '-iob', '-iod', '-rjs', '-fis', '-aub', '-cjc', 'male_1', 'male_2', 'male_3'
    ];

    const hasFemale = femaleKeywords.some(kw => text.includes(kw));
    const hasMale = maleKeywords.some(kw => text.includes(kw));
    return hasFemale && !hasMale;
  }

  public getVoicesByGender(gender: VoiceGender): SpeechSynthesisVoice[] {
    const englishVoices = this.getEnglishVoices().filter(v => !this.isNoveltyVoice(v));
    if (gender === 'male') {
      const explicitMales = englishVoices.filter(v => this.isMaleVoice(v));
      const list = explicitMales.length > 0 ? explicitMales : englishVoices;
      return list.sort((a, b) => {
        // Fred prioritized at top for male
        const aFred = a.name.toLowerCase().includes('fred');
        const bFred = b.name.toLowerCase().includes('fred');
        if (aFred && !bFred) return -1;
        if (!aFred && bFred) return 1;
        return 0;
      });
    } else {
      // Return voices that are identified as female, or at least not male
      const explicitFemales = englishVoices.filter(v => this.isFemaleVoice(v));
      const list = explicitFemales.length > 0 ? explicitFemales : englishVoices.filter(v => !this.isMaleVoice(v));
      return list.sort((a, b) => {
        // Samantha prioritized at top for female
        const aSam = a.name.toLowerCase().includes('samantha');
        const bSam = b.name.toLowerCase().includes('samantha');
        if (aSam && !bSam) return -1;
        if (!aSam && bSam) return 1;
        return 0;
      });
    }
  }

  public findVoice(gender: VoiceGender): { voice: SpeechSynthesisVoice | null; isMaleVoiceFound: boolean; isFemaleVoiceFound: boolean } {
    const usVoices = this.getUSVoices();
    const allVoices = this.getVoices();

    if (gender === 'male') {
      // 1. Prioritize Fred (macOS clear male voice requested by user)
      const fred = allVoices.find(v => {
        if (!v.lang.toLowerCase().startsWith('en')) return false;
        const text = `${v.name} ${v.voiceURI}`.toLowerCase();
        return text.includes('fred');
      });
      if (fred) return { voice: fred, isMaleVoiceFound: true, isFemaleVoiceFound: false };

      // 2. High-quality natural US English male voices (excluding novelty)
      const highQualityKeywords = ['alex', 'google uk english male', 'david', 'guy', 'daniel', 'oliver', 'george'];
      const topMale = usVoices.find(v => {
        if (this.isNoveltyVoice(v) || this.isFemaleVoice(v)) return false;
        const text = `${v.name} ${v.voiceURI}`.toLowerCase();
        return highQualityKeywords.some(kw => text.includes(kw));
      });
      if (topMale) return { voice: topMale, isMaleVoiceFound: true, isFemaleVoiceFound: false };

      // 3. Search in US English voices for explicit male keywords (excluding novelty)
      const usMale = usVoices.find(v => this.isMaleVoice(v) && !this.isNoveltyVoice(v));
      if (usMale) return { voice: usMale, isMaleVoiceFound: true, isFemaleVoiceFound: false };

      // 4. Search in any English voices for explicit male keywords (excluding novelty)
      const enMale = allVoices.find(v => v.lang.toLowerCase().startsWith('en') && this.isMaleVoice(v) && !this.isNoveltyVoice(v));
      if (enMale) return { voice: enMale, isMaleVoiceFound: true, isFemaleVoiceFound: false };

      // Crucial: On Android, if NO explicit male voice exists in OS, return null
      // so speak() modulates pitch downwards (0.68) rather than forcing a female voice
      return { voice: null, isMaleVoiceFound: false, isFemaleVoiceFound: false };
    } else {
      // Female voice search
      // 1. Prioritize Samantha (macOS default female, exceptionally clear and requested by user)
      const samantha = allVoices.find(v => {
        if (!v.lang.toLowerCase().startsWith('en')) return false;
        const text = `${v.name} ${v.voiceURI}`.toLowerCase();
        return text.includes('samantha');
      });
      if (samantha) return { voice: samantha, isMaleVoiceFound: false, isFemaleVoiceFound: true };

      // 2. High-quality natural US English female voices (excluding novelty)
      const highQualityFemaleKeywords = ['google us english', 'natural', 'neural', 'victoria', 'ava', 'allison', 'jenny', 'aria', 'zoe'];
      const topFemale = usVoices.find(v => {
        if (this.isNoveltyVoice(v) || this.isMaleVoice(v)) return false;
        const text = `${v.name} ${v.voiceURI}`.toLowerCase();
        return highQualityFemaleKeywords.some(kw => text.includes(kw));
      });
      if (topFemale) return { voice: topFemale, isMaleVoiceFound: false, isFemaleVoiceFound: true };

      // 3. Search in US English voices for explicit female keywords (excluding novelty)
      const usFemale = usVoices.find(v => this.isFemaleVoice(v) && !this.isNoveltyVoice(v));
      if (usFemale) return { voice: usFemale, isMaleVoiceFound: false, isFemaleVoiceFound: true };

      // 4. Search in all English voices for explicit female keywords (excluding novelty)
      const enFemale = allVoices.find(v => v.lang.toLowerCase().startsWith('en') && this.isFemaleVoice(v) && !this.isNoveltyVoice(v));
      if (enFemale) return { voice: enFemale, isMaleVoiceFound: false, isFemaleVoiceFound: true };

      // 5. Fallback: Search for any English voice that is NOT male and NOT novelty
      const nonMale = allVoices.find(v => v.lang.toLowerCase().startsWith('en') && !this.isMaleVoice(v) && !this.isNoveltyVoice(v));
      if (nonMale) return { voice: nonMale, isMaleVoiceFound: false, isFemaleVoiceFound: true };

      // 6. Fallback if only male voices exist in the entire system
      return { voice: null, isMaleVoiceFound: false, isFemaleVoiceFound: false };
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
    utterance.volume = settings.volume ?? 1.0;

    const gender = settings.gender ?? 'female';
    let chosenVoice: SpeechSynthesisVoice | null = null;
    let isMaleVoiceFound = false;

    // 1. If explicit voiceURI is specified, verify compatibility with requested gender
    if (settings.voiceURI && settings.voiceURI.trim().length > 0) {
      const matched = this.getVoices().find(v => v.voiceURI === settings.voiceURI);
      if (matched) {
        const isMale = this.isMaleVoice(matched);
        const isFemale = this.isFemaleVoice(matched);

        // Guard against mismatch: if user requested female, do NOT allow a male voice (e.g. leftover Alex)
        if (gender === 'female' && isMale && !isFemale) {
          chosenVoice = null;
        } else if (gender === 'male' && isFemale && !isMale) {
          chosenVoice = null;
        } else {
          chosenVoice = matched;
          isMaleVoiceFound = isMale;
        }
      }
    }

    // 2. Otherwise auto-detect best voice matching gender
    if (!chosenVoice) {
      const found = this.findVoice(gender);
      chosenVoice = found.voice;
      isMaleVoiceFound = found.isMaleVoiceFound;
    }

    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    const userPitch = settings.pitch ?? 1.0;
    const speed = settings.speed ?? 1.0;

    // Acoustic pitch modulation:
    if (gender === 'male') {
      if (isMaleVoiceFound) {
        // Native male voice present (Alex, David, Daniel, Fred, etc.)
        utterance.pitch = Math.max(0.1, Math.min(2.0, userPitch * 1.0));
        utterance.rate = speed;
      } else {
        // Fallback for Android or systems with only a female default voice
        utterance.pitch = Math.max(0.1, Math.min(2.0, userPitch * 0.68));
        utterance.rate = speed * 0.92;
      }
    } else {
      // Female voice:
      if (chosenVoice && !this.isMaleVoice(chosenVoice)) {
        // Genuine female voice (Samantha, Victoria, etc.)
        utterance.pitch = Math.max(0.1, Math.min(2.0, userPitch * 1.0));
        utterance.rate = speed;
      } else {
        // Fallback: If only male voices exist, shift pitch UP to produce a clear female voice
        utterance.pitch = Math.max(0.1, Math.min(2.0, userPitch * 1.30));
        utterance.rate = speed * 1.02;
      }
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
