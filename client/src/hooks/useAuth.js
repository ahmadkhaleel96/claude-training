import { useState, useCallback } from 'react';
import { loginApi, registerApi } from '../api/authApi';

const TOKEN_KEY = 'ttt_token';
const USERNAME_KEY = 'ttt_username';
const VISITED_KEY = 'ttt_visited';

export function useAuth() {
  const [username, setUsernameState] = useState(() => localStorage.getItem(USERNAME_KEY) ?? null);
  const [token, setTokenState] = useState(() => localStorage.getItem(TOKEN_KEY) ?? null);
  const [showModal, setShowModal] = useState(() => !localStorage.getItem(VISITED_KEY));

  const _saveSession = useCallback((uname, tok) => {
    localStorage.setItem(USERNAME_KEY, uname);
    localStorage.setItem(TOKEN_KEY, tok);
    localStorage.setItem(VISITED_KEY, '1');
    setUsernameState(uname);
    setTokenState(tok);
    setShowModal(false);
  }, []);

  const login = useCallback(async (uname, password) => {
    const { token: tok, username: resolved } = await loginApi(uname, password);
    _saveSession(resolved, tok);
  }, [_saveSession]);

  const register = useCallback(async (uname, password) => {
    const { token: tok, username: resolved } = await registerApi(uname, password);
    _saveSession(resolved, tok);
  }, [_saveSession]);

  const continueAsGuest = useCallback(() => {
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.setItem(VISITED_KEY, '1');
    setUsernameState(null);
    setTokenState(null);
    setShowModal(false);
  }, []);

  const openModal = useCallback(() => setShowModal(true), []);

  const logout = useCallback(() => {
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setUsernameState(null);
    setTokenState(null);
  }, []);

  return { username, token, showModal, login, register, continueAsGuest, openModal, logout };
}
