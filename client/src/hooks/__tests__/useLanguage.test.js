import { renderHook, act } from '@testing-library/react';
import { useLanguage } from '../useLanguage';

const STORAGE_KEY = 'tic-tac-toe-lang';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('lang');
  document.documentElement.removeAttribute('dir');
  vi.stubGlobal('navigator', { language: 'en-US' });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('initial language', () => {
  it('defaults to English when browser language is English', () => {
    const { result } = renderHook(() => useLanguage());
    expect(result.current.lang).toBe('en');
  });

  it('defaults to Arabic when browser language is Arabic', () => {
    vi.stubGlobal('navigator', { language: 'ar-SA' });
    const { result } = renderHook(() => useLanguage());
    expect(result.current.lang).toBe('ar');
  });

  it('uses localStorage value over browser language', () => {
    localStorage.setItem(STORAGE_KEY, 'ar');
    vi.stubGlobal('navigator', { language: 'en-US' });
    const { result } = renderHook(() => useLanguage());
    expect(result.current.lang).toBe('ar');
  });
});

describe('DOM effect', () => {
  it('sets lang attribute to "en" on document.documentElement', () => {
    renderHook(() => useLanguage());
    expect(document.documentElement.lang).toBe('en');
  });

  it('sets dir to "ltr" for English', () => {
    renderHook(() => useLanguage());
    expect(document.documentElement.dir).toBe('ltr');
  });

  it('sets lang attribute to "ar" when language is Arabic', () => {
    localStorage.setItem(STORAGE_KEY, 'ar');
    renderHook(() => useLanguage());
    expect(document.documentElement.lang).toBe('ar');
  });

  it('sets dir to "rtl" when language is Arabic', () => {
    localStorage.setItem(STORAGE_KEY, 'ar');
    renderHook(() => useLanguage());
    expect(document.documentElement.dir).toBe('rtl');
  });

  it('updates dir to "rtl" after toggling to Arabic', () => {
    const { result } = renderHook(() => useLanguage());
    act(() => result.current.toggleLanguage());
    expect(document.documentElement.dir).toBe('rtl');
  });
});

describe('toggleLanguage', () => {
  it('switches from English to Arabic', () => {
    const { result } = renderHook(() => useLanguage());
    act(() => result.current.toggleLanguage());
    expect(result.current.lang).toBe('ar');
  });

  it('switches from Arabic to English', () => {
    localStorage.setItem(STORAGE_KEY, 'ar');
    const { result } = renderHook(() => useLanguage());
    act(() => result.current.toggleLanguage());
    expect(result.current.lang).toBe('en');
  });

  it('persists the new language to localStorage', () => {
    const { result } = renderHook(() => useLanguage());
    act(() => result.current.toggleLanguage());
    expect(localStorage.getItem(STORAGE_KEY)).toBe('ar');
  });

  it('persists back to English after two toggles', () => {
    const { result } = renderHook(() => useLanguage());
    act(() => result.current.toggleLanguage());
    act(() => result.current.toggleLanguage());
    expect(localStorage.getItem(STORAGE_KEY)).toBe('en');
  });
});
