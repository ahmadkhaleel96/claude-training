import { render, screen } from '@testing-library/react';
import { LanguageContext, useTranslations } from '../LanguageContext';
import { translations } from '../../i18n/translations';

function ConsumerComponent() {
  const ctx = useTranslations();
  if (!ctx) return <span>no context</span>;
  return <span>{ctx.t.title}</span>;
}

describe('LanguageContext', () => {
  it('useTranslations returns null when rendered outside a provider', () => {
    render(<ConsumerComponent />);
    expect(screen.getByText('no context')).toBeInTheDocument();
  });

  it('useTranslations returns the provided value inside a provider', () => {
    render(
      <LanguageContext.Provider value={{ t: translations.en, lang: 'en' }}>
        <ConsumerComponent />
      </LanguageContext.Provider>
    );
    expect(screen.getByText('Tic-Tac-Toe')).toBeInTheDocument();
  });

  it('useTranslations reflects Arabic when the Arabic locale is provided', () => {
    render(
      <LanguageContext.Provider value={{ t: translations.ar, lang: 'ar' }}>
        <ConsumerComponent />
      </LanguageContext.Provider>
    );
    expect(screen.getByText('إكس أو')).toBeInTheDocument();
  });
});
