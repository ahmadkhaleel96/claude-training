import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageContext } from '../../../context/LanguageContext';
import { translations } from '../../../i18n/translations';
import Game from '../Game';

// --- mocks ---

const mockPlayPlace = vi.fn();
const mockPlayWin = vi.fn();
const mockPlayDraw = vi.fn();

vi.mock('../../../hooks/useSoundEffects', () => ({
  useSoundEffects: () => ({
    playPlace: mockPlayPlace,
    playWin: mockPlayWin,
    playDraw: mockPlayDraw,
  }),
}));

// getBestMove always returns cell 8 so PvC tests are deterministic
vi.mock('../../../utils/aiPlayer', () => ({
  getBestMove: vi.fn(() => 8),
}));

// --- helpers ---

function renderGame(props = {}) {
  return render(
    <LanguageContext.Provider value={{ t: translations.en, lang: 'en' }}>
      <Game onGameEnd={() => {}} {...props} />
    </LanguageContext.Provider>
  );
}

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

// ─── PvP ────────────────────────────────────────────────────────────────────

describe('Game — PvP', () => {
  it("shows Player X's turn at the start", () => {
    renderGame();
    expect(screen.getByText("Player X's turn")).toBeInTheDocument();
  });

  it('places X on the first click and switches to O', async () => {
    renderGame();
    const cells = screen.getAllByRole('button', { name: /empty cell/i });
    await userEvent.click(cells[0]);
    expect(cells[0]).toHaveTextContent('X');
    expect(screen.getByText("Player O's turn")).toBeInTheDocument();
  });

  it('alternates turns between X and O', async () => {
    renderGame();
    const cells = screen.getAllByRole('button', { name: /empty cell/i });
    await userEvent.click(cells[0]);
    await userEvent.click(cells[1]);
    expect(cells[0]).toHaveTextContent('X');
    expect(cells[1]).toHaveTextContent('O');
    expect(screen.getByText("Player X's turn")).toBeInTheDocument();
  });

  it('ignores clicks on already-filled cells', async () => {
    renderGame();
    const cells = screen.getAllByRole('button', { name: /empty cell/i });
    await userEvent.click(cells[0]);
    await userEvent.click(cells[0]);
    expect(screen.getByText("Player O's turn")).toBeInTheDocument();
  });

  it('calls onGameEnd with the winner when X wins', async () => {
    const onGameEnd = vi.fn();
    renderGame({ onGameEnd });
    const cells = screen.getAllByRole('button');
    await userEvent.click(cells[0]); // X
    await userEvent.click(cells[3]); // O
    await userEvent.click(cells[1]); // X
    await userEvent.click(cells[4]); // O
    await userEvent.click(cells[2]); // X wins

    expect(onGameEnd).toHaveBeenCalledWith('X');
    expect(screen.getByText('Player X wins!')).toBeInTheDocument();
  });

  it('calls onGameEnd with "draw" when the board fills with no winner', async () => {
    const onGameEnd = vi.fn();
    renderGame({ onGameEnd });
    const cells = screen.getAllByRole('button');
    for (const i of [0, 1, 2, 4, 3, 6, 5, 8, 7]) {
      await userEvent.click(cells[i]);
    }
    expect(onGameEnd).toHaveBeenCalledWith('draw');
    expect(screen.getByText("It's a draw!")).toBeInTheDocument();
  });

  it('shows Play Again after game ends and resets the board on click', async () => {
    renderGame();
    const cells = screen.getAllByRole('button');
    await userEvent.click(cells[0]);
    await userEvent.click(cells[3]);
    await userEvent.click(cells[1]);
    await userEvent.click(cells[4]);
    await userEvent.click(cells[2]); // X wins

    await userEvent.click(screen.getByRole('button', { name: /play again/i }));
    expect(screen.getByText("Player X's turn")).toBeInTheDocument();
  });
});

// ─── PvP sounds ─────────────────────────────────────────────────────────────

describe('Game — PvP sounds', () => {
  it('plays a place sound on each valid non-terminal click', async () => {
    renderGame();
    const cells = screen.getAllByRole('button', { name: /empty cell/i });
    await userEvent.click(cells[0]);
    await userEvent.click(cells[1]);
    expect(mockPlayPlace).toHaveBeenCalledTimes(2);
  });

  it('plays win sound (not place) on the winning move', async () => {
    renderGame();
    const cells = screen.getAllByRole('button');
    await userEvent.click(cells[0]);
    await userEvent.click(cells[3]);
    await userEvent.click(cells[1]);
    await userEvent.click(cells[4]);
    await userEvent.click(cells[2]); // X wins

    expect(mockPlayWin).toHaveBeenCalledTimes(1);
    expect(mockPlayPlace).toHaveBeenCalledTimes(4);
  });

  it('plays draw sound on the board-filling move', async () => {
    renderGame();
    const cells = screen.getAllByRole('button');
    for (const i of [0, 1, 2, 4, 3, 6, 5, 8, 7]) {
      await userEvent.click(cells[i]);
    }
    expect(mockPlayDraw).toHaveBeenCalledTimes(1);
    expect(mockPlayWin).not.toHaveBeenCalled();
    expect(mockPlayPlace).toHaveBeenCalledTimes(8);
  });

  it('plays no sound when clicking a filled (disabled) cell', async () => {
    renderGame();
    const cells = screen.getAllByRole('button', { name: /empty cell/i });
    await userEvent.click(cells[0]);
    vi.clearAllMocks();
    await userEvent.click(cells[0]); // disabled, click blocked by browser
    expect(mockPlayPlace).not.toHaveBeenCalled();
  });
});

// ─── PvC ────────────────────────────────────────────────────────────────────

describe('Game — PvC', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  function renderPvC(props = {}) {
    return renderGame({ mode: 'pvc', ...props });
  }

  it('shows "Computer is thinking…" immediately after X plays', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
    renderPvC();
    const cells = screen.getAllByRole('button', { name: /empty cell/i });
    await user.click(cells[0]);
    expect(screen.getByText('Computer is thinking…')).toBeInTheDocument();
  });

  it('computer places O after the delay', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
    renderPvC();
    const cells = screen.getAllByRole('button');
    await user.click(cells[0]); // X plays at 0

    await act(() => vi.advanceTimersByTime(600));

    expect(cells[8]).toHaveTextContent('O'); // getBestMove always returns 8
  });

  it('switches back to "Player X\'s turn" after the computer moves', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
    renderPvC();
    const cells = screen.getAllByRole('button', { name: /empty cell/i });
    await user.click(cells[0]);

    await act(() => vi.advanceTimersByTime(600));

    expect(screen.getByText("Player X's turn")).toBeInTheDocument();
  });

  it('ignores player clicks while the computer is thinking', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
    renderPvC();
    const cells = screen.getAllByRole('button');
    await user.click(cells[0]); // X plays

    // Try to click another cell before computer moves
    await user.click(cells[1]);
    expect(cells[1]).not.toHaveTextContent('X');
  });

  it('calls onGameEnd with O wins when computer wins', async () => {
    const { getBestMove } = await import('../../../utils/aiPlayer');
    // Set up a near-win for O: O at 0 and 3, needs 6
    // X at 1, 2. We'll drive the computer to win.
    getBestMove
      .mockReturnValueOnce(6); // computer's winning move

    const onGameEnd = vi.fn();
    // Board: X:1,2 O:0,3 → O needs 6 to win col 0,3,6
    // We'll set up state by having X play first then let computer respond
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
    renderPvC({ onGameEnd });

    // Manually bring board to: O:0,3 X:1,2 by playing moves in sequence
    // But since computer always gets the mocked cell, let's just drive two rounds
    // Round 1: X plays 1, O plays first mock (6)
    getBestMove.mockReturnValueOnce(0); // O plays 0
    await user.click(screen.getAllByRole('button')[1]); // X plays 1
    await act(() => vi.advanceTimersByTime(600)); // O plays 0

    getBestMove.mockReturnValueOnce(3); // O plays 3
    await user.click(screen.getAllByRole('button')[2]); // X plays 2
    await act(() => vi.advanceTimersByTime(600)); // O plays 3

    getBestMove.mockReturnValueOnce(6); // O plays 6 → wins
    await user.click(screen.getAllByRole('button')[4]); // X plays 4
    await act(() => vi.advanceTimersByTime(600)); // O plays 6 and wins

    expect(onGameEnd).toHaveBeenCalledWith('O');
    expect(screen.getByText('Player O wins!')).toBeInTheDocument();
  });

  it('cancels the pending computer move when the game is reset', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
    renderPvC();
    const cells = screen.getAllByRole('button');
    await user.click(cells[0]); // X plays, computer timer starts

    // Reset before timer fires
    await user.click(screen.getByRole('button', { name: /restart/i }));

    // Advance past the original timer — computer should NOT have moved
    await act(() => vi.advanceTimersByTime(600));

    // Board should be empty (all cells empty)
    expect(screen.getAllByRole('button', { name: /empty cell/i })).toHaveLength(9);
  });
});
