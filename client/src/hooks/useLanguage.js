import { useState, useEffect } from 'react';

const STORAGE_KEY = 'tic-tac-toe-lang';

function getSystemLanguage() {
  return navigator.language?.startsWith('ar') ? 'ar' : 'en';
}

export function useLanguage() {
  const [lang, setLang] = useState(
    () => localStorage.getItem(STORAGE_KEY) ?? getSystemLanguage()
  );

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  function toggleLanguage() {
    const next = lang === 'en' ? 'ar' : 'en';
    localStorage.setItem(STORAGE_KEY, next);
    setLang(next);
  }

  return { lang, toggleLanguage };
}
