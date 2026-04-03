import { useState, useCallback } from 'react';
import Board from '../Board/Board';
import StatusBar from '../StatusBar/StatusBar';
import ResetButton from '../ResetButton/ResetButton';
import { calculateWinner, isBoardFull } from '../../utils/gameLogic';
import './Game.css';

const EMPTY_BOARD = Array(9).fill(null);

function Game({ onGameEnd }) {
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [isXTurn, setIsXTurn] = useState(true);
  const [winningLine, setWinningLine] = useState(null);

  const result = calculateWinner(board);
  const winner = result?.winner ?? null;
  const isDraw = !winner && isBoardFull(board);
  const gameOver = winner !== null || isDraw;
  const currentPlayer = isXTurn ? 'X' : 'O';

  const handleCellClick = useCallback(
    (index) => {
      if (board[index] || gameOver) return;

      const next = board.slice();
      next[index] = currentPlayer;

      const newResult = calculateWinner(next);
      if (newResult) {
        setWinningLine(newResult.line);
        onGameEnd(newResult.winner);
      } else if (isBoardFull(next)) {
        onGameEnd('draw');
      }

      setBoard(next);
      setIsXTurn(!isXTurn);
    },
    [board, gameOver, currentPlayer, isXTurn, onGameEnd]
  );

  const handleReset = useCallback(() => {
    setBoard(EMPTY_BOARD);
    setIsXTurn(true);
    setWinningLine(null);
  }, []);

  return (
    <div className="game">
      <StatusBar currentPlayer={currentPlayer} winner={winner} isDraw={isDraw} />
      <Board board={board} onCellClick={handleCellClick} winningLine={winningLine} />
      <ResetButton gameOver={gameOver} onReset={handleReset} />
    </div>
  );
}

export default Game;
