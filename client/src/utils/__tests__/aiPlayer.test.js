import { getBestMove, getBestMoveForPlayer } from '../aiPlayer';
import { calculateWinner } from '../gameLogic';

describe('getBestMove', () => {
  it('returns -1 when no moves are available (full board)', () => {
    const board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'];
    expect(getBestMove(board)).toBe(-1);
  });

  it('returns a valid index (0–8) on a board with available moves', () => {
    const move = getBestMove(Array(9).fill(null));
    expect(move).toBeGreaterThanOrEqual(0);
    expect(move).toBeLessThanOrEqual(8);
  });

  it('always picks an empty cell', () => {
    const board = ['X', 'O', 'X', 'O', 'X', 'O', null, null, null];
    const move = getBestMove(board);
    expect(board[move]).toBeNull();
  });

  it('does not mutate the original board', () => {
    const board = Array(9).fill(null);
    const snapshot = [...board];
    getBestMove(board);
    expect(board).toEqual(snapshot);
  });

  it('takes an immediate winning move for O', () => {
    // O: 0, 1 — wins at 2; X: 3, 4
    const board = ['O', 'O', null, 'X', 'X', null, null, null, null];
    expect(getBestMove(board)).toBe(2);
  });

  it('blocks an immediate winning move for X', () => {
    // X: 0, 1 — would win at 2; O must block
    const board = ['X', 'X', null, 'O', null, null, null, null, null];
    expect(getBestMove(board)).toBe(2);
  });

  it('prefers winning over blocking when both are possible', () => {
    // O can win at 8 (right column: 2, 5, 8)
    // X can win at 6 (left column: 0, 3, 6) — but O moves first
    const board = ['X', null, 'O', 'X', null, 'O', null, null, null];
    expect(getBestMove(board)).toBe(8);
  });

  it('returns the only remaining empty cell when one move is left', () => {
    const board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', null];
    expect(getBestMove(board)).toBe(8);
  });

  it('O never loses against any X opening move', () => {
    for (let opening = 0; opening < 9; opening++) {
      const board = Array(9).fill(null);
      board[opening] = 'X';
      let isXTurn = false;

      for (let turn = 0; turn < 8; turn++) {
        if (calculateWinner(board)) break;
        if (board.every(Boolean)) break;

        if (isXTurn) {
          const move = board.indexOf(null);
          if (move !== -1) board[move] = 'X';
        } else {
          const move = getBestMove(board);
          if (move !== -1) board[move] = 'O';
        }
        isXTurn = !isXTurn;
      }

      const result = calculateWinner(board);
      expect(result?.winner).not.toBe('X');
    }
  });
});

describe('getBestMoveForPlayer', () => {
  it('returns the same result as getBestMove when player is O', () => {
    const board = ['O', 'O', null, 'X', 'X', null, null, null, null];
    expect(getBestMoveForPlayer(board, 'O')).toBe(getBestMove(board));
  });

  it('takes an immediate winning move for X', () => {
    // X: 0, 1 — wins at 2
    const board = ['X', 'X', null, 'O', 'O', null, null, null, null];
    expect(getBestMoveForPlayer(board, 'X')).toBe(2);
  });

  it('blocks O from winning immediately when playing as X', () => {
    // O: 3, 4 — would win at 5; X should block at 5
    const board = ['X', null, null, 'O', 'O', null, null, null, null];
    expect(getBestMoveForPlayer(board, 'X')).toBe(5);
  });

  it('does not mutate the original board', () => {
    const board = Array(9).fill(null);
    const snapshot = [...board];
    getBestMoveForPlayer(board, 'X');
    expect(board).toEqual(snapshot);
  });

  it('returns -1 on a full board for X', () => {
    const board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'];
    expect(getBestMoveForPlayer(board, 'X')).toBe(-1);
  });
});
