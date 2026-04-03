import { render, screen } from '@testing-library/react';
import { LanguageContext } from '../../../context/LanguageContext';
import { translations } from '../../../i18n/translations';
import StatusBar from '../StatusBar';

function renderWithLang(ui, lang = 'en') {
  return render(
    <LanguageContext.Provider value={{ t: translations[lang], lang }}>
      {ui}
    </LanguageContext.Provider>
  );
}

const defaults = { currentPlayer: 'X', winner: null, isDraw: false, isComputerThinking: false };

describe('StatusBar — English', () => {
  it("shows the current player's turn when no winner or draw", () => {
    renderWithLang(<StatusBar {...defaults} />);
    expect(screen.getByText("Player X's turn")).toBeInTheDocument();
  });

  it('shows the winner message when there is a winner', () => {
    renderWithLang(<StatusBar {...defaults} winner="X" />);
    expect(screen.getByText('Player X wins!')).toBeInTheDocument();
  });

  it('shows the draw message when isDraw is true', () => {
    renderWithLang(<StatusBar {...defaults} isDraw={true} />);
    expect(screen.getByText("It's a draw!")).toBeInTheDocument();
  });

  it('shows the computer thinking message when isComputerThinking is true', () => {
    renderWithLang(<StatusBar {...defaults} isComputerThinking={true} />);
    expect(screen.getByText('Computer is thinking…')).toBeInTheDocument();
  });

  it('applies the winner modifier class on a win', () => {
    renderWithLang(<StatusBar {...defaults} winner="O" />);
    expect(screen.getByText('Player O wins!')).toHaveClass('status-bar__message--winner');
  });

  it('applies the draw modifier class on a draw', () => {
    renderWithLang(<StatusBar {...defaults} isDraw={true} />);
    expect(screen.getByText("It's a draw!")).toHaveClass('status-bar__message--draw');
  });

  it('applies the thinking modifier class when computer is thinking', () => {
    renderWithLang(<StatusBar {...defaults} isComputerThinking={true} />);
    expect(screen.getByText('Computer is thinking…')).toHaveClass('status-bar__message--thinking');
  });

  it('winner takes priority over isComputerThinking', () => {
    renderWithLang(<StatusBar {...defaults} winner="X" isComputerThinking={true} />);
    expect(screen.getByText('Player X wins!')).toBeInTheDocument();
    expect(screen.queryByText('Computer is thinking…')).not.toBeInTheDocument();
  });
});

describe('StatusBar — Arabic', () => {
  it('shows the current player turn in Arabic', () => {
    renderWithLang(<StatusBar {...defaults} />, 'ar');
    expect(screen.getByText('دور اللاعب X')).toBeInTheDocument();
  });

  it('shows the winner message in Arabic', () => {
    renderWithLang(<StatusBar {...defaults} winner="X" />, 'ar');
    expect(screen.getByText('اللاعب X فاز!')).toBeInTheDocument();
  });

  it('shows the draw message in Arabic', () => {
    renderWithLang(<StatusBar {...defaults} isDraw={true} />, 'ar');
    expect(screen.getByText('تعادل!')).toBeInTheDocument();
  });

  it('shows the computer thinking message in Arabic', () => {
    renderWithLang(<StatusBar {...defaults} isComputerThinking={true} />, 'ar');
    expect(screen.getByText('الكمبيوتر يفكر…')).toBeInTheDocument();
  });
});
