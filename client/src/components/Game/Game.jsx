import { useState, useEffect, useCallback } from 'react';
import Board from '../Board/Board';
import StatusBar from '../StatusBar/StatusBar';
import ResetButton from '../ResetButton/ResetButton';
import { calculateWinner, isBoardFull } from '../../utils/gameLogic';
import { getBestMove } from '../../utils/aiPlayer';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import './Game.css';

const EMPTY_BOARD = Array(9).fill(null);
const COMPUTER_DELAY_MS = 600;

function Game({ mode = 'pvp', onGameEnd }) {
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [isXTurn, setIsXTurn] = useState(true);
  const [winningLine, setWinningLine] = useState(null);
  const [boardKey, setBoardKey] = useState(0);
  const { playPlace, playWin, playDraw } = useSoundEffects();

  const result = calculateWinner(board);
  const winner = result?.winner ?? null;
  const isDraw = !winner && isBoardFull(board);
  const gameOver = winner !== null || isDraw;
  const currentPlayer = isXTurn ? 'X' : 'O';
  const isComputerThinking = mode === 'pvc' && !isXTurn && !gameOver;

  const handleCellClick = useCallback(
    (index) => {
      if (board[index] || gameOver || (mode === 'pvc' && !isXTurn)) return;

      const next = board.slice();
      next[index] = currentPlayer;

      const newResult = calculateWinner(next);
      if (newResult) {
        setWinningLine(newResult.line);
        onGameEnd(newResult.winner);
        playWin();
      } else if (isBoardFull(next)) {
        onGameEnd('draw');
        playDraw();
      } else {
        playPlace();
      }

      setBoard(next);
      setIsXTurn(!isXTurn);
    },
    [board, gameOver, currentPlayer, isXTurn, mode, onGameEnd, playPlace, playWin, playDraw]
  );

  useEffect(() => {
    if (mode !== 'pvc' || isXTurn || gameOver) return;

    const timer = setTimeout(() => {
      const move = getBestMove(board);
      if (move === -1) return;

      const next = board.slice();
      next[move] = 'O';

      const newResult = calculateWinner(next);
      if (newResult) {
        setWinningLine(newResult.line);
        onGameEnd(newResult.winner);
        playWin();
      } else if (isBoardFull(next)) {
        onGameEnd('draw');
        playDraw();
      } else {
        playPlace();
      }

      setBoard(next);
      setIsXTurn(true);
    }, COMPUTER_DELAY_MS);

    return () => clearTimeout(timer);
  }, [mode, isXTurn, gameOver, board, onGameEnd, playPlace, playWin, playDraw]);

  const handleReset = useCallback(() => {
    setBoard(EMPTY_BOARD);
    setIsXTurn(true);
    setWinningLine(null);
    setBoardKey((k) => k + 1);
  }, []);

  return (
    <div className="game">
      <StatusBar
        currentPlayer={currentPlayer}
        winner={winner}
        isDraw={isDraw}
        isComputerThinking={isComputerThinking}
      />
      <Board key={boardKey} board={board} onCellClick={handleCellClick} winningLine={winningLine} />
      <ResetButton gameOver={gameOver} onReset={handleReset} />
    </div>
  );
}

export default Game;
