import { useRef } from 'react';

export function useSoundEffects() {
  const ctxRef = useRef(null);

  function getCtx() {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }

  function tone(freq, duration, type, volume, startOffset) {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startOffset);
    gain.gain.setValueAtTime(0, ctx.currentTime + startOffset);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + startOffset + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startOffset + duration);
    osc.start(ctx.currentTime + startOffset);
    osc.stop(ctx.currentTime + startOffset + duration + 0.05);
  }

  return {
    playPlace: () => tone(380, 0.07, 'square', 0.1, 0),

    playWin: () => {
      // C major arpeggio: C5 → E5 → G5 → C6
      [[523, 0], [659, 0.1], [784, 0.2], [1047, 0.35]].forEach(([f, t]) =>
        tone(f, 0.3, 'sine', 0.25, t)
      );
    },

    playDraw: () => {
      // Descending tritone
      [[440, 0], [370, 0.15], [310, 0.32]].forEach(([f, t]) =>
        tone(f, 0.28, 'triangle', 0.18, t)
      );
    },
  };
}
