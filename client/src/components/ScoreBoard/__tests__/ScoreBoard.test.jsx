import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageContext } from '../../../context/LanguageContext';
import { translations } from '../../../i18n/translations';
import ScoreBoard from '../ScoreBoard';

const scores = { X: 3, O: 1, draws: 2 };

function renderWithLang(ui, lang = 'en') {
  return render(
    <LanguageContext.Provider value={{ t: translations[lang], lang }}>
      {ui}
    </LanguageContext.Provider>
  );
}

describe('ScoreBoard — English', () => {
  it('displays the X, O, and draw counts', () => {
    renderWithLang(<ScoreBoard scores={scores} onReset={() => {}} />);
    const values = screen.getAllByText(/\d+/);
    const texts = values.map((el) => el.textContent);
    expect(texts).toContain('3');
    expect(texts).toContain('1');
    expect(texts).toContain('2');
  });

  it('shows English labels', () => {
    renderWithLang(<ScoreBoard scores={scores} onReset={() => {}} />);
    expect(screen.getByText('Score')).toBeInTheDocument();
    expect(screen.getByText('Player X')).toBeInTheDocument();
    expect(screen.getByText('Player O')).toBeInTheDocument();
    expect(screen.getByText('Draws')).toBeInTheDocument();
  });

  it('calls onReset when the reset button is clicked', async () => {
    const onReset = vi.fn();
    renderWithLang(<ScoreBoard scores={scores} onReset={onReset} />);
    await userEvent.click(screen.getByRole('button', { name: /reset scores/i }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});

describe('ScoreBoard — Arabic', () => {
  it('shows Arabic labels', () => {
    renderWithLang(<ScoreBoard scores={scores} onReset={() => {}} />, 'ar');
    expect(screen.getByText('النتيجة')).toBeInTheDocument();
    expect(screen.getByText('اللاعب X')).toBeInTheDocument();
    expect(screen.getByText('اللاعب O')).toBeInTheDocument();
  });

  it('shows Arabic reset button text', () => {
    renderWithLang(<ScoreBoard scores={scores} onReset={() => {}} />, 'ar');
    expect(screen.getByRole('button', { name: /إعادة/i })).toBeInTheDocument();
  });
});
