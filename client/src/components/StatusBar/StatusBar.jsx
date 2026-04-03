import { useTranslations } from '../../context/LanguageContext';
import './StatusBar.css';

function StatusBar({ currentPlayer, winner, isDraw, isComputerThinking }) {
  const { t } = useTranslations();

  let message;
  let modifier = '';

  if (winner) {
    message = t.playerWins(winner);
    modifier = 'status-bar__message--winner';
  } else if (isDraw) {
    message = t.draw;
    modifier = 'status-bar__message--draw';
  } else if (isComputerThinking) {
    message = t.computerTurn;
    modifier = 'status-bar__message--thinking';
  } else {
    message = t.playerTurn(currentPlayer);
  }

  return (
    <div className="status-bar">
      <p key={message} className={`status-bar__message ${modifier}`}>
        {message}
      </p>
    </div>
  );
}

export default StatusBar;
