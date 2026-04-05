import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { loginApi, registerApi } from '../../api/authApi';

vi.mock('../../api/authApi');

const TOKEN_KEY = 'ttt_token';
const USERNAME_KEY = 'ttt_username';
const VISITED_KEY = 'ttt_visited';

beforeEach(() => {
  localStorage.clear();
  loginApi.mockResolvedValue({ token: 'mock_token', username: 'alice' });
  registerApi.mockResolvedValue({ token: 'mock_token', username: 'alice' });
});

afterEach(() => {
  vi.clearAllMocks();
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

  it('restores username and token from localStorage', () => {
    localStorage.setItem(USERNAME_KEY, 'alice');
    localStorage.setItem(TOKEN_KEY, 'stored_token');
    localStorage.setItem(VISITED_KEY, '1');
    const { result } = renderHook(() => useAuth());
    expect(result.current.username).toBe('alice');
    expect(result.current.token).toBe('stored_token');
  });

  it('starts with null username and token when none is stored', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.username).toBeNull();
    expect(result.current.token).toBeNull();
  });
});

describe('useAuth — login', () => {
  it('calls loginApi with credentials', async () => {
    const { result } = renderHook(() => useAuth());
    await act(() => result.current.login('alice', 'pass123'));
    expect(loginApi).toHaveBeenCalledWith('alice', 'pass123');
  });

  it('sets username, token, closes modal, and persists to localStorage', async () => {
    const { result } = renderHook(() => useAuth());
    await act(() => result.current.login('alice', 'pass123'));
    expect(result.current.username).toBe('alice');
    expect(result.current.token).toBe('mock_token');
    expect(result.current.showModal).toBe(false);
    expect(localStorage.getItem(USERNAME_KEY)).toBe('alice');
    expect(localStorage.getItem(TOKEN_KEY)).toBe('mock_token');
    expect(localStorage.getItem(VISITED_KEY)).toBe('1');
  });

  it('throws when loginApi rejects', async () => {
    loginApi.mockRejectedValue(new Error('Invalid username or password.'));
    const { result } = renderHook(() => useAuth());
    await expect(act(() => result.current.login('alice', 'wrong'))).rejects.toThrow(
      'Invalid username or password.'
    );
  });
});

describe('useAuth — register', () => {
  it('calls registerApi with credentials', async () => {
    const { result } = renderHook(() => useAuth());
    await act(() => result.current.register('alice', 'pass123'));
    expect(registerApi).toHaveBeenCalledWith('alice', 'pass123');
  });

  it('sets username, token, closes modal, and persists to localStorage', async () => {
    const { result } = renderHook(() => useAuth());
    await act(() => result.current.register('alice', 'pass123'));
    expect(result.current.username).toBe('alice');
    expect(result.current.token).toBe('mock_token');
    expect(result.current.showModal).toBe(false);
    expect(localStorage.getItem(USERNAME_KEY)).toBe('alice');
    expect(localStorage.getItem(TOKEN_KEY)).toBe('mock_token');
  });

  it('throws when registerApi rejects', async () => {
    registerApi.mockRejectedValue(new Error('Username already taken.'));
    const { result } = renderHook(() => useAuth());
    await expect(act(() => result.current.register('alice', 'pass123'))).rejects.toThrow(
      'Username already taken.'
    );
  });
});

describe('useAuth — continueAsGuest', () => {
  it('clears username and token, closes modal, sets visited flag', () => {
    const { result } = renderHook(() => useAuth());
    act(() => result.current.continueAsGuest());
    expect(result.current.username).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.showModal).toBe(false);
    expect(localStorage.getItem(VISITED_KEY)).toBe('1');
    expect(localStorage.getItem(USERNAME_KEY)).toBeNull();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it('does not show modal on next render after guest choice', () => {
    const { result } = renderHook(() => useAuth());
    act(() => result.current.continueAsGuest());
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
  it('clears username and token from state and localStorage', async () => {
    localStorage.setItem(USERNAME_KEY, 'alice');
    localStorage.setItem(TOKEN_KEY, 'tok');
    localStorage.setItem(VISITED_KEY, '1');
    const { result } = renderHook(() => useAuth());
    act(() => result.current.logout());
    expect(result.current.username).toBeNull();
    expect(result.current.token).toBeNull();
    expect(localStorage.getItem(USERNAME_KEY)).toBeNull();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it('does not re-open the modal on logout', () => {
    localStorage.setItem(USERNAME_KEY, 'alice');
    localStorage.setItem(TOKEN_KEY, 'tok');
    localStorage.setItem(VISITED_KEY, '1');
    const { result } = renderHook(() => useAuth());
    act(() => result.current.logout());
    expect(result.current.showModal).toBe(false);
  });
});
