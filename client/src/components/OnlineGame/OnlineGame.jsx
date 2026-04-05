import { useState, useEffect } from 'react';
import { useTranslations } from '../../context/LanguageContext';
import Board from '../Board/Board';
import StatusBar from '../StatusBar/StatusBar';
import { useOnlineGame } from '../../hooks/useOnlineGame';
import { calculateWinner } from '../../utils/gameLogic';
import './OnlineGame.css';

function OnlineGame({ initialRoomId, onGameEnd }) {
  const { t } = useTranslations();
  const {
    status,
    roomId,
    symbol,
    board,
    isXTurn,
    winner,
    isDraw,
    error,
    isMyTurn,
    waitingPlayAgain,
    createRoom,
    joinRoom,
    makeMove,
    requestPlayAgain,
  } = useOnlineGame();

  const [joinInput, setJoinInput] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialRoomId) {
      joinRoom(initialRoomId);
    }
  }, [initialRoomId, joinRoom]);

  useEffect(() => {
    if (winner) onGameEnd(winner);
    else if (isDraw) onGameEnd('draw');
  }, [winner, isDraw, onGameEnd]);

  const roomLink = roomId
    ? `${window.location.origin}${window.location.pathname}?room=${roomId}`
    : null;

  const winningLine = calculateWinner(board)?.line ?? null;
  const currentPlayer = isXTurn ? 'X' : 'O';

  const handleCopy = () => {
    navigator.clipboard.writeText(roomLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (status === 'idle' || status === 'creating') {
    return (
      <div className="online-game online-game--lobby">
        <button
          className="online-game__btn online-game__btn--primary"
          onClick={createRoom}
          disabled={status === 'creating'}
        >
          {t.createRoom}
        </button>
        <div className="online-game__divider">{t.or}</div>
        <div className="online-game__join">
          <input
            className="online-game__input"
            type="text"
            placeholder={t.enterRoomCode}
            value={joinInput}
            onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
            aria-label={t.enterRoomCode}
          />
          <button
            className="online-game__btn"
            onClick={() => joinRoom(joinInput)}
            disabled={!joinInput.trim()}
          >
            {t.joinRoom}
          </button>
        </div>
        {error && <p className="online-game__error" role="alert">{error}</p>}
      </div>
    );
  }

  if (status === 'waiting') {
    return (
      <div className="online-game online-game--waiting">
        <p className="online-game__waiting-text">{t.waitingForOpponent}</p>
        <p className="online-game__symbol">{t.yourSymbol} <strong>{symbol}</strong></p>
        {roomLink && (
          <div className="online-game__share">
            <p className="online-game__share-label">{t.shareLink}</p>
            <div className="online-game__share-row">
              <input
                className="online-game__input online-game__input--link"
                type="text"
                readOnly
                value={roomLink}
                aria-label={t.roomLink}
                onFocus={(e) => e.target.select()}
              />
              <button className="online-game__btn" onClick={handleCopy}>
                {copied ? '✓' : t.copyLink}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (status === 'disconnected') {
    return (
      <div className="online-game online-game--disconnected">
        <p className="online-game__waiting-text">{t.opponentDisconnected}</p>
      </div>
    );
  }

  // status === 'playing' | 'finished'
  const handleCellClick = (index) => {
    if (!isMyTurn || winner || isDraw) return;
    makeMove(index);
  };

  return (
    <div className="online-game">
      <p className="online-game__symbol">{t.yourSymbol} <strong>{symbol}</strong></p>
      <StatusBar
        currentPlayer={currentPlayer}
        winner={winner}
        isDraw={isDraw}
        isComputerThinking={false}
      />
      <Board
        board={board}
        onCellClick={handleCellClick}
        winningLine={winningLine}
      />
      {(winner || isDraw) && (
        <button
          className="online-game__btn online-game__btn--primary"
          onClick={requestPlayAgain}
          disabled={waitingPlayAgain}
        >
          {waitingPlayAgain ? t.waitingForOpponent : t.playAgain}
        </button>
      )}
    </div>
  );
}

export default OnlineGame;
