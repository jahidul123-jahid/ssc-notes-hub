// ============================================================================
// SSC Note Box - High-Quality Bengali AI Voice Reader Service
// Supported Engines:
// 1. Google Neural Bengali TTS (100% natural native Bangla speaker, zero-config)
// 2. Cartesia Multilingual Sonic-3.6 (Dedicated high-speed AI voice)
// 3. Web Speech API (Seamless offline fallback)
// ============================================================================

export interface VoicePlaybackState {
  status: 'idle' | 'loading' | 'playing' | 'paused' | 'error';
  engine: 'google' | 'cartesia' | 'webspeech' | 'none';
  title: string;
  subtitle?: string;
  progress: number; // 0 to 1
  currentTime: number;
  duration: number;
  speed: number;
  errorMessage?: string;
}

type StateListener = (state: VoicePlaybackState) => void;

class AIVoiceService {
  private cartesiaApiKey: string;
  private cartesiaEndpoint = 'https://api.cartesia.ai/tts/bytes';
  private cartesiaVersion = '2024-11-13';
  private cartesiaVoiceId = 'd23ab7c3-2d90-4e26-aab9-a06766086ef7'; // Sohini - Cheerful Concierge (Bengali sonic-3.6)

  private currentAudio: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private audioQueue: string[] = [];
  private currentQueueIndex = 0;
  private listeners: StateListener[] = [];

  private state: VoicePlaybackState = {
    status: 'idle',
    engine: 'none',
    title: '',
    progress: 0,
    currentTime: 0,
    duration: 0,
    speed: 1.0,
  };

  constructor() {
    this.cartesiaApiKey =
      import.meta.env.VITE_CARTESIA_API_KEY ||
      'sk_car_Vg41ARhoTAfwGhDo1PzgVH';
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l({ ...this.state }));
  }

  public getState(): VoicePlaybackState {
    return { ...this.state };
  }

  public setApiKey(key: string) {
    this.cartesiaApiKey = key.trim();
  }

  /**
   * Main entry to play text with AI Voice
   */
  public async speak(text: string, title: string = 'অডিও পাঠ', subtitle?: string) {
    this.stop();

    const cleanText = this.sanitizeText(text);
    if (!cleanText) return;

    this.state = {
      ...this.state,
      status: 'loading',
      title,
      subtitle,
      progress: 0,
      currentTime: 0,
      duration: 0,
      errorMessage: undefined,
    };
    this.notify();

    // 1. Play with Google Neural Bengali TTS (crystal-clear native Bangla speaker)
    try {
      this.playGoogleBengali(cleanText);
    } catch (err) {
      console.warn("Google Bengali TTS failed, falling back to Web Speech:", err);
      this.playWebSpeech(cleanText);
    }
  }

  /**
   * Split long text into natural sentence chunks
   */
  private splitIntoChunks(text: string, maxLen = 170): string[] {
    const sentences = text.match(/[^।?!,\n]+[।?!,\n]?/g) || [text];
    const chunks: string[] = [];
    let current = '';

    for (const s of sentences) {
      if ((current + ' ' + s).trim().length <= maxLen) {
        current = (current + ' ' + s).trim();
      } else {
        if (current) chunks.push(current);
        if (s.length > maxLen) {
          const words = s.split(' ');
          let sub = '';
          for (const w of words) {
            if ((sub + ' ' + w).trim().length <= maxLen) {
              sub = (sub + ' ' + w).trim();
            } else {
              if (sub) chunks.push(sub);
              sub = w;
            }
          }
          if (sub) current = sub;
        } else {
          current = s.trim();
        }
      }
    }
    if (current) chunks.push(current);
    return chunks;
  }

  /**
   * High-quality Google Bengali Neural Speech Streamer
   */
  private playGoogleBengali(text: string) {
    this.audioQueue = this.splitIntoChunks(text);
    this.currentQueueIndex = 0;
    this.playNextGoogleChunk();
  }

  private playNextGoogleChunk() {
    if (this.currentQueueIndex >= this.audioQueue.length) {
      // Finished speaking all sentences cleanly
      this.stop();
      return;
    }

    const chunk = this.audioQueue[this.currentQueueIndex];
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=bn&client=tw-ob`;

    const audio = new Audio(url);
    this.currentAudio = audio;
    audio.playbackRate = this.state.speed;

    audio.onloadedmetadata = () => {
      this.state.duration = audio.duration || 0;
      this.notify();
    };

    audio.onplay = () => {
      this.state.status = 'playing';
      this.state.engine = 'google';
      this.notify();
    };

    audio.ontimeupdate = () => {
      if (audio.duration) {
        const chunkProgress = audio.currentTime / audio.duration;
        const totalProgress = (this.currentQueueIndex + chunkProgress) / this.audioQueue.length;
        this.state.currentTime = audio.currentTime;
        this.state.duration = audio.duration;
        this.state.progress = Math.min(1, totalProgress);
        this.notify();
      }
    };

    audio.onended = () => {
      this.currentQueueIndex++;
      this.playNextGoogleChunk();
    };

    audio.onerror = () => {
      console.warn('Google TTS audio chunk error, switching to browser speech synthesis');
      this.playWebSpeech(this.audioQueue.slice(this.currentQueueIndex).join(' '));
    };

    audio.play().catch((err) => {
      console.warn('Audio play() blocked by browser, trying Web Speech:', err);
      this.playWebSpeech(chunk);
    });
  }

  /**
   * Seamless Fallback: Native Web Speech API
   */
  private playWebSpeech(text: string) {
    if (!('speechSynthesis' in window)) {
      this.state = {
        ...this.state,
        status: 'error',
        engine: 'none',
        errorMessage: 'আপনার ব্রাউজারে অডিও স্পিচ সমর্থন করে না।',
      };
      this.notify();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;

    const selectVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const bengaliVoice = voices.find(
        (v) => v.lang.startsWith('bn') || v.lang.includes('Bengali') || v.name.includes('Bangla')
      );

      if (bengaliVoice) {
        utterance.voice = bengaliVoice;
        utterance.lang = bengaliVoice.lang;
      } else {
        utterance.lang = 'bn-BD';
      }
    };

    selectVoice();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = selectVoice;
    }

    utterance.rate = this.state.speed;
    utterance.pitch = 1.0;

    const words = text.split(/\s+/).length;
    const estimatedDuration = Math.max(3, (words / 130) * 60);
    this.state.duration = estimatedDuration;
    const startTime = Date.now();

    let timer: any = null;

    utterance.onstart = () => {
      this.state.status = 'playing';
      this.state.engine = 'webspeech';
      this.notify();

      timer = setInterval(() => {
        if (this.state.status !== 'playing') {
          clearInterval(timer);
          return;
        }
        const elapsed = (Date.now() - startTime) / 1000;
        this.state.currentTime = Math.min(elapsed, estimatedDuration);
        this.state.progress = Math.min(1, elapsed / estimatedDuration);
        this.notify();
      }, 250);
    };

    utterance.onend = () => {
      if (timer) clearInterval(timer);
      this.stop();
    };

    utterance.onerror = (e) => {
      if (timer) clearInterval(timer);
      if (e.error !== 'canceled') {
        this.state.status = 'error';
        this.state.errorMessage = 'অডিও চালাতে সমস্যা হয়েছে।';
        this.notify();
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  public pause() {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
      this.state.status = 'paused';
      this.notify();
    } else if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      this.state.status = 'paused';
      this.notify();
    }
  }

  public resume() {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play();
      this.state.status = 'playing';
      this.notify();
    } else if (window.speechSynthesis && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      this.state.status = 'playing';
      this.notify();
    }
  }

  public stop() {
    // If already idle, do nothing to prevent unnecessary state broadcasts and infinite render loops
    if (this.state.status === 'idle') {
      return;
    }

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio.onended = null;
      this.currentAudio.onerror = null;
      this.currentAudio = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
    this.audioQueue = [];
    this.currentQueueIndex = 0;

    this.state = {
      ...this.state,
      status: 'idle',
      title: '',
      subtitle: '',
      progress: 0,
      currentTime: 0,
      duration: 0,
    };
    this.notify();
  }

  public setSpeed(speed: number) {
    this.state.speed = speed;
    if (this.currentAudio) {
      this.currentAudio.playbackRate = speed;
    }
    if (this.currentUtterance && window.speechSynthesis) {
      this.currentUtterance.rate = speed;
    }
    this.notify();
  }

  public seek(progress: number) {
    if (this.currentAudio && this.currentAudio.duration) {
      this.currentAudio.currentTime = progress * this.currentAudio.duration;
      this.state.currentTime = this.currentAudio.currentTime;
      this.state.progress = progress;
      this.notify();
    }
  }

  private sanitizeText(raw: string): string {
    return raw
      .replace(/<[^>]*>/g, '') // Strip HTML tags
      .replace(/https?:\/\/\S+/g, '') // Strip URLs
      .replace(/[*_#`~[\]]/g, '') // Strip Markdown formatting
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .trim();
  }
}

export const aiVoiceService = new AIVoiceService();
