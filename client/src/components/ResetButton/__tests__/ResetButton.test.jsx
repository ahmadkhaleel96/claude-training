import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageContext } from '../../../context/LanguageContext';
import { translations } from '../../../i18n/translations';
import ResetButton from '../ResetButton';

function renderWithLang(ui, lang = 'en') {
  return render(
    <LanguageContext.Provider value={{ t: translations[lang], lang }}>
      {ui}
    </LanguageContext.Provider>
  );
}

describe('ResetButton — English', () => {
  it('shows "Restart" when the game is not over', () => {
    renderWithLang(<ResetButton gameOver={false} onReset={() => {}} />);
    expect(screen.getByRole('button', { name: 'Restart' })).toBeInTheDocument();
  });

  it('shows "Play Again" when the game is over', () => {
    renderWithLang(<ResetButton gameOver={true} onReset={() => {}} />);
    expect(screen.getByRole('button', { name: 'Play Again' })).toBeInTheDocument();
  });

  it('calls onReset when clicked', async () => {
    const onReset = vi.fn();
    renderWithLang(<ResetButton gameOver={false} onReset={onReset} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('"Restart" and "Play Again" labels are different', () => {
    expect(translations.en.restart).not.toBe(translations.en.playAgain);
  });
});

describe('ResetButton — Arabic', () => {
  it('shows Arabic restart text when the game is not over', () => {
    renderWithLang(<ResetButton gameOver={false} onReset={() => {}} />, 'ar');
    expect(screen.getByRole('button', { name: translations.ar.restart })).toBeInTheDocument();
  });

  it('shows Arabic play-again text when the game is over', () => {
    renderWithLang(<ResetButton gameOver={true} onReset={() => {}} />, 'ar');
    expect(screen.getByRole('button', { name: translations.ar.playAgain })).toBeInTheDocument();
  });

  it('calls onReset when clicked in Arabic mode', async () => {
    const onReset = vi.fn();
    renderWithLang(<ResetButton gameOver={false} onReset={onReset} />, 'ar');
    await userEvent.click(screen.getByRole('button'));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
