// ============================================================================
// SSC Notes Hub - AI Audio Voice Reader Service (Cartesia AI & Web Speech Fallback)
// ============================================================================

export interface VoicePlaybackState {
  status: 'idle' | 'loading' | 'playing' | 'paused' | 'error';
  engine: 'cartesia' | 'webspeech' | 'none';
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
  private defaultVoiceId = '47c38ca4-5f35-497b-b1a3-415245fb35e1'; // Daniel - Modern Assistant (supports Bengali with sonic-3.6)
  private currentAudio: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private audioCache = new Map<string, string>(); // Text hash -> Blob URL
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

    // 1. Try Cartesia AI first if API Key is available
    if (this.cartesiaApiKey) {
      try {
        const audioUrl = await this.fetchCartesiaAudio(cleanText);
        this.playHtmlAudio(audioUrl, cleanText);
        return;
      } catch (err: any) {
        console.warn('Cartesia TTS unavailable or limit reached, falling back to Web Speech engine:', err?.message || err);
      }
    }

    // 2. Seamless Fallback: Native Web Speech API with Bengali Voice
    this.playWebSpeech(cleanText);
  }

  /**
   * Fetch audio bytes from Cartesia AI API
   */
  private async fetchCartesiaAudio(text: string): Promise<string> {
    const cacheKey = `cartesia_${text.slice(0, 80)}_${text.length}`;
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey)!;
    }

    // Truncate text if too long for a single request (Cartesia recommends max ~1000 characters)
    const truncated = text.length > 900 ? text.slice(0, 900) + '...' : text;

    const response = await fetch(this.cartesiaEndpoint, {
      method: 'POST',
      headers: {
        'X-API-Key': this.cartesiaApiKey,
        'Cartesia-Version': this.cartesiaVersion,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_id: 'sonic-3.6',
        transcript: truncated,
        voice: {
          mode: 'id',
          id: this.defaultVoiceId,
        },
        language: 'bn',
        output_format: {
          container: 'mp3',
          bit_rate: 128000,
          sample_rate: 44100,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cartesia API HTTP ${response.status}: ${errorText}`);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    this.audioCache.set(cacheKey, objectUrl);
    return objectUrl;
  }

  /**
   * Play audio via HTML5 Audio Element (Cartesia output)
   */
  private playHtmlAudio(url: string, _text: string) {
    const audio = new Audio(url);
    this.currentAudio = audio;
    audio.playbackRate = this.state.speed;

    audio.onloadedmetadata = () => {
      this.state.duration = audio.duration || 0;
      this.notify();
    };

    audio.onplay = () => {
      this.state.status = 'playing';
      this.state.engine = 'cartesia';
      this.notify();
    };

    audio.ontimeupdate = () => {
      if (audio.duration) {
        this.state.currentTime = audio.currentTime;
        this.state.progress = audio.currentTime / audio.duration;
        this.notify();
      }
    };

    audio.onended = () => {
      this.state.status = 'idle';
      this.state.progress = 1;
      this.notify();
    };

    audio.onerror = () => {
      console.warn('Audio playback error, falling back to Web Speech');
      this.playWebSpeech(_text);
    };

    audio.play().catch((err) => {
      console.warn('Audio play() rejected:', err);
      this.playWebSpeech(_text);
    });
  }

  /**
   * High-compatibility Web Speech API fallback for Bengali
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

    // Try to find Bengali voices (bn-BD, bn-IN) or best fallback
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

    utterance.rate = this.state.speed;
    utterance.pitch = 1.0;

    // Approximate duration based on word count (approx 130 words per minute)
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
      this.state.status = 'idle';
      this.state.progress = 1;
      this.notify();
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
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
    this.state = {
      ...this.state,
      status: 'idle',
      progress: 0,
      currentTime: 0,
    };
    this.notify();
  }

  public setSpeed(speed: number) {
    this.state.speed = speed;
    if (this.currentAudio) {
      this.currentAudio.playbackRate = speed;
    }
    if (this.currentUtterance && window.speechSynthesis) {
      // For speech synthesis, changing speed usually requires restart
      this.currentUtterance.rate = speed;
    }
    this.notify();
  }

  public seek(progress: number) {
    if (this.currentAudio && this.currentAudio.duration) {
      const targetTime = Math.max(0, Math.min(this.currentAudio.duration * progress, this.currentAudio.duration));
      this.currentAudio.currentTime = targetTime;
      this.state.currentTime = targetTime;
      this.state.progress = progress;
      this.notify();
    }
  }

  private sanitizeText(raw: string): string {
    return raw
      .replace(/https?:\/\/\S+/g, '') // remove urls
      .replace(/[#*_~`\[\]()<>]/g, ' ') // remove markdown syntax
      .replace(/\s+/g, ' ')
      .trim();
  }
}

export const aiVoiceService = new AIVoiceService();
