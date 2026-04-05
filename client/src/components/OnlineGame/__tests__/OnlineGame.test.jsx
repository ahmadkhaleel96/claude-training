import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageContext } from '../../../context/LanguageContext';
import { translations } from '../../../i18n/translations';
import OnlineGame from '../OnlineGame';

// ── mock useOnlineGame ───────────────────────────────────────────────────────

const mockCreateRoom = vi.fn();
const mockJoinRoom = vi.fn();
const mockMakeMove = vi.fn();
const mockRequestPlayAgain = vi.fn();

const defaultHookState = {
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
  createRoom: mockCreateRoom,
  joinRoom: mockJoinRoom,
  makeMove: mockMakeMove,
  requestPlayAgain: mockRequestPlayAgain,
};

let hookState = { ...defaultHookState };

vi.mock('../../../hooks/useOnlineGame', () => ({
  useOnlineGame: () => hookState,
}));

// ─────────────────────────────────────────────────────────────────────────────

function renderOnlineGame(props = {}) {
  return render(
    <LanguageContext.Provider value={{ t: translations.en, lang: 'en' }}>
      <OnlineGame onGameEnd={vi.fn()} {...props} />
    </LanguageContext.Provider>
  );
}

beforeEach(() => {
  hookState = { ...defaultHookState };
  vi.clearAllMocks();
});

// ─── Lobby (idle) ────────────────────────────────────────────────────────────

describe('OnlineGame — lobby', () => {
  it('renders Create Room button', () => {
    renderOnlineGame();
    expect(screen.getByRole('button', { name: /create room/i })).toBeInTheDocument();
  });

  it('renders Join Room button and room code input', () => {
    renderOnlineGame();
    expect(screen.getByRole('textbox', { name: /enter room code/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /join room/i })).toBeInTheDocument();
  });

  it('calls createRoom when Create Room is clicked', async () => {
    renderOnlineGame();
    await userEvent.click(screen.getByRole('button', { name: /create room/i }));
    expect(mockCreateRoom).toHaveBeenCalledTimes(1);
  });

  it('calls joinRoom with the entered code when Join Room is clicked', async () => {
    renderOnlineGame();
    await userEvent.type(screen.getByRole('textbox', { name: /enter room code/i }), 'ABC123');
    await userEvent.click(screen.getByRole('button', { name: /join room/i }));
    expect(mockJoinRoom).toHaveBeenCalledWith('ABC123');
  });

  it('Join Room button is disabled when input is empty', () => {
    renderOnlineGame();
    expect(screen.getByRole('button', { name: /join room/i })).toBeDisabled();
  });

  it('displays error message when error is set', () => {
    hookState = { ...defaultHookState, error: 'Room not found' };
    renderOnlineGame();
    expect(screen.getByRole('alert')).toHaveTextContent('Room not found');
  });

  it('auto-joins when initialRoomId is provided', () => {
    renderOnlineGame({ initialRoomId: 'XYZ' });
    expect(mockJoinRoom).toHaveBeenCalledWith('XYZ');
  });
});

// ─── Waiting ─────────────────────────────────────────────────────────────────

describe('OnlineGame — waiting', () => {
  beforeEach(() => {
    hookState = {
      ...defaultHookState,
      status: 'waiting',
      roomId: 'ABC123',
      symbol: 'X',
    };
    // stub window.location
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:5173', pathname: '/' },
      writable: true,
    });
  });

  it('shows waiting for opponent text', () => {
    renderOnlineGame();
    expect(screen.getByText(/waiting for opponent/i)).toBeInTheDocument();
  });

  it('shows the player symbol', () => {
    renderOnlineGame();
    expect(screen.getByText('X')).toBeInTheDocument();
  });

  it('renders the shareable link input', () => {
    renderOnlineGame();
    const linkInput = screen.getByRole('textbox', { name: /room link/i });
    expect(linkInput).toHaveValue('http://localhost:5173/?room=ABC123');
  });

  it('renders Copy button', () => {
    renderOnlineGame();
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
  });
});

// ─── Disconnected ─────────────────────────────────────────────────────────────

describe('OnlineGame — disconnected', () => {
  it('shows opponent disconnected message', () => {
    hookState = { ...defaultHookState, status: 'disconnected' };
    renderOnlineGame();
    expect(screen.getByText(/opponent disconnected/i)).toBeInTheDocument();
  });
});

// ─── Playing ─────────────────────────────────────────────────────────────────

describe('OnlineGame — playing', () => {
  beforeEach(() => {
    hookState = {
      ...defaultHookState,
      status: 'playing',
      roomId: 'ABC123',
      symbol: 'X',
      isMyTurn: true,
    };
  });

  it('renders the board', () => {
    renderOnlineGame();
    expect(screen.getAllByRole('button', { name: /empty cell/i })).toHaveLength(9);
  });

  it("calls makeMove when clicking an empty cell on your turn", async () => {
    renderOnlineGame();
    const cells = screen.getAllByRole('button', { name: /empty cell/i });
    await userEvent.click(cells[0]);
    expect(mockMakeMove).toHaveBeenCalledWith(0);
  });

  it("does not call makeMove when it is not your turn", async () => {
    hookState = { ...hookState, isMyTurn: false };
    renderOnlineGame();
    const cells = screen.getAllByRole('button', { name: /empty cell/i });
    await userEvent.click(cells[0]);
    expect(mockMakeMove).not.toHaveBeenCalled();
  });

  it('shows the status bar with the current player', () => {
    renderOnlineGame();
    expect(screen.getByText("Player X's turn")).toBeInTheDocument();
  });
});

// ─── Finished ────────────────────────────────────────────────────────────────

describe('OnlineGame — finished', () => {
  it('shows Play Again button when there is a winner', () => {
    const board = Array(9).fill(null);
    board[0] = board[1] = board[2] = 'X';
    hookState = {
      ...defaultHookState,
      status: 'finished',
      roomId: 'R',
      symbol: 'X',
      board,
      winner: 'X',
    };
    renderOnlineGame();
    expect(screen.getByRole('button', { name: /play again/i })).toBeInTheDocument();
  });

  it('calls requestPlayAgain when Play Again is clicked', async () => {
    const board = Array(9).fill(null);
    board[0] = board[1] = board[2] = 'X';
    hookState = {
      ...defaultHookState,
      status: 'finished',
      roomId: 'R',
      symbol: 'X',
      board,
      winner: 'X',
    };
    renderOnlineGame();
    await userEvent.click(screen.getByRole('button', { name: /play again/i }));
    expect(mockRequestPlayAgain).toHaveBeenCalledTimes(1);
  });

  it('shows waiting for opponent on Play Again button when waitingPlayAgain is true', () => {
    const board = Array(9).fill(null);
    board[0] = board[1] = board[2] = 'X';
    hookState = {
      ...defaultHookState,
      status: 'finished',
      roomId: 'R',
      symbol: 'X',
      board,
      winner: 'X',
      waitingPlayAgain: true,
    };
    renderOnlineGame();
    expect(screen.getByRole('button', { name: /waiting for opponent/i })).toBeDisabled();
  });

  it('calls onGameEnd with the winner when a winner is set', () => {
    const onGameEnd = vi.fn();
    const board = Array(9).fill(null);
    board[0] = board[1] = board[2] = 'X';
    hookState = {
      ...defaultHookState,
      status: 'finished',
      roomId: 'R',
      symbol: 'X',
      board,
      winner: 'X',
    };
    renderOnlineGame({ onGameEnd });
    expect(onGameEnd).toHaveBeenCalledWith('X');
  });

  it('calls onGameEnd with "draw" on a draw', () => {
    const onGameEnd = vi.fn();
    hookState = {
      ...defaultHookState,
      status: 'finished',
      roomId: 'R',
      symbol: 'X',
      board: Array(9).fill('X'),
      isDraw: true,
    };
    renderOnlineGame({ onGameEnd });
    expect(onGameEnd).toHaveBeenCalledWith('draw');
  });

  it('highlights the winning line', () => {
    // X wins with top row
    const board = Array(9).fill(null);
    board[0] = board[1] = board[2] = 'X';
    hookState = {
      ...defaultHookState,
      status: 'finished',
      roomId: 'R',
      symbol: 'X',
      board,
      winner: 'X',
    };
    renderOnlineGame();
    // The three X cells should have the winning class
    const cells = screen.getAllByRole('button');
    // Filter to the game board cells (not Play Again)
    const boardCells = cells.filter((c) => c.classList.contains('cell'));
    expect(boardCells[0]).toHaveClass('cell--winning');
    expect(boardCells[1]).toHaveClass('cell--winning');
    expect(boardCells[2]).toHaveClass('cell--winning');
  });
});
