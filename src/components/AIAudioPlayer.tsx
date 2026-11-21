import React, { useState } from 'react';
import { useAudioReader } from '../context/AudioReaderContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Play,
  Pause,
  Square,
  Volume2,
  X,
  Sparkles,
  ChevronUp,
  ChevronDown,
  RotateCcw
} from 'lucide-react';

export const AIAudioPlayer: React.FC = () => {
  const { state, pause, resume, stop, setSpeed, seek } = useAudioReader();
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  // When audio is stopped or idle, immediately close and hide the player
  if (state.status === 'idle') {
    return null;
  }

  const isPlaying = state.status === 'playing';
  const isLoading = state.status === 'loading';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progress = Math.max(0, Math.min(1, clickX / rect.width));
    seek(progress);
  };

  return (
    <aside
      role="region"
      aria-label="AI Audio Player"
      className="fixed bottom-3 sm:bottom-6 right-2 sm:right-6 left-2 sm:left-auto z-40 sm:w-96 max-w-full pb-safe animate-slide-up"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-brand-200/80 shadow-2xl overflow-hidden transition-all duration-300">
        {/* Top Accent Gradient Bar */}
        <div className="h-1 bg-gradient-to-r from-brand-500 via-violetAccent to-indigo-600 relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 bg-white/40 animate-pulse" />
          )}
        </div>

        {/* Player Header & Main Row */}
        <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
          {/* Animated Wave / Icon */}
          <div className="relative shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-brand-50 text-brand-600 border border-brand-200/60">
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <div className="flex items-center gap-0.5 h-4">
                <span className="w-1 bg-brand-600 rounded-full animate-[bounce_0.8s_infinite_100ms] h-full" />
                <span className="w-1 bg-brand-500 rounded-full animate-[bounce_0.8s_infinite_300ms] h-3" />
                <span className="w-1 bg-brand-600 rounded-full animate-[bounce_0.8s_infinite_200ms] h-5" />
                <span className="w-1 bg-brand-400 rounded-full animate-[bounce_0.8s_infinite_400ms] h-2.5" />
              </div>
            ) : (
              <Volume2 className="w-5 h-5 text-brand-600" />
            )}
          </div>

          {/* Title & Status */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-100/80 text-brand-700 uppercase tracking-wider">
                <Sparkles className="w-2.5 h-2.5" />
                {state.engine === 'google' ? 'Google বাংলা AI' : state.engine === 'cartesia' ? 'Cartesia AI' : 'বাংলা স্পিচ'}
              </span>
              {state.subtitle && (
                <span className="text-[11px] text-secondaryText truncate">
                  • {state.subtitle}
                </span>
              )}
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-primaryText truncate mt-0.5">
              {state.title || t('player_playing')}
            </h4>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-1 shrink-0">
            {isPlaying ? (
              <button
                onClick={pause}
                className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 transition-colors shadow-sm active:scale-95"
                title="বিরতি দিন"
                aria-label="Pause audio"
              >
                <Pause className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                onClick={resume}
                disabled={isLoading}
                className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 transition-colors shadow-sm disabled:opacity-50 active:scale-95"
                title="চালিয়ে যান"
                aria-label="Resume audio"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </button>
            )}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-8 h-8 rounded-lg text-secondaryText hover:text-primaryText hover:bg-slate-100 flex items-center justify-center transition-colors"
              title={isExpanded ? 'ছোট করুন' : 'বিস্তারিত নিয়ন্ত্রণ'}
              aria-label="Toggle player details"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={stop}
              className="w-8 h-8 rounded-lg text-secondaryText hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
              title="বন্ধ করুন"
              aria-label="Stop audio"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div
          onClick={handleProgressBarClick}
          className="h-1.5 w-full bg-slate-100 cursor-pointer relative group"
        >
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-violetAccent transition-all duration-150"
            style={{ width: `${Math.min(100, Math.max(0, state.progress * 100))}%` }}
          />
        </div>

        {/* Expanded View Controls */}
        {isExpanded && (
          <div className="p-3.5 sm:p-4 pt-2 border-t border-cardBorder bg-slate-50/70 space-y-3">
            {/* Time Indicators */}
            <div className="flex items-center justify-between text-[11px] font-semibold text-secondaryText">
              <span>{formatTime(state.currentTime)}</span>
              <span>{state.duration > 0 ? formatTime(state.duration) : '--:--'}</span>
            </div>

            {/* Playback Speed Selectors */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-xs font-semibold text-secondaryText">{t('reading_speed')}</span>
              <div className="flex items-center gap-1.5">
                {[0.75, 1.0, 1.25, 1.5].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setSpeed(spd)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      state.speed === spd
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-white text-secondaryText hover:text-primaryText border border-cardBorder'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Secondary Controls: Replay / Stop */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <button
                onClick={() => seek(0)}
                className="inline-flex items-center gap-1.5 text-secondaryText hover:text-brand-600 font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('restart_audio')}</span>
              </button>

              <button
                onClick={stop}
                className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700 font-semibold"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{t('stop_player')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
