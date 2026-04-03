import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageContext } from '../../../context/LanguageContext';
import { translations } from '../../../i18n/translations';
import ModeSelector from '../ModeSelector';

function renderWithLang(ui, lang = 'en') {
  return render(
    <LanguageContext.Provider value={{ t: translations[lang], lang }}>
      {ui}
    </LanguageContext.Provider>
  );
}

describe('ModeSelector — English', () => {
  it('renders two mode buttons', () => {
    renderWithLang(<ModeSelector mode="pvp" onModeChange={() => {}} />);
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('marks the pvp button as active when mode is pvp', () => {
    renderWithLang(<ModeSelector mode="pvp" onModeChange={() => {}} />);
    expect(
      screen.getByRole('button', { name: translations.en.playerVsPlayer })
    ).toHaveClass('mode-selector__btn--active');
    expect(
      screen.getByRole('button', { name: translations.en.playerVsComputer })
    ).not.toHaveClass('mode-selector__btn--active');
  });

  it('marks the pvc button as active when mode is pvc', () => {
    renderWithLang(<ModeSelector mode="pvc" onModeChange={() => {}} />);
    expect(
      screen.getByRole('button', { name: translations.en.playerVsComputer })
    ).toHaveClass('mode-selector__btn--active');
    expect(
      screen.getByRole('button', { name: translations.en.playerVsPlayer })
    ).not.toHaveClass('mode-selector__btn--active');
  });

  it('sets aria-pressed=true on the active button', () => {
    renderWithLang(<ModeSelector mode="pvp" onModeChange={() => {}} />);
    expect(
      screen.getByRole('button', { name: translations.en.playerVsPlayer })
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('button', { name: translations.en.playerVsComputer })
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onModeChange with "pvp" when the pvp button is clicked', async () => {
    const onModeChange = vi.fn();
    renderWithLang(<ModeSelector mode="pvc" onModeChange={onModeChange} />);
    await userEvent.click(
      screen.getByRole('button', { name: translations.en.playerVsPlayer })
    );
    expect(onModeChange).toHaveBeenCalledWith('pvp');
  });

  it('calls onModeChange with "pvc" when the pvc button is clicked', async () => {
    const onModeChange = vi.fn();
    renderWithLang(<ModeSelector mode="pvp" onModeChange={onModeChange} />);
    await userEvent.click(
      screen.getByRole('button', { name: translations.en.playerVsComputer })
    );
    expect(onModeChange).toHaveBeenCalledWith('pvc');
  });

  it('has a group role with an accessible label', () => {
    renderWithLang(<ModeSelector mode="pvp" onModeChange={() => {}} />);
    expect(screen.getByRole('group', { name: 'Game mode' })).toBeInTheDocument();
  });
});

describe('ModeSelector — Arabic', () => {
  it('renders Arabic labels', () => {
    renderWithLang(<ModeSelector mode="pvp" onModeChange={() => {}} />, 'ar');
    expect(screen.getByRole('button', { name: translations.ar.playerVsPlayer })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: translations.ar.playerVsComputer })).toBeInTheDocument();
  });
});
