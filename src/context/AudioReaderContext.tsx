import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const [state, setState] = useState<VoicePlaybackState>(aiVoiceService.getState());

  useEffect(() => {
    const unsubscribe = aiVoiceService.subscribe((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  const play = (text: string, title: string = 'অডিও পাঠ', subtitle?: string) => {
    aiVoiceService.speak(text, title, subtitle);
  };

  const pause = () => aiVoiceService.pause();
  const resume = () => aiVoiceService.resume();
  const stop = () => aiVoiceService.stop();
  const setSpeed = (speed: number) => aiVoiceService.setSpeed(speed);
  const seek = (progress: number) => aiVoiceService.seek(progress);

  const isItemPlaying = (title: string) => {
    return state.title === title && (state.status === 'playing' || state.status === 'loading');
  };

  return (
    <AudioReaderContext.Provider
      value={{
        state,
        play,
        pause,
        resume,
        stop,
        setSpeed,
        seek,
        isItemPlaying,
      }}
    >
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
