import { useState, useCallback } from 'react';

const USERNAME_KEY = 'ttt_username';
const VISITED_KEY = 'ttt_visited';

export function useAuth() {
  const [username, setUsernameState] = useState(() => {
    return localStorage.getItem(USERNAME_KEY) ?? null;
  });

  // Show modal on first visit (neither username nor visited flag is set)
  const [showModal, setShowModal] = useState(() => {
    return !localStorage.getItem(VISITED_KEY);
  });

  const setUsername = useCallback((name) => {
    const trimmed = name.trim();
    localStorage.setItem(USERNAME_KEY, trimmed);
    localStorage.setItem(VISITED_KEY, '1');
    setUsernameState(trimmed);
    setShowModal(false);
  }, []);

  const continueAsGuest = useCallback(() => {
    localStorage.removeItem(USERNAME_KEY);
    localStorage.setItem(VISITED_KEY, '1');
    setUsernameState(null);
    setShowModal(false);
  }, []);

  const openModal = useCallback(() => {
    setShowModal(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(USERNAME_KEY);
    setUsernameState(null);
  }, []);

  return { username, showModal, setUsername, continueAsGuest, openModal, logout };
}
