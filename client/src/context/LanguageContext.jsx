import { createContext, useContext } from 'react';

export const LanguageContext = createContext(null);

export function useTranslations() {
  return useContext(LanguageContext);
}
