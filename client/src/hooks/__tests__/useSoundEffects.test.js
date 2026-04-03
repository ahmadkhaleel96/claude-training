import { renderHook } from '@testing-library/react';
import { useSoundEffects } from '../useSoundEffects';

function makeMockCtx(state = 'running') {
  const gain = {
    connect: vi.fn(),
    gain: {
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
  };
  const osc = {
    connect: vi.fn(),
    type: '',
    frequency: { setValueAtTime: vi.fn() },
    start: vi.fn(),
    stop: vi.fn(),
  };
  return {
    state,
    currentTime: 0,
    destination: {},
    resume: vi.fn(),
    createOscillator: vi.fn(() => osc),
    createGain: vi.fn(() => gain),
    _osc: osc,
    _gain: gain,
  };
}

let mockCtx;

beforeEach(() => {
  mockCtx = makeMockCtx();
  vi.stubGlobal('AudioContext', vi.fn(() => mockCtx));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AudioContext lifecycle', () => {
  it('creates an AudioContext on first play', () => {
    const { result } = renderHook(() => useSoundEffects());
    result.current.playPlace();
    expect(window.AudioContext).toHaveBeenCalledTimes(1);
  });

  it('reuses the same AudioContext across multiple plays', () => {
    const { result } = renderHook(() => useSoundEffects());
    result.current.playPlace();
    result.current.playPlace();
    expect(window.AudioContext).toHaveBeenCalledTimes(1);
  });

  it('resumes a suspended AudioContext before playing', () => {
    mockCtx = makeMockCtx('suspended');
    vi.stubGlobal('AudioContext', vi.fn(() => mockCtx));
    const { result } = renderHook(() => useSoundEffects());
    result.current.playPlace();
    expect(mockCtx.resume).toHaveBeenCalled();
  });

  it('does not call resume when context is already running', () => {
    const { result } = renderHook(() => useSoundEffects());
    result.current.playPlace();
    expect(mockCtx.resume).not.toHaveBeenCalled();
  });

  it('falls back to webkitAudioContext when AudioContext is unavailable', () => {
    const webkitMock = vi.fn(() => mockCtx);
    vi.stubGlobal('AudioContext', undefined);
    vi.stubGlobal('webkitAudioContext', webkitMock);
    const { result } = renderHook(() => useSoundEffects());
    result.current.playPlace();
    expect(webkitMock).toHaveBeenCalledTimes(1);
  });
});

describe('playPlace', () => {
  it('creates exactly one oscillator and one gain node', () => {
    const { result } = renderHook(() => useSoundEffects());
    result.current.playPlace();
    expect(mockCtx.createOscillator).toHaveBeenCalledTimes(1);
    expect(mockCtx.createGain).toHaveBeenCalledTimes(1);
  });

  it('sets oscillator type to square', () => {
    const { result } = renderHook(() => useSoundEffects());
    result.current.playPlace();
    expect(mockCtx._osc.type).toBe('square');
  });

  it('connects oscillator → gain → destination', () => {
    const { result } = renderHook(() => useSoundEffects());
    result.current.playPlace();
    expect(mockCtx._osc.connect).toHaveBeenCalledWith(mockCtx._gain);
    expect(mockCtx._gain.connect).toHaveBeenCalledWith(mockCtx.destination);
  });

  it('starts and stops the oscillator', () => {
    const { result } = renderHook(() => useSoundEffects());
    result.current.playPlace();
    expect(mockCtx._osc.start).toHaveBeenCalled();
    expect(mockCtx._osc.stop).toHaveBeenCalled();
  });
});

describe('playWin', () => {
  it('creates 4 oscillator+gain pairs (one per arpeggio note)', () => {
    const { result } = renderHook(() => useSoundEffects());
    result.current.playWin();
    expect(mockCtx.createOscillator).toHaveBeenCalledTimes(4);
    expect(mockCtx.createGain).toHaveBeenCalledTimes(4);
  });

  it('uses sine wave oscillators', () => {
    const { result } = renderHook(() => useSoundEffects());
    result.current.playWin();
    expect(mockCtx._osc.type).toBe('sine');
  });
});

describe('playDraw', () => {
  it('creates 3 oscillator+gain pairs (one per descending note)', () => {
    const { result } = renderHook(() => useSoundEffects());
    result.current.playDraw();
    expect(mockCtx.createOscillator).toHaveBeenCalledTimes(3);
    expect(mockCtx.createGain).toHaveBeenCalledTimes(3);
  });

  it('uses triangle wave oscillators', () => {
    const { result } = renderHook(() => useSoundEffects());
    result.current.playDraw();
    expect(mockCtx._osc.type).toBe('triangle');
  });
});
