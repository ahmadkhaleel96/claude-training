import { useState, useEffect, useCallback } from 'react';
import Board from '../Board/Board';
import StatusBar from '../StatusBar/StatusBar';
import ResetButton from '../ResetButton/ResetButton';
import { calculateWinner, isBoardFull } from '../../utils/gameLogic';
import { getBestMove, getBestMoveForPlayer } from '../../utils/aiPlayer';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { useAuthContext } from '../../context/AuthContext';
import { useTranslations } from '../../context/LanguageContext';
import './Game.css';

const EMPTY_BOARD = Array(9).fill(null);
const COMPUTER_DELAY_MS = 600;

function Game({ mode = 'pvp', onGameEnd }) {
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [isXTurn, setIsXTurn] = useState(true);
  const [winningLine, setWinningLine] = useState(null);
  const [boardKey, setBoardKey] = useState(0);
  const [hintIndex, setHintIndex] = useState(null);
  const { playPlace, playWin, playDraw } = useSoundEffects();
  const { username } = useAuthContext();
  const { t } = useTranslations();

  const result = calculateWinner(board);
  const winner = result?.winner ?? null;
  const isDraw = !winner && isBoardFull(board);
  const gameOver = winner !== null || isDraw;
  const currentPlayer = isXTurn ? 'X' : 'O';
  const isComputerThinking = mode === 'pvc' && !isXTurn && !gameOver;

  // Hint is available only to signed-in users when it's their turn and game is ongoing
  const canHint =
    !!username &&
    !gameOver &&
    !isComputerThinking &&
    !(mode === 'pvf');

  const handleCellClick = useCallback(
    (index) => {
      if (board[index] || gameOver || (mode === 'pvc' && !isXTurn)) return;

      setHintIndex(null);
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
    setHintIndex(null);
    setBoardKey((k) => k + 1);
  }, []);

  const handleHint = useCallback(() => {
    if (!canHint) return;
    const best = getBestMoveForPlayer(board, currentPlayer);
    if (best !== -1) setHintIndex(best);
  }, [canHint, board, currentPlayer]);

  return (
    <div className="game">
      <StatusBar
        currentPlayer={currentPlayer}
        winner={winner}
        isDraw={isDraw}
        isComputerThinking={isComputerThinking}
      />
      <Board
        key={boardKey}
        board={board}
        onCellClick={handleCellClick}
        winningLine={winningLine}
        hintIndex={hintIndex}
      />
      <div className="game__actions">
        <ResetButton gameOver={gameOver} onReset={handleReset} />
        {canHint && (
          <button
            className="game__hint-btn"
            onClick={handleHint}
            aria-label={t.hint}
          >
            {t.hint}
          </button>
        )}
      </div>
    </div>
  );
}

export default Game;
