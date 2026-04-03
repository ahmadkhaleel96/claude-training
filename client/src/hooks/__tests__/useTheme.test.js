import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../useTheme';

const STORAGE_KEY = 'tic-tac-toe-theme';

function setupMatchMedia(matches) {
  const listeners = new Set();
  const mq = {
    matches,
    addEventListener: vi.fn((_, handler) => listeners.add(handler)),
    removeEventListener: vi.fn((_, handler) => listeners.delete(handler)),
    trigger: (newMatches) => {
      act(() => listeners.forEach((h) => h({ matches: newMatches })));
    },
  };
  vi.stubGlobal('matchMedia', vi.fn(() => mq));
  return mq;
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('initial theme', () => {
  it('defaults to light when system preference is light', () => {
    setupMatchMedia(false);
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
  });

  it('defaults to dark when system preference is dark', () => {
    setupMatchMedia(true);
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
  });

  it('uses localStorage value over system preference', () => {
    setupMatchMedia(false);
    localStorage.setItem(STORAGE_KEY, 'dark');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
  });
});

describe('DOM effect', () => {
  it('sets data-theme attribute on document.documentElement', () => {
    setupMatchMedia(false);
    renderHook(() => useTheme());
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('updates data-theme when theme changes', () => {
    setupMatchMedia(false);
    const { result } = renderHook(() => useTheme());
    act(() => result.current.toggleTheme());
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});

describe('toggleTheme', () => {
  it('flips from light to dark', () => {
    setupMatchMedia(false);
    const { result } = renderHook(() => useTheme());
    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe('dark');
  });

  it('flips from dark to light', () => {
    setupMatchMedia(true);
    const { result } = renderHook(() => useTheme());
    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe('light');
  });

  it('saves to localStorage after first toggle', () => {
    setupMatchMedia(false);
    const { result } = renderHook(() => useTheme());
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    act(() => result.current.toggleTheme());
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
  });

  it('updates localStorage on each subsequent toggle', () => {
    setupMatchMedia(false);
    const { result } = renderHook(() => useTheme());
    act(() => result.current.toggleTheme());
    act(() => result.current.toggleTheme());
    expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
  });
});

describe('system preference listener', () => {
  it('does not write to localStorage before user toggles', () => {
    setupMatchMedia(false);
    renderHook(() => useTheme());
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('follows system preference changes when user has not toggled', () => {
    const mq = setupMatchMedia(false);
    const { result } = renderHook(() => useTheme());
    mq.trigger(true);
    expect(result.current.theme).toBe('dark');
  });

  it('ignores system preference changes after user has toggled', () => {
    const mq = setupMatchMedia(false);
    const { result } = renderHook(() => useTheme());
    act(() => result.current.toggleTheme()); // user sets dark
    mq.trigger(false);                       // system reverts to light
    expect(result.current.theme).toBe('dark');
  });

  it('removes the listener on unmount', () => {
    const mq = setupMatchMedia(false);
    const { unmount } = renderHook(() => useTheme());
    unmount();
    expect(mq.removeEventListener).toHaveBeenCalled();
  });

  it('removes the listener when user overrides (stops tracking system)', () => {
    const mq = setupMatchMedia(false);
    const { result } = renderHook(() => useTheme());
    act(() => result.current.toggleTheme());
    expect(mq.removeEventListener).toHaveBeenCalled();
  });
});
