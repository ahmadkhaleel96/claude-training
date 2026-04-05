import { renderHook, act } from '@testing-library/react';
import { useOnlineGame } from '../useOnlineGame';

// ── mock socket.io-client ────────────────────────────────────────────────────

let mockSocket;

vi.mock('socket.io-client', () => ({
  io: () => {
    mockSocket = {
      connected: false, // starts disconnected, like a real socket
      listeners: {},
      emit: vi.fn(),
      on(event, cb) { this.listeners[event] = cb; },
      disconnect: vi.fn(),
      trigger(event, data) {
        if (event === 'connect') this.connected = true;
        this.listeners[event]?.(data);
      },
    };
    return mockSocket;
  },
}));

// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockSocket = null;
});

// Helper: render hook and simulate socket connection
function renderConnectedHook() {
  const hook = renderHook(() => useOnlineGame());
  act(() => mockSocket.trigger('connect'));
  return hook;
}

describe('useOnlineGame — initial state', () => {
  it('starts with status idle', () => {
    const { result } = renderHook(() => useOnlineGame());
    expect(result.current.status).toBe('idle');
  });

  it('has an empty board', () => {
    const { result } = renderHook(() => useOnlineGame());
    expect(result.current.board).toEqual(Array(9).fill(null));
  });
});

describe('useOnlineGame — createRoom', () => {
  it('emits create-room and sets status to creating', () => {
    const { result } = renderConnectedHook();
    act(() => result.current.createRoom());
    expect(mockSocket.emit).toHaveBeenCalledWith('create-room');
    expect(result.current.status).toBe('creating');
  });

  it('transitions to waiting on room-created event', () => {
    const { result } = renderConnectedHook();
    act(() => result.current.createRoom());
    act(() => mockSocket.trigger('room-created', { roomId: 'ABC123', symbol: 'X' }));
    expect(result.current.status).toBe('waiting');
    expect(result.current.roomId).toBe('ABC123');
    expect(result.current.symbol).toBe('X');
  });
});

describe('useOnlineGame — joinRoom', () => {
  it('emits join-room immediately when socket is connected', () => {
    const { result } = renderConnectedHook();
    act(() => result.current.joinRoom('ABC123'));
    expect(mockSocket.emit).toHaveBeenCalledWith('join-room', 'ABC123');
  });

  it('queues the join and sends it on connect when socket not yet connected', () => {
    const { result } = renderHook(() => useOnlineGame());
    // Socket is NOT yet connected (connected = false before 'connect' event)
    act(() => result.current.joinRoom('XYZ'));
    // Should NOT have emitted yet
    expect(mockSocket.emit).not.toHaveBeenCalledWith('join-room', 'XYZ');
    // Fire connect event — pending join should now be emitted
    act(() => mockSocket.trigger('connect'));
    expect(mockSocket.emit).toHaveBeenCalledWith('join-room', 'XYZ');
  });

  it('sets roomId and symbol on room-joined', () => {
    const { result } = renderConnectedHook();
    act(() => result.current.joinRoom('ABC123'));
    act(() => mockSocket.trigger('room-joined', { roomId: 'ABC123', symbol: 'O' }));
    expect(result.current.roomId).toBe('ABC123');
    expect(result.current.symbol).toBe('O');
  });

  it('transitions to playing on game-start', () => {
    const { result } = renderConnectedHook();
    act(() => result.current.joinRoom('ABC123'));
    act(() => mockSocket.trigger('room-joined', { roomId: 'ABC123', symbol: 'O' }));
    act(() => mockSocket.trigger('game-start', { board: Array(9).fill(null) }));
    expect(result.current.status).toBe('playing');
  });

  it('sets error and returns to idle on join-error', () => {
    const { result } = renderConnectedHook();
    act(() => result.current.joinRoom('NOPE'));
    act(() => mockSocket.trigger('join-error', 'Room not found'));
    expect(result.current.error).toBe('Room not found');
    expect(result.current.status).toBe('idle');
  });
});

describe('useOnlineGame — makeMove', () => {
  function renderPlayingHook() {
    const hook = renderConnectedHook();
    act(() => hook.result.current.createRoom());
    act(() => mockSocket.trigger('room-created', { roomId: 'ABC123', symbol: 'X' }));
    act(() => mockSocket.trigger('game-start', { board: Array(9).fill(null) }));
    return hook;
  }

  it('emits make-move with roomId and index', () => {
    const { result } = renderPlayingHook();
    act(() => result.current.makeMove(4));
    expect(mockSocket.emit).toHaveBeenCalledWith('make-move', { roomId: 'ABC123', index: 4 });
  });

  it('updates board and isXTurn on move-made', () => {
    const { result } = renderPlayingHook();
    const newBoard = Array(9).fill(null);
    newBoard[0] = 'X';
    act(() => mockSocket.trigger('move-made', { board: newBoard, isXTurn: false, winner: null, isDraw: false }));
    expect(result.current.board[0]).toBe('X');
    expect(result.current.isXTurn).toBe(false);
  });

  it('sets status to finished when winner is returned', () => {
    const { result } = renderPlayingHook();
    const board = Array(9).fill(null);
    board[0] = board[1] = board[2] = 'X';
    act(() => mockSocket.trigger('move-made', { board, isXTurn: false, winner: 'X', isDraw: false }));
    expect(result.current.winner).toBe('X');
    expect(result.current.status).toBe('finished');
  });

  it('sets status to finished on a draw', () => {
    const { result } = renderPlayingHook();
    const board = Array(9).fill('X');
    act(() => mockSocket.trigger('move-made', { board, isXTurn: false, winner: null, isDraw: true }));
    expect(result.current.isDraw).toBe(true);
    expect(result.current.status).toBe('finished');
  });
});

describe('useOnlineGame — isMyTurn', () => {
  it('is true for X when isXTurn is true', () => {
    const { result } = renderConnectedHook();
    act(() => result.current.createRoom());
    act(() => mockSocket.trigger('room-created', { roomId: 'R', symbol: 'X' }));
    act(() => mockSocket.trigger('game-start', { board: Array(9).fill(null) }));
    expect(result.current.isMyTurn).toBe(true);
  });

  it('is false for O when isXTurn is true', () => {
    const { result } = renderConnectedHook();
    act(() => result.current.joinRoom('R'));
    act(() => mockSocket.trigger('room-joined', { roomId: 'R', symbol: 'O' }));
    act(() => mockSocket.trigger('game-start', { board: Array(9).fill(null) }));
    expect(result.current.isMyTurn).toBe(false);
  });

  it('is true for O when isXTurn is false', () => {
    const { result } = renderConnectedHook();
    act(() => result.current.joinRoom('R'));
    act(() => mockSocket.trigger('room-joined', { roomId: 'R', symbol: 'O' }));
    act(() => mockSocket.trigger('game-start', { board: Array(9).fill(null) }));
    act(() => mockSocket.trigger('move-made', { board: [null, ...Array(8).fill(null)], isXTurn: false, winner: null, isDraw: false }));
    expect(result.current.isMyTurn).toBe(true);
  });
});

describe('useOnlineGame — play-again', () => {
  it('emits play-again with roomId', () => {
    const { result } = renderConnectedHook();
    act(() => result.current.createRoom());
    act(() => mockSocket.trigger('room-created', { roomId: 'ABC123', symbol: 'X' }));
    act(() => result.current.requestPlayAgain());
    expect(mockSocket.emit).toHaveBeenCalledWith('play-again', 'ABC123');
  });

  it('resets state on game-restart', () => {
    const { result } = renderConnectedHook();
    act(() => result.current.createRoom());
    act(() => mockSocket.trigger('room-created', { roomId: 'R', symbol: 'X' }));
    act(() => mockSocket.trigger('game-start', { board: Array(9).fill(null) }));
    const board = Array(9).fill(null);
    board[0] = board[1] = board[2] = 'X';
    act(() => mockSocket.trigger('move-made', { board, isXTurn: false, winner: 'X', isDraw: false }));
    act(() => mockSocket.trigger('game-restart'));
    expect(result.current.board).toEqual(Array(9).fill(null));
    expect(result.current.winner).toBe(null);
    expect(result.current.status).toBe('playing');
    expect(result.current.waitingPlayAgain).toBe(false);
  });

  it('sets waitingPlayAgain when waiting-for-play-again fires', () => {
    const { result } = renderHook(() => useOnlineGame());
    act(() => mockSocket.trigger('waiting-for-play-again'));
    expect(result.current.waitingPlayAgain).toBe(true);
  });
});

describe('useOnlineGame — disconnect', () => {
  it('sets status to disconnected on opponent-disconnected', () => {
    const { result } = renderHook(() => useOnlineGame());
    act(() => mockSocket.trigger('opponent-disconnected'));
    expect(result.current.status).toBe('disconnected');
  });

  it('disconnects the socket on unmount', () => {
    const { result, unmount } = renderHook(() => useOnlineGame());
    void result.current;
    unmount();
    expect(mockSocket.disconnect).toHaveBeenCalledTimes(1);
  });
});
