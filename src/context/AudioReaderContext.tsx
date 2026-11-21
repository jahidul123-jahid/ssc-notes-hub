import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { aiVoiceService, VoicePlaybackState } from '../services/aiVoiceService';

interface AudioReaderContextType {
  state: VoicePlaybackState;
  play: (text: string, title?: string, subtitle?: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setSpeed: (speed: number) => void;
  seek: (progress: number) => void;
  isItemPlaying: (title: string) => boolean;
}

const AudioReaderContext = createContext<AudioReaderContextType | undefined>(undefined);

export const AudioReaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<VoicePlaybackState>(() => aiVoiceService.getState());

  useEffect(() => {
    const unsubscribe = aiVoiceService.subscribe((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  const play = useCallback((text: string, title: string = 'অডিও পাঠ', subtitle?: string) => {
    aiVoiceService.speak(text, title, subtitle);
  }, []);

  const pause = useCallback(() => aiVoiceService.pause(), []);
  const resume = useCallback(() => aiVoiceService.resume(), []);
  const stop = useCallback(() => aiVoiceService.stop(), []);
  const setSpeed = useCallback((speed: number) => aiVoiceService.setSpeed(speed), []);
  const seek = useCallback((progress: number) => aiVoiceService.seek(progress), []);

  const isItemPlaying = useCallback((title: string) => {
    return state.title === title && (state.status === 'playing' || state.status === 'loading');
  }, [state.title, state.status]);

  const value = useMemo(() => ({
    state,
    play,
    pause,
    resume,
    stop,
    setSpeed,
    seek,
    isItemPlaying,
  }), [state, play, pause, resume, stop, setSpeed, seek, isItemPlaying]);

  return (
    <AudioReaderContext.Provider value={value}>
      {children}
    </AudioReaderContext.Provider>
  );
};

export const useAudioReader = () => {
  const context = useContext(AudioReaderContext);
  if (!context) {
    throw new Error('useAudioReader must be used within an AudioReaderProvider');
  }
  return context;
};
