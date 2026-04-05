import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';

const USERNAME_KEY = 'ttt_username';
const VISITED_KEY = 'ttt_visited';

beforeEach(() => {
  localStorage.clear();
});

describe('useAuth — initial state', () => {
  it('shows modal on first visit (no visited flag)', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.showModal).toBe(true);
  });

  it('does not show modal when visited flag is set', () => {
    localStorage.setItem(VISITED_KEY, '1');
    const { result } = renderHook(() => useAuth());
    expect(result.current.showModal).toBe(false);
  });

  it('restores username from localStorage', () => {
    localStorage.setItem(USERNAME_KEY, 'alice');
    localStorage.setItem(VISITED_KEY, '1');
    const { result } = renderHook(() => useAuth());
    expect(result.current.username).toBe('alice');
  });

  it('starts with null username when none is stored', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.username).toBeNull();
  });
});

describe('useAuth — setUsername', () => {
  it('sets username, closes modal, and persists to localStorage', () => {
    const { result } = renderHook(() => useAuth());
    act(() => result.current.setUsername('alice'));
    expect(result.current.username).toBe('alice');
    expect(result.current.showModal).toBe(false);
    expect(localStorage.getItem(USERNAME_KEY)).toBe('alice');
    expect(localStorage.getItem(VISITED_KEY)).toBe('1');
  });

  it('trims whitespace from username', () => {
    const { result } = renderHook(() => useAuth());
    act(() => result.current.setUsername('  bob  '));
    expect(result.current.username).toBe('bob');
    expect(localStorage.getItem(USERNAME_KEY)).toBe('bob');
  });
});

describe('useAuth — continueAsGuest', () => {
  it('sets username to null, closes modal, sets visited flag', () => {
    const { result } = renderHook(() => useAuth());
    act(() => result.current.continueAsGuest());
    expect(result.current.username).toBeNull();
    expect(result.current.showModal).toBe(false);
    expect(localStorage.getItem(VISITED_KEY)).toBe('1');
    expect(localStorage.getItem(USERNAME_KEY)).toBeNull();
  });

  it('does not show modal on next render after guest choice', () => {
    const { result } = renderHook(() => useAuth());
    act(() => result.current.continueAsGuest());

    // Simulate remount
    const { result: result2 } = renderHook(() => useAuth());
    expect(result2.current.showModal).toBe(false);
  });
});

describe('useAuth — openModal', () => {
  it('sets showModal to true', () => {
    localStorage.setItem(VISITED_KEY, '1');
    const { result } = renderHook(() => useAuth());
    expect(result.current.showModal).toBe(false);
    act(() => result.current.openModal());
    expect(result.current.showModal).toBe(true);
  });
});

describe('useAuth — logout', () => {
  it('clears username from state and localStorage', () => {
    localStorage.setItem(USERNAME_KEY, 'alice');
    localStorage.setItem(VISITED_KEY, '1');
    const { result } = renderHook(() => useAuth());
    act(() => result.current.logout());
    expect(result.current.username).toBeNull();
    expect(localStorage.getItem(USERNAME_KEY)).toBeNull();
  });

  it('does not re-open the modal on logout', () => {
    localStorage.setItem(USERNAME_KEY, 'alice');
    localStorage.setItem(VISITED_KEY, '1');
    const { result } = renderHook(() => useAuth());
    act(() => result.current.logout());
    expect(result.current.showModal).toBe(false);
  });
});
