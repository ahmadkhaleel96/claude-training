import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import * as scoresApi from './api/scoresApi';
import { translations } from './i18n/translations';

const mockToggleTheme = vi.fn();
const mockToggleLanguage = vi.fn();

vi.mock('./api/scoresApi');

vi.mock('./hooks/useTheme', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: mockToggleTheme }),
}));

vi.mock('./hooks/useLanguage', () => ({
  useLanguage: () => ({ lang: 'en', toggleLanguage: mockToggleLanguage }),
}));

vi.mock('./hooks/useSoundEffects', () => ({
  useSoundEffects: () => ({
    playPlace: vi.fn(),
    playWin: vi.fn(),
    playDraw: vi.fn(),
  }),
}));

vi.mock('./utils/aiPlayer', () => ({
  getBestMove: vi.fn(() => 8),
}));

vi.mock('./hooks/useOnlineGame', () => ({
  useOnlineGame: () => ({
    status: 'idle',
    roomId: null,
    symbol: null,
    board: Array(9).fill(null),
    isXTurn: true,
    winner: null,
    isDraw: false,
    error: null,
    isMyTurn: true,
    waitingPlayAgain: false,
    createRoom: vi.fn(),
    joinRoom: vi.fn(),
    makeMove: vi.fn(),
    requestPlayAgain: vi.fn(),
  }),
}));

const defaultScores = { X: 0, O: 0, draws: 0 };

beforeEach(() => {
  scoresApi.fetchScores.mockResolvedValue(defaultScores);
  scoresApi.postScore.mockResolvedValue({ X: 1, O: 0, draws: 0 });
  scoresApi.resetScores.mockResolvedValue(defaultScores);
  // Default: no room param in URL
  Object.defineProperty(window, 'location', {
    value: { search: '', origin: 'http://localhost', pathname: '/' },
    writable: true,
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('App — scores', () => {
  it('fetches and displays scores on mount', async () => {
    scoresApi.fetchScores.mockResolvedValue({ X: 2, O: 1, draws: 3 });
    render(<App />);
    await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument());
  });

  it('calls postScore with the winner when a game ends', async () => {
    render(<App />);
    await waitFor(() => expect(scoresApi.fetchScores).toHaveBeenCalled());

    // Get board cells specifically (avoids fragility with mode selector button count)
    const cells = screen.getAllByRole('button', { name: /empty cell/i });
    await userEvent.click(cells[0]); // X → 0
    await userEvent.click(cells[3]); // O → 3
    await userEvent.click(cells[1]); // X → 1
    await userEvent.click(cells[4]); // O → 4
    await userEvent.click(cells[2]); // X wins (row 0-1-2)

    await waitFor(() => expect(scoresApi.postScore).toHaveBeenCalledWith('X'));
  });

  it('calls resetScores when Reset Scores is clicked', async () => {
    render(<App />);
    await waitFor(() => expect(scoresApi.fetchScores).toHaveBeenCalled());
    await userEvent.click(screen.getByRole('button', { name: /reset scores/i }));
    expect(scoresApi.resetScores).toHaveBeenCalledTimes(1);
  });
});

describe('App — header controls', () => {
  it('renders the English title', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Tic-Tac-Toe' })).toBeInTheDocument();
  });

  it('renders the ThemeToggle', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument();
  });

  it('calls toggleTheme when the theme toggle is clicked', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /switch to dark mode/i }));
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('renders the LanguageToggle', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /switch to arabic/i })).toBeInTheDocument();
  });

  it('calls toggleLanguage when the language toggle is clicked', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /switch to arabic/i }));
    expect(mockToggleLanguage).toHaveBeenCalledTimes(1);
  });
});

describe('App — mode selector', () => {
  it('renders the mode selector', () => {
    render(<App />);
    expect(screen.getByRole('group', { name: 'Game mode' })).toBeInTheDocument();
  });

  it('defaults to PvP mode (pvp button is active)', () => {
    render(<App />);
    expect(
      screen.getByRole('button', { name: translations.en.playerVsPlayer })
    ).toHaveClass('mode-selector__btn--active');
  });

  it('switches to PvC mode when the vs Computer button is clicked', async () => {
    render(<App />);
    await userEvent.click(
      screen.getByRole('button', { name: translations.en.playerVsComputer })
    );
    expect(
      screen.getByRole('button', { name: translations.en.playerVsComputer })
    ).toHaveClass('mode-selector__btn--active');
  });

  it('switches back to PvP mode', async () => {
    render(<App />);
    await userEvent.click(
      screen.getByRole('button', { name: translations.en.playerVsComputer })
    );
    await userEvent.click(
      screen.getByRole('button', { name: translations.en.playerVsPlayer })
    );
    expect(
      screen.getByRole('button', { name: translations.en.playerVsPlayer })
    ).toHaveClass('mode-selector__btn--active');
  });

  it('switches to vs Friend mode when the vs Friend button is clicked', async () => {
    render(<App />);
    await userEvent.click(
      screen.getByRole('button', { name: translations.en.playerVsFriend })
    );
    expect(
      screen.getByRole('button', { name: translations.en.playerVsFriend })
    ).toHaveClass('mode-selector__btn--active');
  });

  it('renders OnlineGame lobby when mode is pvf', async () => {
    render(<App />);
    await userEvent.click(
      screen.getByRole('button', { name: translations.en.playerVsFriend })
    );
    expect(screen.getByRole('button', { name: /create room/i })).toBeInTheDocument();
  });
});

describe('App — URL room param', () => {
  it('defaults to pvf mode when ?room= is in the URL', () => {
    window.location = { search: '?room=ABC123', origin: 'http://localhost', pathname: '/' };
    render(<App />);
    expect(
      screen.getByRole('button', { name: translations.en.playerVsFriend })
    ).toHaveClass('mode-selector__btn--active');
  });
});
