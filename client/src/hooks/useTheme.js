import { useState, useEffect } from 'react';

const STORAGE_KEY = 'tic-tac-toe-theme';

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem(STORAGE_KEY) ?? getSystemTheme()
  );
  const [userOverride, setUserOverride] = useState(
    () => localStorage.getItem(STORAGE_KEY) !== null
  );

  // Apply the theme attribute to <html> whenever it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Persist to localStorage only after the user has manually chosen
  useEffect(() => {
    if (userOverride) {
      localStorage.setItem(STORAGE_KEY, theme);
    }
  }, [theme, userOverride]);

  // Follow system preference changes unless the user has overridden
  useEffect(() => {
    if (userOverride) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setTheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [userOverride]);

  function toggleTheme() {
    setUserOverride(true);
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }

  return { theme, toggleTheme };
}
