import React, { useState, useEffect, useRef } from 'react';
import storage from '../../lib/storage';

/**
 * AudioPlayer - Retro sound effects & ambient breeze generator using Web Audio API.
 * Follows Section 7.4 & Mobile Fix Fase 1:
 * - Default status: OFF
 * - Minimum 44x44px tap target
 * - aria-pressed attribute for accessibility
 */
export function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(() =>
    storage.get('portfolio_audio_enabled', false)
  );

  const audioCtxRef = useRef(null);
  const windGainRef = useRef(null);
  const windNoiseRef = useRef(null);

  // Initialize and toggle Web Audio
  const toggleAudio = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    storage.set('portfolio_audio_enabled', nextState);

    if (nextState) {
      startAmbientSound();
      playClickSound();
    } else {
      stopAmbientSound();
    }
  };

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtxRef.current = new AudioContext();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const startAmbientSound = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.015;
        b6 = white * 0.115926;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();

      windNoiseRef.current = whiteNoise;
      windGainRef.current = gain;
    } catch (err) {
      console.warn('Audio synthesis notice:', err);
    }
  };

  const stopAmbientSound = () => {
    try {
      if (windNoiseRef.current) {
        windNoiseRef.current.stop();
        windNoiseRef.current.disconnect();
        windNoiseRef.current = null;
      }
    } catch (e) {
      // Ignore
    }
  };

  const playClickSound = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {
      // Ignore
    }
  };

  useEffect(() => {
    if (!isPlaying) return;

    const handleGlobalClick = (e) => {
      const isButton = e.target.closest('button') || e.target.closest('a');
      if (isButton) {
        playClickSound();
      }
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      stopAmbientSound();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <button
      type="button"
      onClick={toggleAudio}
      aria-pressed={isPlaying}
      className="flex items-center justify-center min-w-[44px] min-h-[44px] px-2.5 py-1.5 border-2 border-[var(--ink)] bg-[var(--cream)] text-[var(--ink)] font-pixel text-xs shadow-[2px_2px_0_var(--ink)] active:translate-y-[1px] active:shadow-none cursor-pointer"
      title={isPlaying ? 'Matikan Suara Ambience' : 'Nyalakan Suara Ambience'}
      aria-label={isPlaying ? 'Audio aktif. Klik untuk mematikan.' : 'Audio nonaktif. Klik untuk menyalakan.'}
    >
      <span className="text-base leading-none">{isPlaying ? '🔊' : '🔇'}</span>
      <span className="hidden lg:inline ml-1 font-bold">
        {isPlaying ? 'AUDIO ON' : 'AUDIO OFF'}
      </span>
    </button>
  );
}

export default AudioPlayer;
