import { calculateWinner, isBoardFull } from './gameLogic';

/**
 * Minimax with alpha-beta pruning.
 * O is the maximising player (computer), X is the minimising player (human).
 * Depth adjustment causes the AI to prefer faster wins and slower losses.
 */
function minimax(board, isMaximizing, alpha, beta, depth) {
  const result = calculateWinner(board);
  if (result) return result.winner === 'O' ? 10 - depth : depth - 10;
  if (isBoardFull(board)) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'O';
        best = Math.max(best, minimax(board, false, alpha, beta, depth + 1));
        board[i] = null;
        alpha = Math.max(alpha, best);
        if (alpha >= beta) break;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'X';
        best = Math.min(best, minimax(board, true, alpha, beta, depth + 1));
        board[i] = null;
        beta = Math.min(beta, best);
        if (alpha >= beta) break;
      }
    }
    return best;
  }
}

/**
 * Returns the index (0–8) of the best move for O, or -1 if no moves are available.
 * Does not mutate the board that is passed in.
 */
export function getBestMove(board) {
  const work = [...board];
  let bestScore = -Infinity;
  let bestMove = -1;

  for (let i = 0; i < 9; i++) {
    if (work[i] === null) {
      work[i] = 'O';
      const score = minimax(work, false, -Infinity, Infinity, 0);
      work[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }

  return bestMove;
}
