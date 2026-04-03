import { calculateWinner, isBoardFull } from '../gameLogic';

describe('calculateWinner', () => {
  it('returns null for an empty board', () => {
    expect(calculateWinner(Array(9).fill(null))).toBeNull();
  });

  it('returns null when no winner yet', () => {
    const board = ['X', 'O', 'X', null, null, null, null, null, null];
    expect(calculateWinner(board)).toBeNull();
  });

  it.each([
    ['top row', ['X', 'X', 'X', 'O', 'O', null, null, null, null], [0, 1, 2]],
    ['middle row', ['O', null, null, 'X', 'X', 'X', null, 'O', null], [3, 4, 5]],
    ['bottom row', [null, 'O', 'O', null, null, null, 'X', 'X', 'X'], [6, 7, 8]],
    ['left column', ['X', 'O', null, 'X', 'O', null, 'X', null, null], [0, 3, 6]],
    ['middle column', ['O', 'X', null, null, 'X', 'O', null, 'X', null], [1, 4, 7]],
    ['right column', ['O', null, 'X', 'O', null, 'X', null, null, 'X'], [2, 5, 8]],
    ['main diagonal', ['X', 'O', null, 'O', 'X', null, null, null, 'X'], [0, 4, 8]],
    ['anti-diagonal', ['O', null, 'X', null, 'X', 'O', 'X', null, null], [2, 4, 6]],
  ])('detects %s win', (_, board, expectedLine) => {
    const result = calculateWinner(board);
    expect(result).not.toBeNull();
    expect(result.line).toEqual(expectedLine);
  });

  it('returns the correct winner symbol', () => {
    const board = ['O', 'O', 'O', 'X', 'X', null, null, null, null];
    expect(calculateWinner(board)?.winner).toBe('O');
  });
});

describe('isBoardFull', () => {
  it('returns false for an empty board', () => {
    expect(isBoardFull(Array(9).fill(null))).toBe(false);
  });

  it('returns false for a partially filled board', () => {
    const board = ['X', 'O', null, null, null, null, null, null, null];
    expect(isBoardFull(board)).toBe(false);
  });

  it('returns true when every cell is filled', () => {
    const board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'];
    expect(isBoardFull(board)).toBe(true);
  });
});
